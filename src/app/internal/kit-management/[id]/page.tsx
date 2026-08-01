
"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase'
import { doc, setDoc, updateDoc, serverTimestamp, increment, collection, query, orderBy, writeBatch } from 'firebase/firestore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft,
  Package, 
  Truck, 
  Loader2, 
  ShieldCheck, 
  CheckCircle2, 
  Save,
  X,
  ClipboardList,
  Briefcase,
  MapPin,
  Car
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Footer } from '@/components/footer'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors'

const INITIAL_KIT_ITEMS = [
  { id: 'identityCard', label: 'Identity Card' },
  { id: 'lanyard', label: 'Lanyard' },
  { id: 'cardHolder', label: 'Card Holder' },
  { id: 'vehicleSticker', label: 'Vehicle Sticker' },
  { id: 'badge', label: 'Official Badge' },
  { id: 'appointmentLetter', label: 'Appointment Letter' },
  { id: 'membershipCertificate', label: 'Membership Certificate' },
  { id: 'designationCarPlate', label: 'Designation Car Plate' },
  { id: 'approvalLetterCarPlate', label: 'Approval Letter (Car Plate)' },
  { id: 'letterhead', label: 'Letterhead Pack' },
  { id: 'officeSeal', label: 'Office Seal' },
]

const INITIAL_ELIGIBILITY: Record<string, string[]> = {
  "Volunteer": ['identityCard', 'lanyard', 'cardHolder'],
  "General Member": ['identityCard', 'lanyard', 'cardHolder', 'membershipCertificate'],
  "Board Member": ['identityCard', 'lanyard', 'cardHolder', 'badge', 'membershipCertificate', 'appointmentLetter', 'vehicleSticker'],
  "Office-bearing Member": INITIAL_KIT_ITEMS.map(i => i.id)
};

