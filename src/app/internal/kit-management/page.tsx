
"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser, useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase'
import { collection, query, orderBy, doc, setDoc, serverTimestamp, where } from 'firebase/firestore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Package, 
  Search, 
  Truck, 
  Loader2, 
  ShieldCheck, 
  UserCheck, 
  CheckCircle2, 
  MapPin,
  ChevronRight,
  Briefcase,
  Globe,
  Building2,
  Settings2,
  Plus,
  Users,
  Edit,
  Trash2,
  ClipboardList,
  Car,
  Info
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog"
import { Progress } from '@/components/ui/progress'
import { Footer } from '@/components/footer'
import { INDIA_DATA } from '@/lib/india-data'

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

const MEMBER_CATEGORIES = [
  "General Member",
  "Board Member",
  "Office-bearing Member",
  "Volunteer"
]

const INITIAL_ELIGIBILITY: Record<string, string[]> = {
  "Volunteer": ['identityCard', 'lanyard', 'cardHolder'],
  "General Member": ['identityCard', 'lanyard', 'cardHolder', 'membershipCertificate'],
  "Board Member": ['identityCard', 'lanyard', 'cardHolder', 'badge', 'membershipCertificate', 'appointmentLetter', 'vehicleSticker'],
  "Office-bearing Member": INITIAL_KIT_ITEMS.map(i => i.id)
};

