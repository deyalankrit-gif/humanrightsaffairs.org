"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Package, 
  Search, 
  Truck, 
  Loader2, 
  ShieldCheck, 
  UserCheck, 
  CheckCircle2, 
  Archive,
  Save,
  MapPin,
  ChevronRight,
  X,
  Briefcase,
  Building2,
  Globe,
  Activity,
  ClipboardList,
  Settings2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"

const KIT_ITEMS = [
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

const MEMBER_CATEGORIES = [
  "General Member",
  "Board Member",
  "Office-bearing Member",
  "Volunteer"
]

export default function MemberKitManagement() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [isSaving, setIsSaving] = useState<string | null>(null)
  const [selectedMember, setSelectedMember] = useState<any>(null)

  // ELIGIBILITY STATE
  const [eligibilityRules, setEligibilityRules] = useState<Record<string, string[]>>({
    "Volunteer": ['identityCard', 'lanyard', 'cardHolder'],
    "General Member": ['identityCard', 'lanyard', 'cardHolder', 'membershipCertificate'],
    "Board Member": ['identityCard', 'lanyard', 'cardHolder', 'badge', 'membershipCertificate', 'appointmentLetter', 'vehicleSticker'],
    "Office-bearing Member": KIT_ITEMS.map(i => i.id)
  });

  const [kitForm, setKitForm] = useState({
    items: {} as Record<string, boolean>,
    dispatchDate: '',
    courierDetails: '',
    deliveryStatus: 'Pending' as const,
    acknowledgementReceived: false,
    notes: ''
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  const membersQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'memberProfiles'), orderBy('name', 'asc'));
  }, [db, user]);

  const kitsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'member_kits'));
  }, [db, user]);

  const { data: members, loading: membersLoading } = useCollection(membersQuery);
  const { data: kits, loading: kitsLoading } = useCollection(kitsQuery);

  const kitMap = useMemo(() => {
    const map: Record<string, any> = {};
    (kits || []).forEach((k: any) => {
      map[k.id] = k;
    });
    return map;
  }, [kits]);

  const handleSelectMember = (member: any) => {
    setSelectedMember(member)
    const existingKit = kitMap[member.id] || {}
    setKitForm({
      items: existingKit.items || {},
      dispatchDate: existingKit.dispatchDate || '',
      courierDetails: existingKit.courierDetails || '',
      deliveryStatus: existingKit.deliveryStatus || 'Pending',
      acknowledgementReceived: existingKit.acknowledgementReceived || false,
      notes: existingKit.notes || ''
    })
  }

  const handleSaveKit = async () => {
    if (!db || !selectedMember) return
    setIsSaving(selectedMember.id)

    const kitData = {
      ...kitForm,
      memberId: selectedMember.memberId,
      memberName: selectedMember.name,
      updatedAt: serverTimestamp(),
      updatedBy: user?.email
    }

    try {
      await setDoc(doc(db, 'member_kits', selectedMember.id), kitData, { merge: true })
      toast({ title: "Logistics Registry Updated", description: `Kit status for ${selectedMember.name} committed.` })
      setSelectedMember(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Registry Error", description: e.message })
    } finally {
      setIsSaving(null)
    }
  }

  const filteredMembers = (members || []).filter(m => {
    const matchesSearch = (m.name || '').toLowerCase().includes(search.toLowerCase()) || 
                          (m.memberId || '').toLowerCase().includes(search.toLowerCase());
    const kit = kitMap[m.id];
    const status = kit?.deliveryStatus || 'Pending';
    const matchesStatus = statusFilter === 'All' || status === statusFilter;
    return matchesSearch && matchesStatus;
  })

  // CLASSIFIED BREAKDOWN CALCULATION (Filtered by Eligibility)
  const itemStats = useMemo(() => {
    const stats: Record<string, { issued: number, total: number }> = {};
    KIT_ITEMS.forEach(item => {
      stats[item.id] = { issued: 0, total: 0 };
    });

    filteredMembers.forEach(m => {
      const category = m.designationCategory || "General Member";
      const eligibleItems = eligibilityRules[category] || [];
      const kit = kitMap[m.id];

      KIT_ITEMS.forEach(item => {
        if (eligibleItems.includes(item.id)) {
          stats[item.id].total += 1;
          if (kit?.items?.[item.id]) {
            stats[item.id].issued += 1;
          }
        }
      });
    });
    return stats;
  }, [filteredMembers, kitMap, eligibilityRules]);

  const groupings = useMemo(() => {
    const central = filteredMembers.filter(m => m.level === 'National');
    
    const stateGroups = filteredMembers
      .filter(m => m.level === 'State')
      .reduce((acc, m) => {
        const state = (m.stateName || 'Unspecified State').toUpperCase();
        if (!acc[state]) acc[state] = [];
        acc[state].push(m);
        return acc;
      }, {} as Record<string, any[]>);

    const districtGroups = filteredMembers
      .filter(m => m.level === 'District')
      .reduce((acc, m) => {
        const state = (m.stateName || 'Unspecified State').toUpperCase();
        const district = (m.districtName || 'Unspecified District').toUpperCase();
        if (!acc[state]) acc[state] = {};
        if (!acc[state][district]) acc[state][district] = [];
        acc[state][district].push(m);
        return acc;
      }, {} as Record<string, Record<string, any[]>>);

    return { central, stateGroups, districtGroups };
  }, [filteredMembers]);

  const toggleEligibility = (category: string, itemId: string) => {
    setEligibilityRules(prev => {
      const current = prev[category] || [];
      const updated = current.includes(itemId) 
        ? current.filter(id => id !== itemId) 
        : [...current, itemId];
      return { ...prev, [category]: updated };
    });
  };

  const renderMemberCard = (m: any) => {
    const kit = kitMap[m.id];
    const status = kit?.deliveryStatus || 'Pending';
    const category = m.designationCategory || "General Member";
    const eligibleItemIds = eligibilityRules[category] || [];
    const eligibleItems = KIT_ITEMS.filter(item => eligibleItemIds.includes(item.id));

    return (
      <Card 
        key={m.id} 
        onClick={() => handleSelectMember(m)}
        className={cn(
          "border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 relative group cursor-pointer transition-all hover:scale-[1.01]",
          selectedMember?.id === m.id && "ring-2 ring-accent"
        )}
      >
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row items-stretch">
             <div className="p-5 bg-slate-50 dark:bg-slate-800 md:w-44 text-center border-r border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center shrink-0">
                <Badge variant="outline" className={cn(
                  "text-[8px] font-bold px-3 py-1 rounded-full uppercase border-none",
                  status === 'Delivered' ? "bg-emerald-500 text-white" : 
                  status === 'Dispatched' ? "bg-blue-500 text-white" : "bg-amber-500 text-white"
                )}>
                  {status}
                </Badge>
                <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{m.memberId || 'NO ID'}</p>
             </div>
             <div className="flex-1 p-6 flex items-center justify-between">
                <div className="space-y-1.5">
                   <div className="flex flex-wrap items-center gap-2">
                     <h3 className="text-lg font-bold text-primary dark:text-white leading-tight group-hover:text-accent transition-colors">{m.name}</h3>
                     <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-[7px] font-black uppercase tracking-tighter h-4">
                       {category}
                     </Badge>
                   </div>
                   <div className="flex flex-wrap gap-3 text-[10px] font-bold text-slate-500 uppercase">
                      <span className="flex items-center gap-1 text-primary dark:text-slate-300">
                        <Briefcase className="w-2.5 h-2.5 text-accent" /> {m.designation}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-accent" /> 
                        {m.level === 'District' ? `${m.districtName}, ${m.stateName}` : m.stateName || 'National Center'}
                      </span>
                   </div>
                </div>
                <div className="flex items-center gap-6">
                   <div className="flex flex-wrap gap-1.5 justify-end max-w-[160px] md:max-w-[200px]">
                      {eligibleItems.map(item => (
                        <div 
                          key={item.id} 
                          className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center text-[6px] font-black uppercase transition-all shadow-sm border shrink-0",
                            kit?.items?.[item.id] ? "bg-emerald-500 text-white border-emerald-600" : "bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600 border-slate-200 dark:border-slate-700"
                          )}
                          title={item.label}
                        >
                          {item.label[0]}
                        </div>
                      ))}
                      {eligibleItems.length === 0 && (
                        <span className="text-[8px] font-bold text-slate-300 uppercase italic">No items assigned</span>
                      )}
                   </div>
                   <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform shrink-0" />
                </div>
             </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border border-accent/30">
                <ShieldCheck className="w-2.5 h-2.5" /> Logistics Oversight
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold">Kit & Asset <span className="text-accent italic">Management</span></h1>
              <p className="text-slate-400 text-[11px]">Tracking institutional materials and official representation assets.</p>
            </div>
            <div className="flex gap-2">
               <Dialog>
                 <DialogTrigger asChild>
                   <Button variant="outline" className="bg-white/5 border-accent/30 text-accent h-10 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-accent hover:text-primary transition-all">
                      <Settings2 className="w-4 h-4" /> Eligibility Configuration
                   </Button>
                 </DialogTrigger>
                 <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto rounded-[2rem] border-none shadow-2xl">
                    <DialogHeader>
                       <DialogTitle>Memeber Item Eligibility Protocol</DialogTitle>
                       <DialogDescription>Define which institutional items each category of member is entitled to receive.</DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-8">
                       {MEMBER_CATEGORIES.map(category => (
                         <div key={category} className="space-y-4">
                            <h4 className="text-sm font-black uppercase tracking-widest text-primary border-b pb-2 flex items-center gap-2">
                               <UserCheck className="w-4 h-4 text-accent" /> {category}
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                               {KIT_ITEMS.map(item => {
                                 const isEligible = (eligibilityRules[category] || []).includes(item.id);
                                 return (
                                   <div 
                                    key={item.id} 
                                    onClick={() => toggleEligibility(category, item.id)}
                                    className={cn(
                                      "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none",
                                      isEligible ? "bg-accent/10 border-accent/40 text-primary font-bold" : "bg-slate-50 border-slate-100 text-slate-400"
                                    )}
                                   >
                                      <Checkbox checked={isEligible} onCheckedChange={() => toggleEligibility(category, item.id)} className="border-accent" />
                                      <span className="text-[10px] uppercase">{item.label}</span>
                                   </div>
                                 )
                               })}
                            </div>
                         </div>
                       ))}
                    </div>
                    <DialogFooter>
                       <DialogClose asChild>
                         <Button className="w-full h-12 rounded-xl font-bold bg-primary text-white">Save & Commit Rules</Button>
                       </DialogClose>
                    </DialogFooter>
                 </DialogContent>
               </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* CLASSIFIED BREAKDOWN DASHBOARD */}
      <section className="py-6 border-b bg-white dark:bg-slate-900 shadow-sm animate-in fade-in duration-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
             <Activity className="w-4 h-4 text-accent" />
             <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Eligibility-Based Issuance Breakdown</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 gap-3">
             {KIT_ITEMS.map(item => {
               const s = itemStats[item.id];
               const percentage = Math.round((s.issued / (s.total || 1)) * 100);
               return (
                 <div key={item.id} className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex flex-col justify-between group hover:border-accent/40 transition-colors">
                    <p className="text-[7px] font-black uppercase text-slate-400 mb-2 truncate group-hover:text-primary dark:group-hover:text-accent transition-colors" title={item.label}>
                      {item.label}
                    </p>
                    <div className="space-y-1.5">
                       <div className="flex justify-between items-baseline">
                          <span className="text-sm font-black text-primary dark:text-white">{s.issued}</span>
                          <span className="text-[8px] font-bold text-slate-400">/ {s.total}</span>
                       </div>
                       <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full transition-all duration-1000",
                              percentage === 100 ? "bg-emerald-500" : percentage > 50 ? "bg-accent" : "bg-blue-500"
                            )} 
                            style={{ width: `${percentage}%` }} 
                          />
                       </div>
                    </div>
                 </div>
               )
             })}
          </div>
        </div>
      </section>

      <section className="py-6 border-b bg-white dark:bg-slate-900 sticky top-10 z-30 shadow-sm">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
             {['All', 'Pending', 'Dispatched', 'Delivered'].map(st => (
               <button 
                key={st} 
                onClick={() => setStatusFilter(st)}
                className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all", statusFilter === st ? "bg-accent text-primary shadow-md" : "text-slate-500 hover:bg-slate-200")}
               >
                 {st}
               </button>
             ))}
          </div>
          <div className="relative w-full max-lg:max-w-full max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search member name or ID..." className="pl-9 h-11 rounded-xl border-slate-200 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container mx-auto px-4">
          {membersLoading || kitsLoading ? (
            <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" /></div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              
              {/* Member List - Categorized */}
              <div className="lg:col-span-2 space-y-12 pb-20">
                {groupings.central.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                       <ShieldCheck className="w-5 h-5 text-red-600" />
                       <h4 className="text-sm font-black uppercase tracking-[0.25em] text-primary dark:text-white">Central Committee Registry</h4>
                       <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                    </div>
                    {groupings.central.map(renderMemberCard)}
                  </div>
                )}

                {Object.keys(groupings.stateGroups).length > 0 && (
                  <div className="space-y-12">
                    {Object.keys(groupings.stateGroups).sort().map(state => (
                      <div key={state} className="space-y-4">
                        <div className="flex items-center gap-3 px-2">
                           <Globe className="w-6 h-6 text-emerald-600" />
                           <h4 className="text-base font-black uppercase tracking-[0.2em] text-primary dark:text-white">
                             {state} <span className="text-emerald-500 font-bold ml-2">State Committee</span>
                           </h4>
                           <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                        </div>
                        {groupings.stateGroups[state].map(renderMemberCard)}
                      </div>
                    ))}
                  </div>
                )}

                {Object.keys(groupings.districtGroups).length > 0 && (
                  <div className="space-y-16">
                    {Object.keys(groupings.districtGroups).sort().map(state => (
                      <div key={state} className="space-y-12">
                        {Object.keys(groupings.districtGroups[state]).sort().map(district => (
                          <div key={district} className="space-y-4">
                            <div className="flex items-center gap-3 px-2">
                               <Building2 className="w-6 h-6 text-blue-600" />
                               <h4 className="text-base font-black uppercase tracking-[0.2em] text-primary dark:text-white">
                                 {district} <span className="text-blue-500 font-bold ml-2">District Cell</span>
                               </h4>
                               <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                            </div>
                            <div className="grid gap-4">
                               {groupings.districtGroups[state][district].map(renderMemberCard)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {filteredMembers.length === 0 && (
                  <div className="text-center py-24 opacity-30">
                     <Package className="w-16 h-16 mx-auto mb-4" />
                     <p className="text-lg font-headline font-bold">No records matching criteria.</p>
                  </div>
                )}
              </div>

              {/* Management Side Panel */}
              <div className="lg:col-span-1">
                {selectedMember ? (
                  <Card className="rounded-[2.5rem] bg-white dark:bg-slate-900 border-none shadow-2xl sticky top-32 overflow-hidden animate-in slide-in-from-right-4 duration-500">
                     <CardHeader className="bg-slate-900 text-white p-8 border-b-4 border-accent/20">
                        <div className="flex items-center justify-between mb-4">
                           <Badge className="bg-accent text-primary font-black text-[8px] tracking-widest">{selectedMember.memberId}</Badge>
                           <button onClick={() => setSelectedMember(null)} className="text-white/40 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <CardTitle className="text-2xl font-headline font-bold">{selectedMember.name}</CardTitle>
                        <CardDescription className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Personnel Logistics Registry</CardDescription>
                     </CardHeader>
                     <CardContent className="p-8 space-y-8">
                        <div className="space-y-4">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2">
                             <ClipboardList className="w-3.5 h-3.5" /> Eligible Items for {selectedMember.designationCategory || "Member"}
                           </h4>
                           <div className="grid grid-cols-1 gap-2">
                              {KIT_ITEMS.filter(item => (eligibilityRules[selectedMember.designationCategory || "General Member"] || []).includes(item.id)).map(item => (
                                <div key={item.id} className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-accent/30 transition-all">
                                   <Checkbox 
                                    id={item.id} 
                                    checked={kitForm.items[item.id] || false}
                                    onCheckedChange={(val) => setKitForm({
                                      ...kitForm,
                                      items: { ...kitForm.items, [item.id]: !!val }
                                    })}
                                    className="border-accent"
                                   />
                                   <Label htmlFor={item.id} className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex-1">{item.label}</Label>
                                   {kitForm.items[item.id] && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                                </div>
                              ))}
                              {KIT_ITEMS.filter(item => (eligibilityRules[selectedMember.designationCategory || "General Member"] || []).includes(item.id)).length === 0 && (
                                <div className="text-center py-4 border-2 border-dashed rounded-xl border-slate-100 text-[10px] text-slate-400 uppercase font-bold">
                                  No items configured for this type.
                                </div>
                              )}
                           </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                             <Truck className="w-3.5 h-3.5" /> Dispatch Particulars
                           </h4>
                           
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                 <Label className="text-[9px] font-bold text-slate-400 uppercase">Dispatch Date</Label>
                                 <Input type="date" value={kitForm.dispatchDate} onChange={e => setKitForm({...kitForm, dispatchDate: e.target.value})} className="h-10 rounded-xl" />
                              </div>
                              <div className="space-y-1.5">
                                 <Label className="text-[9px] font-bold text-slate-400 uppercase">Delivery Status</Label>
                                 <Select value={kitForm.deliveryStatus} onValueChange={(val: any) => setKitForm({...kitForm, deliveryStatus: val})}>
                                    <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-white">
                                       {['Pending', 'Dispatched', 'In Transit', 'Delivered', 'Returned'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                 </Select>
                              </div>
                           </div>

                           <div className="space-y-1.5">
                              <Label className="text-[9px] font-bold text-slate-400 uppercase">AWB / Courier Info</Label>
                              <Input placeholder="e.g. Speed Post - EW123456789IN" value={kitForm.courierDetails} onChange={e => setKitForm({...kitForm, courierDetails: e.target.value})} className="h-10 rounded-xl" />
                           </div>

                           <div className="flex items-center space-x-3 p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900">
                              <Checkbox 
                                id="ack" 
                                checked={kitForm.acknowledgementReceived} 
                                onCheckedChange={(val) => setKitForm({...kitForm, acknowledgementReceived: !!val})}
                                className="border-emerald-500 h-5 w-5"
                              />
                              <Label htmlFor="ack" className="text-xs font-black text-emerald-700 dark:text-emerald-400 cursor-pointer uppercase tracking-tight">Ack. Received</Label>
                           </div>

                           <div className="space-y-1.5">
                              <Label className="text-[9px] font-bold text-slate-400 uppercase">Registry Notes</Label>
                              <Textarea value={kitForm.notes} onChange={e => setKitForm({...kitForm, notes: e.target.value})} placeholder="Internal notes..." className="rounded-xl min-h-[80px]" />
                           </div>
                        </div>

                        <Button 
                          onClick={handleSaveKit} 
                          disabled={isSaving === selectedMember.id}
                          className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-secondary shadow-xl shadow-primary/20 transition-all flex gap-2"
                        >
                          {isSaving === selectedMember.id ? <Loader2 className="animate-spin w-5 h-5" /> : <><Save className="w-5 h-5" /> Commit Logistics Data</>}
                        </Button>
                     </CardContent>
                  </Card>
                ) : (
                  <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 text-center space-y-6 sticky top-32 shadow-sm">
                     <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto border-2 border-dashed border-slate-200">
                        <UserCheck className="w-10 h-10 text-slate-300" />
                     </div>
                     <div className="space-y-2">
                        <h4 className="text-xl font-headline font-bold text-primary dark:text-white">Logistics Node</h4>
                        <p className="text-sm text-slate-400 leading-relaxed italic">"Select a member to manage their official institutional kit and tracking assets."</p>
                     </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </section>
    </main>
  )
}
