
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  ChevronLeft,
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
  Crown,
  Zap,
  ShieldAlert,
  Menu,
  X,
  LayoutDashboard,
  BarChart3,
  ShieldQuestion,
  Archive,
  Receipt,
  Users,
  Settings2,
  Newspaper,
  Handshake,
  BookMarked,
  Gavel
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetHeader, 
  SheetTitle
} from '@/components/ui/sheet';
import { MANUAL_DATA, type ManualSection } from './manual-content';
import { cn } from '@/lib/utils';
import { Footer } from '@/components/footer';

/**
 * UserManualPage: High-fidelity GitBook-style documentation terminal.
 * Features a sticky inner sidebar, independent content scrolling, and sequential navigation.
 */
export default function UserManualPage() {
  const [search, setSearch] = useState('');
  const [activeSectionId, setActiveSectionId] = useState<string>('daily-update');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Persist selection on refresh
    const saved = localStorage.getItem('hrat_manual_active_node');
    if (saved && MANUAL_DATA[saved]) {
      setActiveSectionId(MANUAL_DATA[saved].id);
    }
  }, []);

  const sections = Object.values(MANUAL_DATA);
  
  // Logical Grouping for the Sidebar
  const navigationGroups = useMemo(() => [
    {
      title: "Core Operations",
      items: [
        { id: "daily-update", label: "Daily Update", icon: LayoutDashboard },
      ]
    },
    {
      title: "Force Intelligence",
      items: [
        { id: "donations-analytics", label: "Donation Analytics", icon: BarChart3 },
        { id: "member-analytics", label: "Member Analytics", icon: Globe },
      ]
    },
    {
      title: "Case Management",
      items: [
        { id: "complaints-registry", label: "Complaints Registry", icon: ShieldQuestion },
        { id: "case-investigation", label: "Investigation Hub", icon: Gavel },
      ]
    },
    {
      title: "Logistics & Assets",
      items: [
        { id: "kit-logistics", label: "Kit Management", icon: Archive },
        { id: "material-registry", label: "Material System", icon: Settings2 },
      ]
    },
    {
      title: "Legal & Finance",
      items: [
        { id: "vms-terminal", label: "VMS Terminal", icon: Receipt },
        { id: "voucher-generation", label: "Generate Instrument", icon: FileText },
      ]
    },
    {
      title: "Personnel & Policy",
      items: [
        { id: "member-directory", label: "Secure Registry", icon: Users },
        { id: "access-governance", label: "Access Roles", icon: ShieldAlert },
        { id: "news-governance", label: "News Governance", icon: Newspaper },
        { id: "meetings-registry", label: "Meeting Registry", icon: Handshake },
      ]
    }
  ], []);

  const filteredSections = useMemo(() => {
    if (!search.trim()) return sections;
    return sections.filter(s => 
      s.title.toLowerCase().includes(search.toLowerCase()) || 
      s.subtitle.toLowerCase().includes(search.toLowerCase()) ||
      s.instructions.some(i => i.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, sections]);

  const activeContent = sections.find(s => s.id === activeSectionId) || sections[0];
  
  const currentIndex = sections.findIndex(s => s.id === activeSectionId);
  const prevSection = currentIndex > 0 ? sections[currentIndex - 1] : null;
  const nextSection = currentIndex < sections.length - 1 ? sections[currentIndex + 1] : null;

  const handleNavigate = (id: string, fullPath?: string) => {
    setActiveSectionId(id);
    if (fullPath) localStorage.setItem('hrat_manual_active_node', fullPath);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!mounted) return null;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search manual..." 
            className="pl-9 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-none shadow-inner text-xs"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-2 pb-10 min-h-0">
        <div className="space-y-6">
          {navigationGroups.map((group, gIdx) => {
            const groupItems = group.items.filter(item => 
              filteredSections.some(fs => fs.id === item.id)
            );

            if (groupItems.length === 0) return null;

            return (
              <div key={gIdx} className="space-y-1">
                <h4 className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{group.title}</h4>
                {groupItems.map((item) => {
                  const isActive = activeSectionId === item.id;
                  const fullPath = Object.keys(MANUAL_DATA).find(k => MANUAL_DATA[k].id === item.id);
                  return (
                    <button 
                      key={item.id}
                      onClick={() => handleNavigate(item.id, fullPath)}
                      className={cn(
                        "w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3 group",
                        isActive 
                          ? "bg-accent text-primary shadow-sm" 
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-slate-400 group-hover:text-accent")} />
                      <span className="truncate">{item.label}</span>
                      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Dynamic Header */}
      <header className="h-16 md:h-20 bg-slate-900 text-white flex items-center px-4 md:px-8 border-b-4 border-accent/20 sticky top-12 md:top-10 z-30 shadow-xl">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <div className="lg:hidden">
               <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                 <SheetTrigger asChild>
                   <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                     <Menu className="w-6 h-6" />
                   </Button>
                 </SheetTrigger>
                 <SheetContent side="left" className="p-0 w-72 bg-white dark:bg-slate-900 border-r">
                    <SheetHeader className="p-6 border-b">
                      <SheetTitle className="text-xl font-headline font-bold flex items-center gap-2">
                        <BookMarked className="w-6 h-6 text-accent" /> Manual Index
                      </SheetTitle>
                    </SheetHeader>
                    <SidebarContent />
                 </SheetContent>
               </Sheet>
             </div>
             <div className="flex flex-col">
               <h1 className="text-xl md:text-2xl font-headline font-bold flex items-center gap-2">
                 <ShieldCheck className="w-5 h-5 text-accent hidden sm:block" /> Governance <span className="text-accent italic">Manual</span>
               </h1>
               <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                 <Navigation className="w-2.5 h-2.5 text-accent" /> National Support Node • Protocol v1.0
               </div>
             </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
             <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 font-black uppercase text-[8px]">Registry Verified</Badge>
             <div className="h-8 w-px bg-white/10" />
             <p className="text-[10px] font-bold text-slate-400">Authorized Access Only</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto flex flex-1 w-full">
        {/* Desktop Sticky Sidebar */}
        <aside className="hidden lg:block w-72 border-r bg-white dark:bg-slate-900/50 sticky top-[100px] h-[calc(100vh-140px)] shrink-0">
          <SidebarContent />
        </aside>

        {/* Independent Scroll Content Area */}
        <div className="flex-1 min-w-0 bg-white dark:bg-slate-950">
          <div className="max-w-4xl mx-auto py-8 md:py-12 px-4 md:px-12 space-y-12 pb-32">
            
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 overflow-hidden whitespace-nowrap">
               <span>Manual</span>
               <ChevronRight className="w-3 h-3" />
               <span className="text-primary dark:text-white">{activeContent.title}</span>
            </nav>

            {/* Main Content Render */}
            <article className="animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="space-y-4 mb-16">
                  <div className="flex items-center gap-3">
                     <Badge className="bg-accent text-primary font-black uppercase text-[10px] tracking-widest px-4 h-6">Section Protocol</Badge>
                     <span className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em]">{activeSectionId.replace(/-/g, ' ')}</span>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-headline font-bold text-primary dark:text-white leading-tight">{activeContent.title}</h2>
                  <p className="text-xl text-slate-500 italic font-medium">"{activeContent.subtitle}"</p>
               </div>

               <div className="space-y-16">
                  <section className="space-y-8">
                     <div className="flex items-center gap-4 border-b pb-4">
                        <Navigation className="w-6 h-6 text-accent" />
                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary dark:text-white">Procedural Roadmap</h3>
                     </div>
                     <div className="grid gap-6">
                        {activeContent.instructions.map((step, i) => (
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
                  </section>

                  <div className="grid md:grid-cols-2 gap-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                     <div className="space-y-6">
                        <div className="flex items-center gap-3">
                           <Zap className="w-5 h-5 text-emerald-500" />
                           <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Administrative Tips</h4>
                        </div>
                        <div className="space-y-4">
                           {activeContent.tips.map((tip, i) => (
                             <div key={i} className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-4 shadow-sm">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400 italic">"{tip}"</p>
                             </div>
                           ))}
                        </div>
                     </div>

                     {activeContent.mandates && (
                        <div className="space-y-6">
                           <div className="flex items-center gap-3">
                              <ShieldAlert className="w-5 h-5 text-red-600" />
                              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Governance Mandates</h4>
                           </div>
                           <div className="space-y-4">
                              {activeContent.mandates.map((m, i) => (
                                <div key={i} className="p-5 bg-red-50/50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-start gap-4">
                                   <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                   <p className="text-[10px] font-black text-red-900 dark:text-red-400 uppercase leading-relaxed tracking-tight">{m}</p>
                                </div>
                              ))}
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </article>

            {/* Sequential Paging Navigation */}
            <div className="grid grid-cols-2 gap-4 pt-20 border-t border-slate-100 dark:border-slate-800">
               {prevSection ? (
                 <button 
                  onClick={() => handleNavigate(prevSection.id)}
                  className="flex flex-col gap-2 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-accent transition-all text-left group"
                 >
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Previous
                    </div>
                    <span className="text-sm font-bold text-primary dark:text-white truncate">{prevSection.title}</span>
                 </button>
               ) : <div />}

               {nextSection ? (
                 <button 
                  onClick={() => handleNavigate(nextSection.id)}
                  className="flex flex-col gap-2 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-accent transition-all text-right group items-end"
                 >
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       Next <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <span className="text-sm font-bold text-primary dark:text-white truncate">{nextSection.title}</span>
                 </button>
               ) : <div />}
            </div>

            <div className="pt-10 flex flex-col items-center gap-4 opacity-20">
               <div className="h-px w-32 bg-slate-300" />
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em]">Institutional Intelligence Node</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

/**
 * Enhanced Scroll Area to support flexbox layout constraints.
 */
function ScrollArea({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn("overflow-y-auto custom-scrollbar min-h-0", className)}>
      {children}
    </div>
  );
}
