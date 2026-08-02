
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Speaker, 
  ShieldCheck, 
  Loader2, 
  UploadCloud, 
  Play, 
  Pause, 
  Trash2, 
  Save, 
  Zap, 
  RefreshCw,
  X,
  FileAudio,
  Volume2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Footer } from '@/components/footer';

/**
 * AudioAnnouncementAdmin: Terminal for managing global website audio broadcasts.
 * Features: Direct Base64 archival, real-time preview, and broadcast status monitoring.
 */
export default function AudioAnnouncementAdmin() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [tempDataUri, setTempDataUri] = useState<string | null>(null);
  
  const previewRef = React.useRef<HTMLAudioElement>(null);

  const announcementRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'settings', 'audio_announcement');
  }, [db]);

  const { data: settings, loading: settingsLoading } = useDoc(announcementRef);

  const [form, setForm] = useState({
    enabled: false,
    title: 'HRAT Official Announcement',
    description: '',
    autoplay: true,
    volume: 0.5,
    audioData: ''
  });

  useEffect(() => {
    if (!authLoading && !user) router.push('/internal/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (settings) {
      setForm({
        enabled: settings.enabled ?? false,
        title: settings.title || 'HRAT Official Announcement',
        description: settings.description || '',
        autoplay: settings.autoplay ?? true,
        volume: settings.volume ?? 0.5,
        audioData: settings.audioData || ''
      });
    }
  }, [settings]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File validation: MPEG, MP3, WAV, OGG under 1MB
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'];
    const isMpegExtension = file.name.toLowerCase().endsWith('.mpeg') || file.name.toLowerCase().endsWith('.mpg');
    
    if (!validTypes.includes(file.type) && !isMpegExtension) {
      toast({ variant: "destructive", title: "Invalid Format", description: "Please upload MPEG, MP3, WAV, or OGG." });
      return;
    }

    if (file.size > 1024 * 1024) { // 1MB Firestore Doc Limit safety
      toast({ variant: "destructive", title: "File Too Large", description: "Direct archival limit is 1MB. Use a shorter clip." });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUri = reader.result as string;
      setTempDataUri(dataUri);
      setTempFile(file);
      setForm(prev => ({ ...prev, audioData: dataUri }));
      toast({ title: "Audio Buffered", description: "The asset is ready for verification." });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!announcementRef || !user) return;
    setIsSaving(true);
    try {
      await setDoc(announcementRef, {
        ...form,
        updatedAt: serverTimestamp(),
        updatedBy: user.email
      }, { merge: true });
      
      toast({ title: "Broadcast Synchronized", description: "The institutional announcement registry has been updated." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: e.message });
    } finally {
      setIsSaving(true);
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  const togglePreview = () => {
    if (!previewRef.current) return;
    if (isPreviewPlaying) {
      previewRef.current.pause();
    } else {
      previewRef.current.play();
    }
    setIsPreviewPlaying(!isPreviewPlaying);
  };

  const purgeAudio = () => {
    setForm(prev => ({ ...prev, audioData: '', enabled: false }));
    setTempDataUri(null);
    setTempFile(null);
    toast({ title: "Asset Purged", description: "Audio buffer cleared." });
  };

  if (authLoading || settingsLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-accent" /></div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
             <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-accent/30">
               <Speaker className="w-2.5 h-2.5 animate-pulse" /> Audio Broadcast Node
             </div>
             <h1 className="text-3xl md:text-4xl font-headline font-bold">Audio <span className="text-accent italic">Announcement</span></h1>
             <p className="text-slate-400 text-[11px] uppercase font-black">Institutional Communication Registry</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="bg-accent text-primary hover:bg-secondary hover:text-white h-11 px-8 rounded-xl font-bold gap-2 shadow-xl shadow-accent/20 transition-all">
             {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />} Commit Changes
          </Button>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4 max-w-5xl">
        <div className="grid lg:grid-cols-12 gap-8">
           
           <div className="lg:col-span-8 space-y-6">
              <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                 <CardHeader className="p-8 border-b bg-slate-50 dark:bg-slate-800/50">
                    <CardTitle className="text-xl font-headline font-bold">Broadcast Configuration</CardTitle>
                    <CardDescription>Define the metadata and behavioral logic for the website audio.</CardDescription>
                 </CardHeader>
                 <CardContent className="p-8 space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-400">Announcement Title</Label>
                          <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Welcome to HRAT India" className="h-11 rounded-xl" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-400">Default Volume</Label>
                          <div className="flex items-center gap-4 pt-2">
                             <Volume2 className="w-4 h-4 text-slate-400" />
                             <Slider 
                               value={[form.volume]} 
                               max={1} 
                               step={0.1} 
                               onValueChange={v => setForm({...form, volume: v[0]})}
                               className="flex-1"
                             />
                             <span className="text-xs font-bold w-8">{Math.round(form.volume * 100)}%</span>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-400">Tactical Description (Optional)</Label>
                       <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Brief context for administrative logs..." className="h-11 rounded-xl" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                       <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100">
                          <div className="space-y-0.5">
                             <Label className="font-bold text-sm">Status: {form.enabled ? 'Live' : 'Inactive'}</Label>
                             <p className="text-[9px] text-slate-400 uppercase font-bold">Enable global broadcast</p>
                          </div>
                          <Switch checked={form.enabled} onCheckedChange={v => setForm({...form, enabled: v})} className="data-[state=checked]:bg-emerald-500" />
                       </div>
                       <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100">
                          <div className="space-y-0.5">
                             <Label className="font-bold text-sm">Autoplay Logic</Label>
                             <p className="text-[9px] text-slate-400 uppercase font-bold">Trigger on landing</p>
                          </div>
                          <Switch checked={form.autoplay} onCheckedChange={v => setForm({...form, autoplay: v})} className="data-[state=checked]:bg-accent" />
                       </div>
                    </div>
                 </CardContent>
              </Card>

              {/* Audio Asset Terminal */}
              <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                 <CardHeader className="p-8 border-b">
                    <CardTitle className="text-xl font-headline font-bold flex items-center gap-3">
                       <FileAudio className="w-5 h-5 text-accent" /> Institutional Audio Registry
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-8">
                    <div className="flex flex-col items-center gap-8">
                       {form.audioData ? (
                         <div className="w-full space-y-6 animate-in zoom-in-95 duration-500">
                            <div className="p-8 bg-slate-900 rounded-3xl border border-white/5 flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden">
                               <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                               <div className="relative z-10 w-20 h-20 rounded-full bg-accent/10 border-4 border-accent/20 flex items-center justify-center text-accent">
                                  {isPreviewPlaying ? <Loader2 className="w-10 h-10 animate-spin" /> : <Speaker className="w-10 h-10" />}
                               </div>
                               <div className="text-center z-10">
                                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Active Asset Loaded</p>
                                  <h4 className="text-lg font-bold text-white uppercase tracking-tight">{tempFile?.name || 'Committed Audio File'}</h4>
                               </div>
                               
                               <div className="flex gap-3 relative z-10">
                                  <Button onClick={togglePreview} className="bg-white text-primary hover:bg-accent hover:text-white font-bold h-12 px-10 rounded-xl transition-all">
                                     {isPreviewPlaying ? <><Pause className="w-4 h-4 mr-2" /> STOP PREVIEW</> : <><Play className="w-4 h-4 mr-2" /> START PREVIEW</>}
                                  </Button>
                                  <Button variant="ghost" onClick={purgeAudio} className="h-12 w-12 rounded-xl text-red-500 hover:bg-red-500/10">
                                     <Trash2 className="w-5 h-5" />
                                  </Button>
                               </div>
                               <audio ref={previewRef} src={form.audioData} onEnded={() => setIsPlaying(false)} className="hidden" />
                            </div>
                         </div>
                       ) : (
                         <div className="w-full flex flex-col items-center p-12 border-4 border-dashed border-slate-100 rounded-[3rem] group hover:border-accent transition-colors relative cursor-pointer">
                            <UploadCloud className="w-16 h-16 text-slate-200 group-hover:text-accent transition-colors duration-500" />
                            <div className="text-center mt-6">
                               <p className="text-lg font-bold text-primary dark:text-white uppercase tracking-tight">Archival Upload Node</p>
                               <p className="text-xs text-slate-400 mt-1 uppercase font-bold">MPEG, MP3, WAV or OGG (Max 1MB)</p>
                            </div>
                            <input type="file" accept="audio/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                         </div>
                       )}
                    </div>
                 </CardContent>
              </Card>
           </div>

           <div className="lg:col-span-4 space-y-6">
              <Card className="rounded-[2.5rem] border-none shadow-sm bg-slate-900 text-white p-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                 <h3 className="text-xs font-black uppercase text-emerald-400 tracking-[0.2em] mb-8 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Integrity Protocol
                 </h3>
                 <div className="space-y-4 text-[11px] text-slate-400 font-medium leading-relaxed italic">
                    <p>"The audio announcement is a primary institutional tool. Ensure all uploaded assets reflect the formal tone and mandate of the Human Rights Affairs Trust."</p>
                    <p>"Files are archived directly in the National Registry database. Maintaining a strict 1MB limit ensures high-fidelity performance for mobile and low-bandwidth users."</p>
                 </div>
              </Card>

              <div className="p-8 rounded-[2.5rem] bg-indigo-50 dark:bg-indigo-950/20 border-2 border-dashed border-indigo-200 dark:border-indigo-900/30 text-center space-y-4">
                 <RefreshCw className="w-10 h-10 text-indigo-500 mx-auto" />
                 <h4 className="text-sm font-black uppercase tracking-widest text-indigo-500">Live Status</h4>
                 <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                       <div className={cn("w-2 h-2 rounded-full", form.enabled ? "bg-emerald-500 animate-pulse" : "bg-red-500")}></div>
                       <span className={cn("text-[10px] font-black uppercase", form.enabled ? "text-emerald-600" : "text-red-500")}>
                          {form.enabled ? 'ACTIVE BROADCAST' : 'SYSTEM OFFLINE'}
                       </span>
                    </div>
                    <p className="text-[8px] text-slate-400 font-bold uppercase mt-2">Latest Sync: {settings?.updatedAt?.toDate?.()?.toLocaleString() || 'N/A'}</p>
                 </div>
              </div>
           </div>

        </div>
      </section>
      <Footer />
    </main>
  );
}
