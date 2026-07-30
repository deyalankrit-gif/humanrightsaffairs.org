
"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, doc, updateDoc, serverTimestamp, increment } from 'firebase/firestore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Footer } from '@/components/footer'
import { 
  Boxes, 
  Search, 
  RefreshCw, 
  Loader2, 
  ShieldCheck, 
  History,
  Plus,
  Minus,
  Tag,
  MapPin,
  X
} from 'lucide-center'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog"
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

/**
 * STOCK INVENTORY HUB
 * Reconciliation terminal for institutional supplies.
 * Synchronized with Material Management Registry and Kit Management Issuances.
 */
export default function StockInventoryHub() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [isAdjusting, setIsAdjusting] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  const materialsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'materials'), orderBy('currentStock', 'asc'));
  }, [db, user]);

  const { data: materials, loading: dataLoading } = useCollection(materialsQuery);

  const stats = useMemo(() => {
    if (!materials) return { totalItems: 0, lowStock: 0, outOfStock: 0 };
    return {
      totalItems: materials.length,
      lowStock: materials.filter((m: any) => m.status === 'Low Stock').length,
      outOfStock: materials.filter((m: any) => m.status === 'Out of Stock').length,
    }
  }, [materials]);

  const handleAdjustStock = async (id: string, name: string, delta: number) => {
    if (!db) return
    setIsAdjusting(id)
    
    const materialRef = doc(db, 'materials', id)
    const currentItem = materials?.find(m => m.id === id) as any
    const newStock = Math.max(0, (currentItem?.currentStock || 0) + delta)
    const threshold = currentItem?.lowStockThreshold || 10
    
    const newStatus = newStock <= 0 ? 'Out of Stock' : 
                      newStock <= threshold ? 'Low Stock' : 'Available';

    updateDoc(materialRef, {
      currentStock: newStock,
      status: newStatus,
      updatedAt: serverTimestamp(),
      lastModifiedBy: user?.email
    })
      .then(() => {
        toast({ 
          title: delta > 0 ? "Inventory Replenished" : "Stock Disbursed",
          description: `${name} updated to ${newStock} units.`
        })
      })
      .finally(() => setIsAdjusting(null))
  }

  if (authLoading || (user && dataLoading)) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  const filtered = (materials || []).filter((m: any) => 
    (m.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (m.sku || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
               <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-bold uppercase border border-accent/30 tracking-widest">
                 <ShieldCheck className="w-2.5 h-2.5" /> Stability Protocol
               </div>
               <h1 className="text-3xl md:text-4xl font-headline font-bold leading-tight">Stock <span className="text-accent italic">Inventory</span></h1>
               <p className="text-slate-400 text-[11px] uppercase font-black tracking-widest">Tactical Stock Reconciliation Hub</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
               <div className="bg-white/5 px-6 py-2 rounded-xl border border-white/10 text-center flex-1">
                  <p className="text-[8px] text-slate-500 font-bold uppercase mb-0.5">Critical Alerts</p>
                  <p className="text-lg font-bold text-red-500 leading-none">{stats.outOfStock + stats.lowStock}</p>
               </div>
               <div className="bg-white/5 px-6 py-2 rounded-xl border border-white/10 text-center flex-1">
                  <p className="text-[8px] text-slate-500 font-bold uppercase mb-0.5">Total Assets</p>
                  <p className="text-lg font-bold text-white leading-none">{stats.totalItems}</p>
               </div>
            </div>
          </div>
        </div>
      </header>

      <section className="py-6 bg-white dark:bg-slate-900 border-b sticky top-10 z-40 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
             <h2 className="text-xl font-headline font-bold text-primary dark:text-white flex items-center gap-3 w-full md:w-auto">
                <RefreshCw className="w-5 h-5 text-accent" /> Live Reconciliation Registry
             </h2>
             <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Search catalog by name or SKU..." className="pl-10 h-12 md:h-11 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none shadow-inner text-sm" value={search} onChange={e => setSearch(e.target.value)} />
             </div>
          </div>
        </div>
      </section>

      <section className="py-8 container mx-auto px-4">
          <div className="grid gap-4 max-w-5xl mx-auto">
             {filtered.map((item: any) => (
               <Card key={item.id} className={cn(
                 "border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] border transition-all active:scale-[0.99]",
                 item.status === 'Out of Stock' ? "border-l-4 border-l-red-600" : 
                 item.status === 'Low Stock' ? "border-l-4 border-l-amber-500" : "border-l-4 border-l-emerald-500"
               )}>
                  <CardContent className="p-0">
                     <div className="flex flex-col md:flex-row items-stretch">
                        <div className="p-6 md:w-56 text-center border-r flex flex-col items-center justify-center shrink-0 bg-slate-50 dark:bg-slate-800/50">
                           <p className="text-2xl font-black text-primary dark:text-white leading-none">{item.currentStock}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{item.unit}</p>
                           <Badge className={cn(
                             "mt-3 text-[9px] font-black uppercase border-none text-white px-3 h-5",
                             item.status === 'Available' ? 'bg-emerald-500' : 
                             item.status === 'Low Stock' ? 'bg-amber-500' : 'bg-red-500'
                           )}>{item.status}</Badge>
                        </div>
                        
                        <div className="flex-1 p-6 flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8">
                           <div className="space-y-1.5 flex-1 text-center md:text-left">
                              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                                 <Badge variant="outline" className="text-[7px] font-black border-accent/20 text-accent uppercase tracking-widest px-2">CATEGORY: {item.category}</Badge>
                                 <span className="text-[9px] font-mono font-bold text-slate-400 tracking-tighter">SKU: {item.sku}</span>
                              </div>
                              <h3 className="text-lg md:text-xl font-bold text-primary dark:text-white leading-tight">{item.name}</h3>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start">
                                 <History className="w-3.5 h-3.5 text-accent" /> Warning Threshold: {item.lowStockThreshold}
                              </p>
                           </div>

                           <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 w-full sm:w-auto justify-between sm:justify-center">
                                 <Button 
                                   onClick={() => handleAdjustStock(item.id, item.name, -1)} 
                                   disabled={isAdjusting === item.id || item.currentStock <= 0}
                                   variant="ghost" 
                                   size="icon" 
                                   className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 text-red-500 hover:bg-red-50 shadow-sm border border-slate-100"
                                 >
                                   <Minus className="w-4 h-4" />
                                 </Button>
                                 <div className="px-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Adjust</div>
                                 <Button 
                                   onClick={() => handleAdjustStock(item.id, item.name, 1)} 
                                   disabled={isAdjusting === item.id}
                                   variant="ghost" 
                                   size="icon" 
                                   className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 text-emerald-600 hover:bg-emerald-50 shadow-sm border border-slate-100"
                                 >
                                   <Plus className="w-4 h-4" />
                                 </Button>
                              </div>

                              <Dialog>
                                 <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full sm:w-auto h-11 md:h-10 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 hover:bg-accent hover:text-primary transition-all">Bulk Receipt</Button>
                                 </DialogTrigger>
                                 <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl w-[95vw] p-8">
                                    <DialogHeader>
                                       <DialogTitle className="text-2xl font-headline font-bold">Registry Reconciliation</DialogTitle>
                                       <DialogDescription className="text-xs uppercase tracking-widest font-bold text-slate-400">Input quantity received for "{item.name}".</DialogDescription>
                                    </DialogHeader>
                                    <div className="py-8 space-y-6">
                                       <div className="space-y-2">
                                          <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Incoming Units ({item.unit})</Label>
                                          <Input id={`bulk-${item.id}`} type="number" placeholder="0" className="h-16 text-4xl font-black text-center rounded-2xl bg-slate-50 border-none shadow-inner" />
                                       </div>
                                       <Button 
                                         onClick={() => {
                                           const input = document.getElementById(`bulk-${item.id}`) as HTMLInputElement;
                                           if (input.value) handleAdjustStock(item.id, item.name, Number(input.value));
                                         }}
                                         disabled={isAdjusting === item.id}
                                         className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-xl shadow-emerald-900/20"
                                       >
                                         {isAdjusting === item.id ? <Loader2 className="animate-spin" /> : "Authorize Registry Update"}
                                       </Button>
                                    </div>
                                    <DialogFooter>
                                       <DialogClose asChild>
                                          <Button variant="ghost" className="w-full text-slate-400 font-bold uppercase text-[10px] tracking-widest">Abort Process</Button>
                                       </DialogClose>
                                    </DialogFooter>
                                 </DialogContent>
                              </Dialog>
                           </div>
                        </div>
                     </div>
                  </CardContent>
               </Card>
             ))}
             {filtered.length === 0 && (
                <div className="text-center py-40 opacity-30">
                   <Boxes className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                   <p className="text-lg font-headline font-bold uppercase tracking-widest">No stock nodes found</p>
                </div>
             )}
          </div>
      </section>

      <Footer />
    </main>
  )
}
