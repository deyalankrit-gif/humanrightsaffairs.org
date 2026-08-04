
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  X, 
  Search,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  MousePointer2,
  Loader2,
  Monitor,
  Info,
  Layers,
  Sparkles,
  Bot
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogClose 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * TUTORIAL_STEPS: Registry of the 14 procedural chapters.
 */
const TUTORIAL_STEPS = [
  { id: 1, title: "Welcome", subtitle: "Institutional Overview", duration: 30, desc: "Introduction to the Justice Shield investigative framework and organizational roles." },
  { id: 2, title: "Registration", subtitle: "Public Intake", duration: 45, desc: "Step-by-step guide to filing a formal complaint via the national portal." },
  { id: 3, title: "Verification", subtitle: "Triage Protocol", duration: 40, desc: "How administrators perform initial vetting, duplicate checks, and case validation." },
  { id: 4, title: "Case Creation", subtitle: "Docket Assignment", duration: 35, desc: "Understanding Docket Numbers, timestamps, and initial status baselines." },
  { id: 5, title: "Team Deployment", subtitle: "Personnel Selection", duration: 50, desc: "The administrative process of selecting and assigning investigation officers from the registry." },
  { id: 6, title: "Mission Mandate", subtitle: "Directives & Goals", duration: 40, desc: "Defining objectives, special instructions, and evidence requirements for the team." },
  { id: 7, title: "Officer Login", subtitle: "Terminal Access", duration: 30, desc: "How investigators access their dedicated tactical portal with secure credentials." },
  { id: 8, title: "Assigned Tasks", subtitle: "Tactical Queue", duration: 45, desc: "Reviewing assigned dockets, priorities, and specific field mandates." },
  { id: 9, title: "Evidence Vault", subtitle: "Fact-Finding", duration: 55, desc: "The protocol for uploading photos, witness statements, and GPS-tagged evidence." },
  { id: 10, title: "Progress Sync", subtitle: "Real-time Updates", duration: 40, desc: "Updating case milestones and maintaining transparency with the central cell." },
  { id: 11, title: "Field Reporting", subtitle: "Documenting Findings", duration: 50, desc: "Drafting and submitting structured task reports with findings and recommendations." },
  { id: 12, title: "Supervisor Audit", subtitle: "Decision Review", duration: 45, desc: "The administrative review process for field reports and evidence verification." },
  { id: 13, title: "Commission Findings", subtitle: "Final Document", duration: 40, desc: "Generating the final investigative report and institutional resolutions." },
  { id: 14, title: "Case Closure", subtitle: "Mission Completion", duration: 30, desc: "Archiving the record and finalizing the audit trail after rights restoration." },
];

/**
 * InvestigationTutorial: Enterprise-grade animated documentation component.
 */
