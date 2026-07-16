
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
  ArrowRight
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
      if (file.size > 204800) { // 200KB limit
        toast({ variant: "destructive", title: "File too large", description: "Banner images must be under 200KB for institutional storage." });
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
      toast({ variant: "destructive", title: "Validation Error", description: "Title and Image are mandatory." });
      return;
    }
    setIsActionLoading(true);
    addDoc(collection(db, 'occasions'), { ...newOccasion, createdAt: serverTimestamp() })
      .then(() => {
        toast({ title: "Occasion Published" });
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
        toast({ title: "Occasion Updated" });
        setIsEditDialogOpen(false);
        setEditOccasion(null);
      })
      .finally(() => setIsActionLoading(false));
  };

  const handleDeleteOccasion = async (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'occasions', id)).then(() => toast({ title: "Occasion Purged" }));
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
      <section className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-bold uppercase border border-accent/30 tracking-widest">
              <ShieldCheck className="w-2.5 h-2.5" /> Greeting Governance
            </div>
            <h1 className="text-3xl md:text-4xl font-headline font-bold">Institutional <span className="text-accent italic">Occasions</span></h1>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-primary font-bold rounded-xl h-11 px-6 flex gap-2 shadow-lg hover:bg-secondary hover:text-white transition-all">
                <Plus className="w-4 h-4" /> New Occasion Greeting
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-[2.5rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle>Occasion Entry Documentation</DialogTitle>
                <DialogDescription>Setup festive banners and greetings for the public homepage.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-2">
                <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-3xl bg-slate-50 dark:bg-slate-900 border-slate-200">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-200">
                    {newOccasion.imageUrl ? <Image src={newOccasion.imageUrl} alt="Preview" fill className="object-cover" /> : <div className="flex items-center justify-center h-full"><ImageIcon className="w-10 h-10 text-slate-400" /></div>}
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, false)} />
                  </div>
                  <Label className="text-[10px] font-black uppercase text-slate-400">Click banner area to upload greeting image (Max 200KB)</Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase">Occasion Title</Label>
                    <Input placeholder="e.g. Independence Day 2025" value={newOccasion.title} onChange={e => setNewOccasion({...newOccasion, title: e.target.value})} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase">Display Priority (Highest first)</Label>
                    <Input type="number" value={newOccasion.priority} onChange={e => setNewOccasion({...newOccasion, priority: Number(e.target.value)})} className="h-11 rounded-xl" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase">Activation Date</Label>
                    <Input type="date" value={newOccasion.startDate} onChange={e => setNewOccasion({...newOccasion, startDate: e.target.value})} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase">Deactivation Date</Label>
                    <Input type="date" value={newOccasion.endDate} onChange={e => setNewOccasion({...newOccasion, endDate: e.target.value})} className="h-11 rounded-xl" />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase">Short Greeting Message</Label>
                  <Textarea placeholder="e.g. Wishing every citizen a prosperous year ahead..." value={newOccasion.message} onChange={e => setNewOccasion({...newOccasion, message: e.target.value})} className="rounded-xl min-h-[80px]" />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <Label className="font-bold">Enable for Public Display</Label>
                  <Switch checked={newOccasion.isActive} onCheckedChange={val => setNewOccasion({...newOccasion, isActive: val})} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddOccasion} disabled={isActionLoading} className="w-full h-12 rounded-xl bg-accent text-primary font-bold hover:bg-secondary hover:text-white shadow-xl shadow-accent/20">Establish Official Entry</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <section className="py-6 border-b bg-white dark:bg-slate-900 sticky top-10 z-30 shadow-sm transition-colors">
        <div className="container mx-auto px-4">
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Filter institutional greetings..." className="pl-9 h-11 rounded-xl border-slate-200 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" /></div>
          ) : (
            <div className="grid gap-6 max-w-5xl mx-auto">
              {filtered.map((occ: any) => (
                <Card key={occ.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 group">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className="relative w-full md:w-64 aspect-video md:aspect-auto overflow-hidden shrink-0 border-r border-slate-100 dark:border-slate-800">
                         <Image src={occ.imageUrl} alt="Banner" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                         <div className="absolute top-3 left-3">
                           <Badge className={cn("text-[8px] font-black uppercase tracking-widest", occ.isActive ? "bg-emerald-500" : "bg-slate-500")}>
                             {occ.isActive ? "LIVE" : "INACTIVE"}
                           </Badge>
                         </div>
                      </div>
                      <div className="flex-1 p-6 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                           <div className="space-y-1">
                              <h3 className="text-xl font-headline font-bold text-primary dark:text-white leading-tight">{occ.title}</h3>
                              <div className="flex items-center gap-4 text-[9px] font-black uppercase text-slate-400 tracking-[0.1em]">
                                 <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3 text-accent" /> {occ.startDate} <ArrowRight className="w-2.5 h-2.5" /> {occ.endDate}</span>
                                 <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-accent" /> Priority: {occ.priority}</span>
                              </div>
                           </div>
                           <div className="flex items-center gap-2 shrink-0">
                              <Button variant="outline" size="sm" onClick={() => { setEditOccasion(occ); setIsEditDialogOpen(true); }} className="h-9 px-4 rounded-xl text-[10px] font-bold border-slate-200">Modify</Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteOccasion(occ.id)} className="h-9 w-9 text-slate-300 hover:text-red-500 rounded-xl"><Trash2 className="w-4 h-4" /></Button>
                           </div>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 italic">"{occ.message}"</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filtered.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                   <ImageIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No occasion greetings identified in the registry.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl">
          <DialogHeader><DialogTitle>Modify Institutional Greeting</DialogTitle></DialogHeader>
          {editOccasion && (
            <div className="space-y-6 py-2">
                <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-3xl bg-slate-50 dark:bg-slate-900">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-200">
                    <Image src={editOccasion.imageUrl} alt="Banner" fill className="object-cover" />
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, true)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Title</Label><Input value={editOccasion.title} onChange={e => setEditOccasion({...editOccasion, title: e.target.value})} /></div>
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Priority</Label><Input type="number" value={editOccasion.priority} onChange={e => setEditOccasion({...editOccasion, priority: Number(e.target.value)})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Start Date</Label><Input type="date" value={editOccasion.startDate} onChange={e => setEditOccasion({...editOccasion, startDate: e.target.value})} /></div>
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">End Date</Label><Input type="date" value={editOccasion.endDate} onChange={e => setEditOccasion({...editOccasion, endDate: e.target.value})} /></div>
                </div>
                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Greeting Message</Label><Textarea value={editOccasion.message} onChange={e => setEditOccasion({...editOccasion, message: e.target.value})} className="rounded-xl min-h-[80px]" /></div>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100">
                  <Label className="font-bold">Active Status</Label>
                  <Switch checked={editOccasion.isActive} onCheckedChange={val => setEditOccasion({...editOccasion, isActive: val})} />
                </div>
                <Button onClick={handleUpdateOccasion} disabled={isActionLoading} className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-lg mt-4">Commit Profile Refresh</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Footer />
    </main>
  );
}
