
"use client"

import React, { useRef, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase'
import { doc, updateDoc, serverTimestamp, increment, collection, query, where, getDocs, addDoc, setDoc } from 'firebase/firestore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2, 
  Download, 
  Building, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  Hash,
  X
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

/**
 * VoucherDetail: High-fidelity print-ready layout for institutional financial instruments.
 * Enhanced with a dedicated Close mechanism and real-time ledger synchronization.
 */
export default function VoucherDetailPage() {
  const { id } = useParams()
  const { user, loading: authLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const printRef = useRef<HTMLDivElement>(null)

  const docRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'finance_vms_vouchers', id as string);
  }, [db, id]);

  const { data: v, loading: dataLoading } = useDoc(docRef);

  const handlePrint = () => window.print();

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/internal/finance/vms/list');
    }
  };

  const handleAction = async (newStatus: string) => {
    if (!db || !docRef || !user || !v) return;
    try {
      const trailUpdate = {
        action: `Voucher ${newStatus}`,
        user: user.email,
        timestamp: new Date().toISOString()
      };
      
      const updateData: any = {
        status: newStatus,
        auditTrail: [...(v?.auditTrail || []), trailUpdate]
      };

      if (newStatus === 'Approved') {
        // 1. Atomic summary sync
        const summaryRef = doc(db, 'finance_summary', 'state');
        const isIncome = v.type.includes('Receipt') || v.type.includes('Donation') || v.type.includes('Membership');
        
        // Use setDoc with merge: true to ensure it works even if the state doc is missing
        await setDoc(summaryRef, {
          [isIncome ? 'totalIncome' : 'totalExpense']: increment(v.amount),
          [v.paymentMethod === 'Bank' ? 'bankBalance' : 'cashInHand']: increment(isIncome ? v.amount : -v.amount),
          updatedAt: serverTimestamp()
        }, { merge: true });

        // 2. Propagate Approval to General Ledger (finance_transactions)
        const txQuery = query(collection(db, 'finance_transactions'), where('voucherNo', '==', v.voucherNo));
        const txSnap = await getDocs(txQuery);
        
        if (!txSnap.empty) {
          await updateDoc(txSnap.docs[0].ref, { 
            status: 'Approved',
            updatedAt: serverTimestamp() 
          });
        } else {
          // Create missing transaction if audit gap detected
          await addDoc(collection(db, 'finance_transactions'), {
            voucherNo: v.voucherNo,
            date: v.date,
            type: isIncome ? 'Income' : 'Expense',
            account: v.accountHead,
            amount: v.amount,
            paymentMethod: v.paymentMethod,
            particulars: v.narration || `Voucher: ${v.type} for ${v.person?.name}`,
            status: 'Approved',
            createdAt: serverTimestamp(),
            createdBy: user.email
          });
        }
      }

      await updateDoc(docRef, updateData);
      toast({ title: `Status: ${newStatus}`, description: "Voucher and Ledger successfully synchronized." });
    } catch (e: any) {
      console.error("[VMS-ACTION-ERROR]", e);
      toast({ variant: "destructive", title: "Action Failed", description: "Could not synchronize with national ledger." });
    }
  }

  if (authLoading || dataLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="animate-spin text-emerald-500" /></div>
  if (!v) return <div className="p-20 text-center font-bold text-slate-400 uppercase tracking-widest">Record not found in National Registry.</div>

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 md:p-8 print:p-0 print:bg-white flex flex-col items-center pb-24">
      
      {/* Top Header Actions */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-8 print:hidden">
        <Button variant="ghost" onClick={handleClose} className="gap-2 font-bold uppercase text-[10px] tracking-widest text-slate-500 hover:text-primary transition-all">
          <ArrowLeft className="w-4 h-4" /> Close & Return
        </Button>
        <div className="flex gap-3">
           {v.status !== 'Approved' && (
             <Button onClick={() => handleAction('Approved')} className="bg-emerald-600 text-white hover:bg-emerald-500 font-bold h-11 rounded-xl px-8 shadow-xl">
               <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Instrument
             </Button>
           )}
           <Button onClick={handlePrint} variant="outline" className="h-11 px-8 rounded-xl font-bold bg-white border-2 border-slate-200">
             <Printer className="w-4 h-4 mr-2" /> Print Instrument
           </Button>
        </div>
      </div>

      {/* PRINT LAYOUT */}
      <div ref={printRef} className="w-full max-w-4xl bg-white shadow-2xl p-10 md:p-20 print:shadow-none print:p-8 relative overflow-hidden border border-slate-200 dark:text-slate-900">
         <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 print:hidden"></div>
         
         <div className="border-b-4 border-slate-900 pb-10 mb-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
               <div className="relative w-24 h-24">
                  <Image src="/HRAT%20Logo.jpeg" alt="Institutional Logo" fill className="object-contain" />
               </div>
               <div>
                  <h1 className="text-3xl font-black text-primary tracking-tighter uppercase leading-none">Human Rights Affairs Trust</h1>
                  <p className="text-xs font-bold text-accent uppercase tracking-[0.3em] mt-2">National Finance Cell • Registered NGO</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Reg No: WB/2025/0762605</p>
               </div>
            </div>
            <div className="text-right">
               <Badge className="bg-primary text-white font-black text-xs uppercase px-4 py-1 mb-2">{v.type}</Badge>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital Registry ID</p>
               <p className="font-mono text-sm font-bold text-primary">{v.voucherNo}</p>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-12 text-sm mb-12">
            <div className="space-y-4">
               <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Date of Issuance</p><p className="font-bold text-primary">{v.date}</p></div>
               <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Financial Year</p><p className="font-bold text-primary">{v.financialYear}</p></div>
               <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Branch / Chapter</p><p className="font-bold text-primary uppercase">{v.branch} ({v.district})</p></div>
            </div>
            <div className="space-y-4 text-right">
               <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Payee / Recipient</p><p className="text-xl font-black text-primary uppercase">{v.person?.name}</p></div>
               <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Reference ID</p><p className="font-mono text-primary font-bold">{v.person?.memberId || 'GUEST-ENTRY'}</p></div>
            </div>
         </div>

         <div className="bg-slate-50 border-y-2 border-slate-900 p-8 my-10 space-y-6">
            <div className="flex justify-between items-center">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description of Transaction</h4>
               <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Validated Entry</p>
            </div>
            <p className="text-lg font-bold text-primary italic leading-relaxed">"{v.narration}"</p>
            <div className="flex justify-between pt-6 border-t border-slate-200">
               <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Account Head</p><p className="font-black text-primary uppercase">{v.accountHead}</p></div>
               <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Payment Channel</p><p className="font-black text-primary uppercase">{v.paymentMethod}</p></div>
               <div className="text-right"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Total Value</p><p className="text-3xl font-black text-primary">₹{v.amount.toLocaleString()}</p></div>
            </div>
            <div className="pt-4"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">In Words</p><p className="text-sm font-black text-primary uppercase tracking-tighter">{v.amountInWords}</p></div>
         </div>

         <div className="flex justify-between items-end mt-20 pt-10">
            <div className="text-center space-y-2">
               <div className="w-32 h-10 border-b-2 border-slate-300 mx-auto"></div>
               <p className="text-[9px] font-black uppercase text-slate-400">Receiver Signature</p>
            </div>
            <div className="text-center space-y-2">
               <div className="relative w-24 h-24 mx-auto opacity-10">
                  <Image src="/HRAT%20Logo.jpeg" alt="Trust Seal" fill className="object-contain grayscale" />
               </div>
               <p className="text-[9px] font-black uppercase text-slate-400">Institutional Seal</p>
            </div>
            <div className="text-center space-y-2">
               <div className="w-32 h-10 border-b-2 border-slate-300 mx-auto"></div>
               <p className="text-[9px] font-black uppercase text-slate-400">Authorized Official</p>
            </div>
         </div>

         <div className="mt-16 flex items-center justify-between pt-10 border-t border-slate-100">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 bg-white border p-1 rounded-lg">
                  <Image src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=HRAT-VERIFY-VOUCHER-${v.voucherNo}`} alt="QR Verification" width={60} height={60} />
               </div>
               <div className="space-y-1">
                  <p className="text-[8px] font-black uppercase text-slate-400">Audit Verification Node</p>
                  <p className="text-[7px] text-slate-300 max-w-[200px] leading-tight">This instrument is digitally verified. Authenticity can be confirmed via the VMS scanner.</p>
               </div>
            </div>
            <p className="text-[7px] font-bold text-slate-300 uppercase tracking-widest">HRAT VMS Terminal v1.0 • South Asia Region</p>
         </div>
      </div>

      {/* Final Bottom Close Mechanism */}
      <div className="mt-12 w-full max-w-4xl flex flex-col items-center gap-4 print:hidden">
         <Button 
           onClick={handleClose}
           className="w-full h-16 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-lg hover:bg-slate-800 transition-all shadow-2xl flex items-center justify-center gap-3 group"
         >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" /> 
            Close Instrument Review
         </Button>
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Official Audit Node • HRAT India</p>
      </div>
    </main>
  )
}
