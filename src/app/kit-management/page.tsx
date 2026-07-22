"use client"

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { 
  Package, 
  Search, 
  Loader2, 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  Truck,
  MapPin,
  Briefcase,
  Globe,
  Building2,
  ChevronRight,
  Activity,
  Star,
  Clock,
  FileText,
  Car,
  X,
  BadgeCheck,
  CalendarClock,
  Hash,
  UserCheck
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase'
import { collection, query, orderBy, doc } from 'firebase/firestore'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { ScrollArea } from '@/components/ui/scroll-area'

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

export default function PublicKitManagementPage() {
  const [search, setSearch] = useState('')
  const [selectedMemberDetail, setSelectedMemberDetail] = useState<any>(null)
  const [viewingItemMembers, setViewingItemMembers] = useState<{item: any, members: any[]} | null>(null)
  const db = useFirestore()

  const configDocRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'member_kits', 'settings');
  }, [db]);

  const { data: configData, loading: configLoading } = useDoc(configDocRef);

  const kitItems = useMemo(() => {
    return (configData as any)?.kitItems || INITIAL_KIT_ITEMS;
  }, [configData]);

  const eligibilityRules = useMemo(() => {
    return (configData as any)?.eligibilityRules || INITIAL_ELIGIBILITY;
  }, [configData]);

  const membersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'memberProfiles'), orderBy('name', 'asc'));
  }, [db]);

  const kitsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'member_kits'));
  }, [db]);

  const { data: members, loading: membersLoading } = useCollection(membersQuery);
  const { data: kits, loading: kitsLoading } = useCollection(kitsQuery);

  const kitMap = useMemo(() => {
    const map: Record<string, any> = {};
    (kits || []).forEach((k: any) => {
      map[k.id] = k;
    });
    return map;
  }, [kits]);

  const filteredMembers = (members || []).filter(m => {
    const matchesSearch = (m.name || '').toLowerCase().includes(search.toLowerCase()) || 
                          (m.memberId || '').toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  })

  const globalStats = useMemo(() => {
    const total = (members || []).length;
    const delivered = (members || []).filter(m => kitMap[m.id]?.deliveryStatus === 'Delivered').length;
    const notDelivered = total - delivered;
    return { total, delivered, notDelivered };
  }, [members, kitMap]);

  const itemStats = useMemo(() => {
    const stats: Record<string, { issued: number, total: number }> = {};
    kitItems.forEach((item: any) => {
      stats[item.id] = { issued: 0, total: 0 };
    });

    members?.forEach(m => {
      const category = m.designationCategory || "General Member";
      const eligibleItemsList = eligibilityRules[category] || [];
      const kit = kitMap[m.id];

      kitItems.forEach((item: any) => {
        if (eligibleItemsList.includes(item.id)) {
          stats[item.id].total += 1;
          if (kit?.items?.[item.id]) {
            stats[item.id].issued += 1;
          }
        }
      });
    });
    return stats;
  }, [members, kitMap, eligibilityRules, kitItems]);

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

  const renderMemberCard = (m: any) => {
    const kit = kitMap[m.id];
    const status = kit?.deliveryStatus || 'Pending';
    const category = m.designationCategory || "General Member";
    const eligibleItemIds = eligibilityRules[category] || [];
    const eligibleItems = kitItems.filter((item: any) => eligibleItemIds.includes(item.id));
    const isOfficeBearer = category === 'Office-bearing Member';

    // Dynamic car plate detection logic
    const carPlateItemIds = kitItems
      .filter((item: any) => item.label.toLowerCase().includes('car plate'))
      .map((item: any) => item.id);
    const isCarPlateIssued = carPlateItemIds.some((id: string) => kit?.items?.[id]);

    return (
      <Card 
        key={m.id} 
        onClick={() => setSelectedMemberDetail(m)}
        className={cn(
          "border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 relative group cursor-pointer transition-all hover:scale-[1.01]",
          selectedMemberDetail?.id === m.id && "ring-2 ring-accent"
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
                <div className="space-y-2">
                   <div className="flex flex-wrap items-center gap-3">
                     <h3 className="text-xl font-bold text-primary dark:text-white leading-tight">{m.name}</h3>
                     <Badge className={cn(
                       "text-[8px] font-black uppercase tracking-wider h-5 px-3",
                       isOfficeBearer ? "bg-accent text-primary" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                     )}>
                       {isOfficeBearer && <Star className="w-2.5 h-2.5 mr-1 fill-primary" />}
                       {category}
                     </Badge>
                   </div>
                   <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      <span className="flex items-center gap-1.5 text-primary dark:text-slate-200">
                        <Briefcase className="w-3 h-3 text-accent" /> {m.designation}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-accent" /> 
                        {m.level === 'District' ? `${m.districtName}, ${m.stateName}` : m.stateName || 'National Center'}
                      </span>
                      {kit?.dispatchDate && (
                        <span className="flex items-center gap-1.5 text-blue-500">
                          <Clock className="w-3 h-3" /> {kit.dispatchDate}
                        </span>
                      )}
                      {isCarPlateIssued && (
                        <span className="flex items-center gap-1.5 text-red-600 animate-pulse" title="Official Designation Car Plate Issued">
                          <Car className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {kit?.notes && (
                        <span className="flex items-center gap-1.5 text-slate-400 italic font-medium max-w-[200px] truncate normal-case">
                          <FileText className="w-3 h-3" /> {kit.notes}
                        </span>
                      )}
                   </div>
                </div>
                <div className="flex items-center gap-6">
                   <div className="flex flex-wrap gap-1.5 justify-end max-w-[160px] md:max-w-[240px]">
                      {eligibleItems.map((item: any) => (
                        <div 
                          key={item.id} 
                          className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center text-[6px] font-black uppercase transition-all shadow-sm border shrink-0",
                            kit?.items?.[item.id] ? "bg-emerald-500 text-white border-emerald-600" : "bg-yellow-100 text-yellow-600 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-500 dark:border-yellow-800"
                          )}
                          title={item.label}
                        >
                          {item.label[0]}
                        </div>
                      ))}
                   </div>
                   <ChevronRight className="w-4 h-4 text-slate-950 dark:text-white stroke-[3px] group-hover:translate-x-1 transition-transform shrink-0" />
                </div>
             </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <header className="pt-32 pb-12 bg-primary text-primary-foreground border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-accent/30">
                <ShieldCheck className="w-4 h-4" /> Logistics Transparency
              </div>
              <h1 className="text-4xl md:text-6xl font-headline font-bold">Kit & Asset <span className="text-accent italic">Registry</span></h1>
              <p className="text-slate-300 text-sm md:text-lg max-w-2xl">Verified record of institutional materials issued to the HRAT national force.</p>
            </div>
          </div>
        </div>
      </header>

      <section className="py-8 bg-white dark:bg-slate-900 border-b shadow-sm">
        <div className="container mx-auto px-4">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-none shadow-sm rounded-3xl bg-slate-50 dark:bg-slate-800/50 p-6 flex items-center gap-6">
                 <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                    <Users className="w-7 h-7" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Total Force</p>
                    <p className="text-3xl font-headline font-bold text-primary dark:text-white leading-none">{globalStats.total}</p>
                    <p className="text-[8px] font-bold text-slate-500">Registered Members</p>
                 </div>
              </Card>

              <Card className="border-none shadow-sm rounded-3xl bg-emerald-50 dark:bg-emerald-950/20 p-6 flex items-center gap-6">
                 <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 className="w-7 h-7" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">Kit Delivered</p>
                    <p className="text-3xl font-headline font-bold text-emerald-700 dark:text-emerald-400 leading-none">{globalStats.delivered}</p>
                    <p className="text-[8px] font-bold text-emerald-600/60 uppercase">Distribution Successful</p>
                 </div>
              </Card>

              <Card className="border-none shadow-sm rounded-3xl bg-amber-50 dark:bg-amber-950/20 p-6 flex items-center gap-6">
                 <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                    <Truck className="w-7 h-7" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-amber-600 tracking-widest">Pending Delivery</p>
                    <p className="text-3xl font-headline font-bold text-amber-700 dark:text-amber-400 leading-none">{globalStats.notDelivered}</p>
                    <p className="text-[8px] font-bold text-amber-600/60 uppercase">Logistics in Pipeline</p>
                 </div>
              </Card>
           </div>
        </div>
      </section>

      <section className="py-6 border-b bg-white dark:bg-slate-900 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
             <Activity className="w-4 h-4 text-accent" />
             <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Eligibility-Based Issuance Breakdown</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 gap-3">
             {kitItems.map((item: any) => {
               const s = itemStats[item.id] || { issued: 0, total: 0 };
               const percentage = Math.round((s.issued / (s.total || 1)) * 100);
               return (
                 <div 
                  key={item.id} 
                  onClick={() => {
                    const issuedMembers = (members || []).filter(m => kitMap[m.id]?.items?.[item.id]);
                    setViewingItemMembers({ item, members: issuedMembers });
                  }}
                  className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex flex-col justify-between group hover:border-accent/40 transition-colors cursor-pointer hover:shadow-md"
                 >
                    <p className="text-[7px] font-black uppercase text-slate-400 mb-2 truncate group-hover:text-primary dark:group-hover:text-accent transition-colors" title={item.label}>
                      {item.label}
                    </p>
                    <div className="space-y-1.5">
                       <div className="flex justify-between items-baseline">
                          <span className="text-sm font-black text-primary dark:text-white">{s.issued}</span>
                          <span className="text-[8px] font-bold text-slate-400">/ {s.total}</span>
                       </div>
                       <div className="h-1 w-full bg-slate-200 dark:bg-sidebar-border rounded-full overflow-hidden">
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

      <section className="py-6 border-b bg-white dark:bg-slate-900 sticky top-[56px] md:top-[64px] z-30 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search member name or ID..." className="pl-9 h-11 rounded-xl border-slate-200 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="py-12 flex-1 pb-24">
        <div className="container mx-auto px-4">
          {membersLoading || kitsLoading || configLoading ? (
            <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" /></div>
          ) : (
            <div className="space-y-12 max-w-6xl mx-auto">
              
              <div className="bg-white/60 dark:bg-slate-900/60 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 text-center max-w-2xl mx-auto shadow-sm mb-12">
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Verified Institutional Logistics Node</p>
                <p className="text-[8px] text-slate-400 mt-1 uppercase">Read-only transparency feed synchronized with the National Registry. Click a member for full details.</p>
              </div>

              {groupings.central.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                     <ShieldCheck className="w-5 h-5 text-red-600" />
                     <h4 className="text-sm font-black uppercase tracking-[0.25em] text-primary dark:text-white">Central Committee</h4>
                     <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                  </div>
                  {groupings.central.map(renderMemberCard)}
                </div>
              )}

              {Object.keys(groupings.stateGroups).sort().map(state => (
                <div key={state} className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                     <Globe className="w-6 h-6 text-emerald-600" />
                     <h4 className="text-base font-black uppercase tracking-[0.2em] text-primary dark:text-white">
                       {state} <span className="text-emerald-500 font-bold ml-2">Chapter</span>
                     </h4>
                     <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                  </div>
                  {groupings.stateGroups[state].map(renderMemberCard)}
                </div>
              ))}

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
        </div>
      </section>

      {/* DETAILED LOGISTICS MODAL */}
      <Dialog open={!!selectedMemberDetail} onOpenChange={(val) => !val && setSelectedMemberDetail(null)}>
        <DialogContent className="max-w-4xl p-0 border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 flex flex-col [&>button]:hidden max-h-[90vh]">
          <DialogHeader className="sr-only">
             <DialogTitle>Member Logistics Detail: {selectedMemberDetail?.name}</DialogTitle>
             <DialogDescription>Institutional record of issued assets and credentials.</DialogDescription>
          </DialogHeader>
          <div className="absolute right-6 top-6 z-50">
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full bg-blue-600 hover:bg-blue-500 text-white h-10 w-10 shadow-xl transition-all hover:scale-110 active:scale-95 duration-300">
                <X className="w-6 h-6 text-white" />
              </Button>
            </DialogClose>
          </div>

          {selectedMemberDetail && (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
               <div className="flex flex-col">
                  <div className="relative bg-slate-900 p-12 md:p-16 text-white overflow-hidden border-b-8 border-accent/20">
                    <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-[-20px]"><ShieldCheck className="w-64 h-64 md:w-96 md:h-96" /></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                       <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[2rem] overflow-hidden border-4 border-white/20 shadow-2xl bg-slate-800">
                          <Image 
                            src={selectedMemberDetail.imageId?.startsWith('data:') ? selectedMemberDetail.imageId : (PlaceHolderImages.find(i => i.id === selectedMemberDetail.imageId)?.imageUrl || (selectedMemberDetail.gender?.toLowerCase() === 'female' ? '/dummy w.png' : '/dummy m.png'))} 
                            alt={selectedMemberDetail.name} 
                            fill 
                            className="object-cover" 
                          />
                       </div>
                       <div className="space-y-3 text-center md:text-left">
                          <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-md px-3 py-1 rounded-full border border-accent/40">
                            <BadgeCheck className="w-4 h-4 text-accent" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">{selectedMemberDetail.designationCategory || "Member"} Profile</span>
                          </div>
                          <h2 className="text-4xl md:text-6xl font-headline font-bold drop-shadow-xl">{selectedMemberDetail.name}</h2>
                          <div className="flex items-center gap-4 justify-center md:justify-start">
                             <p className="text-white/60 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                                <Hash className="w-3.5 h-3.5 text-accent" /> ID: {selectedMemberDetail.memberId}
                             </p>
                             <Badge className="bg-emerald-500 text-white font-black text-[8px] h-5 px-3">VERIFIED ACTIVE</Badge>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="p-8 md:p-16 space-y-12 pb-24">
                     <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2"><Package className="w-4 h-4" /> Item Issuance Checklist</h4>
                           <div className="grid grid-cols-1 gap-2">
                              {kitItems.filter((item: any) => (eligibilityRules[selectedMemberDetail.designationCategory || "General Member"] || []).includes(item.id)).map((item: any) => {
                                const isIssued = kitMap[selectedMemberDetail.id]?.items?.[item.id];
                                return (
                                  <div key={item.id} className={cn(
                                    "flex items-center gap-3 p-4 rounded-2xl border transition-all shadow-sm",
                                    isIssued ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900" : "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                                  )}>
                                     {isIssued ? (
                                       <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                     ) : (
                                       <div className="w-5 h-5 rounded-full border-2 border-slate-200 dark:border-slate-700 shrink-0" />
                                     )}
                                     <span className={cn(
                                       "text-sm font-bold uppercase tracking-tight",
                                       isIssued ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400"
                                     )}>{item.label}</span>
                                  </div>
                                )
                              })}
                           </div>
                        </div>

                        <div className="space-y-10">
                           <div className="space-y-4">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2"><Globe className="w-4 h-4" /> Jurisdictional Scope</h4>
                              <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                                 <div>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Operational Level</p>
                                    <p className="text-sm font-bold text-primary dark:text-white uppercase">{selectedMemberDetail.level} Council</p>
                                 </div>
                                 <div className="h-px bg-slate-200 dark:bg-slate-800"></div>
                                 <div>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Assigned Region</p>
                                    <p className="text-sm font-bold text-primary dark:text-white uppercase">
                                       {selectedMemberDetail.districtName ? `${selectedMemberDetail.districtName}, ` : ''}{selectedMemberDetail.stateName || 'National Center'}
                                    </p>
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-4">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2"><CalendarClock className="w-4 h-4" /> Membership Term</h4>
                              <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                                 <div className="grid grid-cols-2 gap-4">
                                    <div><p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Issue Date</p><p className="text-xs font-bold">{selectedMemberDetail.joiningDate || 'Verified'}</p></div>
                                    <div><p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Expiry Date</p><p className="text-xs font-bold text-red-500">{selectedMemberDetail.expiryDate || 'N/A'}</p></div>
                                 </div>
                                 <div className="h-px bg-slate-200 dark:bg-slate-800"></div>
                                 <div><p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Term Duration</p><p className="text-xs font-bold text-indigo-500">{selectedMemberDetail.membershipDuration || '1 Year'}</p></div>
                              </div>
                           </div>

                           {kitMap[selectedMemberDetail.id]?.notes && (
                              <div className="space-y-4">
                                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><FileText className="w-4 h-4" /> Registry Notes</h4>
                                 <div className="p-6 bg-amber-50/30 dark:bg-amber-950/20 rounded-3xl border border-amber-100 dark:border-amber-900/50">
                                    <p className="text-sm italic text-amber-900 dark:text-amber-400 leading-relaxed normal-case">
                                       "{kitMap[selectedMemberDetail.id].notes}"
                                    </p>
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>

                     <div className="pt-12 border-t border-slate-100 dark:border-slate-800 text-center space-y-4">
                        <Button 
                          size="lg" 
                          onClick={() => setSelectedMemberDetail(null)}
                          className="w-full bg-primary text-white font-bold h-16 rounded-2xl text-lg hover:bg-secondary transition-all shadow-xl shadow-primary/20"
                        >
                          Close Detail Registry
                        </Button>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em]">
                           Verified Institutional Logistics Feed • Human Rights Affairs Trust
                        </p>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Issuance Breakdown Members Modal (Public) */}
      <Dialog open={!!viewingItemMembers} onOpenChange={(val) => !val && setViewingItemMembers(null)}>
        <DialogContent className="max-w-2xl rounded-[2rem] border-none shadow-2xl bg-white dark:bg-slate-900 p-0 overflow-hidden flex flex-col max-h-[80vh]">
          <DialogHeader className="p-8 bg-slate-900 text-white border-b-4 border-accent/20">
             <div className="flex items-center justify-between mb-2">
                <Badge className="bg-accent text-primary font-black text-[8px] tracking-[0.2em]">Verified Issued Personnel</Badge>
                <DialogClose asChild><button className="text-white/40 hover:text-white transition-colors"><X className="w-5 h-5" /></button></DialogClose>
             </div>
             <DialogTitle className="text-2xl font-headline font-bold">
               {viewingItemMembers?.item?.label} Registry
             </DialogTitle>
             <DialogDescription className="text-slate-400 text-xs font-bold uppercase">
               Public record of officials holding this institutional asset.
             </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
               <div className="p-6 space-y-3">
                  {viewingItemMembers?.members.map((m: any) => (
                    <div 
                      key={m.id} 
                      onClick={() => { setSelectedMemberDetail(m); setViewingItemMembers(null); }}
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-accent/40 transition-all cursor-pointer"
                    >
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-100 group-hover:border-accent transition-colors">
                             <UserCheck className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-primary dark:text-white leading-none">{m.name}</p>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{m.memberId}</p>
                          </div>
                       </div>
                       <div className="flex flex-col items-end gap-1">
                          <Badge variant="outline" className="text-[7px] font-bold border-slate-200 text-slate-500 uppercase">
                            {m.level} Level
                          </Badge>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">{m.stateName || 'National Center'}</p>
                       </div>
                    </div>
                  ))}
                  {viewingItemMembers?.members.length === 0 && (
                    <div className="text-center py-20 opacity-30">
                       <Package className="w-12 h-12 mx-auto mb-3" />
                       <p className="text-sm font-bold uppercase tracking-widest">No verified issuances for this item.</p>
                    </div>
                  )}
               </div>
            </ScrollArea>
          </div>
          
          <div className="p-6 border-t bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
             <p className="text-[10px] font-black uppercase text-slate-400">Public Record: {viewingItemMembers?.members.length} Distributed</p>
             <Button variant="ghost" onClick={() => setViewingItemMembers(null)} className="text-[10px] font-black uppercase tracking-widest text-accent hover:bg-accent/10">Close Feed</Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