export function InvestigationTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isResuming, setIsResuming] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Persistence Hook
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hrat_tutorial_pos');
      if (saved) {
        const pos = parseInt(saved);
        if (pos > 0 && pos < TUTORIAL_STEPS.length) {
          setCurrentStep(pos);
          setIsResuming(true);
        }
      }
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Playback Engine
  useEffect(() => {
    if (isPlaying && isOpen) {
      const stepData = TUTORIAL_STEPS[currentStep];
      
      // Auto-Narration
      if (!isMuted && synthRef.current) {
        synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(stepData.desc);
        utterance.rate = playbackSpeed;
        utterance.volume = volume;
        synthRef.current.speak(utterance);
      }

      // Progress Timer
      timerRef.current = setTimeout(() => {
        if (currentStep < TUTORIAL_STEPS.length - 1) {
          handleNext();
        } else {
          setIsPlaying(false);
        }
      }, (stepData.duration * 1000) / playbackSpeed);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (synthRef.current) synthRef.current.cancel();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep, isOpen, playbackSpeed, isMuted, volume]);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      localStorage.setItem('hrat_tutorial_pos', next.toString());
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      localStorage.setItem('hrat_tutorial_pos', prev.toString());
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsPlaying(true);
    localStorage.setItem('hrat_tutorial_pos', '0');
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const filteredSteps = useMemo(() => {
    if (!searchQuery.trim()) return TUTORIAL_STEPS;
    return TUTORIAL_STEPS.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const progressPercent = Math.round(((currentStep + 1) / TUTORIAL_STEPS.length) * 100);
  const activeStep = TUTORIAL_STEPS[currentStep];

  return (
    <div className="w-full mt-12 animate-in fade-in duration-1000">
      <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white dark:bg-slate-900 group">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Thumbnail / Action Area */}
            <div className="md:w-1/3 relative aspect-video md:aspect-auto min-h-[240px] overflow-hidden bg-slate-900">
               <Image 
                 src="https://picsum.photos/seed/tutorial/800/600" 
                 alt="Tutorial Preview" 
                 fill 
                 className="object-cover opacity-40 group-hover:scale-110 transition-transform duration-1000"
               />
               <div className="absolute inset-0 bg-gradient-to-tr from-primary to-transparent opacity-60"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                  <Button 
                    onClick={() => { setIsOpen(true); setIsPlaying(true); }}
                    className="w-20 h-20 rounded-full bg-accent text-primary hover:bg-secondary hover:text-white shadow-2xl transition-all scale-100 hover:scale-110 active:scale-95"
                  >
                    <Play className="w-10 h-10 fill-current ml-1" />
                  </Button>
               </div>
               <div className="absolute bottom-6 left-6">
                  <Badge className="bg-white/10 backdrop-blur-md border-white/20 text-white font-bold uppercase tracking-widest text-[9px] px-3">5-10 MIN DURATION</Badge>
               </div>
            </div>

            {/* Description Area */}
            <div className="flex-1 p-8 md:p-12 space-y-6">
               <div className="space-y-2">
                  <div className="flex items-center gap-2 text-accent font-black uppercase text-[10px] tracking-[0.3em]">
                    <Sparkles className="w-4 h-4" />
                    <span>Educational Hub</span>
                  </div>
                  <h3 className="text-3xl font-headline font-bold text-primary dark:text-white">Interactive Investigation <span className="text-accent italic">Tutorial</span></h3>
                  <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-xl">
                    Master the high-fidelity investigative lifecycle. This animated walkthrough teaches citizens and officials how to navigate every stage from intake to closure.
                  </p>
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Training Progress</p>
                      <p className="text-sm font-bold text-primary dark:text-white">Chapter {currentStep + 1} of {TUTORIAL_STEPS.length}</p>
                    </div>
                    <span className="text-xl font-black text-accent">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-1.5" />
               </div>

               <div className="pt-4 flex gap-4">
                  <Button 
                    onClick={() => { setIsOpen(true); setIsPlaying(true); }}
                    className="h-12 px-8 rounded-xl bg-primary text-white font-bold shadow-lg hover:bg-secondary transition-all"
                  >
                    {isResuming ? "Resume Training" : "Start Tutorial"} <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setIsOpen(true)}
                    className="h-12 px-8 rounded-xl border-slate-200 font-bold"
                  >
                    Browse Topics
                  </Button>
               </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IMMERSIVE TUTORIAL MODAL */}
      <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if(!val) setIsPlaying(false); }}>
        <DialogContent className="max-w-[100vw] w-full h-[100vh] p-0 border-none bg-black overflow-hidden flex flex-col z-[1000000] [&>button]:hidden">
          <DialogHeader className="sr-only">
             <DialogTitle>Animated Investigation Tutorial</DialogTitle>
             <DialogDescription>14-Step Procedural Walkthrough</DialogDescription>
          </DialogHeader>

          {/* Player Header */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent z-50 flex items-center justify-between px-8">
             <div className="flex items-center gap-4">
                <div className="relative w-8 h-8">
                  <Image src="/HRAT%20Logo.jpeg" alt="Logo" fill className="object-contain" />
                </div>
                <div className="hidden sm:block">
                  <h4 className="text-white font-headline font-bold text-lg leading-none">HRAT <span className="text-accent italic">Academy</span></h4>
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mt-1">Institutional Training Node</p>
                </div>
             </div>

             <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/10">
                   <Clock className="w-3.5 h-3.5 text-accent" />
                   <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                     Chapter {currentStep + 1} of {TUTORIAL_STEPS.length}: {activeStep.title}
                   </span>
                </div>
                <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-red-500 text-white flex items-center justify-center transition-all">
                  <X className="w-6 h-6" />
                </button>
             </div>
          </div>

          {/* MAIN STAGE (ANIMATION CANVAS) */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-slate-950">
             {/* Scene Background Decor */}
             <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent rounded-full blur-[120px]"></div>
             </div>

             <AnimatePresence mode="wait">
                <motion.div 
                  key={currentStep}
                  initial={{ opacity: 0, x: 50, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -50, scale: 1.05 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="w-full max-w-5xl h-full flex items-center justify-center p-8 md:p-20 relative z-10"
                >
                   {/* SCENE RENDERER */}
                   <div className="w-full aspect-video bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 shadow-2xl flex flex-col items-center justify-center text-center p-12 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5">
                         <motion.div 
                            className="h-full bg-accent"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: activeStep.duration / playbackSpeed, ease: "linear" }}
                         />
                      </div>

                      {/* Dynamic Scene Visuals */}
                      <div className="relative mb-10">
                         {/* Mouse Pointer Simulation */}
                         {isPlaying && (
                           <motion.div 
                            className="absolute z-[60] pointer-events-none"
                            animate={{ 
                               x: [100, -50, 20, 0], 
                               y: [50, 100, -30, 0],
                               scale: [1, 0.9, 1, 1]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                           >
                              <MousePointer2 className="w-8 h-8 text-white fill-accent drop-shadow-lg" />
                           </motion.div>
                         )}

                         <div className="p-8 bg-white/10 rounded-full border border-white/20 relative group">
                            <activeStep.id className="w-20 h-20 text-accent" />
                            {currentStep === 0 && <Bot className="absolute -top-4 -right-4 w-12 h-12 text-indigo-400 animate-bounce" />}
                            {currentStep === 8 && <Camera className="absolute -top-4 -right-4 w-12 h-12 text-emerald-400 animate-pulse" />}
                         </div>
                      </div>

                      <div className="space-y-4 max-w-2xl">
                         <h2 className="text-4xl md:text-6xl font-headline font-bold text-white leading-tight">
                            {activeStep.title}
                         </h2>
                         <p className="text-xl md:text-2xl text-slate-400 italic font-medium leading-relaxed">
                            "{activeStep.desc}"
                         </p>
                      </div>

                      {/* Mockup Windows based on step */}
                      <div className="mt-12 w-full max-w-3xl grid grid-cols-3 gap-4 opacity-40">
                         {[1, 2, 3].map(i => (
                           <div key={i} className="h-24 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
                         ))}
                      </div>
                   </div>
                </motion.div>
             </AnimatePresence>

             {/* Subtitles Overlay */}
             {showSubtitles && (
               <div className="absolute bottom-32 left-0 right-0 z-50 flex justify-center px-8">
                  <div className="bg-black/60 backdrop-blur-xl px-8 py-3 rounded-2xl border border-white/10 text-center max-w-3xl shadow-2xl">
                     <p className="text-white text-sm md:text-lg font-medium leading-relaxed tracking-wide">
                       {activeStep.desc}
                     </p>
                  </div>
               </div>
             )}
          </div>

          {/* PLAYER CONTROLS (Bottom Bar) */}
          <div className="bg-slate-900 border-t border-white/10 p-6 md:p-8 shrink-0 relative z-[60]">
             <div className="container mx-auto max-w-6xl space-y-6">
                
                {/* Timeline Slider */}
                <div className="space-y-2">
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden cursor-pointer relative group">
                      <div 
                        className="absolute h-full bg-accent transition-all duration-300" 
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                      <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="w-3 h-3 bg-white rounded-full shadow-lg"></div>
                      </div>
                   </div>
                   <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500 tracking-widest">
                      <span>{formatTime(currentStep * 40)} elapsed</span>
                      <span className="text-accent">{activeStep.subtitle}</span>
                      <span>{formatTime((TUTORIAL_STEPS.length - currentStep) * 40)} remaining</span>
                   </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                   {/* Left Controls */}
                   <div className="flex items-center gap-6">
                      <Button variant="ghost" size="icon" onClick={handlePrev} disabled={currentStep === 0} className="text-white/60 hover:text-white">
                        <SkipBack className="w-6 h-6" />
                      </Button>
                      
                      <Button 
                        onClick={togglePlay}
                        className="w-16 h-16 rounded-full bg-white text-primary hover:bg-accent hover:text-white transition-all shadow-2xl"
                      >
                        {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                      </Button>

                      <Button variant="ghost" size="icon" onClick={handleNext} disabled={currentStep === TUTORIAL_STEPS.length - 1} className="text-white/60 hover:text-white">
                        <SkipForward className="w-6 h-6" />
                      </Button>

                      <div className="w-px h-8 bg-white/10 mx-2" />

                      <Button variant="ghost" size="icon" onClick={handleRestart} className="text-white/40 hover:text-accent">
                        <RotateCcw className="w-5 h-5" />
                      </Button>
                   </div>

                   {/* Right Controls */}
                   <div className="flex items-center gap-8">
                      <div className="flex items-center gap-4">
                         <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)} className="text-white/60 hover:text-white p-0">
                           {isMuted ? <VolumeX className="w-6 h-6 text-red-500" /> : <Volume2 className="w-6 h-6" />}
                         </Button>
                         <Select value={playbackSpeed.toString()} onValueChange={v => setPlaybackSpeed(parseFloat(v))}>
                            <SelectTrigger className="h-9 w-20 bg-white/5 border-white/10 text-white text-[10px] font-black">
                               <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white z-[2000000]">
                               {[0.5, 1, 1.25, 1.5, 2].map(v => <SelectItem key={v} value={v.toString()}>{v}x</SelectItem>)}
                            </SelectContent>
                         </Select>
                      </div>

                      <div className="flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                         <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Subtitles</span>
                         <button 
                           onClick={() => setShowSubtitles(!showSubtitles)}
                           className={cn(
                             "w-8 h-4 rounded-full relative transition-all duration-300",
                             showSubtitles ? "bg-accent" : "bg-slate-700"
                           )}
                         >
                            <div className={cn(
                              "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all",
                              showSubtitles ? "left-4.5" : "left-0.5"
                            )} />
                         </button>
                      </div>

                      <div className="hidden lg:flex items-center gap-4">
                         <Dialog>
                            <DialogTrigger asChild>
                               <Button variant="ghost" size="icon" className="text-white/40 hover:text-white">
                                  <Search className="w-5 h-5" />
                               </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md bg-slate-900 border-white/10 text-white rounded-3xl z-[2000000]">
                               <DialogHeader>
                                  <DialogTitle>Search Tutorial Index</DialogTitle>
                               </DialogHeader>
                               <div className="py-4 space-y-4">
                                  <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input 
                                      placeholder="Jump to topic..." 
                                      className="bg-black/50 border-white/10 pl-10 h-11"
                                      value={searchQuery}
                                      onChange={e => setSearchQuery(e.target.value)}
                                    />
                                  </div>
                                  <ScrollArea className="h-[300px] pr-4">
                                     <div className="grid gap-2">
                                        {filteredSteps.map((s, idx) => (
                                          <button 
                                            key={s.id}
                                            onClick={() => { setCurrentStep(TUTORIAL_STEPS.findIndex(ts => ts.id === s.id)); setIsPlaying(true); }}
                                            className={cn(
                                              "w-full text-left p-4 rounded-2xl transition-all border group",
                                              currentStep === TUTORIAL_STEPS.findIndex(ts => ts.id === s.id) 
                                                ? "bg-accent border-accent text-primary" 
                                                : "bg-white/5 border-white/5 hover:bg-white/10 text-white/60"
                                            )}
                                          >
                                             <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold uppercase">{s.title}</span>
                                                <Badge variant="outline" className="text-[7px] border-white/10">{s.subtitle}</Badge>
                                             </div>
                                          </button>
                                        ))}
                                     </div>
                                  </ScrollArea>
                               </div>
                            </DialogContent>
                         </Dialog>
                         <Button variant="ghost" size="icon" className="text-white/40 hover:text-white">
                            <Maximize className="w-5 h-5" />
                         </Button>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function ScrollArea({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn("overflow-y-auto custom-scrollbar", className)}>
      {children}
    </div>
  );
}
