'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GLOBAL-ERROR-BOUNDARY]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-10 text-center space-y-6 border border-slate-100 dark:border-slate-800">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto text-red-500">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-headline font-bold text-primary dark:text-white">Application Exception</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            A critical client-side error occurred. The system has safely isolated the failure to protect your session.
          </p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-[10px] font-mono text-red-600 dark:text-red-400 break-all overflow-hidden line-clamp-3 uppercase">
            {error.message || "Unknown Runtime Error"}
          </p>
        </div>
        <div className="grid gap-3 pt-4">
          <Button 
            onClick={() => reset()} 
            className="w-full h-12 rounded-xl bg-primary text-white font-bold hover:bg-secondary transition-all gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Attempt Recovery
          </Button>
          <Button asChild variant="outline" className="w-full h-12 rounded-xl border-slate-200 text-slate-500 font-bold gap-2">
            <Link href="/"><Home className="w-4 h-4" /> Return to Home</Link>
          </Button>
        </div>
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Institutional Error Node • HRAT</p>
      </div>
    </div>
  );
}
