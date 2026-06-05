"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  ArrowDownLeft, 
  ArrowUpRight, 
  History,
  ShieldCheck,
  Boxes
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

type InventoryItem = {
  id: string
  name: string
  category: string
  unit: string
  currentStock: number
  totalInflow: number
  totalOutflow: number
  lowStockThreshold: number
  lastUpdated: any
  createdAt: any
}

export default function InventoryManagementPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [search, setSearch] = useState('')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [adjustingItem, setAdjustingItem] = useState<{ item: InventoryItem, type: 'Inflow' | 'Outflow' } | null>(null)
  const [adjustmentAmount, setAdjustmentAmount] = useState('0')
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)

  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Stationery',
    unit: 'pcs',
    currentStock: 0,
    lowStockThreshold: 5,
    totalInflow: 0,
    totalOutflow: 0
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  const inventoryQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'inventory'), orderBy('name', 'asc'));
  }, [db, user]);

  const { data: inventory, loading: dataLoading } = useCollection(inventoryQuery);

  const handleAddItem = async () => {
    if (!db) return;
    if (!newItem.name.trim()) {
      toast({ variant: "destructive", title: "Missing Name", description: "Please provide a name for the material." });
      return;
    }

    setIsActionLoading(true)
    const data = { ...newItem, totalInflow: Number(newItem.currentStock), lastUpdated: serverTimestamp(), createdAt: serverTimestamp() }
    addDoc(collection(db, 'inventory'), data)
      .then(() => {
        toast({ title: "Item Added" })
        setNewItem({ name: '', category: 'Stationery', unit: 'pcs', currentStock: 0, lowStockThreshold: 5, totalInflow: 0, totalOutflow: 0 })
        setIsAddDialogOpen(false)
      })
      .finally(() => setIsActionLoading(false))
  }

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  const filtered = (inventory as InventoryItem[] || []).filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    i.category.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    totalItems: (inventory || []).length,
    lowStock: (inventory || []).filter((i: any) => i.currentStock <= i.lowStockThreshold).length
  }

  const categories = ["Stationery", "Relief Kits", "Advocacy Manuals", "Electronics", "Furniture", "Medical Supplies", "Other"]

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-bold uppercase border border-accent/30">
                <ShieldCheck className="w-2.5 h-2.5" /> Supply Governance
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold">Material <span className="text-accent italic">Inventory</span></h1>
              <p className="text-slate-400 text-[11px]">Logistics management for the Human Rights Affairs Trust.</p>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-accent text-primary font-bold rounded-xl h-11 px-6 flex gap-2 shadow-lg">
                  <Plus className="w-4 h-4" /> New Material Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md rounded-3xl">
                <DialogHeader><DialogTitle>Add Supply Item</DialogTitle></DialogHeader>
                <Button onClick={handleAddItem} disabled={isActionLoading} className="w-full h-11 rounded-xl mt-4">Establish Record</Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      <section className="py-6 border-b bg-white dark:bg-slate-900 sticky top-10 z-30 shadow-sm transition-colors">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <Boxes className="w-4 h-4 text-accent" />
                 <div><p className="text-[8px] font-bold text-slate-400 uppercase">SKUs</p><p className="text-sm font-bold leading-none">{stats.totalItems}</p></div>
               </div>
               <div className="w-px h-6 bg-slate-200"></div>
               <div className="flex items-center gap-2">
                 <AlertCircle className={cn("w-4 h-4", stats.lowStock > 0 ? "text-red-500" : "text-slate-400")} />
                 <div><p className="text-[8px] font-bold text-slate-400 uppercase">Critical</p><p className={cn("text-sm font-bold leading-none", stats.lowStock > 0 ? "text-red-500" : "")}>{stats.lowStock}</p></div>
               </div>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Search materials..." className="pl-9 h-10 rounded-xl text-xs border-slate-100" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent mx-auto" /></div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((item) => (
                <Card key={item.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-100">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className={cn("p-5 md:w-44 text-center border-r border-slate-100 flex flex-col items-center justify-center shrink-0", item.currentStock <= item.lowStockThreshold ? "bg-red-50" : "bg-slate-50")}>
                           <Package className={cn("w-8 h-8 mb-2", item.currentStock <= item.lowStockThreshold ? "text-red-500" : "text-accent")} />
                           <Badge variant="outline" className="text-[7px] font-bold px-1.5 py-0 mb-1 uppercase">{item.category}</Badge>
                           <p className="text-2xl font-headline font-bold leading-none">{item.currentStock} <span className="text-[8px] font-sans text-slate-400 uppercase">{item.unit}</span></p>
                      </div>
                      <div className="flex-1 p-5 grid lg:grid-cols-3 gap-6 items-center">
                        <h3 className="text-lg font-headline font-bold leading-tight">{item.name}</h3>
                        <div className="flex flex-wrap gap-4">
                          <div className="text-[10px] font-bold text-slate-500 uppercase">In: {item.totalInflow}</div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase">Out: {item.totalOutflow}</div>
                        </div>
                        <div className="flex justify-end gap-2">
                           <Button size="sm" variant="outline" className="h-8 rounded-lg text-[10px] font-bold border-slate-200">Adjust</Button>
                           <Button variant="ghost" size="sm" className="h-8 w-8 text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
