
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Info, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  ShieldCheck,
  ArrowRight,
  BookMarked
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { MANUAL_DATA } from '@/app/internal/manual/manual-content';
import { cn } from '@/lib/utils';

/**
 * ContextualHelp: Intelligently renders relevant guidelines based on the current route.
 * Integrated into the LayoutWrapper for zero-disruption documentation access.
 */
export function ContextualHelp() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine which section to show. Handles dynamic routes like [id]
  const sectionKey = useMemo(() => {
    if (!pathname) return null;
    
    // Check for exact matches
    if (MANUAL_DATA[pathname]) return pathname;
    
    // Check for dynamic ID routes
    if (pathname.startsWith('/internal/public-complaints/') && pathname.split('/').length === 4) {
      return '/internal/public-complaints/[id]';
    }
    if (pathname.startsWith('/internal/members/') && pathname.split('/').length === 4) {
      return '/internal/members/[id]';
    }

    return null;
  }, [pathname]);

  const content = sectionKey ? MANUAL_DATA[sectionKey] : null;

  if (!mounted || !content) return null;

  return (
    <div className="container mx-auto px-4 mt-6 animate-in fade-in slide-in-from-top-2 duration-700">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group">
        <Card className={cn(
          "border-none shadow-sm transition-all duration-500 overflow-hidden rounded-2xl",
          isOpen ? "bg-white dark:bg-slate-900 ring-2 ring-accent/20" : "bg-slate-100/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900"
        )}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 cursor-pointer select-none">
              <div className="flex items-center gap-3">
                 <div className={cn(
                   "p-1.5 rounded-lg transition-colors",
                   isOpen ? "bg-accent text-primary" : "bg-slate-200 dark:bg-slate-800 text-slate-400 group-hover:text-accent"
                 )}>
                   <Info className="w-3.5 h-3.5" />
                 </div>
                 <div className="flex flex-col">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-primary dark:text-white">Help & Guidelines</h4>
                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                     {isOpen ? "Currently Viewing: " + content.title : "Click to view page instructions & best practices"}
                   </p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 {!isOpen && (
                   <div className="hidden md:flex gap-1">
                      {content.instructions.slice(0, 1).map((_, i) => (
                        <Badge key={i} variant="outline" className="text-[7px] border-slate-200 text-slate-400 font-bold uppercase py-0">Module Protocol Active</Badge>
                      ))}
                   </div>
                 )}
                 <ChevronDown className={cn("w-4 h-4 text-slate-300 transition-transform duration-500", isOpen && "rotate-180 text-accent")} />
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="p-8 pt-2 border-t border-slate-50 dark:border-slate-800 animate-in fade-in duration-500">
               <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                     <div className="space-y-1">
                        <h5 className="text-sm font-black text-accent uppercase tracking-widest flex items-center gap-2">
                           <BookMarked className="w-4 h-4" /> Operational Steps
                        </h5>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Procedural roadmap for this module</p>
                     </div>
                     <ul className="space-y-3">
                        {content.instructions.map((step, i) => (
                          <li key={i} className="flex items-start gap-3 text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                             <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-400">{i + 1}</span>
                             {step}
                          </li>
                        ))}
                     </ul>
                  </div>

                  <div className="space-y-8">
                     <div className="space-y-4">
                        <div className="space-y-1">
                           <h5 className="text-sm font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4" /> Performance Tips
                           </h5>
                        </div>
                        <div className="grid gap-2">
                           {content.tips.map((tip, i) => (
                             <div key={i} className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-3">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 italic">"{tip}"</p>
                             </div>
                           ))}
                        </div>
                     </div>

                     {content.mandates && (
                        <div className="space-y-4">
                           <div className="space-y-1">
                              <h5 className="text-sm font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                                 <AlertCircle className="w-4 h-4" /> Governance Mandates
                              </h5>
                           </div>
                           <div className="grid gap-2">
                              {content.mandates.map((m, i) => (
                                <div key={i} className="p-3 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30 flex items-start gap-3">
                                   <ArrowRight className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                                   <p className="text-[10px] font-black text-red-900 dark:text-red-400 uppercase tracking-tight leading-relaxed">{m}</p>
                                </div>
                              ))}
                           </div>
                        </div>
                     )}
                  </div>
               </div>
               
               <div className="mt-10 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Authorized Institutional Documentation</p>
                  <Link href="/internal/manual" className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline flex items-center gap-2">
                     Open Full Manual <ChevronRight className="w-3 h-3" />
                  </Link>
               </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}

import { useMemo } from 'react';