export default function MemberKitManagement() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const [isConfiguring, setIsConfiguring] = useState(false)
  const [newItemLabel, setNewItemLabel] = useState('')
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingItemLabel, setEditingItemLabel] = useState('')
  
  const [viewingItemMembers, setViewingItemMembers] = useState<{item: any, members: any[]} | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

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
    if (!db || !user) return null;
    return query(collection(db, 'memberProfiles'), orderBy('name', 'asc'));
  }, [db, user]);

  const { data: firestoreMembers, loading: membersLoading } = useCollection(membersQuery);

  const members = React.useMemo(() => {
    return ((firestoreMembers || []) as any[]).filter(m => m.isDemi !== true);
  }, [firestoreMembers]);

  const kitsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'member_kits'));
  }, [db, user]);

  const { data: kits, loading: kitsLoading } = useCollection(kitsQuery);

  const kitMap = useMemo(() => {
    const map: Record<string, any> = {};
    (kits || []).forEach((k: any) => {
      map[k.id] = k;
    });
    return map;
  }, [kits]);

  const saveLogisticsConfig = async (newKitItems: any[], newEligibilityRules: any) => {
    if (!db) return;
    const updateData = {
      kitItems: newKitItems,
      eligibilityRules: newEligibilityRules,
      updatedAt: serverTimestamp(),
      updatedBy: user?.email
    };
    
    setDoc(doc(db, 'member_kits', 'settings'), updateData, { merge: true });
  }

  const handleCreateKitItem = () => {
    if (!newItemLabel.trim()) return
    const id = newItemLabel.toLowerCase().replace(/\s+/g, '')
    if (kitItems.find((i: any) => i.id === id)) {
      toast({ variant: "destructive", title: "Duplicate Entry" })
      return
    }

    const updatedItems = [...kitItems, { id, label: newItemLabel.trim() }];
    saveLogisticsConfig(updatedItems, eligibilityRules);
    setNewItemLabel('')
  }

  const handleStartEditItem = (item: {id: string, label: string}) => {
    setEditingItemId(item.id)
    setEditingItemLabel(item.label)
  }

  const handleSaveEditItem = () => {
    if (!editingItemId || !editingItemLabel.trim()) return
    const updatedItems = kitItems.map((item: any) => 
      item.id === editingItemId ? { ...item, label: editingItemLabel.trim() } : item
    )
    saveLogisticsConfig(updatedItems, eligibilityRules);
    setEditingItemId(null)
    setEditingItemLabel('')
  }

  const handleDeleteKitItem = (id: string) => {
    const updatedItems = kitItems.filter((item: any) => item.id !== id);
    const updatedEligibility = { ...eligibilityRules };
    MEMBER_CATEGORIES.forEach(cat => {
      if (updatedEligibility[cat]) {
        updatedEligibility[cat] = updatedEligibility[cat].filter((itemId: string) => itemId !== id)
      }
    })
    saveLogisticsConfig(updatedItems, updatedEligibility);
  }

  const toggleEligibility = (category: string, itemId: string) => {
    const current = eligibilityRules[category] || [];
    const updated = current.includes(itemId) 
      ? current.filter((id: string) => id !== itemId) 
      : [...current, itemId];
    saveLogisticsConfig(kitItems, { ...eligibilityRules, [category]: updated });
  };

  const filteredMembers = (members || []).filter(m => {
    const matchesSearch = (m.name || '').toLowerCase().includes(search.toLowerCase()) || 
                          (m.memberId || '').toLowerCase().includes(search.toLowerCase());
    const kit = kitMap[m.id];
    const status = kit?.deliveryStatus || 'Pending Verification';
    const matchesStatus = statusFilter === 'All' || status === statusFilter;
    return matchesSearch && matchesStatus;
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
          if (kit?.items?.[item.id]) stats[item.id].issued += 1;
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
    const status = kit?.deliveryStatus || 'Pending Verification';
    const category = m.designationCategory || "General Member";
    const eligibleItemIds = eligibilityRules[category] || [];
    const eligibleItems = kitItems.filter((item: any) => eligibleItemIds.includes(item.id));
    const isOfficeBearer = category === 'Office-bearing Member';
    const carPlateItemIds = kitItems.filter((item: any) => item.label.toLowerCase().includes('car plate')).map((item: any) => item.id);
    const isCarPlateIssued = carPlateItemIds.some((id: string) => kit?.items?.[id]);

    return (
      <Link href={`/internal/kit-management/${m.id}`} key={m.id}>
        <Card 
          className={cn(
            "border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 relative group cursor-pointer transition-all hover:shadow-lg active:scale-[0.99]"
          )}
        >
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row items-stretch">
               <div className="p-5 bg-slate-50 dark:bg-slate-800 md:w-44 text-center border-r border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center shrink-0">
                  <Badge variant="outline" className={cn(
                    "text-[8px] font-bold px-3 py-1 rounded-full uppercase border-none",
                    status === 'Delivered' ? "bg-emerald-500 text-white" : 
                    status === 'In Transit' ? "bg-indigo-500 text-white" :
                    status === 'Dispatched' ? "bg-blue-500 text-white" : 
                    status === 'Returned' ? "bg-red-500 text-white" : "bg-amber-500 text-white animate-pulse"
                  )}>
                    {status}
                  </Badge>
                  <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{m.memberId || 'NO ID'}</p>
               </div>
               <div className="flex-1 p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-2 text-center sm:text-left w-full sm:w-auto">
                     <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                       <h3 className="text-lg md:text-xl font-bold text-primary dark:text-white leading-tight group-hover:text-accent transition-colors">{m.name}</h3>
                       <Badge className={cn(
                         "text-[7px] md:text-[8px] font-black uppercase tracking-wider h-5 px-3",
                         isOfficeBearer ? "bg-accent text-primary shadow-sm" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                       )}>
                         {category}
                       </Badge>
                     </div>
                     <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                        <span className="flex items-center gap-1.5 text-primary dark:text-slate-200">
                          <Briefcase className="w-3 h-3 text-accent" /> {m.designation}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-accent" /> 
                          {m.level === 'District' ? `${m.districtName}, ${m.stateName}` : m.stateName || 'National Center'}
                        </span>
                        {isCarPlateIssued && <Car className="w-3.5 h-3.5 text-red-600 animate-pulse" />}
                     </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                     <div className="flex flex-wrap gap-1 justify-end max-w-[120px] md:max-w-[240px]">
                        {eligibleItems.map((item: any) => (
                          <div 
                            key={item.id} 
                            className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-black uppercase transition-all shadow-sm border shrink-0",
                              kit?.items?.[item.id] ? "bg-emerald-500 text-white border-emerald-600" : "bg-slate-100 text-slate-300 dark:bg-slate-900 border-slate-200"
                            )}
                          >
                            {item.label[0]}
                          </div>
                        ))}
                     </div>
                     <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
               </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  if (authLoading || (user && (membersLoading || kitsLoading || configLoading))) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border border-accent/30">
                <ShieldCheck className="w-2.5 h-2.5" /> Logistics Oversight
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold">Kit & Asset <span className="text-accent italic">Registry</span></h1>
              <p className="text-slate-400 text-[11px]">Comprehensive oversight of institutional material distribution and personnel logistics.</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
               <Dialog>
                 <DialogTrigger asChild>
                   <Button variant="outline" className="flex-1 md:flex-none bg-white/5 border-accent/30 text-accent h-11 md:h-10 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-accent hover:text-primary transition-all">
                      <Settings2 className="w-4 h-4" /> Eligibility Configuration
                   </Button>
                 </DialogTrigger>
                 <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] overflow-y-auto rounded-[2rem] border-none shadow-2xl p-4 md:p-10">
                    <DialogHeader>
                       <DialogTitle>Item Eligibility Protocol</DialogTitle>
                       <DialogDescription>Define mandatory items for each member category.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-8">
                       <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-6">
                          <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase text-slate-500">Registry Maintenance</Label>
                            <div className="flex flex-col sm:flex-row gap-3">
                               <Input 
                                  placeholder="e.g. Official Blazer" 
                                  value={editingItemId ? editingItemLabel : newItemLabel}
                                  onChange={e => editingItemId ? setEditingItemLabel(e.target.value) : setNewItemLabel(e.target.value)}
                                  className="h-11 rounded-xl"
                               />
                               <Button onClick={editingItemId ? handleSaveEditItem : handleCreateKitItem} className="h-11 px-8 rounded-xl font-bold bg-accent text-primary">
                                  {editingItemId ? "Commit" : "Add Item"}
                               </Button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                             {kitItems.map((item: any) => (
                               <Badge key={item.id} variant="outline" className={cn(
                                 "pl-4 pr-1 py-1 rounded-xl h-10 border-slate-200 bg-white dark:bg-slate-800 gap-3",
                                 editingItemId === item.id && "border-accent ring-1 ring-accent"
                               )}>
                                  <span className="text-[10px] font-bold">{item.label}</span>
                                  <div className="flex gap-1">
                                    <button onClick={() => handleStartEditItem(item)} className="p-1 hover:text-blue-600"><Edit className="w-3.5 h-3.5"/></button>
                                    <button onClick={() => handleDeleteKitItem(item.id)} className="p-1 hover:text-red-600"><Trash2 className="w-3.5 h-3.5"/></button>
                                  </div>
                               </Badge>
                             ))}
                          </div>
                       </div>
                       {MEMBER_CATEGORIES.map(category => (
                         <div key={category} className="space-y-4">
                            <h4 className="text-sm font-black uppercase tracking-widest text-primary border-b pb-2 flex items-center gap-2">
                               <UserCheck className="w-4 h-4 text-accent" /> {category}
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                               {kitItems.map((item: any) => {
                                 const isEligible = (eligibilityRules[category] || []).includes(item.id);
                                 return (
                                   <div 
                                    key={item.id} 
                                    onClick={() => toggleEligibility(category, item.id)}
                                    className={cn(
                                      "flex items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer select-none",
                                      isEligible ? "bg-accent/10 border-accent/40 text-primary font-bold" : "bg-slate-50 border-slate-100 text-slate-400"
                                    )}
                                   >
                                      <Checkbox checked={isEligible} className="border-accent" />
                                      <span className="text-[10px] uppercase truncate">{item.label}</span>
                                   </div>
                                 )
                               })}
                            </div>
                         </div>
                       ))}
                    </div>
                    <DialogFooter>
                       <DialogClose asChild><Button className="w-full h-12 rounded-xl font-bold bg-primary text-white">Save Changes</Button></DialogClose>
                    </DialogFooter>
                 </DialogContent>
               </Dialog>
            </div>
          </div>
        </div>
      </header>

      <section className="py-8 bg-white dark:bg-slate-900 border-b shadow-sm">
        <div className="container mx-auto px-4">
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              {[
                { label: 'Total Force', val: globalStats.total, icon: <Users className="w-6 h-6 text-blue-600" />, bg: 'bg-blue-50/50' },
                { label: 'Kit Delivered', val: globalStats.delivered, icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />, bg: 'bg-emerald-50/50' },
                { label: 'Pending Delivery', val: globalStats.notDelivered, icon: <Truck className="w-6 h-6 text-amber-600" />, bg: 'bg-amber-50/50' }
              ].map((s, i) => (
                <Card key={i} className={cn("border-none shadow-sm rounded-3xl p-6 flex items-center gap-5", s.bg)}>
                   <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">{s.icon}</div>
                   <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">{s.label}</p>
                      <p className="text-3xl font-headline font-bold text-primary dark:text-white leading-none">{s.val}</p>
                   </div>
                </Card>
              ))}
           </div>
        </div>
      </section>

      {/* Item-wise Issuance Audit Section */}
      <section className="py-8 bg-slate-50 dark:bg-slate-900 border-b overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h3 className="text-[10px] font-black uppercase text-accent tracking-[0.2em] flex items-center gap-2">
                <ClipboardList className="w-3.5 h-3.5" /> Item-wise Issuance Audit
              </h3>
              <p className="text-[8px] text-slate-400 font-bold uppercase">Real-time distribution analytics by kit component</p>
            </div>
          </div>
          
          <div className="flex flex-nowrap overflow-x-auto custom-scrollbar gap-4 pb-6 px-1">
            {kitItems.map((item: any) => {
              const stat = itemStats[item.id] || { issued: 0, total: 0 };
              const percent = stat.total > 0 ? Math.round((stat.issued / stat.total) * 100) : 0;
              
              const progressColor = percent < 30 ? "bg-red-500" : percent < 70 ? "bg-amber-500" : "bg-emerald-500";
              const textColor = percent < 30 ? "text-red-500" : percent < 70 ? "text-amber-500" : "text-emerald-500";
              const trackColor = percent < 30 ? "bg-red-100" : percent < 70 ? "bg-amber-100" : "bg-emerald-100";

              return (
                <Card 
                  key={item.id} 
                  className="min-w-[220px] md:min-w-[260px] border-none shadow-md rounded-2xl bg-white dark:bg-slate-800 p-5 flex flex-col gap-4 shrink-0 transition-transform hover:scale-[1.02]"
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-black uppercase text-slate-500 truncate">{item.label}</span>
                    <button 
                      onClick={() => {
                        const receivers = members.filter(m => kitMap[m.id]?.items?.[item.id]);
                        setViewingItemMembers({ item, members: receivers });
                      }}
                      className="text-[9px] font-black text-accent hover:underline flex items-center gap-1 shrink-0 bg-accent/5 px-2 py-0.5 rounded-lg transition-colors hover:bg-accent/10"
                    >
                      VIEW <ChevronRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                       <p className="text-2xl font-black text-primary dark:text-white leading-none">
                         {stat.issued}
                         <span className="text-[10px] text-slate-400 font-bold ml-1.5 uppercase tracking-tighter">/ {stat.total}</span>
                       </p>
                       <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-lg", textColor, trackColor)}>
                         {percent}%
                       </span>
                    </div>
                    <div className={cn("h-1.5 w-full rounded-full overflow-hidden", trackColor, "dark:opacity-20")}>
                      <div 
                        className={cn("h-full transition-all duration-1000", progressColor)} 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-6 border-b bg-white dark:bg-slate-900 sticky top-10 z-40 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex w-full overflow-x-auto no-scrollbar gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border">
               {['All', 'Pending Verification', 'Dispatched', 'In Transit', 'Delivered', 'Returned'].map(st => (
                 <button 
                  key={st} 
                  onClick={() => setStatusFilter(st)}
                  className={cn("whitespace-nowrap px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all", statusFilter === st ? "bg-accent text-primary shadow-md" : "text-slate-500 hover:bg-white")}
                 >
                   {st}
                 </button>
               ))}
            </div>
            <div className="relative w-full max-lg:max-w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Search member name or ID..." className="pl-9 h-12 md:h-11 rounded-xl border-slate-200 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 flex-1 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
            <div className="space-y-12">
                {groupings.central.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                       <ShieldCheck className="w-5 h-5 text-red-600" />
                       <h4 className="text-sm font-black uppercase tracking-[0.25em] text-primary dark:text-white">National Registry</h4>
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
                             {state} <span className="text-emerald-500 font-bold ml-2">Chapter</span>
                           </h4>
                           <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                        </div>
                        <div className="grid gap-3">{groupings.stateGroups[state].map(renderMemberCard)}</div>
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
                                 {district} <span className="text-blue-500 font-bold ml-2">Cell</span>
                               </h4>
                               <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                            </div>
                            <div className="grid gap-3">{groupings.districtGroups[state][district].map(renderMemberCard)}</div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {filteredMembers.length === 0 && (
                  <div className="text-center py-24 opacity-30">
                     <Package className="w-16 h-16 mx-auto mb-4" />
                     <p className="text-lg font-headline font-bold">No matching records identified in this jurisdiction.</p>
                  </div>
                )}
            </div>
        </div>
      </section>

      {/* View Item Members Dialog */}
      <Dialog open={!!viewingItemMembers} onOpenChange={(val) => !val && setViewingItemMembers(null)}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900">
           {viewingItemMembers && (
             <>
               <div className="bg-slate-900 p-8 text-white relative">
                  <div className="absolute right-6 top-6">
                    <DialogClose asChild>
                      <Button variant="ghost" size="icon" className="rounded-full text-white/40 hover:text-white">
                        <X className="w-5 h-5" />
                      </Button>
                    </DialogClose>
                  </div>
                  <Badge className="bg-accent text-primary font-black text-[8px] uppercase mb-2">Logistics Audit</Badge>
                  <DialogTitle className="text-2xl font-headline font-bold">{viewingItemMembers.item.label}</DialogTitle>
                  <DialogDescription className="text-slate-400">Registry of personnel issued with this component.</DialogDescription>
               </div>
               <div className="p-8">
                  <ScrollArea className="h-64 pr-4">
                     <div className="space-y-2">
                        {viewingItemMembers.members.length > 0 ? viewingItemMembers.members.map((m: any) => (
                          <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-accent">
                                   <User className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-xs font-bold">{m.name}</span>
                                   <span className="text-[8px] font-black text-slate-400 uppercase">{m.memberId}</span>
                                </div>
                             </div>
                             <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          </div>
                        )) : (
                          <div className="text-center py-12 opacity-30">
                             <Info className="w-10 h-10 mx-auto mb-2" />
                             <p className="text-xs font-bold uppercase tracking-widest">No issuance recorded</p>
                          </div>
                        )}
                     </div>
                  </ScrollArea>
                  <Button onClick={() => setViewingItemMembers(null)} className="w-full h-12 rounded-xl mt-6 bg-primary text-white font-bold">
                    Close Audit Node
                  </Button>
               </div>
             </>
           )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}

function ScrollArea({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn("overflow-y-auto custom-scrollbar", className)}>
      {children}
    </div>
  );
}
