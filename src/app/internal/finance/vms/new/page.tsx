
"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useFirestore } from '@/firebase'
import { collection, query, orderBy, addDoc, serverTimestamp, limit, getDocs } from 'firebase/firestore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft, 
  Loader2, 
  Save, 
  Send, 
  ShieldCheck, 
  IndianRupee, 
  User, 
  Building,
  Calendar as CalendarIcon,
  CreditCard,
  Building2,
  Hash,
  Fingerprint
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from '@/hooks/use-toast'
import { format, parse } from 'date-fns'
import { 
  amountToWords, 
  VOUCHER_TYPE_CODES, 
  getCurrentFinancialYear 
} from '@/lib/vms-utils'
import { cn } from '@/lib/utils'

/**
 * Account Head Mapping: Defines relevant fiscal accounts per voucher type.
 */
const ACCOUNT_HEADS_MAP: Record<string, string[]> = {
  "Receipt Voucher": ["Grants", "Subsidies", "Interest Income", "General Receipts", "Other Income"],
  "Payment Voucher": ["Office Rent", "Electricity", "Salaries", "Legal Fees", "Travel", "Maintenance", "Utility Bills"],
  "Journal Voucher": ["Depreciation", "Accrued Expenses", "Outstanding Liabilities", "Pre-paid Assets", "Adjustment"],
  "Contra Voucher": ["Cash to Bank", "Bank to Cash", "Bank to Bank Transfer"],
  "Donation Voucher": ["General Donation", "Corpus Fund", "80G Donation", "CSR Contribution"],
  "Membership Fee Voucher": ["Annual Membership", "Life Membership", "Volunteer Registration", "Renewal Fee"],
  "Expense Voucher": ["Stationery", "Printing", "Food & Lodging", "Event Logistics", "Relief Aid"],
  "Advance Voucher": ["Staff Advance", "Vendor Advance", "Travel Advance"],
  "Refund Voucher": ["Membership Refund", "Excess Fee Refund", "Security Deposit Refund"]
};

/**
 * NewVoucherPage: Terminal for generating official financial instruments.
 * Features: Dynamic Account Heads, real-time amount-to-words, and ledger sync.
 */
