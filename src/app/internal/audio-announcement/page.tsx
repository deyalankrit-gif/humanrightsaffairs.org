
'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { 
  Speaker, 
  ShieldCheck, 
  Loader2, 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  Save, 
  Zap, 
  RefreshCw,
  X,
  FileAudio,
  Volume2,
  AlertCircle,
  BrainCircuit,
  Languages,
  Mic2,
  Clock,
  CheckCircle2,
  Search,
  History,
  Archive,
  ArrowRight,
  User,
  Activity,
  XCircle,
  Radio,
  Edit,
  Waves,
  Wind,
  RotateCcw,
  Settings2,
  Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Footer } from '@/components/footer';
import { generateAiSpeech } from '@/ai/flows/tts-flow';

/**
 * AI Audio Announcement Center: Full Enterprise Terminal.
 * Managed registry for AI-generated human voice broadcasts.
 * Single Source of Truth for National Public Portal Synchronization.
 */
export default function AiAudioCenter() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Audio Engine Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const reverbNodeRef = useRef<ConvolverNode | null>(null);
  const reverbWetGainRef = useRef<GainNode | null>(null);
  const reverbDryGainRef = useRef<GainNode | null>(null);
  const echoDelayNodeRef = useRef<DelayNode | null>(null);
  const echoWetGainRef = useRef<GainNode | null>(null);
  const echoFeedbackGainRef = useRef<GainNode | null>(null);

  const [form, setForm] = useState({
    title: '',
    fullText: '',
    category: 'Official Notice',
    language: 'English' as 'English' | 'Bengali' | 'Hindi',
    voice: 'Male' as 'Male' | 'Female',
    emotion: 'Official' as any,
    speed: 1,
    pitch: 0,
    volume: 0.8,
    reverbMix: 8,
    echoMix: 0,
    audioData: '',
    status: 'Draft' as 'Draft' | 'Published' | 'Archived'
  });

  const announcementsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'ai_announcements'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: announcements, loading: dataLoading } = useCollection(announcementsQuery);

  const activeBroadcast = useMemo(() => {
    if (!announcements) return null;
    return announcements.find((a: any) => a.status === 'Published');
  }, [announcements]);

  /**
   * syncGlobalState: Pushes the current audio settings to the global settings document.
   */
  const syncGlobalState = useCallback(async (updates: any) => {
    if (!db) return;
    const settingsRef = doc(db, 'settings', 'audio_announcement');
    try {
      await setDoc(settingsRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        lastCommand: updates.isPlaying ? 'PLAY' : 'PAUSE'
      }, { merge: true });
      console.log('[AUDIO-SYSTEM] Global state synchronized:', updates);
    } catch (e) {
      console.error('[AUDIO-SYSTEM] Failed to sync global state:', e);
    }
  }, [db]);

  /**
   * syncAudioNodes: Maps state to the Web Audio API signal chain.
   */
  const syncAudioNodes = useCallback(() => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const time = ctx.currentTime;

    if (gainNodeRef.current) gainNodeRef.current.gain.setTargetAtTime(form.volume, time, 0.05);
    
    if (reverbWetGainRef.current && reverbDryGainRef.current) {
      const mix = form.reverbMix / 100;
      reverbWetGainRef.current.gain.setTargetAtTime(mix, time, 0.05);
      reverbDryGainRef.current.gain.setTargetAtTime(1 - mix, time, 0.05);
    }

    if (echoWetGainRef.current) {
      echoWetGainRef.current.gain.setTargetAtTime(form.echoMix / 100, time, 0.05);
    }

    if (audioRef.current) {
       audioRef.current.playbackRate = form.speed;
    }
  }, [form.volume, form.reverbMix, form.echoMix, form.speed]);

  /**
   * initAudioEngine: Establishes the professional broadcast signal chain.
   */
  const initAudioEngine = useCallback(() => {
    if (!audioRef.current || audioContextRef.current) {
      if (audioContextRef.current) syncAudioNodes();
      return;
    }

    try {
      console.log('[AUDIO-SYSTEM] Establishing Master Signal Chain...');
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const source = ctx.createMediaElementSource(audioRef.current);
      sourceNodeRef.current = source;

      // REVERB
      const reverb = ctx.createConvolver();
      const length = ctx.sampleRate * 2;
      const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const data = impulse.getChannelData(c);
        for (let i = 0; i < length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
        }
      }
      reverb.buffer = impulse;
      reverbNodeRef.current = reverb;

      const reverbWet = ctx.createGain();
      const reverbDry = ctx.createGain();
      reverbWetGainRef.current = reverbWet;
      reverbDryGainRef.current = reverbDry;

      // ECHO
      const delay = ctx.createDelay(1.0);
      delay.delayTime.value = 0.35;
      echoDelayNodeRef.current = delay;

      const feedback = ctx.createGain();
      feedback.gain.value = 0.4;
      echoFeedbackGainRef.current = feedback;

      const echoWet = ctx.createGain();
      echoWetGainRef.current = echoWet;

      // MASTER GAIN
      const mainGain = ctx.createGain();
      gainNodeRef.current = mainGain;

      source.connect(reverbDry);
      source.connect(reverb);
      reverb.connect(reverbWet);

      source.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(echoWet);

      reverbDry.connect(mainGain);
      reverbWet.connect(mainGain);
      echoWet.connect(mainGain);

      mainGain.connect(ctx.destination);
      
      // IMMEDIATE SYNC AFTER CONNECT
      syncAudioNodes();
    } catch (e) {
      console.warn("[AUDIO-SYSTEM] Web Audio initialization blocked.", e);
    }
  }, [syncAudioNodes]);

  useEffect(() => {
    syncAudioNodes();
    // Real-time propagation if this announcement is the active live one
    if (activeBroadcast && editingId === activeBroadcast.id) {
       syncGlobalState({
          volume: form.volume,
          reverbMix: form.reverbMix,
          echoMix: form.echoMix,
          speed: form.speed,
          isPlaying: !audioRef.current?.paused
       });
    }
  }, [form.volume, form.reverbMix, form.echoMix, form.speed, syncAudioNodes, activeBroadcast, editingId, syncGlobalState]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/internal/login');
  }, [user, authLoading, router]);

  const handleResetDefaults = () => {
    setForm(prev => ({
      ...prev,
      speed: 1,
      pitch: 0,
      volume: 0.8,
      reverbMix: 8,
      echoMix: 0
    }));
    toast({ title: "Institutional Defaults Restored" });
  };

  const handleGenerate = async () => {
    if (!form.fullText.trim()) {
      toast({ variant: "destructive", title: "Content Missing" });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateAiSpeech({
        text: form.fullText,
        language: form.language,
        voice: form.voice,
        emotion: form.emotion,
        speed: form.speed,
        pitch: form.pitch
      });
      if (result.success && result.audioData) {
        setForm(prev => ({ ...prev, audioData: result.audioData! }));
        toast({ title: "Synthesis Complete" });
      } else {
        throw new Error(result.error);
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Synthesis Failed", description: e.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (status: 'Draft' | 'Published') => {
    if (!db || !user) return;
    if (!form.title || !form.audioData) {
      toast({ variant: "destructive", title: "Incomplete Protocol" });
      return;
    }

    setIsSaving(true);
    try {
      const docData = {
        ...form,
        status,
        updatedAt: serverTimestamp(),
        updatedBy: user.email,
        publishedTime: status === 'Published' ? serverTimestamp() : null
      };

      if (editingId) {
        await updateDoc(doc(db, 'ai_announcements', editingId), docData);
      } else {
        await addDoc(collection(db, 'ai_announcements'), {
          ...docData,
          createdAt: serverTimestamp(),
          createdBy: user.email,
        });
      }

      if (status === 'Published') {
         await syncGlobalState({
            enabled: true,
            audioData: form.audioData,
            title: form.title,
            category: form.category,
            volume: form.volume,
            reverbMix: form.reverbMix,
            echoMix: form.echoMix,
            speed: form.speed,
            isPlaying: true,
            autoplay: true
         });
      }
      
      setIsAddOpen(false);
      setEditingId(null);
      toast({ title: "Registry Updated" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Archive Error", description: e.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusUpdate = async (ann: any, newStatus: string) => {
    if (!db) return;
    const ref = doc(db, 'ai_announcements', ann.id);
    try {
      await updateDoc(ref, { 
        status: newStatus, 
        updatedAt: serverTimestamp(),
        publishedTime: newStatus === 'Published' ? serverTimestamp() : null
      });

      if (newStatus === 'Published') {
         await syncGlobalState({
            enabled: true,
            audioData: ann.audioData,
            title: ann.title,
            category: ann.category,
            volume: ann.volume || 0.8,
            reverbMix: ann.reverbMix || 8,
            echoMix: ann.echoMix || 0,
            speed: ann.speed || 1,
            isPlaying: true,
            autoplay: true
         });
      } else {
         await syncGlobalState({ enabled: false, isPlaying: false });
      }

      toast({ title: "Broadcast State Updated" });
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Failed" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'ai_announcements', id));
      toast({ title: "Record Purged" });
    } catch (e) {
      toast({ variant: "destructive", title: "Delete Failed" });
    }
  };

  const startPlayback = () => {
    if (!audioRef.current) return;
    initAudioEngine();
    audioRef.current.play().then(() => syncAudioNodes());
  };

  const filtered = (announcements || []).filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || dataLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-accent" /></div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
             <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-accent/30">
               <BrainCircuit className="w-2.5 h-2.5 animate-pulse" /> AI Voice Terminal
             </div>
             <h1 className="text-3xl md:text-4xl font-headline font-bold">Audio <span className="text-accent italic">Announcement Center</span></h1>
             <p className="text-slate-400 text-[11px] uppercase font-black">Authorized Personnel Command Hub</p>
          </div>
          <Button onClick={() => { setEditingId(null); setIsAddOpen(true); setForm({ title: '', fullText: '', category: 'Official Notice', language: 'English', voice: 'Male', emotion: 'Official', speed: 1, pitch: 0, volume: 0.8, reverbMix: 8, echoMix: 0, audioData: '', status: 'Draft' }); }} className="bg-accent text-primary hover:bg-secondary hover:text-white h-11 px-8 rounded-xl font-bold gap-2 shadow-xl shadow-accent/20 transition-all">
             <Plus className="w-4 h-4" /> Initialize New Announcement
          </Button>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4 max-w-6xl">
        
        {/* Live Broadcast Monitor Section */}
        {activeBroadcast ? (
          <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <Card className="border-none shadow-2xl rounded-[2.5rem] bg-slate-950 text-white overflow-hidden relative border-l-8 border-emerald-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[2rem] bg-emerald-50/20 flex items-center justify-center text-emerald-500 relative shrink-0">
                       <Radio className="w-10 h-10 animate-pulse" />
                       <div className="absolute -top-1 -right-1 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                       </div>
                    </div>
                    <div className="space-y-1">
                       <div className="flex items-center gap-2">
                          <Badge className="bg-emerald-600 text-white font-black text-[8px] uppercase tracking-widest px-3 h-5">Live Now</Badge>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Public Channel Active</span>
                       </div>
                       <h2 className="text-2xl md:text-3xl font-headline font-bold text-white">{activeBroadcast.title}</h2>
                       <p className="text-slate-400 text-sm italic line-clamp-1">"{activeBroadcast.fullText}"</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 w-full md:w-auto">
                    <Button 
                      onClick={() => handleStatusUpdate(activeBroadcast, 'Archived')} 
                      className="flex-1 md:flex-none h-14 px-10 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs tracking-widest gap-2 shadow-xl shadow-red-900/40"
                    >
                      <XCircle className="w-5 h-5" /> Stop Live Broadcast
                    </Button>
                 </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="mb-10 animate-in fade-in duration-700">
             <div className="p-8 rounded-[2.5rem] bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center flex flex-col items-center gap-3">
                <Radio className="w-10 h-10 text-slate-300" />
                <h3 className="text-lg font-bold text-slate-400">No Active Broadcast</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select an existing announcement to push it live to the public portal.</p>
             </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
           <div className="relative w-full max-width-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Filter registry by title or category..." className="pl-10 h-11 rounded-xl bg-white dark:bg-slate-900 shadow-sm" value={search} onChange={e => setSearch(e.target.value)} />
           </div>
        </div>

        <div className="grid gap-6">
           {filtered.map((ann: any) => (
             <Card key={ann.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-3xl group transition-all hover:shadow-lg">
                <CardContent className="p-0">
                   <div className="flex flex-col md:flex-row items-stretch">
                      <div className="p-6 md:w-56 text-center border-r bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center shrink-0">
                         <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-accent mb-3 shadow-sm group-hover:scale-110 transition-transform">
                            <Speaker className="w-6 h-6" />
                         </div>
                         <Badge className={cn(
                           "text-[9px] font-black uppercase px-3 py-0.5 rounded-full border-none shadow-sm",
                           ann.status === 'Published' ? "bg-emerald-500" : ann.status === 'Draft' ? "bg-slate-400" : "bg-blue-600"
                         )}>
                           {ann.status === 'Published' ? 'LIVE' : ann.status}
                         </Badge>
                         <p className="text-[8px] font-bold text-slate-400 uppercase mt-3 tracking-widest">{ann.language} • {ann.voice}</p>
                      </div>
                      <div className="flex-1 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                         <div className="space-y-1.5 text-center md:text-left flex-1">
                            <div className="flex items-center justify-center md:justify-start gap-2">
                               <h3 className="text-xl font-bold text-primary dark:text-white leading-tight">{ann.title}</h3>
                               <Badge variant="outline" className="text-[7px] font-black uppercase border-accent text-accent">{ann.category}</Badge>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic">"{ann.fullText}"</p>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                               <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-accent" /> {ann.createdAt?.toDate?.()?.toLocaleDateString() || 'Just now'}</span>
                               <span className="flex items-center gap-1.5"><User className="w-3 h-3 text-accent" /> By: {ann.createdBy?.split('@')[0]}</span>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <Button onClick={() => { setEditingId(ann.id); setForm(ann); setIsAddOpen(true); }} variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-accent rounded-xl"><Edit className="w-5 h-5" /></Button>
                            {(ann.status === 'Draft' || ann.status === 'Archived') && (
                              <Button onClick={() => handleStatusUpdate(ann, 'Published')} variant="outline" size="sm" className="h-9 rounded-xl border-emerald-100 text-emerald-600 hover:bg-emerald-50 font-bold text-[10px] uppercase shadow-sm">
                                <Zap className="w-3 h-3 mr-1.5" /> Go Live
                              </Button>
                            )}
                            {ann.status === 'Published' && (
                              <Button onClick={() => handleStatusUpdate(ann, 'Archived')} variant="outline" size="sm" className="h-9 rounded-xl border-red-100 text-red-600 hover:bg-red-50 font-bold text-[10px] uppercase shadow-sm">
                                <XCircle className="w-3 h-3 mr-1.5" /> Stop Live
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-red-500 transition-all rounded-xl"><Trash2 className="w-5 h-5" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-[2.5rem]">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Purge announcement record?</AlertDialogTitle>
                                  <AlertDialogDescription>This will permanently remove "{ann.title}" from the registry. This cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(ann.id)} className="bg-red-600 hover:bg-red-700 rounded-xl">Confirm Purge</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                         </div>
                      </div>
                   </div>
                </CardContent>
             </Card>
           ))}
        </div>
      </section>

      {/* Synthesis Dialog */}
      <Dialog open={isAddOpen} onOpenChange={(val) => { setIsAddOpen(val); if(!val) setEditingId(null); }}>
         <DialogContent className="max-w-5xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-950 flex flex-col max-h-[95vh]">
            <div className="bg-slate-900 p-8 text-white relative shrink-0 border-b-4 border-accent/20">
               <div className="absolute right-6 top-6"><DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full text-white/40 hover:text-white"><X className="w-5 h-5" /></Button></DialogClose></div>
               <Badge className="bg-accent text-primary font-black text-[8px] uppercase mb-2 tracking-widest">Administrative Node</Badge>
               <DialogTitle className="text-2xl font-headline font-bold">{editingId ? "Update Announcement Protocol" : "AI Speech Synthesis Protocol"}</DialogTitle>
               <DialogDescription className="text-slate-400 uppercase tracking-widest text-[9px] font-black mt-1">High-Fidelity Human Voice Generation Hub</DialogDescription>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
               <div className="grid lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Input Details */}
                  <div className="lg:col-span-8 space-y-8">
                     <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                           <Label className="text-[10px] font-bold uppercase text-slate-400">Announcement Title *</Label>
                           <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Constitutional Awareness Update" className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                           <Label className="text-[10px] font-bold uppercase text-slate-400">Categorization</Label>
                           <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                              <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                              <SelectContent className="bg-white">
                                 {['Official Notice', 'Legal Update', 'Mission Alert', 'Event Greeting', 'Emergency Broadcast'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                              </SelectContent>
                           </Select>
                        </div>
                     </div>

                     <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Broadcast Narrative (Full Text) *</Label>
                        <Textarea 
                          value={form.fullText} 
                          onChange={e => setForm({...form, fullText: e.target.value})} 
                          placeholder="Type the message to be converted to human speech..." 
                          className="min-h-[180px] rounded-2xl p-6 leading-relaxed bg-slate-50 dark:bg-slate-900 border-none shadow-inner" 
                        />
                     </div>

                     <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                           <Label className="text-[10px] font-bold uppercase text-slate-400">Language</Label>
                           <Select value={form.language} onValueChange={(v: any) => setForm({...form, language: v})}>
                              <SelectTrigger className="h-11 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                              <SelectContent className="bg-white">
                                 <SelectItem value="English">English (Global)</SelectItem>
                                 <SelectItem value="Bengali">Bengali (State)</SelectItem>
                                 <SelectItem value="Hindi">Hindi (National)</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>
                        <div className="space-y-1.5">
                           <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Vocal Profile</Label>
                           <Select value={form.voice} onValueChange={(v: any) => setForm({...form, voice: v})}>
                              <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                              <SelectContent className="bg-white">
                                 <SelectItem value="Male">Male (Lead)</SelectItem>
                                 <SelectItem value="Female">Female (Support)</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>
                        <div className="space-y-1.5">
                           <Label className="text-[10px] font-bold uppercase text-slate-400">Tonality / Emotion</Label>
                           <Select value={form.emotion} onValueChange={(v: any) => setForm({...form, emotion: v})}>
                              <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                              <SelectContent className="bg-white">
                                 {['Official', 'Professional', 'Calm', 'Friendly', 'Emergency', 'Authoritative', 'Inspirational', 'Empathetic', 'Urgent'].map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                              </SelectContent>
                           </Select>
                        </div>
                     </div>

                     <div className="grid md:grid-cols-2 gap-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-inner">
                        <div className="space-y-4">
                           <Label className="text-[10px] font-black uppercase text-accent flex items-center gap-2">
                              <RefreshCw className={cn("w-3 h-3", isGenerating && "animate-spin")} /> Speech Velocity
                           </Label>
                           <div className="flex items-center gap-4">
                              <Slider 
                                value={[form.speed]} 
                                min={0.5} 
                                max={2} 
                                step={0.1} 
                                onValueChange={v => setForm({...form, speed: v[0]})}
                                className="flex-1"
                              />
                              <span className="text-xs font-bold w-12 text-center bg-white px-2 py-1 rounded-lg border">{form.speed}x</span>
                           </div>
                        </div>
                        <div className="space-y-4">
                           <Label className="text-[10px] font-black uppercase text-accent flex items-center gap-2">
                              <Activity className="w-3 h-3" /> Vocal Pitch
                           </Label>
                           <div className="flex items-center gap-4">
                              <Slider 
                                value={[form.pitch]} 
                                min={-20} 
                                max={20} 
                                step={1} 
                                onValueChange={v => setForm({...form, pitch: v[0]})}
                                className="flex-1"
                              />
                              <span className="text-xs font-bold w-12 text-center bg-white px-2 py-1 rounded-lg border">{form.pitch}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Right Column: Audio Output & Parameters */}
                  <div className="lg:col-span-4 space-y-8">
                     <Card className="rounded-3xl border-none shadow-sm bg-slate-900 text-white p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                        <h4 className="text-[10px] font-black uppercase text-accent tracking-[0.2em] mb-6 flex items-center gap-2">
                           <ShieldCheck className="w-4 h-4" /> Sound Profile Sync
                        </h4>
                        <div className="space-y-3">
                           {[
                              { label: 'High-Pass Filter', val: '100Hz', ok: true },
                              { label: 'Presence Boost', val: '+2dB @ 3kHz', ok: true },
                              { label: 'Air Brilliance', val: '+2dB @ 10kHz', ok: true },
                              { label: 'Dynamics Comp', val: '3:1 Ratio', ok: true },
                              { label: 'Audio Ceiling', val: '-1dB Limiter', ok: true }
                           ].map((p, i) => (
                              <div key={i} className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                                 <span className="text-[9px] font-bold text-slate-400 uppercase">{p.label}</span>
                                 <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-black text-emerald-400">{p.val}</span>
                                    {p.ok && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </Card>

                     <div className="space-y-4">
                        <Button 
                          type="button" 
                          onClick={handleGenerate}
                          disabled={isGenerating}
                          className="w-full h-16 rounded-2xl bg-primary text-white font-black text-lg hover:bg-secondary transition-all shadow-xl shadow-primary/20 flex gap-3 group"
                        >
                           {isGenerating ? <Loader2 className="w-7 h-7 animate-spin" /> : <><Mic2 className="w-6 h-6 group-hover:scale-110" /> Generate AI Voice</>}
                        </Button>
                        
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={handleResetDefaults}
                          className="w-full h-12 rounded-xl border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all gap-2"
                        >
                           <RotateCcw className="w-4 h-4" /> Reset Defaults
                        </Button>
                     </div>
                  </div>
               </div>

               {/* MASTER PREVIEW TERMINAL */}
               {form.audioData && (
                 <div className="w-full space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                    <div className="p-6 rounded-[2.5rem] bg-indigo-50 dark:bg-indigo-900/10 border-2 border-dashed border-indigo-200 dark:border-indigo-800 flex items-center gap-6">
                       <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 shrink-0">
                          <AlertCircle className="w-6 h-6" />
                       </div>
                       <div className="flex-1">
                          <h4 className="text-xs font-black uppercase text-indigo-600 tracking-[0.2em] mb-1">Verification Protocol Active</h4>
                          <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase italic">
                             Audit the vocal signature for emotional clarity and linguistic accuracy before committing to the National Registry. Playback quality must be verified across both channels.
                          </p>
                       </div>
                    </div>

                    <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden border border-slate-100 dark:border-slate-800">
                      <CardContent className="p-8 md:p-10 space-y-10">
                        {/* Primary Control Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                           <div className="lg:col-span-6 h-14 flex items-center bg-slate-50 dark:bg-slate-950 rounded-2xl px-6 border border-slate-100 dark:border-slate-800">
                              <audio 
                                ref={audioRef}
                                src={form.audioData} 
                                controls 
                                className="w-full h-10"
                                onPlay={startPlayback}
                              />
                           </div>
                           
                           <div className="lg:col-span-6 space-y-3">
                              <div className="flex justify-between items-center px-2">
                                 <Label className="text-[10px] font-black uppercase text-accent tracking-widest flex items-center gap-2">
                                   <Volume2 className="w-3.5 h-3.5" /> Output Gain Control
                                 </Label>
                                 <span className="text-[10px] font-mono font-bold text-slate-400">NORMALIZED ({Math.round(form.volume * 100)}%)</span>
                              </div>
                              <div className="px-2">
                                <Slider value={[form.volume * 100]} max={100} step={1} onValueChange={(v) => setForm({...form, volume: v[0] / 100})} className="h-2" />
                              </div>
                           </div>
                        </div>

                        {/* Spatial Processing Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           <div className="space-y-3">
                              <div className="flex justify-between items-center px-2">
                                 <Label className="text-[10px] font-black uppercase text-emerald-600 tracking-widest flex items-center gap-2">
                                   <Waves className="w-3.5 h-3.5" /> Reverb Depth
                                 </Label>
                                 <span className="text-[10px] font-bold text-slate-400">{form.reverbMix}%</span>
                              </div>
                              <div className="px-2">
                                <Slider value={[form.reverbMix]} min={0} max={100} step={1} onValueChange={v => setForm({...form, reverbMix: v[0]})} className="h-2" />
                              </div>
                           </div>

                           <div className="space-y-3">
                              <div className="flex justify-between items-center px-2">
                                 <Label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-2">
                                   <Wind className="w-3.5 h-3.5" /> Echo Intensity
                                 </Label>
                                 <span className="text-[10px] font-bold text-slate-400">{form.echoMix}%</span>
                              </div>
                              <div className="px-2">
                                <Slider value={[form.echoMix]} min={0} max={100} step={1} onValueChange={v => setForm({...form, echoMix: v[0]})} className="h-2" />
                              </div>
                           </div>
                        </div>

                        {/* Vocal Signature Identification Row */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-50 dark:border-slate-800">
                           <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shadow-sm animate-pulse shrink-0">
                                 <Mic2 className="w-6 h-6" />
                              </div>
                              <div className="space-y-1">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none">Vocal Signature Identification</p>
                                 <div className="flex items-center gap-3">
                                    <Badge className="bg-primary text-white font-black text-[9px] uppercase px-4 h-6 rounded-lg">{form.voice} Node</Badge>
                                    <Badge variant="outline" className="text-[9px] font-bold border-accent/30 text-accent uppercase px-4 h-6 rounded-lg">{form.emotion} Tonality</Badge>
                                    <Badge variant="outline" className="text-[9px] font-bold border-slate-200 text-slate-500 uppercase px-4 h-6 rounded-lg">{form.language}</Badge>
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center gap-6 opacity-40">
                              <div className="flex gap-1">
                                 {[1,2,3,4,5,6,7,8].map(i => (
                                    <div 
                                      key={i} 
                                      className="w-0.5 h-5 bg-accent rounded-full animate-bounce" 
                                      style={{ animationDelay: `${i * 0.1}s`, animationDuration: '1.2s' }} 
                                    />
                                 ))}
                              </div>
                              <div className="text-right">
                                 <p className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em]">Signal Processing</p>
                                 <p className="text-[9px] font-bold text-emerald-500 uppercase">Broadcast Ready</p>
                              </div>
                           </div>
                        </div>
                      </CardContent>
                    </Card>
                 </div>
               )}
            </div>

            <DialogFooter className="p-8 bg-slate-50 dark:bg-slate-900 border-t shrink-0">
               <div className="flex w-full gap-4">
                  <Button onClick={() => handleSave('Draft')} disabled={isSaving || isGenerating || !form.audioData} variant="outline" className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest border-2">
                     <Archive className="w-5 h-5 mr-2" /> Save as Draft
                  </Button>
                  <Button onClick={() => handleSave('Published')} disabled={isSaving || isGenerating || !form.audioData} className="flex-1 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-900/40">
                     <CheckCircle2 className="w-5 h-5 mr-2" /> Verify & Go Live
                  </Button>
               </div>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      <Footer />
    </main>
  );
}