export default function MemberKitDetailPage() {
  const { id: memberId } = useParams()
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [isSaving, setIsSaving] = useState(false)

  const [kitForm, setKitForm] = useState({
    items: {} as Record<string, boolean>,
    dispatchDate: '',
    courierDetails: '',
    deliveryStatus: 'Pending Verification' as const,
    acknowledgementReceived: false,
    notes: ''
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  // Data Fetching: Member Profile
  const memberRef = useMemoFirebase(() => {
    if (!db || !memberId) return null;
    return doc(db, 'memberProfiles', memberId as string);
  }, [db, memberId]);
  const { data: member, loading: memberLoading } = useDoc(memberRef);

  // Data Fetching: Kit Details
  const kitRef = useMemoFirebase(() => {
    if (!db || !memberId) return null;
    return doc(db, 'member_kits', memberId as string);
  }, [db, memberId]);
  const { data: kit, loading: kitLoading } = useDoc(kitRef);

  // Data Fetching: Settings
  const configDocRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'member_kits', 'settings');
  }, [db]);
  const { data: configData, loading: configLoading } = useDoc(configDocRef);

  // Data Fetching: Materials for Stock Sync
  const materialsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'materials'), orderBy('name', 'asc'));
  }, [db]);
  const { data: materialsList } = useCollection(materialsQuery);

  const kitItems = useMemo(() => {
    return (configData as any)?.kitItems || INITIAL_KIT_ITEMS;
  }, [configData]);

  const eligibilityRules = useMemo(() => {
    return (configData as any)?.eligibilityRules || INITIAL_ELIGIBILITY;
  }, [configData]);

  useEffect(() => {
    if (kit) {
      setKitForm({
        items: kit.items || {},
        dispatchDate: kit.dispatchDate || '',
        courierDetails: kit.courierDetails || '',
        deliveryStatus: kit.deliveryStatus || 'Pending Verification',
        acknowledgementReceived: kit.acknowledgementReceived || false,
        notes: kit.notes || ''
      })
    }
  }, [kit])

  const handleSaveKit = async () => {
    if (!db || !member || !kitRef || !user || !materialsList) return
    setIsSaving(true)

    const batch = writeBatch(db);
    const oldItems = kit?.items || {}
    const newItems = kitForm.items

    const kitData = {
      ...kitForm,
      memberId: member.memberId,
      memberName: member.name,
      updatedAt: serverTimestamp(),
      updatedBy: user.email
    }

    try {
      // 1. Queue Kit Document Update
      batch.set(kitRef, kitData, { merge: true })
      
      // 2. Queue Material Stock Synchronizations
      for (const kitItem of kitItems) {
        const wasChecked = !!oldItems[kitItem.id];
        const isChecked = !!newItems[kitItem.id];

        if (wasChecked === isChecked) continue;

        const delta = isChecked ? -1 : 1;
        const materialMatch = (materialsList || []).find((m: any) => 
          m.name.toLowerCase().trim() === kitItem.label.toLowerCase().trim() || 
          m.sku === kitItem.id
        );

        if (materialMatch) {
          const mRef = doc(db, 'materials', materialMatch.id);
          const newStock = Math.max(0, (materialMatch.currentStock || 0) + delta);
          const threshold = materialMatch.lowStockThreshold || 10;
          
          const newStatus = newStock <= 0 ? 'Out of Stock' : 
                            newStock <= threshold ? 'Low Stock' : 'Available';

          batch.update(mRef, {
            currentStock: newStock,
            status: newStatus,
            updatedAt: serverTimestamp()
          });
        }
      }

      // 3. Commit Atomic Batch
      batch.commit()
        .then(() => {
          toast({ title: "Registry Synchronized", description: `Logistics data for ${member.name} updated with inventory sync.` })
          router.push('/internal/kit-management')
        })
        .catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: 'atomic_kit_sync',
            operation: 'write',
            requestResourceData: kitData,
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        });

    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Protocol Failed", description: e.message })
      setIsSaving(false)
    }
  }

  if (authLoading || memberLoading || kitLoading || configLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  if (!member) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-8 text-center">
        <Package className="w-20 h-20 text-slate-200 mb-6" />
        <h2 className="text-2xl font-headline font-bold text-primary dark:text-white">Profile Reference Lost</h2>
        <p className="text-slate-500 mt-2">The requested personnel record could not be identified in the national registry.</p>
        <Link href="/internal/kit-management" className="mt-8">
          <Button variant="outline" className="rounded-xl"><ArrowLeft className="w-4 h-4 mr-2" /> Return to Directory</Button>
        </Link>
      </div>
    )
  }

  const category = member.designationCategory || "General Member";
  const eligibleItemIds = eligibilityRules[category] || [];
  const eligibleItems = kitItems.filter((item: any) => eligibleItemIds.includes(item.id));
  const isCarPlateIssued = kitItems.filter((i: any) => i.label.toLowerCase().includes('car plate')).some((i: any) => kitForm.items[i.id]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 sticky top-0 z-40 px-4">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
           <div className="flex items-center gap-6">
              <Button variant="ghost" onClick={() => router.back()} className="text-white hover:bg-white/10 h-11 w-11 p-0 rounded-full">
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <div>
                 <div className="flex items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-headline font-bold">{member.name}</h1>
                    <Badge className="bg-accent text-primary font-black text-[9px] uppercase tracking-widest">{member.memberId}</Badge>
                 </div>
                 <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                   <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Logistics Registry Profile
                 </p>
              </div>
           </div>
           {isCarPlateIssued && (
             <div className="flex items-center gap-2 bg-red-600/20 px-4 py-1.5 rounded-full border border-red-600/30 text-red-500 animate-pulse">
                <Car className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Plate Issued</span>
             </div>
           )}
        </div>
      </header>

      <section className="py-12 container mx-auto px-4 max-w-5xl">
         <div className="grid lg:grid-cols-12 gap-10">
            
            {/* Sidebar: Personnel Metadata */}
            <div className="lg:col-span-4 space-y-6">
               <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 p-8">
                  <div className="space-y-6">
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-accent"><Briefcase className="w-5 h-5" /></div>
                           <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Official Post</p>
                              <p className="text-sm font-bold text-primary dark:text-white leading-tight">{member.designation}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-accent"><MapPin className="w-5 h-5" /></div>
                           <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Region</p>
                              <p className="text-sm font-bold text-primary dark:text-white leading-tight uppercase">
                                {member.level === 'District' ? `${member.districtName}, ${member.stateName}` : member.stateName || 'National Center'}
                              </p>
                           </div>
                        </div>
                     </div>

                     <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
                        <Badge variant="outline" className="w-full justify-center h-8 rounded-xl border-accent/20 text-accent font-black text-[10px] uppercase tracking-widest mb-4">
                          {category}
                        </Badge>
                        <p className="text-[11px] text-slate-500 leading-relaxed italic">
                           "The logistics registry for this member is governed by the {category} eligibility rules as defined in the master configuration."
                        </p>
                     </div>
                  </div>
               </Card>

               <div className="p-8 rounded-[2.5rem] bg-indigo-50 dark:bg-indigo-950/20 border-2 border-dashed border-indigo-200 dark:border-indigo-900/30 text-center space-y-4">
                  <Truck className="w-10 h-10 text-indigo-500 mx-auto" />
                  <h4 className="text-sm font-black uppercase tracking-widest text-indigo-500">Logistics Protocol</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase">
                     Ensure all physical handovers are recorded only after signature verification from the authorized chapter secretary.
                  </p>
               </div>
            </div>

            {/* Main: Kit Logistics Form */}
            <div className="lg:col-span-8 space-y-8">
               <Card className="rounded-[3rem] border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden">
                  <div className="p-8 md:p-12 space-y-12">
                     <div className="space-y-6">
                        <div className="flex items-center justify-between border-b pb-4">
                           <h3 className="text-xs font-black uppercase text-accent tracking-[0.3em] flex items-center gap-2">
                             <ClipboardList className="w-4 h-4" /> Entitled Logistics Checklist
                           </h3>
                           <Badge variant="outline" className="text-[8px] border-slate-100 uppercase font-bold">{eligibleItems.length} Authorized Items</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {eligibleItems.map((item: any) => {
                              const material = (materialsList || []).find((m: any) => 
                                m.name.toLowerCase().trim() === item.label.toLowerCase().trim() || m.sku === item.id
                              );
                              const stock = material?.currentStock ?? 'N/A';
                              const isChecked = !!kitForm.items[item.id];

                              return (
                                <div 
                                  key={item.id} 
                                  onClick={() => setKitForm({...kitForm, items: {...kitForm.items, [item.id]: !kitForm.items[item.id]}})}
                                  className={cn(
                                    "flex items-center space-x-3 p-4 rounded-2xl transition-all cursor-pointer border-2",
                                    isChecked 
                                      ? "bg-emerald-50/50 border-emerald-500/20 ring-1 ring-emerald-500/10" 
                                      : "bg-slate-50 dark:bg-slate-950 border-transparent hover:border-slate-200"
                                  )}
                                >
                                  <Checkbox 
                                    checked={isChecked}
                                    onCheckedChange={(val) => setKitForm({...kitForm, items: { ...kitForm.items, [item.id]: !!val }})}
                                    className="border-accent h-5 w-5"
                                  />
                                  <div className="flex-1 flex flex-col">
                                    <span className={cn("text-xs font-bold leading-none", isChecked ? "text-emerald-700" : "text-primary dark:text-white")}>{item.label}</span>
                                    <span className="text-[8px] font-black uppercase text-slate-400 mt-1">Available Units: {stock}</span>
                                  </div>
                                  {isChecked && <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-in zoom-in-50 duration-300" />}
                                </div>
                              )
                            })}
                        </div>
                     </div>

                     <div className="space-y-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <h3 className="text-xs font-black uppercase text-indigo-500 tracking-[0.3em] flex items-center gap-2">
                           <Truck className="w-4 h-4" /> Distribution & Tracking Trail
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                           <div className="space-y-1.5">
                              <Label className="text-[10px] font-bold uppercase text-slate-400">Dispatch Date</Label>
                              <Input type="date" value={kitForm.dispatchDate} onChange={e => setKitForm({...kitForm, dispatchDate: e.target.value})} className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none shadow-inner" />
                           </div>
                           <div className="space-y-1.5">
                              <Label className="text-[10px] font-bold uppercase text-slate-400">Delivery Status</Label>
                              <Select value={kitForm.deliveryStatus} onValueChange={(val: any) => setKitForm({...kitForm, deliveryStatus: val})}>
                                 <SelectTrigger className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none shadow-inner"><SelectValue /></SelectTrigger>
                                 <SelectContent position="popper" className="z-[1000000] bg-white">
                                    {['Pending Verification', 'Dispatched', 'In Transit', 'Delivered', 'Returned'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                 </SelectContent>
                              </Select>
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <Label className="text-[10px] font-bold uppercase text-slate-400">Courier Tracking Details / AWB</Label>
                           <Input placeholder="Enter tracking number or courier provider..." value={kitForm.courierDetails} onChange={e => setKitForm({...kitForm, courierDetails: e.target.value})} className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none shadow-inner" />
                        </div>
                        <div className="flex items-center space-x-4 p-6 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 group cursor-pointer" onClick={() => setKitForm({...kitForm, acknowledgementReceived: !kitForm.acknowledgementReceived})}>
                           <Checkbox checked={kitForm.acknowledgementReceived} onCheckedChange={(val) => setKitForm({...kitForm, acknowledgementReceived: !!val})} className="border-emerald-500 h-6 w-6" />
                           <div className="space-y-0.5">
                              <Label className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider cursor-pointer">Official Acknowledgement Received</Label>
                              <p className="text-[9px] text-emerald-600/60 uppercase font-bold">Verification of physical kit receipt by the member.</p>
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <Label className="text-[10px] font-bold uppercase text-slate-400">Administrative Logistics Notes</Label>
                           <Textarea value={kitForm.notes} onChange={e => setKitForm({...kitForm, notes: e.target.value})} placeholder="Internal context regarding this distribution..." className="min-h-[120px] rounded-3xl bg-slate-50 dark:bg-slate-950 border-none shadow-inner p-6" />
                        </div>
                     </div>
                  </div>
                  <CardFooter className="p-8 md:p-12 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                     <Button 
                        onClick={handleSaveKit} 
                        disabled={isSaving || !materialsList} 
                        className="w-full h-16 rounded-[1.5rem] bg-primary text-white font-bold text-xl hover:bg-secondary transition-all shadow-xl shadow-primary/20 flex gap-3"
                     >
                        {isSaving ? <Loader2 className="animate-spin w-6 h-6" /> : <><Save className="w-6 h-6" /> Commit Audit Records</>}
                     </Button>
                  </CardFooter>
               </Card>

               <div className="flex flex-col items-center gap-4 opacity-30 pt-10">
                  <ShieldCheck className="w-12 h-12 text-slate-400" />
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em]">National Logistics Node • HRAT India</p>
               </div>
            </div>
         </div>
      </section>

      <Footer />
    </main>
  )
}
