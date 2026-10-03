"use client"
  
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, doc, deleteDoc } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Loader2,
  UserPlus,
  Calendar as CalendarIcon,
  User,
  Building,
  ArrowDown,
  ArrowUp,
  FileText,
  CheckCircle,
  XCircle,
  ShieldAlert,
  Edit,
  Trash2,
  ChevronRight,
  MapPin
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { MembershipRegistrationDialog } from '@/components/membership-registration-dialog'
import { DeleteMemberWorkflow } from '@/components/delete-member-workflow'

interface Member {
  id: string;
  name: string;
  memberId?: string;
  rank: string;
  post: string;
  profilePhotoUrl?: string;
  status: 'active' | 'suspended' | 'expired' | 'terminated';
  commissionDate?: { seconds: number, nanoseconds: number };
  [key: string]: any;
}

export default function InternalMembersPage() {
    const { user, loading: authLoading } = useUser();
    const router = useRouter();
    const db = useFirestore();
    const { toast } = useToast();
    
    const [isRegistering, setIsRegistering] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [deletingMember, setDeletingMember] = useState<Member | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/internal/login');
        }
    }, [user, authLoading, router]);

    const membersQuery = useMemoFirebase(() => {
        if (!db) return null;
        return query(collection(db, 'memberProfiles'), orderBy('name', 'asc'));
    }, [db]);

    const { data: membersRaw, loading: dataLoading } = useCollection(membersQuery);

    const members = React.useMemo(() => {
      return (membersRaw || []).filter((m: any) => m.isDemi !== true);
    }, [membersRaw]);

    const filteredMembers = members.filter((member: any) => {
        const name = member.name?.toLowerCase() || '';
        const rank = member.rank || member.designation || '';
        const search = searchTerm.toLowerCase();
        const matchesSearch = name.includes(search) || rank.toLowerCase().includes(search) || (member.memberId || '').toLowerCase().includes(search);
        const matchesStatus = statusFilter === 'all' ? true : member.status?.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    if (authLoading || dataLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <Loader2 className="w-12 h-12 animate-spin text-accent" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-100 dark:bg-slate-950 pb-24">
            <header className="pt-16 pb-8 bg-slate-900 text-white border-b-4 border-accent/20 px-4 shadow-lg sticky top-0 z-40">
                <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl md:text-4xl font-headline font-bold text-white flex items-center gap-3">
                            <Building className="w-8 h-8 text-accent" />
                            Personnel Portal
                        </h1>
                        <p className="text-slate-300 text-sm uppercase font-semibold">Official Member Registry & Management</p>
                    </div>
                    
                    <div className="flex gap-3">
                        <Button 
                            onClick={() => setIsRegistering(true)}
                            className="bg-accent text-primary font-bold rounded-xl h-11 px-6 shadow-xl transition-all text-sm gap-2"
                        >
                            <UserPlus className="w-5 h-5" /> Commission New Personnel
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6 sticky top-[132px] z-30 bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-sm rounded-b-3xl shadow-md">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-auto md:flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input 
                    placeholder="Search by name, rank, or ID..." 
                    className="pl-10 h-11 rounded-xl bg-white dark:bg-slate-900 shadow-sm text-sm border-2 border-black w-full" 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className='flex items-center gap-3'>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-900 shadow-sm text-sm border-2 border-black w-full md:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <section className="py-8 container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredMembers.map((member: any) => {
                        const profileImg = member.imageId || (member.gender === 'female' ? '/dummy w.png' : '/dummy m.png');
                        return (
                          <Card key={member.id} className="rounded-3xl shadow-lg bg-white dark:bg-slate-900 border border-slate-100 overflow-hidden group">
                            <CardContent className="p-0">
                               <div className="flex flex-col md:flex-row items-stretch">
                                  <div className="p-6 bg-slate-50 dark:bg-slate-800 md:w-44 text-center border-r flex flex-col items-center justify-center shrink-0">
                                     <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-md border-2 border-white mb-3">
                                        <Image src={profileImg} alt={member.name} fill className="object-cover" />
                                     </div>
                                     <Badge variant="outline" className="text-[8px] font-black border-accent text-accent mb-2 uppercase">{member.memberId || 'NO-ID'}</Badge>
                                     <Badge className={cn("text-[9px] uppercase", member.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500')}>{member.status || 'Active'}</Badge>
                                  </div>
                                  <div className="flex-1 p-6 flex flex-col justify-between gap-6">
                                     <div className="space-y-1 text-center md:text-left">
                                        <h3 className="text-xl font-bold text-primary dark:text-white leading-tight">{member.name}</h3>
                                        <p className="text-[10px] font-black uppercase text-accent tracking-widest">{member.designation || member.rank}</p>
                                        <div className="flex items-center justify-center md:justify-start gap-3 text-[10px] font-bold text-slate-500 mt-2">
                                           <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {member.stateName || 'National'}</span>
                                           <span className="flex items-center gap-1.5"><CalendarIcon className="w-3 h-3" /> {member.joiningDate || 'N/A'}</span>
                                        </div>
                                     </div>
                                     <div className="flex items-center justify-center md:justify-end gap-2 pt-4 border-t border-slate-50">
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          onClick={() => router.push(`/internal/members/${member.id}`)}
                                          className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 hover:bg-slate-50"
                                        >
                                           <FileText className="w-3.5 h-3.5 mr-1.5" /> Profile
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          onClick={() => router.push(`/internal/members/${member.id}`)}
                                          className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 border-primary hover:bg-primary hover:text-white"
                                        >
                                           <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          onClick={() => setDeletingMember(member)}
                                          className="h-9 w-9 rounded-xl text-slate-300 hover:text-red-500"
                                        >
                                           <Trash2 className="w-4.5 h-4.5" />
                                        </Button>
                                     </div>
                                  </div>
                               </div>
                            </CardContent>
                          </Card>
                        )
                    })}
                </div>

                {filteredMembers.length === 0 && (
                    <div className="text-center py-40 opacity-30">
                        <User className="w-20 h-20 text-slate-300 mx-auto mb-6" />
                        <h3 className="text-xl font-headline font-bold uppercase tracking-widest">Registry Empty</h3>
                    </div>
                )}
            </section>

            <MembershipRegistrationDialog 
              isOpen={isRegistering}
              onClose={() => setIsRegistering(false)}
            />

            {deletingMember && (
              <DeleteMemberWorkflow 
                member={deletingMember}
                onSuccess={() => setDeletingMember(null)}
                onCancel={() => setDeletingMember(null)}
              />
            )}

            <Footer />
        </main>
    );
}
