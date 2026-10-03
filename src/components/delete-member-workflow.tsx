'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Loader2, 
  X, 
  ArrowRight, 
  Lock, 
  Trash2, 
  AlertTriangle,
  RefreshCw,
  MessageSquare,
  CheckCircle2,
  Phone
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp, collection, addDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { moveToTrash, permanentPurge } from '@/lib/trash-utils';
import { generateSecureOtp, verifySecureOtp } from '@/app/actions/otp-actions';

type DeleteStep = 'reason' | 'warning' | 'otp' | 'final' | 'success';

interface DeleteMemberWorkflowProps {
  member: any;
  isPermanent?: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export function DeleteMemberWorkflow({ member, isPermanent = false, onSuccess, onCancel }: DeleteMemberWorkflowProps) {
  const [step, setStep] = useState<DeleteStep>('reason');
  const [reason, setReason] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpChallengeId, setOtpChallengeId] = useState<string | null>(null);
  
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const handleNextToWarning = () => {
    if (reason.trim().length < 10) {
      toast({ variant: "destructive", title: "Justification Required", description: "Please enter a meaningful reason (min 10 chars)." });
      return;
    }
    setStep('warning');
  };

  const handleSendOtp = async () => {
    setIsLoading(true);
    try {
      // Secure Handshake: Generate OTP on server
      const result = await generateSecureOtp(user?.email || 'root');
      if (result.success && result.challengeId) {
        setOtpChallengeId(result.challengeId);
        setStep('otp');
        toast({ title: "Verification Key Dispatched", description: "Security code sent to your registered terminal." });
      } else {
        throw new Error("Handshake failed");
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Security Protocol Error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpChallengeId || otp.length !== 6) return;
    setIsLoading(true);
    try {
      const isValid = await verifySecureOtp(otpChallengeId, otp);
      if (isValid) {
        if (isPermanent) {
          setStep('final');
        } else {
          executeSoftDelete();
        }
      } else {
        toast({ variant: "destructive", title: "Verification Failed", description: "Invalid or expired security code." });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Auth Error" });
    } finally {
      setIsLoading(false);
    }
  };

  const executeSoftDelete = async () => {
    if (!db || !user) return;
    setIsLoading(true);
    try {
      await moveToTrash(db, user, member, 'memberProfiles', reason);
      setStep('success');
      toast({ title: "Member Trashed", description: "Record moved to 90-day recovery vault." });
    } catch (e) {
      toast({ variant: "destructive", title: "Process Error" });
      onCancel();
    } finally {
      setIsLoading(false);
    }
  };

  const executePermanentDelete = async () => {
    if (!db || !user) return;
    setIsLoading(true);
    try {
      await permanentPurge(db, user, member);
      toast({ title: "Registry Purged", description: "Record permanently removed from institutional archives." });
      onSuccess();
    } catch (e) {
      toast({ variant: "destructive", title: "Purge Failed" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900 [&>button]:hidden">
        
        {/* HEADER */}
        <div className={cn(
          "p-8 text-white relative border-b-4",
          isPermanent ? "bg-red-600 border-red-900/20" : "bg-slate-900 border-accent/20"
        )}>
          <div className="absolute right-6 top-6">
            <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
          <Badge className="bg-white/20 text-white font-black uppercase text-[8px] mb-2 tracking-widest">
            {isPermanent ? "PERMANENT PURGE" : "RECYCLE PROTOCOL"}
          </Badge>
          <DialogTitle className="text-2xl font-headline font-bold">
            {isPermanent ? "Force Deletion" : "Delete Member"}
          </DialogTitle>
        </div>

        {/* STEP 1: REASON */}
        {step === 'reason' && (
          <div className="p-8 space-y-6 animate-in fade-in duration-300">
             <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center">
                   <AlertTriangle className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                   <h4 className="text-lg font-bold">Justification Required</h4>
                   <p className="text-xs text-slate-500">Provide official reasoning for this personnel removal.</p>
                </div>
             </div>
             <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Deletion Reason / Note *</Label>
                <Textarea 
                  value={reason} 
                  onChange={e => setReason(e.target.value)} 
                  placeholder="e.g. Voluntary resignation / Policy violation / Term expiry..." 
                  className="min-h-[120px] rounded-2xl border-2 border-black focus:ring-accent"
                />
             </div>
             <div className="flex gap-3">
                <Button variant="ghost" onClick={onCancel} className="flex-1 rounded-xl h-12 font-bold uppercase text-[10px]">Cancel</Button>
                <Button onClick={handleNextToWarning} className="flex-1 rounded-xl h-12 bg-primary text-white font-bold uppercase text-[10px]">Continue</Button>
             </div>
          </div>
        )}

        {/* STEP 2: WARNING */}
        {step === 'warning' && (
          <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
             <div className="space-y-4">
                <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-black shadow-inner">
                   <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Subject for removal</p>
                   <h4 className="text-xl font-headline font-bold text-primary dark:text-white leading-tight">{member.name}</h4>
                   <p className="text-xs font-bold text-accent uppercase mt-1">{member.designation}</p>
                </div>
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                   <p className="text-[9px] font-black text-red-600 uppercase mb-1">Impact Warning</p>
                   <p className="text-xs text-red-900 leading-relaxed italic">
                     "{isPermanent ? "This action CANNOT be undone. Record will be erased from national servers." : "Member will be moved to Recycle Bin for 90 days before automated permanent deletion."}"
                   </p>
                </div>
             </div>
             <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('reason')} className="flex-1 h-12 rounded-xl font-bold uppercase text-[10px]">Edit Reason</Button>
                <Button onClick={handleSendOtp} disabled={isLoading} className="flex-1 h-12 bg-red-600 text-white font-bold uppercase text-[10px]">
                   {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Authorize Purge"}
                </Button>
             </div>
          </div>
        )}

        {/* STEP 3: OTP */}
        {step === 'otp' && (
          <div className="p-8 space-y-8 animate-in zoom-in-95 duration-500">
             <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl mx-auto flex items-center justify-center">
                   <Lock className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                   <h4 className="text-xl font-headline font-bold">Security Handshake</h4>
                   <p className="text-xs text-slate-500">A 6-digit code has been dispatched to your terminal.</p>
                </div>
             </div>
             <div className="space-y-4">
                <div className="relative">
                   <Input 
                    value={otp} 
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    placeholder="••••••"
                    className="h-16 text-center text-3xl font-black tracking-[0.5em] rounded-2xl border-2 border-black focus:ring-accent"
                   />
                </div>
                <Button onClick={handleVerifyOtp} disabled={isLoading || otp.length < 6} className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg">
                   {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Confirm Identity"}
                </Button>
                <div className="text-center">
                   <button onClick={handleSendOtp} className="text-[10px] font-black uppercase text-accent hover:underline">Resend Security Code</button>
                </div>
             </div>
          </div>
        )}

        {/* STEP 4: FINAL CONFIRMATION (Permanent Only) */}
        {step === 'final' && (
          <div className="p-10 space-y-8 animate-in slide-in-from-bottom-4 duration-500 text-center">
             <div className="w-20 h-20 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl animate-pulse">
                <ShieldAlert className="w-12 h-12" />
             </div>
             <div className="space-y-2">
                <h3 className="text-2xl font-headline font-bold text-red-600 uppercase tracking-tight">Final Authorization</h3>
                <p className="text-sm font-bold text-slate-500 leading-relaxed">
                  Purging record for <strong className="text-primary">{member.name}</strong>. This record will be erased permanently from all institutional registries.
                </p>
             </div>
             <div className="flex gap-4">
                <Button variant="ghost" onClick={onCancel} className="flex-1 h-12 rounded-xl text-slate-400 font-bold uppercase text-[10px]">Abort</Button>
                <Button onClick={executePermanentDelete} disabled={isLoading} className="flex-1 h-12 rounded-xl bg-red-600 text-white font-bold uppercase text-[10px] shadow-xl">
                   {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Verify & Purge"}
                </Button>
             </div>
          </div>
        )}

        {/* STEP 5: SUCCESS */}
        {step === 'success' && (
          <div className="p-10 space-y-8 animate-in zoom-in-95 duration-700 text-center">
             <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-12 h-12" />
             </div>
             <div className="space-y-2">
                <h3 className="text-2xl font-headline font-bold text-emerald-600">Registry Updated</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  Record for <strong>{member.name}</strong> has been displaced to the 90-day recovery vault.
                </p>
             </div>
             <Button onClick={onSuccess} className="w-full h-14 bg-primary text-white font-bold rounded-2xl">Return to Directory</Button>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}