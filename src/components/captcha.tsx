'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

type CaptchaChar = {
  char: string;
  rotation: number;
  offsetY: number;
  scale: number;
};

/**
 * Captcha Component: Generates a distorted alphanumeric code for human verification.
 * Features individualized character transformations for organic "curved" distortion.
 */
export function Captcha({ onVerify }: { onVerify: (isValid: boolean) => void }) {
  const [code, setCode] = useState<CaptchaChar[]>([]);
  const [rawCode, setRawCode] = useState('');
  const [input, setInput] = useState('');
  const [mounted, setMounted] = useState(false);

  const generateCode = useCallback(() => {
    // Unambiguous character set
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result: CaptchaChar[] = [];
    let raw = '';
    
    for (let i = 0; i < 6; i++) {
      const char = chars.charAt(Math.floor(Math.random() * chars.length));
      raw += char;
      result.push({
        char,
        // Apply random rotation between -15 and 15 degrees
        rotation: Math.floor(Math.random() * 30) - 15,
        // Apply vertical offset between -5 and 5 pixels for curvature
        offsetY: Math.floor(Math.random() * 10) - 5,
        // Slight scale variation
        scale: 0.9 + Math.random() * 0.2
      });
    }
    
    setCode(result);
    setRawCode(raw);
    setInput('');
    onVerify(false);
  }, [onVerify]);

  useEffect(() => {
    setMounted(true);
    generateCode();
  }, [generateCode]);

  // Handle verification on every input change
  useEffect(() => {
    onVerify(input === rawCode && rawCode !== '');
  }, [input, rawCode, onVerify]);

  if (!mounted) return null;

  return (
    <div className="space-y-3 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-3 flex items-center justify-center select-none border-2 border-dashed border-slate-200 dark:border-slate-700 relative overflow-hidden h-16">
          {/* Visual Noise Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          
          <div className="flex items-center justify-center gap-1.5 md:gap-3 relative z-10">
            {code.map((c, i) => (
              <span 
                key={i} 
                className="text-2xl md:text-3xl font-black italic text-primary dark:text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] inline-block"
                style={{
                  transform: `rotate(${c.rotation}deg) translateY(${c.offsetY}px) scale(${c.scale})`,
                  letterSpacing: '0.1em'
                }}
              >
                {c.char}
              </span>
            ))}
          </div>
        </div>
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          onClick={generateCode}
          className="h-16 w-12 rounded-xl text-slate-400 hover:text-accent hover:bg-accent/10 shrink-0"
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
          {input === rawCode && rawCode !== '' ? (
            <ShieldCheck className="w-5 h-5 text-emerald-500 animate-in zoom-in-50" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-slate-200 dark:text-slate-800" />
          )}
        </div>
      </div>
    </div>
  );
}
