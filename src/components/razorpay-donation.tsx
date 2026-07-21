'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, ArrowRight } from 'lucide-react';

/**
 * RazorpayDonation: A dedicated component for external secure payments.
 * Matches institutional design standards for the donation hub.
 */
export function RazorpayDonation() {
  const { toast } = useToast();

  // PROVISION FOR FUTURE ACTIVATION:
  // Paste your Razorpay Payment Link in the quotes below.
  const NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK = "";

  const handleDonate = () => {
    if (NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK && NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK.trim() !== "") {
      window.open(NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        title: "Status Update",
        description: "Payment gateway will be activated soon.",
      });
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-sm pt-8 border-t border-white/5">
      <div className="space-y-1 text-center">
        <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-accent">
          Secure Online Payment
        </h3>
        <p className="text-[11px] md:text-sm text-slate-400 font-medium">
          You can securely support Human Rights Affairs Trust using Razorpay.
        </p>
      </div>
      
      <Button 
        onClick={handleDonate}
        className="w-full bg-white text-primary font-bold h-12 md:h-14 rounded-xl hover:bg-accent hover:text-white transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-3 group border-none"
      >
        <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-accent group-hover:text-white transition-colors" />
        <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-black">Donate Now</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  );
}