export default function NewVoucherPage() {
  const { user, loading: authLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    type: 'Payment Voucher',
    date: format(new Date(), 'yyyy-MM-dd'),
    financialYear: getCurrentFinancialYear(),
    branch: 'National HQ',
    state: 'Delhi',
    district: 'Central Delhi',
    person: {
      name: '',
      memberId: '',
      mobile: '',
      email: '',
      address: ''
    },
    amount: '',
    accountHead: 'Salaries',
    paymentMethod: 'Bank Transfer',
    bankName: '',
    accountNo: '',
    utr: '',
    chequeNo: '',
    cardLast4: '',
    narration: ''
  })

  // Sync account head whenever category changes
  useEffect(() => {
    const availableHeads = ACCOUNT_HEADS_MAP[formData.type] || [];
    if (availableHeads.length > 0 && !availableHeads.includes(formData.accountHead)) {
      setFormData(prev => ({ ...prev, accountHead: availableHeads[0] }));
    }
  }, [formData.type]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/internal/login')
  }, [user, authLoading, router])

  const handleGenerateId = async (type: string) => {
    if (!db) return "TEMP-ID";
    const code = VOUCHER_TYPE_CODES[type] || "GEN";
    const year = new Date().getFullYear();
    try {
      const q = query(collection(db, 'finance_vms_vouchers'), orderBy('createdAt', 'desc'), limit(1));
      const snapshot = await getDocs(q);
      const lastNum = snapshot.empty ? 100 : snapshot.docs.length + 100;
      return `HRAT-${code}-${year}-${(lastNum + 1).toString().padStart(6, '0')}`;
    } catch (e) {
      return `HRAT-${code}-${year}-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`;
    }
  }

  const handleSubmit = async (e: React.FormEvent, status: string) => {
    e.preventDefault();
    if (!db || !user) return;
    setIsSaving(true);

    try {
      const voucherNo = await handleGenerateId(formData.type);
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        amountInWords: amountToWords(Number(formData.amount)),
        voucherNo,
        status,
        createdAt: serverTimestamp(),
        createdBy: user.email,
        auditTrail: [{
          action: `Voucher Created as ${status}`,
          user: user.email,
          timestamp: new Date().toISOString()
        }]
      };

      await addDoc(collection(db, 'finance_vms_vouchers'), payload);
      toast({ title: "Voucher Saved", description: `Instrument ${voucherNo} established successfully.` });
      router.push('/internal/finance/vms/list');
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: e.message });
    } finally {
      setIsSaving(false);
    }
  }

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      setFormData({ ...formData, date: format(date, 'yyyy-MM-dd') });
    }
  }

  const getParsedDate = (dateStr: string) => {
    try {
      return parse(dateStr, 'yyyy-MM-dd', new Date());
    } catch (e) {
      return new Date();
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    )
  }

  const currentAvailableHeads = ACCOUNT_HEADS_MAP[formData.type] || [];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-emerald-500/20">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="text-white hover:bg-white/10">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="space-y-1">
             <h1 className="text-2xl md:text-3xl font-headline font-bold">Generate <span className="text-emerald-400 italic">Instrument</span></h1>
             <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
               <ShieldCheck className="w-3.5 h-3.5" /> High-Fidelity Financial Protocol
             </p>
          </div>
        </div>
      </header>

      <section className="py-12 container mx-auto px-4 max-w-5xl">
        <form onSubmit={(e) => handleSubmit(e, 'Pending Verification')} className="space-y-8">
           {/* Section 1: Basic Logistics */}
           <Card className="rounded-[2.5rem] border-none shadow-sm p-8 space-y-6 bg-white dark:bg-slate-900">
              <h3 className="text-xs font-black uppercase text-accent tracking-[0.2em] flex items-center gap-2 border-b pb-4">
                <Building className="w-4 h-4" /> Institutional Logistics
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                 <div className="space-y-1.5">
                   <Label className="text-[10px] font-black uppercase text-red-600">Voucher Category *</Label>
                   <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                      <SelectTrigger className="h-11 rounded-xl font-black text-red-600 border-red-100"><SelectValue /></SelectTrigger>
                      <SelectContent position="popper" className="z-[1000001] bg-white">
                        {Object.keys(VOUCHER_TYPE_CODES).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                   </Select>
                 </div>
                 <div className="space-y-1.5">
                   <Label className="text-[10px] font-bold uppercase text-slate-400">Financial Year</Label>
                   <Input value={formData.financialYear} disabled className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold" />
                 </div>
                 <div className="space-y-1.5">
                   <Label className="text-[10px] font-bold uppercase text-slate-400">Branch Location</Label>
                   <Input value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="h-11 rounded-xl" />
                 </div>
              </div>
           </Card>

           {/* Section 2: Person Particulars */}
           <Card className="rounded-[2.5rem] border-none shadow-sm p-8 space-y-6 bg-white dark:bg-slate-900">
              <h3 className="text-xs font-black uppercase text-accent tracking-[0.2em] flex items-center gap-2 border-b pb-4">
                <User className="w-4 h-4" /> Recipient / Payee Particulars
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="space-y-1.5">
                   <Label className="text-[10px] font-bold uppercase text-slate-400">Full Name *</Label>
                   <Input value={formData.person.name} onChange={e => setFormData({...formData, person: {...formData.person, name: e.target.value}})} placeholder="Legal Name" required />
                 </div>
                 <div className="space-y-1.5">
                   <Label className="text-[10px] font-bold uppercase text-slate-400">Member ID (If Applicable)</Label>
                   <Input value={formData.person.memberId} onChange={e => setFormData({...formData, person: {...formData.person, memberId: e.target.value}})} placeholder="HRAT-MEMBER-XXX" />
                 </div>
                 <div className="space-y-1.5">
                   <Label className="text-[10px] font-bold uppercase text-slate-400">Contact Number</Label>
                   <Input value={formData.person.mobile} onChange={e => setFormData({...formData, person: {...formData.person, mobile: e.target.value}})} placeholder="+91" />
                 </div>
                 <div className="space-y-1.5">
                   <Label className="text-[10px] font-bold uppercase text-slate-400">Email Address</Label>
                   <Input value={formData.person.email} onChange={e => setFormData({...formData, person: {...formData.person, email: e.target.value}})} placeholder="office@hrat-india.org" />
                 </div>
              </div>
           </Card>

           {/* Section 3: Financial Mechanics */}
           <Card className="rounded-[2.5rem] border-none shadow-sm p-8 space-y-6 bg-white dark:bg-slate-900">
              <h3 className="text-xs font-black uppercase text-accent tracking-[0.2em] flex items-center gap-2 border-b pb-4">
                <IndianRupee className="w-4 h-4" /> Fiscal Mechanics
              </h3>
              <div className="grid md:grid-cols-1 lg:grid-cols-4 gap-6">
                 <div className="space-y-1.5">
                   <Label className="text-[10px] font-bold uppercase text-slate-400">Voucher Date *</Label>
                   <div className="flex gap-2">
                     <Input 
                       value={formData.date} 
                       onChange={e => setFormData({...formData, date: e.target.value})} 
                       placeholder="YYYY-MM-DD"
                       className="h-11 rounded-xl flex-1"
                     />
                     <Popover>
                       <PopoverTrigger asChild>
                         <Button variant="outline" size="icon" className="h-11 w-11 shrink-0 rounded-xl border-slate-200">
                           <CalendarIcon className="h-4 w-4 text-slate-500" />
                         </Button>
                       </PopoverTrigger>
                       <PopoverContent className="w-auto p-0 z-[1000001]" align="end">
                         <Calendar
                           mode="single"
                           selected={formData.date ? getParsedDate(formData.date) : undefined}
                           onSelect={handleCalendarSelect}
                           initialFocus
                         />
                       </PopoverContent>
                     </Popover>
                   </div>
                 </div>
                 <div className="space-y-1.5">
                   <Label className="text-[10px] font-bold uppercase text-slate-400">Amount (INR) *</Label>
                   <Input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="h-11 rounded-xl text-lg font-black" required />
                 </div>
                 <div className="space-y-1.5">
                   <Label className="text-[10px] font-bold uppercase text-slate-400">Account Head</Label>
                   <Select value={formData.accountHead} onValueChange={v => setFormData({...formData, accountHead: v})}>
                     <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                     <SelectContent position="popper" className="z-[1000001] bg-white max-h-60 overflow-y-auto">
                        {currentAvailableHeads.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="space-y-1.5">
                   <Label className="text-[10px] font-bold uppercase text-slate-400">Payment Channel</Label>
                   <Select value={formData.paymentMethod} onValueChange={(val: any) => setFormData({...formData, paymentMethod: val})}>
                     <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                     <SelectContent position="popper" className="z-[1000001] bg-white">
                        {['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Card'].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                     </SelectContent>
                   </Select>
                 </div>
              </div>

              {/* Conditional Payment Detail Fields */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-500">
                {formData.paymentMethod === 'Bank Transfer' && (
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-emerald-600 flex items-center gap-2">
                        <Building2 className="w-3 h-3" /> Remitting Bank Name
                      </Label>
                      <Input value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} placeholder="e.g. State Bank of India" className="h-10 rounded-xl" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-emerald-600 flex items-center gap-2">
                        <Hash className="w-3 h-3" /> Account Number
                      </Label>
                      <Input value={formData.accountNo} onChange={e => setFormData({...formData, accountNo: e.target.value})} placeholder="Account digits" className="h-10 rounded-xl font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-emerald-600 flex items-center gap-2">
                        <Fingerprint className="w-3 h-3" /> UTR / Transaction ID
                      </Label>
                      <Input value={formData.utr} onChange={e => setFormData({...formData, utr: e.target.value})} placeholder="Ref Number" className="h-10 rounded-xl font-mono" />
                    </div>
                  </div>
                )}

                {formData.paymentMethod === 'UPI' && (
                  <div className="grid md:grid-cols-1 max-w-md">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-emerald-600 flex items-center gap-2">
                        <Fingerprint className="w-3 h-3" /> UPI Transaction Reference (UTR)
                      </Label>
                      <Input value={formData.utr} onChange={e => setFormData({...formData, utr: e.target.value})} placeholder="e.g. 325412987456" className="h-10 rounded-xl font-mono" />
                    </div>
                  </div>
                )}

                {formData.paymentMethod === 'Cheque' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-emerald-600 flex items-center gap-2">
                        <Building2 className="w-3 h-3" /> Drawee Bank Name
                      </Label>
                      <Input value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} placeholder="e.g. HDFC Bank" className="h-10 rounded-xl" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-emerald-600 flex items-center gap-2">
                        <Hash className="w-3 h-3" /> Cheque Number
                      </Label>
                      <Input value={formData.chequeNo} onChange={e => setFormData({...formData, chequeNo: e.target.value})} placeholder="6-digit number" maxLength={6} className="h-10 rounded-xl font-mono" />
                    </div>
                  </div>
                )}

                {formData.paymentMethod === 'Card' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-emerald-600 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" /> Card Last 4 Digits
                      </Label>
                      <Input value={formData.cardLast4} onChange={e => setFormData({...formData, cardLast4: e.target.value})} placeholder="XXXX" maxLength={4} className="h-10 rounded-xl font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-emerald-600 flex items-center gap-2">
                        <Fingerprint className="w-3 h-3" /> Terminal Approval Code / Ref
                      </Label>
                      <Input value={formData.utr} onChange={e => setFormData({...formData, utr: e.target.value})} placeholder="Auth Ref" className="h-10 rounded-xl font-mono" />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-1.5">
                 <Label className="text-[10px] font-bold uppercase text-slate-400">Narration (Particulars)</Label>
                 <Textarea value={formData.narration} onChange={e => setFormData({...formData, narration: e.target.value})} placeholder="Official justification..." className="min-h-[100px] rounded-2xl" />
              </div>
           </Card>

           <div className="flex gap-4">
              <Button type="button" onClick={(e) => handleSubmit(e, 'Draft')} disabled={isSaving} variant="outline" className="flex-1 h-14 rounded-2xl font-bold uppercase text-[10px] tracking-widest border-2">
                 <Save className="w-4 h-4 mr-2" /> Save Draft
              </Button>
              <Button type="submit" disabled={isSaving} className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20">
                 {isSaving ? <Loader2 className="animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Submit for Verification</>}
              </Button>
           </div>
        </form>
      </section>
    </main>
  )
}
