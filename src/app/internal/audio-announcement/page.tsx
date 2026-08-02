'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, limit } from 'firebase/firestore';
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
  Broadcast
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

  const [form, setForm] = useState({
    title: '',
    fullText: '',
    category: 'Official Notice',
    language: 'English' as 'English' | 'Bengali' | 'Hindi',
    voice: 'Male' as 'Male' | 'Female',
    emotion: 'Official' as any,
    speed: 1,
    pitch: 0,
    audioData: '',
    status: 'Draft' as any
  });

  useEffect(() => {
    if (!authLoading && !user) router.push('/internal/login');
  }, [user, authLoading, router]);

  const announcementsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'ai_announcements'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: announcements, loading: dataLoading } = useCollection(announcementsQuery);

  const activeBroadcast = useMemo(() => {
    if (!announcements) return null;
    return announcements.find((a: any) => a.status === 'Published');
  }, [announcements]);

  const handleGenerate = async () => {
    if (!form.fullText.trim()) {
      toast({ variant: "destructive", title: "Content Missing", description: "Please provide the text for AI conversion." });
      return;
    }
    
    setIsGenerating(true);
    toast({ title: "Initializing AI Synthesis", description: "Mapping text to high-fidelity human voice nodes..." });

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
        toast({ title: "Synthesis Complete", description: "The AI voice has been successfully generated." });
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
      toast({ variant: "destructive", title: "Incomplete Protocol", description: "Title and Generated Audio are mandatory." });
      return;
    }

    setIsSaving(true);
    try {
      const docData = {
        ...form,
        status,
        updatedAt: serverTimestamp(),
        updatedBy: user.email,
        createdAt: serverTimestamp(),
        createdBy: user.email,
        publishedTime: status === 'Published' ? serverTimestamp() : null
      };

      await addDoc(collection(db, 'ai_announcements'), docData);
      
      toast({ title: status === 'Published' ? "Broadcast Live" : "Draft Archived", description: "National registry successfully updated." });
      setIsAddOpen(false);
      setForm({ title: '', fullText: '', category: 'Official Notice', language: 'English', voice: 'Male', emotion: 'Official', speed: 1, pitch: 0, audioData: '', status: 'Draft' });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Archive Error", description: e.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    if (!db) return;
    const ref = doc(db, 'ai_announcements', id);
    try {
      await updateDoc(ref, { 
        status: newStatus, 
        updatedAt: serverTimestamp(),
        publishedTime: newStatus === 'Published' ? serverTimestamp() : null
      });
      toast({ 
        title: newStatus === 'Published' ? "Broadcast Live" : "Broadcast Stopped",
        description: newStatus === 'Published' ? "Audio is now active on the public page." : "Audio removed from live stream."
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed" });
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
             <p className="text-slate-400 text-[11px] uppercase font-black">Autonomous Speech Generation Node</p>
          </div>
          <Button onClick={() => setIsAddOpen(true)} className="bg-accent text-primary hover:bg-secondary hover:text-white h-11 px-8 rounded-xl font-bold gap-2 shadow-xl shadow-accent/20 transition-all">
             <Plus className="w-4 h-4" /> Initialize New Announcement
          </Button>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4">
        
        {/* Live Broadcast Monitor Section */}
        {activeBroadcast ? (
          <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <Card className="border-none shadow-2xl rounded-[2.5rem] bg-slate-950 text-white overflow-hidden relative border-l-8 border-emerald-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/20 flex items-center justify-center text-emerald-500 relative shrink-0">
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
                      onClick={() => handleStatusUpdate(activeBroadcast.id, 'Archived')} 
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
                <Broadcast className="w-10 h-10 text-slate-300" />
                <h3 className="text-lg font-bold text-slate-400">No Active Broadcast</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select a draft to go live on the homepage player</p>
             </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
           <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Filter registry by title or category..." className="pl-10 h-11 rounded-xl bg-white dark:bg-slate-900 shadow-sm" value={search} onChange={e => setSearch(e.target.value)} />
           </div>
           <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border">
              <Badge variant="outline" className="text-[10px] uppercase font-bold border-slate-200">History: {announcements?.length || 0}</Badge>
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
                           ann.status === 'Published' ? "bg-emerald-500" : ann.status === 'Draft' ? "bg-slate-400" : "bg-amber-600"
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
                            {ann.status === 'Draft' && (
                              <Button onClick={() => handleStatusUpdate(ann.id, 'Published')} variant="outline" size="sm" className="h-9 rounded-xl border-emerald-100 text-emerald-600 hover:bg-emerald-50 font-bold text-[10px] uppercase shadow-sm">
                                <Zap className="w-3 h-3 mr-1.5" /> Go Live
                              </Button>
                            )}
                            {ann.status === 'Published' && (
                              <Button onClick={() => handleStatusUpdate(ann.id, 'Archived')} variant="outline" size="sm" className="h-9 rounded-xl border-red-100 text-red-600 hover:bg-red-50 font-bold text-[10px] uppercase shadow-sm">
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
                                  <AlertDialogDescription>This will permanently remove "{ann.title}" from the registry. It will vanished from the public portal instantly.</AlertDialogDescription>
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
           {filtered.length === 0 && (
             <div className="text-center py-32 opacity-30">
                <Speaker className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                <p className="text-xl font-headline font-bold">No announcements found in history</p>
             </div>
           )}
        </div>
      </section>

      {/* Initialize New Announcement Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
         <DialogContent className="max-w-3xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-950 flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 p-8 text-white relative shrink-0 border-b-4 border-accent/20">
               <div className="absolute right-6 top-6"><DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full text-white/40 hover:text-white"><X className="w-5 h-5" /></Button></DialogClose></div>
               <Badge className="bg-accent text-primary font-black text-[8px] uppercase mb-2 tracking-widest">Administrative Node</Badge>
               <DialogTitle className="text-2xl font-headline font-bold">AI Speech Synthesis Protocol</DialogTitle>
               <DialogDescription className="text-slate-400">Institutional Voice Generation & Publishing Terminal</DialogDescription>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
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
                    className="min-h-[150px] rounded-2xl p-4 leading-relaxed" 
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
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Vocal Profile</Label>
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
                           {['Official', 'Professional', 'Calm', 'Friendly', 'Emergency'].map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
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

               <div className="pt-6 flex flex-col items-center gap-6">
                  <Button 
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full h-16 rounded-2xl bg-primary text-white font-black text-lg hover:bg-secondary transition-all shadow-xl shadow-primary/20 flex gap-3 group"
                  >
                     {isGenerating ? <Loader2 className="w-7 h-7 animate-spin" /> : <><Mic2 className="w-6 h-6 group-hover:scale-110" /> Generate AI Voice</>}
                  </Button>

                  {form.audioData && (
                    <div className="w-full p-8 bg-slate-900 rounded-[2rem] flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500 border border-white/10 shadow-2xl">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent animate-pulse">
                             <Volume2 className="w-6 h-6" />
                          </div>
                          <div className="text-center md:text-left">
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Generated Sample</p>
                             <h4 className="text-white font-bold uppercase tracking-tight">Vocal Signature: {form.voice} ({form.language})</h4>
                          </div>
                       </div>
                       <audio src={form.audioData} controls className="w-full rounded-full bg-white/5" />
                    </div>
                  )}
               </div>
            </div>

            <DialogFooter className="p-8 bg-slate-50 dark:bg-slate-900 border-t shrink-0">
               <div className="flex w-full gap-4">
                  <Button onClick={() => handleSave('Draft')} disabled={isSaving || isGenerating || !form.audioData} variant="outline" className="flex-1 h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest border-2">
                     <Archive className="w-4 h-4 mr-2" /> Save as Draft
                  </Button>
                  <Button onClick={() => handleSave('Published')} disabled={isSaving || isGenerating || !form.audioData} className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-900/20">
                     <CheckCircle2 className="w-4 h-4 mr-2" /> Verify & Go Live
                  </Button>
               </div>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      <Footer />
    </main>
  );
}
