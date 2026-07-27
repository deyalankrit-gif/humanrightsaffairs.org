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
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  RefreshCcw, 
  Loader2, 
  ShieldCheck, 
  History,
  PackageCheck,
  ChevronRight,
  Plus,
  Minus,
  Tag,
  MapPin,
  X
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog"
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

/**
 * STOCK INVENTORY HUB
 * Reconciliation terminal for institutional supplies.
 * Synchronized with Material Management Registry.
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

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  const filtered = (materials || []).filter((m: any) => 
    m.name?.toLowerCase().includes(search.toLowerCase()) || 
    m.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
               <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-bold uppercase border border-accent/30 tracking-widest">
                 <ShieldCheck className="w-2.5 h-2.5" /> Stability Protocol
               </div>
               <h1 className="text-3xl md:text-4xl font-headline font-bold">Stock <span className="text-accent italic">Inventory</span></h1>
               <p className="text-slate-400 text-[11px] uppercase font-black tracking-widest">Tactical Stock Reconciliation Hub</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
               <div className="bg-white/5 px-6 py-2 rounded-xl border border-white/10 text-center">
                  <p className="text-[8px] text-slate-500 font-bold uppercase mb-0.5">Critical Alerts</p>
                  <p className="text-lg font-bold text-red-500">{stats.outOfStock + stats.lowStock}</p>
               </div>
               <div className="bg-white/5 px-6 py-2 rounded-xl border border-white/10 text-center">
                  <p className="text-[8px] text-slate-500 font-bold uppercase mb-0.5">Total Assets</p>
                  <p className="text-lg font-bold text-white">{stats.totalItems}</p>
               </div>
            </div>
          </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
           <h2 className="text-xl font-headline font-bold text-primary dark:text-white flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-accent" /> Live Reconciliation Registry
           </h2>
           <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Search catalog by name or SKU..." className="pl-10 h-11 rounded-xl bg-white dark:bg-slate-900 shadow-sm border-none" value={search} onChange={e => setSearch(e.target.value)} />
           </div>
        </div>

        {dataLoading ? (
          <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" /></div>
        ) : (
          <div className="grid gap-4">
             {filtered.map((item: any) => (
               <Card key={item.id} className={cn(
                 "border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] border transition-all hover:shadow-lg",
                 item.status === 'Out of Stock' ? "border-l-4 border-l-red-600" : 
                 item.status === 'Low Stock' ? "border-l-4 border-l-amber-500" : "border-l-4 border-l-emerald-500"
               )}>
                  <CardContent className="p-0">
                     <div className="flex flex-col md:flex-row items-stretch">
                        <div className="p-6 md:w-56 text-center border-r flex flex-col items-center justify-center shrink-0 bg-slate-50 dark:bg-slate-800/50">
                           <p className="text-2xl font-black text-primary dark:text-white leading-none">{item.currentStock}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{item.unit}</p>
                           <Badge variant="outline" className={cn(
                             "mt-3 text-[8px] font-black uppercase border-none text-white px-3",
                             item.status === 'Available' ? 'bg-emerald-500' : 
                             item.status === 'Low Stock' ? 'bg-amber-500' : 'bg-red-500'
                           )}>{item.status}</Badge>
                        </div>
                        
                        <div className="flex-1 p-6 flex flex-col md:flex-row items-center justify-between gap-8">
                           <div className="space-y-1 flex-1 text-center md:text-left">
                              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                                 <Badge variant="outline" className="text-[7px] font-bold border-accent/30 text-accent uppercase">{item.category}</Badge>
                                 <span className="text-[9px] font-mono text-slate-400">{item.sku}</span>
                              </div>
                              <h3 className="text-lg font-bold text-primary dark:text-white leading-tight">{item.name}</h3>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start">
                                 <History className="w-3 h-3" /> Warning Threshold: {item.lowStockThreshold}
                              </p>
                           </div>

                           <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-2 rounded-2xl border">
                              <Button 
                                onClick={() => handleAdjustStock(item.id, item.name, -1)} 
                                disabled={isAdjusting === item.id || item.currentStock <= 0}
                                variant="ghost" 
                                size="icon" 
                                className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 text-red-500 hover:bg-red-50 shadow-sm"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <div className="w-16 text-center text-xs font-black text-slate-500 uppercase">Adjust</div>
                              <Button 
                                onClick={() => handleAdjustStock(item.id, item.name, 1)} 
                                disabled={isAdjusting === item.id}
                                variant="ghost" 
                                size="icon" 
                                className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 text-emerald-600 hover:bg-emerald-50 shadow-sm"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                           </div>

                           <div className="flex items-center gap-2">
                              <Dialog>
                                 <DialogTrigger asChild>
                                    <Button variant="outline" className="h-10 px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest border-2">Bulk Receipt</Button>
                                 </DialogTrigger>
                                 <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl">
                                    <DialogHeader>
                                       <DialogTitle>Stock Replenishment Protocol</DialogTitle>
                                       <DialogDescription>Input the quantity received for "{item.name}".</DialogDescription>
                                    </DialogHeader>
                                    <div className="py-6 space-y-4">
                                       <div className="space-y-1">
                                          <Label className="text-[10px] font-bold uppercase text-slate-400">Incoming Units ({item.unit})</Label>
                                          <Input id="bulk-amt" type="number" placeholder="e.g. 50" className="h-12 text-2xl font-black text-center rounded-xl" />
                                       </div>
                                       <Button 
                                         onClick={() => {
                                           const val = (document.getElementById('bulk-amt') as HTMLInputElement).value;
                                           if (val) handleAdjustStock(item.id, item.name, Number(val));
                                         }}
                                         disabled={isAdjusting === item.id}
                                         className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                       >
                                         {isAdjusting === item.id ? <Loader2 className="animate-spin" /> : "Authorize Receipt"}
                                       </Button>
                                    </div>
                                 </DialogContent>
                              </Dialog>
                           </div>
                        </div>
                     </div>
                  </CardContent>
               </Card>
             ))}
             {filtered.length === 0 && (
                <div className="text-center py-24 opacity-30">
                   <Boxes className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                   <p className="text-sm font-bold uppercase tracking-widest">No matching stock nodes found</p>
                </div>
             )}
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}
