'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  ShieldCheck, 
  Sparkles, 
  Calendar as CalendarIcon, 
  Image as ImageIcon,
  Upload,
  ArrowRight,
  Wifi
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

/**
 * Internal Occasions Governance: Real-time management terminal.
 * Changes committed here are instantly synced to the public OccasionBanner.
 */
export default function InternalOccasionsManagement() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [search, setSearch] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editOccasion, setEditOccasion] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [newOccasion, setNewOccasion] = useState({
    title: '',
    message: '',
    imageUrl: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    isActive: true,
    priority: 1
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login');
    }
  }, [user, authLoading, router]);

  const occasionsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'occasions'), orderBy('priority', 'desc'));
  }, [db, user]);

  const { data: occasions, loading: dataLoading } = useCollection(occasionsQuery);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 204800) { // 200KB limit for Firestore stability
        toast({ variant: "destructive", title: "Asset Size Alert", description: "Institutional banners must be under 200KB for optimized storage." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        if (isEdit) setEditOccasion({ ...editOccasion, imageUrl: dataUri });
        else setNewOccasion({ ...newOccasion, imageUrl: dataUri });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddOccasion = async () => {
    if (!db) return;
    if (!newOccasion.title || !newOccasion.imageUrl) {
      toast({ variant: "destructive", title: "Validation Error", description: "Greeting Title and Banner Image are mandatory." });
      return;
    }
    setIsActionLoading(true);
    addDoc(collection(db, 'occasions'), { ...newOccasion, createdAt: serverTimestamp() })
      .then(() => {
        toast({ title: "Greeting Published", description: "Real-time sync established with public home page." });
        setIsAddDialogOpen(false);
        setNewOccasion({ title: '', message: '', imageUrl: '', startDate: format(new Date(), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd'), isActive: true, priority: 1 });
      })
      .finally(() => setIsActionLoading(false));
  };

  const handleUpdateOccasion = async () => {
    if (!db || !editOccasion) return;
    setIsActionLoading(true);
    const { id, ...data } = editOccasion;
    updateDoc(doc(db, 'occasions', id), data)
      .then(() => {
        toast({ title: "Registry Updated", description: "Changes reflected instantly on public portal." });
        setIsEditDialogOpen(false);
        setEditOccasion(null);
      })
      .finally(() => setIsActionLoading(false));
  };

  const handleDeleteOccasion = async (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'occasions', id)).then(() => toast({ title: "Record Purged" }));
  };

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>;
  }

  const filtered = (occasions || []).filter((occ: any) => 
    occ.title.toLowerCase().includes(search.toLowerCase()) || 
    occ.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[9px] font-bold uppercase border border-emerald-500/30 tracking-[0.2em]">
              <Wifi className="w-2.5 h-2.5 animate-pulse" /> Live Broadcast Control
            </div>
            <h1 className="text-3xl md:text-4xl font-headline font-bold">Institutional <span className="text-accent italic">Occasions</span></h1>
            <p className="text-slate-400 text-[11px] uppercase tracking-widest font-black">Central Greetings & Festival Registry</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-primary font-bold rounded-xl h-11 px-8 flex gap-2 shadow-2xl shadow-accent/20 hover:bg-secondary hover:text-white transition-all transform hover:scale-105 active:scale-95">
                <Plus className="w-4 h-4" /> New Occasion Greeting
              </Button>
            </DialogTrigger>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-2xl rounded-[2.5rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline font-bold">Greeting Setup Protocol</DialogTitle>
                <DialogDescription>Banners are pushed to the homepage in real-time based on priority and dates.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-2">
                <div className="flex flex-col items-center gap-4 p-5 border-2 border-dashed rounded-[2rem] bg-slate-50 dark:bg-slate-900 border-slate-200 shadow-inner">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-200 border-4 border-white shadow-xl">
                    {newOccasion.imageUrl ? <Image src={newOccasion.imageUrl} alt="Preview" fill className="object-cover" /> : <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400"><ImageIcon className="w-10 h-10" /><span className="text-[10px] font-black uppercase">Banner Area</span></div>}
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, false)} />
                  </div>
                  <Label className="text-[10px] font-black uppercase text-slate-400">Click to upload seasonal banner (Max 200KB)</Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Occasion Title</Label>
                    <Input placeholder="e.g. Independence Day 2025" value={newOccasion.title} onChange={e => setNewOccasion({...newOccasion, title: e.target.value})} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Display Priority (Rank)</Label>
                    <Input type="number" value={newOccasion.priority} onChange={e => setNewOccasion({...newOccasion, priority: Number(e.target.value)})} className="h-11 rounded-xl" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Activation Date</Label>
                    <Input type="date" value={newOccasion.startDate} onChange={e => setNewOccasion({...newOccasion, startDate: e.target.value})} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Deactivation Date</Label>
                    <Input type="date" value={newOccasion.endDate} onChange={e => setNewOccasion({...newOccasion, endDate: e.target.value})} className="h-11 rounded-xl" />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Greeting Narrative</Label>
                  <Textarea placeholder="Wishing every citizen a prosperous year ahead..." value={newOccasion.message} onChange={e => setNewOccasion({...newOccasion, message: e.target.value})} className="rounded-xl min-h-[80px]" />
                </div>

                <div className="flex items-center justify-between p-5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <Label className="font-bold text-primary dark:text-emerald-400">Enable Live Broadcast</Label>
                  </div>
                  <Switch checked={newOccasion.isActive} onCheckedChange={val => setNewOccasion({...newOccasion, isActive: val})} className="data-[state=checked]:bg-emerald-500" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddOccasion} disabled={isActionLoading} className="w-full h-14 rounded-2xl bg-accent text-primary font-bold text-lg hover:bg-secondary hover:text-white shadow-2xl shadow-accent/20 transition-all">Establish Official Entry</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <section className="py-6 border-b bg-white dark:bg-slate-900 sticky top-10 z-30 shadow-sm transition-colors">
        <div className="container mx-auto px-4">
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search active greetings..." className="pl-9 h-11 rounded-xl border-slate-200 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="py-8 pb-20">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" /></div>
          ) : (
            <div className="grid gap-6 max-w-5xl mx-auto">
              {filtered.map((occ: any) => (
                <Card key={occ.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 group hover:shadow-2xl transition-all duration-500">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className="relative w-full md:w-72 aspect-video md:aspect-auto overflow-hidden shrink-0 border-r border-slate-100 dark:border-slate-800">
                         <Image src={occ.imageUrl} alt="Banner" fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                         <div className="absolute top-4 left-4">
                           <Badge className={cn("text-[9px] font-black uppercase tracking-[0.1em] px-3 py-1 rounded-full", occ.isActive ? "bg-emerald-500 text-white" : "bg-slate-500 text-white")}>
                             {occ.isActive ? "BROADCAST LIVE" : "TERMINATED"}
                           </Badge>
                         </div>
                      </div>
                      <div className="flex-1 p-8 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                           <div className="space-y-1.5">
                              <h3 className="text-2xl font-headline font-bold text-primary dark:text-white leading-tight group-hover:text-accent transition-colors">{occ.title}</h3>
                              <div className="flex items-center gap-4 text-[10px] font-black uppercase text-slate-400 tracking-[0.15em]">
                                 <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg"><CalendarIcon className="w-3 h-3 text-accent" /> {occ.startDate} <ArrowRight className="w-2.5 h-2.5 mx-1" /> {occ.endDate}</span>
                                 <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg"><Sparkles className="w-3 h-3 text-accent" /> Priority: {occ.priority}</span>
                              </div>
                           </div>
                           <div className="flex items-center gap-2 shrink-0">
                              <Button variant="outline" size="sm" onClick={() => { setEditOccasion(occ); setIsEditDialogOpen(true); }} className="h-10 px-5 rounded-xl text-[10px] font-bold border-slate-200 hover:bg-accent hover:text-primary hover:border-accent transition-all">Modify</Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteOccasion(occ.id)} className="h-10 w-10 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4.5 h-4.5" /></Button>
                           </div>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-inner italic text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          "{occ.message}"
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filtered.length === 0 && (
                <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800 opacity-40">
                   <ImageIcon className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                   <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Registry Node Empty</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl">
          <DialogHeader><DialogTitle className="text-2xl font-headline font-bold">Refine Greeting Metadata</DialogTitle></DialogHeader>
          {editOccasion && (
            <div className="space-y-6 py-2">
                <div className="flex flex-col items-center gap-4 p-5 border-2 border-dashed rounded-[2rem] bg-slate-50 dark:bg-slate-900 shadow-inner">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-200 border-4 border-white">
                    <Image src={editOccasion.imageUrl} alt="Banner" fill className="object-cover" />
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, true)} />
                  </div>
                  <Label className="text-[10px] font-black uppercase text-slate-400">Replace current banner</Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Title</Label><Input value={editOccasion.title} onChange={e => setEditOccasion({...editOccasion, title: e.target.value})} className="h-11 rounded-xl" /></div>
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Priority</Label><Input type="number" value={editOccasion.priority} onChange={e => setEditOccasion({...editOccasion, priority: Number(e.target.value)})} className="h-11 rounded-xl" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Start Date</Label><Input type="date" value={editOccasion.startDate} onChange={e => setEditOccasion({...editOccasion, startDate: e.target.value})} className="h-11 rounded-xl" /></div>
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">End Date</Label><Input type="date" value={editOccasion.endDate} onChange={e => setEditOccasion({...editOccasion, endDate: e.target.value})} className="h-11 rounded-xl" /></div>
                </div>
                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Message</Label><Textarea value={editOccasion.message} onChange={e => setEditOccasion({...editOccasion, message: e.target.value})} className="rounded-xl min-h-[100px]" /></div>
                <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100">
                  <Label className="font-bold">Active Broadcast</Label>
                  <Switch checked={editOccasion.isActive} onCheckedChange={val => setEditOccasion({...editOccasion, isActive: val})} />
                </div>
                <Button onClick={handleUpdateOccasion} disabled={isActionLoading} className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-2xl mt-4 hover:bg-secondary transition-all">Commit Profile Refresh</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Footer />
    </main>
  );
}
