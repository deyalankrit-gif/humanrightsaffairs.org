'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

/**
 * Captcha Component: Generates an alphanumeric code for human verification.
 * Optimized for institutional security across HRAT portals.
 */
export function Captcha({ onVerify }: { onVerify: (isValid: boolean) => void }) {
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [mounted, setMounted] = useState(false);

  const generateCode = useCallback(() => {
    // Unambiguous character set
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
    setInput('');
    onVerify(false);
  }, [onVerify]);

  useEffect(() => {
    setMounted(true);
    generateCode();
  }, [generateCode]);

  // Handle verification on every input change
  useEffect(() => {
    onVerify(input === code && code !== '');
  }, [input, code, onVerify]);

  if (!mounted) return null;

  return (
    <div className="space-y-3 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-3 flex items-center justify-center select-none border-2 border-dashed border-slate-200 dark:border-slate-700 relative overflow-hidden h-12">
          {/* Visual Noise Pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <span className="text-2xl font-black italic tracking-[0.4em] text-primary dark:text-white drop-shadow-md transform rotate-2">
            {code}
          </span>
        </div>
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          onClick={generateCode}
          className="h-12 w-12 rounded-xl text-slate-400 hover:text-accent hover:bg-accent/10 shrink-0"
          title="Refresh Code"
        >
          <RefreshCw className="w-5 h-5" />
        </Button>
      </div>
      <div className="relative">
        <Input 
          placeholder="Enter Captcha Code" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={6}
          className="text-center font-bold tracking-[0.2em] h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 transition-all duration-300">
          {input === code && code !== '' ? (
            <ShieldCheck className="w-5 h-5 text-emerald-500 animate-in zoom-in-50" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-slate-200 dark:text-slate-800" />
          )}
        </div>
      </div>
    </div>
  );
}
