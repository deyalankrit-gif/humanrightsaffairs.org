  "use client"
  
  import React, { useEffect, useState } from 'react'
  import { useRouter } from 'next/navigation'
  import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
  import { collection, query, orderBy, addDoc, serverTimestamp, doc } from 'firebase/firestore'
  import { Footer } from '@/components/footer'
  import { Card, CardContent } from '@/components/ui/card'
  import { Button } from '@/components/ui/button'
  import { Badge } from '@/components/ui/badge'
  import { 
    Search, 
    Lock, 
    Loader2,
    UserPlus,
    MapPin,
    Sparkles,
    Heart,
    Calendar as CalendarIcon,
    Camera,
    User,
    Mail,
    Phone,
    Briefcase,
    Trash2,
    AlertTriangle,
    ShieldAlert,
    Hash,
    Globe,
    Filter,
    ArrowDown,
    ArrowUp,
    FileText,
    CheckCircle,
    XCircle,
    Building,
    Home,
    Fingerprint,
    CreditCard
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
  
  // Define Member type
  interface Member {
    id: string;
    name: string;
    aadhaarUID: string;
    panNumber: string;
    rank: string;
    post: string;
    profilePhotoUrl?: string;
    status: 'active' | 'suspended' | 'expired' | 'terminated';
    commissionDate: { seconds: number, nanoseconds: number };
    [key: string]: any;
  }
  
  // --- SUBCOMPONENTS ---
  
  const MemberCard = ({ member, onSelect }: { member: Member, onSelect: (member: Member) => void }) => {
    const commissionDate = new Date(member.commissionDate.seconds * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  
    return (
      <Card 
        onClick={() => onSelect(member)}
        className="rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer bg-white dark:bg-slate-800/50 border-2 border-transparent hover:border-accent/50 group"
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-md border-4 border-slate-100 dark:border-slate-700">
              {member.profilePhotoUrl ? (
                <Image src={member.profilePhotoUrl} alt={member.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <User className="w-8 h-8 text-slate-400" />
                </div>
              )}
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <h3 className="text-lg font-bold text-primary dark:text-white truncate">{member.name}</h3>
              <p className="text-sm font-semibold text-accent">{member.rank} / {member.post}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Commissioned: {commissionDate}</span>
              </div>
              <Badge className={cn("mt-2 text-xs font-bold", {
                'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300': member.status === 'active',
                'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300': member.status === 'suspended',
                'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300': member.status === 'terminated',
                'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300': member.status === 'expired',
              })}>
                {member.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const MemberDetailView = ({ member, onClose }: { member: Member | null; onClose: () => void }) => {
    if (!member) return null;
  
    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'active': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
        case 'suspended': return <ShieldAlert className="w-5 h-5 text-amber-500" />;
        case 'terminated': return <XCircle className="w-5 h-5 text-red-500" />;
        default: return <XCircle className="w-5 h-5 text-slate-500" />;
      }
    };
  
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-in fade-in">
        <Card className="w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl bg-slate-50 dark:bg-slate-900 border-none flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className='flex items-center gap-3'>
              {getStatusIcon(member.status)}
              <h2 className="text-xl font-bold text-primary dark:text-white">Personnel Record: {member.name}</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
              <X className="w-5 h-5" />
            </Button>
          </div>
  
          <div className="flex-1 overflow-y-auto">
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1 space-y-6">
                <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-lg border-4 border-white dark:border-slate-800">
                  {member.profilePhotoUrl ? (
                    <Image src={member.profilePhotoUrl} alt={member.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <User className="w-20 h-20 text-slate-400" />
                    </div>
                  )}
                </div>
                <div className='space-y-3'>
                    <Button className='w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm'>Edit Record</Button>
                    <Button variant='destructive' className='w-full h-11 rounded-xl font-bold text-sm'>
                        <Trash2 className='w-4 h-4 mr-2'/>
                        Terminate
                    </Button>
                </div>
              </div>
  
              <div className="md:col-span-2 space-y-6">
                <div className="p-6 bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm">
                  <h4 className="text-sm font-semibold uppercase text-slate-400 tracking-wider mb-4">Official Status</h4>
                  <div className="space-y-3">
                      <div className='flex items-center gap-3'><Briefcase className='w-5 h-5 text-accent'/><span className='font-bold text-slate-700 dark:text-slate-200'>{member.rank} / {member.post}</span></div>
                      <div className='flex items-center gap-3'><Hash className='w-5 h-5 text-accent'/><span className='font-mono text-slate-700 dark:text-slate-200'>{member.id}</span></div>
                      <div className='flex items-center gap-3'><CalendarIcon className='w-5 h-5 text-accent'/><span className='text-slate-700 dark:text-slate-200'>Commissioned on {new Date(member.commissionDate.seconds * 1000).toLocaleDateString()}</span></div>
                  </div>
                </div>
  
                <div className="p-6 bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm">
                  <h4 className="text-sm font-semibold uppercase text-slate-400 tracking-wider mb-4">Identification Protocol</h4>
                  <div className="space-y-3">
                      <div className='flex items-center gap-3'><Fingerprint className='w-5 h-5 text-accent'/><span className='font-mono text-slate-700 dark:text-slate-200'>{member.aadhaarUID} (Aadhaar)</span></div>
                      <div className='flex items-center gap-3'><CreditCard className='w-5 h-5 text-accent'/><span className='font-mono text-slate-700 dark:text-slate-200'>{member.panNumber} (PAN)</span></div>
                  </div>
                </div>
  
                 <div className="p-6 bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm">
                  <h4 className="text-sm font-semibold uppercase text-slate-400 tracking-wider mb-4">Contact & Residence</h4>
                  <div className="space-y-3">
                      <div className='flex items-center gap-3'><Mail className='w-5 h-5 text-accent'/><span className='text-slate-700 dark:text-slate-200'>{member.email}</span></div>
                      <div className='flex items-center gap-3'><Phone className='w-5 h-5 text-accent'/><span className='text-slate-700 dark:text-slate-200'>{member.phone}</span></div>
                      <div className='flex items-start gap-3'><Home className='w-5 h-5 text-accent mt-1 shrink-0'/><span className='text-slate-700 dark:text-slate-200'>{member.fullAddress.street}, {member.fullAddress.po}, {member.fullAddress.ps}, {member.fullAddress.city} - {member.fullAddress.pinCode}, {member.fullAddress.state}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };
  
  // --- MAIN PAGE COMPONENT ---
  
  export default function InternalMembersPage() {
      const { user, loading: authLoading } = useUser();
      const router = useRouter();
      const db = useFirestore();
      const { toast } = useToast();
      
      const [isRegistering, setIsRegistering] = useState(false);
      const [searchTerm, setSearchTerm] = useState('');
      const [statusFilter, setStatusFilter] = useState('all');
      const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
      const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
      // Redirect if not logged in
      useEffect(() => {
          if (!authLoading && !user) {
              router.push('/auth/login');
          }
      }, [user, authLoading, router]);
  
      const membersQuery = useMemoFirebase(() => {
          if (!db) return null;
          return query(collection(db, 'members'), orderBy('commissionDate', sortOrder));
      }, [db, sortOrder]);
  
      const { data: members, loading: dataLoading } = useCollection(membersQuery);
  
      const filteredMembers = (members || []).filter((member: any) => {
          const name = member.name?.toLowerCase() || '';
          const rank = member.rank?.toLowerCase() || '';
          const post = member.post?.toLowerCase() || '';
          const search = searchTerm.toLowerCase();
          
          const matchesSearch = name.includes(search) || rank.includes(search) || post.includes(search);
          const matchesStatus = statusFilter === 'all' ? true : member.status === statusFilter;
  
          return matchesSearch && matchesStatus;
      });
  
      if (authLoading || dataLoading) {
          return (
              <div className="min-h-screen flex items-center justify-center bg-slate-950">
                  <Loader2 className="w-12 h-12 animate-spin text-accent" />
              </div>
          );
      }
  
      if (!user) {
        return (
          <div className="min-h-screen flex flex-col items-center justify-center text-white bg-slate-950 p-4 text-center">
            <Lock className="w-16 h-16 text-accent mb-4" />
            <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
            <p className="text-slate-400">You must be logged in to view the personnel portal.</p>
            <Button onClick={() => router.push('/auth/login')} className="mt-6">
              Proceed to Login
            </Button>
          </div>
        );
      }
  
      return (
          <main className="min-h-screen bg-slate-100 dark:bg-slate-950 pb-24">
              {/* Header */}
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
                              className="bg-accent text-primary-foreground hover:bg-secondary hover:text-white font-bold rounded-xl h-11 px-6 shadow-xl shadow-accent/20 transition-all text-sm gap-2"
                          >
                              <UserPlus className="w-5 h-5" /> Commission New Personnel
                          </Button>
                      </div>
                  </div>
              </header>
  
              {/* Controls */}
              <div className="container mx-auto px-4 py-6 sticky top-[132px] z-30 bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-sm rounded-b-3xl shadow-md">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="relative w-full md:w-auto md:flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input 
                      placeholder="Filter by name, rank, or post..." 
                      className="pl-10 h-11 rounded-xl bg-white dark:bg-slate-900 shadow-sm text-sm border-slate-300 dark:border-slate-700 w-full" 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className='flex items-center gap-3'>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-900 shadow-sm text-sm border-slate-300 dark:border-slate-700 w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="terminated">Terminated</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant='outline'
                      onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                      className="h-11 w-11 p-0 rounded-xl bg-white dark:bg-slate-900 shadow-sm border-slate-300 dark:border-slate-700"
                    >
                      {sortOrder === 'desc' ? <ArrowDown className="w-5 h-5" /> : <ArrowUp className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>
              </div>
  
              {/* Grid */}
              <section className="py-8 container mx-auto px-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredMembers.map((member: any) => (
                          <MemberCard key={member.id} member={member} onSelect={setSelectedMember} />
                      ))}
                  </div>
  
                  {filteredMembers.length === 0 && (
                      <div className="text-center py-20 col-span-full">
                          <FileText className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300">No Records Found</h3>
                          <p className="text-slate-500 dark:text-slate-400 mt-2">Adjust your search or filter criteria.</p>
                      </div>
                  )}
              </section>
  
              {/* Modals */}
              <MembershipRegistrationDialog 
                isOpen={isRegistering}
                onClose={() => setIsRegistering(false)}
              />
  
              <MemberDetailView 
                member={selectedMember}
                onClose={() => setSelectedMember(null)}
              />
  
              <Footer />
          </main>
      );
  }
  