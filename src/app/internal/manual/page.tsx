
'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  FileText,
  Navigation,
  Globe,
  Settings,
  ArrowRight,
  Info,
  Clock,
  ExternalLink,
  Crown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MANUAL_DATA } from './manual-content';
import { cn } from '@/lib/utils';
import { Footer } from '@/components/footer';

/**
 * UserManualPage: Comprehensive hand-book for HRAT administrators.
 */
export default function UserManualPage() {
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = Object.values(MANUAL_DATA);
  const filtered = sections.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.subtitle.toLowerCase().includes(search.toLowerCase()) ||
    s.instructions.some(i => i.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-accent/30 mb-4">
              <BookOpen className="w-2.5 h-2.5" /> Institutional Documentation
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold">Governance <span className="text-accent italic">Manual</span></h1>
            <p className="text-slate-400 text-sm md:text-lg mt-4 max-w-2xl leading-relaxed">
              Operational roadmap for all authorized officials of the Human Rights Affairs Trust. Master every administrative node and registry protocol.
            </p>
          </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
           
           {/* Sidebar Navigation */}
           <div className="lg:col-span-3 space-y-6">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <Input 
                   placeholder="Search manual..." 
                   className="pl-9 h-11 rounded-xl bg-white dark:bg-slate-900 border-none shadow-sm"
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                 />
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-2 border shadow-sm">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest p-4 pb-2">Module Directory</p>
                 <div className="space-y-1">
                    {filtered.map((s) => (
                      <button 
                        key={s.id}
                        onClick={() => setActiveSection(s.id)}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between group",
                          activeSection === s.id ? "bg-accent text-primary shadow-md" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                        )}
                      >
                         <span className="truncate">{s.title}</span>
                         <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", activeSection === s.id ? "translate-x-1" : "opacity-0 group-hover:opacity-100")} />
                      </button>
                    ))}
                 </div>
              </div>

              <Card className="rounded-3xl bg-slate-900 text-white p-8 border-none shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                 <div className="relative z-10 space-y-4">
                    <ShieldCheck className="w-8 h-8 text-emerald-500" />
                    <h4 className="font-headline font-bold text-lg">Integrity First</h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed uppercase font-black tracking-wider">
                      "All administrative actions are timestamped and attributed. Accuracy in documentation is the shield of the organization."
                    </p>
                 </div>
              </Card>
           </div>

           {/* Manual Content Area */}
           <div className="lg:col-span-9 space-y-12">
              {filtered.length === 0 ? (
                <div className="py-32 text-center opacity-30 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-dashed">
                   <Search className="w-16 h-16 mx-auto mb-6" />
                   <p className="text-xl font-headline font-bold">No documentation found</p>
                </div>
              ) : (
                filtered.map((s) => (
                  <div key={s.id} id={s.id} className="scroll-mt-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Card className="rounded-[3rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                       <CardHeader className="p-10 md:p-16 bg-slate-50 dark:bg-slate-950 border-b relative">
                          <div className="absolute top-10 right-10 opacity-10 pointer-events-none"><BookOpen className="w-32 h-32" /></div>
                          <div className="space-y-4 relative z-10">
                             <div className="flex items-center gap-3">
                                <Badge className="bg-accent text-primary font-black uppercase text-[10px] tracking-widest px-4 h-6">Section Protocol</Badge>
                                <span className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em]">{s.id.replace(/-/g, ' ')}</span>
                             </div>
                             <h2 className="text-3xl md:text-5xl font-headline font-bold text-primary dark:text-white leading-tight">{s.title}</h2>
                             <p className="text-lg text-slate-500 italic font-medium">"{s.subtitle}"</p>
                          </div>
                       </CardHeader>
                       <CardContent className="p-10 md:p-16 space-y-16">
                          <div className="space-y-8">
                             <div className="flex items-center gap-4 border-b pb-4">
                                <Navigation className="w-6 h-6 text-accent" />
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary dark:text-white">Procedural Roadmap</h3>
                             </div>
                             <div className="grid md:grid-cols-1 gap-6">
                                {s.instructions.map((step, i) => (
                                  <div key={i} className="flex gap-6 group">
                                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-300 font-black text-lg shadow-inner group-hover:bg-accent group-hover:text-primary transition-all">
                                        {i + 1}
                                     </div>
                                     <div className="pt-2">
                                        <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{step}</p>
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                             <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                   <Zap className="w-5 h-5 text-emerald-500" />
                                   <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Administrative Tips</h4>
                                </div>
                                <div className="space-y-4">
                                   {s.tips.map((tip, i) => (
                                     <div key={i} className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-4">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                        <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400 italic">"{tip}"</p>
                                     </div>
                                   ))}
                                </div>
                             </div>

                             {s.mandates && (
                                <div className="space-y-6">
                                   <div className="flex items-center gap-3">
                                      <ShieldAlert className="w-5 h-5 text-red-500" />
                                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Root Mandates</h4>
                                   </div>
                                   <div className="space-y-4">
                                      {s.mandates.map((m, i) => (
                                        <div key={i} className="p-5 bg-red-50/50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-start gap-4">
                                           <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                           <p className="text-[11px] font-black text-red-900 dark:text-red-400 uppercase leading-relaxed tracking-tight">{m}</p>
                                        </div>
                                      ))}
                                   </div>
                                </div>
                             )}
                          </div>

                          <div className="pt-10 flex flex-col items-center gap-4 opacity-30">
                             <div className="h-px w-32 bg-slate-300"></div>
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em]">Institutional Compliance Node</p>
                          </div>
                       </CardContent>
                    </Card>
                  </div>
                ))
              )}
           </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
