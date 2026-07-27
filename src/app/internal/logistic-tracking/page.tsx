"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, where, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AdminFooter } from '@/components/admin-footer'
import { 
  Navigation, 
  Search, 
  Truck, 
  MapPin, 
  Clock, 
  Loader2, 
  ShieldCheck, 
  History, 
  Package, 
  ArrowRight,
  Activity,
  ChevronRight,
  CheckCircle2,
  Clock3,
  X,
  RefreshCw,
  Info,
  Hash
} from 'lucide-react'
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
 * LOGISTIC TRACKING SUITE
 * Terminal for tracking the deployment and movement of organizational materials.
 * Synchronized with the master Material Registry.
 */
export default function LogisticTrackingPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [search, setSearch] = useState('')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  const materialsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'materials'), orderBy('updatedAt', 'desc'));
  }, [db, user]);

  const { data: materials, loading: dataLoading } = useCollection(materialsQuery);

  const stats = useMemo(() => {
    if (!materials) return { deployed: 0, inTransit: 0, pending: 0 };
    return {
      deployed: materials.length,
      inTransit: materials.filter((m: any) => (m.currentStock || 0) > 0).length,
      pending: materials.filter((m: any) => m.status === 'Low Stock').length
    }
  }, [materials]);

  const handleUpdateLocation = async (id: string, newLocation: string) => {
    if (!db) return
    setIsActionLoading(true)
    try {
      await updateDoc(doc(db, 'materials', id), {
        location: newLocation,
        updatedAt: serverTimestamp(),
        lastMovementLoggedBy: user?.email
      })
      toast({ title: "Movement Logged", description: `Material repositioned to ${newLocation}.` })
      setSelectedItem(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Tracking Error" })
    } finally {
      setIsActionLoading(false)
    }
  }

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  const filtered = (materials || []).filter((m: any) => 
    m.name?.toLowerCase().includes(search.toLowerCase()) || 
    m.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-accent/30">
                <Navigation className="w-2.5 h-2.5" /> Mobility Node
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold">Logistic <span className="text-accent italic">Tracking</span></h1>
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">Master Deployment & Distribution Terminal</p>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
               {[
                 { label: 'Deployed', val: stats.deployed, color: 'text-emerald-500' },
                 { label: 'Transit', val: stats.inTransit, color: 'text-blue-500' },
                 { label: 'Pipeline', val: stats.pending, color: 'text-amber-500' }
               ].map((s, i) => (
                 <div key={i} className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 text-center min-w-[80px]">
                    <p className="text-[8px] text-slate-500 font-bold uppercase mb-0.5">{s.label}</p>
                    <p className={cn("text-lg font-bold leading-none", s.color)}>{s.val}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
           
           <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 overflow-hidden">
                 <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                       <CardTitle className="text-xl font-headline font-bold flex items-center gap-2">
                          <Activity className="w-5 h-5 text-accent" /> Deployment Registry
                       </CardTitle>
                       <CardDescription>Real-time position monitoring across regional chapters.</CardDescription>
                    </div>
                    <div className="relative w-full md:w-64">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                       <Input placeholder="Search location..." className="pl-9 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border-none text-xs" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                 </CardHeader>
                 <CardContent className="p-0">
                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                       {filtered.map((item: any) => (
                         <div key={item.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-5 flex-1">
                               <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-950 border-2 border-slate-50 dark:border-slate-800 flex items-center justify-center text-accent shadow-sm group-hover:scale-110 transition-transform">
                                  <Package className="w-6 h-6" />
                               </div>
                               <div>
                                  <h4 className="font-bold text-primary dark:text-white group-hover:text-accent transition-colors">{item.name}</h4>
                                  <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                     <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-accent" /> {item.location}</span>
                                     <span className="flex items-center gap-1.5"><Truck className="w-3 h-3 text-accent" /> {item.status}</span>
                                  </div>
                               </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                                <Button onClick={() => setSelectedItem(item)} variant="outline" size="sm" className="h-9 px-6 rounded-xl font-black text-[9px] uppercase tracking-widest border-2 hover:bg-accent hover:text-primary transition-all">Relocate Asset</Button>
                            </div>
                         </div>
                       ))}
                       {filtered.length === 0 && (
                         <div className="py-24 text-center opacity-30">
                            <Truck className="w-12 h-12 mx-auto mb-4" />
                            <p className="text-sm font-bold uppercase tracking-widest">No active deployments found</p>
                         </div>
                       )}
                    </div>
                 </CardContent>
              </Card>
           </div>

           <div className="space-y-6">
              <Card className="border-none shadow-sm rounded-3xl bg-slate-900 text-white p-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                 <h3 className="text-xs font-black uppercase text-accent tracking-[0.2em] mb-8 flex items-center gap-2">
                    <History className="w-4 h-4" /> Logistics Audit Log
                 </h3>
                 <div className="space-y-6">
                    {[
                      { action: 'Registry Sync', loc: 'National HQ', time: '2h ago', status: 'Verified' },
                      { action: 'Asset Movement', loc: 'WB Chapter', time: '5h ago', status: 'Dispatched' },
                      { action: 'Audit Completed', loc: 'Central Cell', time: 'Yesterday', status: 'Secure' }
                    ].map((log, i) => (
                      <div key={i} className="flex gap-4 relative">
                         {i < 2 && <div className="absolute left-[15px] top-8 bottom-[-24px] w-0.5 bg-white/10" />}
                         <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                            <Clock3 className="w-4 h-4 text-accent" />
                         </div>
                         <div className="space-y-1">
                            <p className="text-sm font-bold leading-none">{log.action}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{log.loc}</p>
                            <div className="flex items-center gap-2 mt-2">
                               <Badge variant="outline" className="text-[7px] border-white/10 text-white opacity-50 px-2 h-4">{log.status}</Badge>
                               <span className="text-[8px] text-slate-500 font-black">{log.time}</span>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </Card>

              <div className="p-8 rounded-[2.5rem] bg-indigo-50 dark:bg-indigo-950/20 border-2 border-dashed border-indigo-200 dark:border-indigo-900 text-center space-y-4">
                 <Truck className="w-10 h-10 text-indigo-500 mx-auto" />
                 <h4 className="text-sm font-black uppercase tracking-widest text-indigo-500">Logistics Mandate</h4>
                 <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase italic">
                    "Accuracy in logistical tracking is mandatory for statutory audits. Ensure every material movement is recorded with authorized chapter timestamps."
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* Position Management Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(val) => !val && setSelectedItem(null)}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
           {selectedItem && (
             <>
               <div className="bg-slate-900 p-8 text-white relative">
                  <div className="absolute right-6 top-6"><DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full text-white/40 h-8 w-8"><X className="w-4 h-4" /></Button></DialogClose></div>
                  <Badge className="bg-accent text-primary font-black text-[8px] uppercase mb-2">Tracking Node</Badge>
                  <DialogTitle className="text-2xl font-headline font-bold">{selectedItem.name}</DialogTitle>
                  <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest font-bold flex items-center gap-1.5">
                     <Hash className="w-3.5 h-3.5" /> {selectedItem.sku || 'LOG-REPOS'}
                  </p>
               </div>
               <div className="p-8 space-y-6">
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Target Operational Node (Location)</Label>
                     <Input id="new-loc" placeholder="Enter chapter or warehouse..." defaultValue={selectedItem.location} className="h-11 rounded-xl" />
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border flex items-start gap-3">
                     <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                     <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Updating this location will instantly refresh the master material registry for all regional chapters.</p>
                  </div>
                  <Button 
                    onClick={() => {
                      const val = (document.getElementById('new-loc') as HTMLInputElement).value;
                      handleUpdateLocation(selectedItem.id, val);
                    }}
                    disabled={isActionLoading}
                    className="w-full h-12 bg-primary text-white font-bold rounded-xl hover:bg-secondary"
                  >
                    {isActionLoading ? <Loader2 className="animate-spin" /> : <><RefreshCw className="w-4 h-4 mr-2" /> Commit Movement</>}
                  </Button>
               </div>
             </>
           )}
        </DialogContent>
      </Dialog>

      <AdminFooter />
    </main>
  )
}
