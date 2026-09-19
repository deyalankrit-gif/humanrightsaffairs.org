'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { isWithinInterval, parseISO, startOfDay, endOfDay, addDays, isToday } from 'date-fns';
import { Sparkles, ShieldCheck, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { BUILT_IN_HOLIDAYS, BUILT_IN_OBSERVANCES } from '@/lib/activity-hub-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

/**
 * ClampOrScroll
 * - If the text fits within `maxLines` when wrapped normally, it stays
 *   fixed in place (no animation at all) — exactly `maxLines` lines max.
 * - If it's longer than `maxLines`, it switches to a single-line
 *   horizontal marquee: the full text scrolls left continuously so
 *   nothing is ever cut off.
 * - Re-measures whenever `text` changes (e.g. language toggle, new occasion).
 */
function ClampOrScroll({
  text,
  maxLines = 2,
  className,
  scrollSpeedPxPerSec = 60,
}: {
  text: string;
  maxLines?: number;
  className?: string;
  scrollSpeedPxPerSec?: number;
}) {
  const wrapMeasureRef = useRef<HTMLDivElement>(null);
  const lineMeasureRef = useRef<HTMLDivElement>(null);
  const [needsScroll, setNeedsScroll] = useState(false);
  const [durationSec, setDurationSec] = useState(10);

  useEffect(() => {
    const wrapEl = wrapMeasureRef.current;
    const lineEl = lineMeasureRef.current;
    if (!wrapEl || !lineEl) return;

    setNeedsScroll(false);

    const raf = requestAnimationFrame(() => {
      const style = getComputedStyle(wrapEl);
      const lineHeight = parseFloat(style.lineHeight || '0') || wrapEl.clientHeight;
      const maxHeight = lineHeight * maxLines;
      const overflowsLines = wrapEl.scrollHeight - maxHeight > 4;

      if (overflowsLines) {
        setNeedsScroll(true);
        const textWidth = lineEl.scrollWidth;
        setDurationSec(Math.max(6, textWidth / scrollSpeedPxPerSec));
      } else {
        setNeedsScroll(false);
      }
    });

    return () => cancelAnimationFrame(raf);
  }, [text, maxLines, scrollSpeedPxPerSec]);

  const lineHeightEm = 1.4;

  return (
    <div
      className="relative overflow-hidden w-full"
      style={{ maxHeight: needsScroll ? `${lineHeightEm}em` : `${lineHeightEm * maxLines}em` }}
    >
      {/* Hidden measurer #1: wrapped, to detect whether it overflows maxLines */}
      <div
        ref={wrapMeasureRef}
        aria-hidden="true"
        className={cn(className, 'invisible absolute top-0 left-0 w-full whitespace-normal break-words')}
        style={{ lineHeight: `${lineHeightEm}em` }}
      >
        {text}
      </div>

      {/* Hidden measurer #2: single line, to get full text width for marquee duration */}
      <div
        ref={lineMeasureRef}
        aria-hidden="true"
        className={cn(className, 'invisible absolute top-0 left-0 whitespace-nowrap')}
        style={{ lineHeight: `${lineHeightEm}em` }}
      >
        {text}
      </div>

      {needsScroll ? (
        <div
          className="flex whitespace-nowrap"
          style={{
            lineHeight: `${lineHeightEm}em`,
            animation: `occasion-scroll-x ${durationSec}s linear infinite`,
          }}
        >
          <span className={className}>{text}</span>
          {/* gap + repeat so the horizontal loop is seamless */}
          <span className={className} style={{ paddingLeft: '4em' }}>{text}</span>
        </div>
      ) : (
        <div
          className={cn(className, 'whitespace-normal break-words')}
          style={{ lineHeight: `${lineHeightEm}em` }}
        >
          {text}
        </div>
      )}

      <style jsx>{`
        @keyframes occasion-scroll-x {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * OccasionBanner: High-fidelity festive display area.
 * Features: Fully transparent background, #CFFF04 primary typography.
 * Updated: Autonomous Discovery Mode with sequential conflict resolution and specific festival imagery mapping.
 * Enhancement: Dynamic Title Prefixing (Happy/শুভ) based on language toggle.
 * Fix: Title and message wrap up to 2 lines; if longer, they auto-scroll instead of truncating.
 */
export function OccasionBanner() {
  const db = useFirestore();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isBangla, setIsBangla] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const DEFAULT_BANNER = {
    title: 'Welcome to HRAT',
    titleBn: 'HRAT-এ স্বাগতম',
    message: 'Human Rights Affairs Trust (Justice Shield) — Standing for your constitutional rights.',
    messageBn: 'হিউম্যান রাইটস অ্যাফেয়ার্স ট্রাস্ট (জাস্টিস শিল্ড) — আপনার সাংবিধানিক অধিকার সুরক্ষায় সর্বদা প্রস্তুত।',
    imageUrl: '/HRAT Logo.jpeg',
    imageHint: 'human rights',
    isDefault: true
  };

  // Helper to map festival titles to specific placeholder images and hints
  const getFestivalImageConfig = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('ganesh')) return PlaceHolderImages.find(i => i.id === 'ganesh-puja');
    if (t.includes('durga')) return PlaceHolderImages.find(i => i.id === 'durga-puja');
    if (t.includes('kali') || t.includes('diwali')) return PlaceHolderImages.find(i => i.id === 'kali-puja');
    return null;
  };

  // Protocol Settings Stream
  const protocolRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'settings', 'occasions_protocol');
  }, [db]);
  const { data: protocol } = useDoc(protocolRef);

  const occasionsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'occasions');
  }, [db]);

  const { data: occasions, loading } = useCollection(occasionsQuery);

  const activeOccasion = useMemo(() => {
    if (!mounted) return DEFAULT_BANNER;

    // --- AUTONOMOUS MODE LOGIC ---
    if (protocol?.mode === 'auto') {
      const now = startOfDay(new Date());
      const currentYear = now.getFullYear();

      const allDays = [
        ...BUILT_IN_HOLIDAYS.map(h => ({ ...h, isHoliday: true, date: startOfDay(new Date(currentYear, h.month - 1, h.day)) })),
        ...BUILT_IN_OBSERVANCES.map(o => ({ ...o, isHoliday: false, date: startOfDay(new Date(currentYear, o.month - 1, o.day)) }))
      ].sort((a, b) => a.date.getTime() - b.date.getTime());

      // Priority Helper
      const getPriority = (d: any) => {
        let p = 0;
        if (d.category === 'National') p += 10;
        if (d.isHoliday) p += 5;
        return p;
      };

      // 1. CHECK FOR TODAY
      const todayEvents = allDays.filter(d => d.date.getTime() === now.getTime())
        .sort((a, b) => getPriority(b) - getPriority(a));

      if (todayEvents.length > 0) {
        const d = todayEvents[0];
        const visual = getFestivalImageConfig(d.title);
        return {
          title: `Happy ${d.title}`,
          titleBn: `শুভ ${d.title}`,
          message: d.isHoliday
            ? `Human Rights Affairs Trust joins the nation in observing ${d.title}. Upholding unity and constitutional values.`
            : `Observing ${d.title}. Our mission for global human rights remains constant.`,
          messageBn: d.isHoliday
            ? `হিউম্যান রাইটস অ্যাফেয়ার্স ট্রাস্ট ${d.title} উপলক্ষে দেশবাসীর সাথে সংহতি প্রকাশ করছে। একতা ও সাংবিধানিক মূল্যবোধ রক্ষা আমাদের অঙ্গীকার।`
            : `${d.title} পালিত হচ্ছে। বিশ্ব মানবাধিকার রক্ষায় আমাদের অভিযান অব্যাহত।`,
          imageUrl: visual?.imageUrl || '/HRAT Logo.jpeg',
          imageHint: visual?.imageHint || 'human rights',
          isAutoGenerated: true,
          category: d.category
        };
      }

      // 2. CHECK FOR YESTERDAY (1-day-after rule)
      const yesterday = addDays(now, -1);
      const yesterdayEvents = allDays.filter(d => d.date.getTime() === yesterday.getTime())
        .sort((a, b) => getPriority(b) - getPriority(a));

      if (yesterdayEvents.length > 0) {
        const d = yesterdayEvents[0];
        const visual = getFestivalImageConfig(d.title);
        return {
          title: `Happy ${d.title}`,
          titleBn: `শুভ ${d.title}`,
          message: d.isHoliday
            ? `Human Rights Affairs Trust joins the nation in observing ${d.title}. Upholding unity and constitutional values.`
            : `Observing ${d.title}. Our mission for global human rights remains constant.`,
          messageBn: d.isHoliday
            ? `হিউম্যান রাইটস অ্যাফেয়ার্স ট্রাস্ট ${d.title} উপলক্ষে দেশবাসীর সাথে সংহতি প্রকাশ করছে। একতা ও সাংবিধানিক মূল্যবোধ রক্ষা আমাদের অঙ্গীকার।`
            : `${d.title} পালিত হচ্ছে। বিশ্ব মানবাধিকার রক্ষায় আমাদের অভিযান অব্যাহত।`,
          imageUrl: visual?.imageUrl || '/HRAT Logo.jpeg',
          imageHint: visual?.imageHint || 'human rights',
          isAutoGenerated: true,
          category: d.category
        };
      }

      // 3. CHECK FOR UPCOMING (3-day-before rule with sequential lead suppression)
      const upcoming = allDays.filter(d => d.date > now && d.date <= addDays(now, 3));
      if (upcoming.length > 0) {
        const next = upcoming[0];

        // CONFLICT CHECK: Suppression of early lead if occasions are consecutive
        const dayBeforeNext = addDays(next.date, -1);
        const isConsecutive = allDays.some(d => d.date.getTime() === dayBeforeNext.getTime());

        if (!isConsecutive) {
          const visual = getFestivalImageConfig(next.title);
          return {
            title: `Happy ${next.title} Coming Soon`,
            titleBn: `শুভ ${next.title} আসন্ন`,
            message: next.isHoliday
              ? `Human Rights Affairs Trust joins the nation in observing ${next.title}. Upholding unity and constitutional values.`
              : `Observing ${next.title}. Our mission for global human rights remains constant.`,
            messageBn: next.isHoliday
              ? `হিউম্যান রাইটস অ্যাফেয়ার্স ট্রাস্ট ${next.title} উপলক্ষে দেশবাসীর সাথে সংহতি প্রকাশ করছে। একতা ও সাংবিধানিক মূল্যবোধ রক্ষা আমাদের অঙ্গীকার।`
              : `${next.title} পালিত হচ্ছে। বিশ্ব মানবাধিকার রক্ষায় আমাদের অভিযান অব্যাহত।`,
            imageUrl: visual?.imageUrl || '/HRAT Logo.jpeg',
            imageHint: visual?.imageHint || 'human rights',
            isAutoGenerated: true,
            category: next.category
          };
        }
      }
    }

    // --- MANUAL MODE / FALLBACK ---
    if (!occasions || occasions.length === 0) return DEFAULT_BANNER;

    const now = new Date();

    const validOccasions = (occasions as any[])
      .filter((occ) => {
        if (!occ.isActive) return false;
        try {
          const start = startOfDay(parseISO(occ.startDate));
          const end = endOfDay(parseISO(occ.endDate));
          return isWithinInterval(now, { start, end });
        } catch (e) {
          return false;
        }
      })
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    return validOccasions[0] ? {
      ...validOccasions[0],
      imageHint: 'celebration'
    } : DEFAULT_BANNER;
  }, [occasions, mounted, protocol]);

  if (!mounted || !isHome || scrolled) return null;

  const isDefault = activeOccasion.isDefault === true;
  const isAuto = activeOccasion.isAutoGenerated === true;
  const displayTitle = (isBangla && activeOccasion.titleBn) ? activeOccasion.titleBn : activeOccasion.title;
  const displayMessage = (isBangla && activeOccasion.messageBn) ? activeOccasion.messageBn : activeOccasion.message;

  return (
    <div className="absolute top-full md:-right-[200px] mt-24 md:mt-48 z-[110] animate-in fade-in slide-in-from-top-4 duration-700 pointer-events-auto w-full md:w-[500px] left-0 md:left-auto px-4 md:px-0">
      <div className={cn(
        "bg-black/20 md:bg-transparent p-4 md:p-6 rounded-3xl md:rounded-none flex items-center gap-4 md:gap-7 group transition-all duration-700 backdrop-blur-md md:backdrop-blur-none",
        loading && "opacity-80"
      )}>
        <div className="relative w-20 h-20 md:w-32 md:h-32 rounded-2xl md:rounded-[1.5rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4)] border-2 border-white/20 shrink-0 group-hover:scale-105 transition-transform duration-700 bg-slate-900/40">
          <Image
            src={activeOccasion.imageUrl || '/HRAT Logo.jpeg'}
            alt={activeOccasion.title}
            fill
            className="object-cover"
            priority
            data-ai-hint={activeOccasion.imageHint || 'human rights'}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/5 pointer-events-none"></div>
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          {/* Title row: title wraps up to 2 lines, then scrolls; language button never shrinks */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-start gap-2 min-w-0 flex-1">
              <div className={cn(
                "h-1.5 w-1.5 rounded-full animate-pulse mt-1.5 md:mt-2 shrink-0",
                isDefault ? "bg-[#FF00FF]" : "bg-[#CFFF04]"
              )}></div>
              <div className="min-w-0 flex-1">
                <ClampOrScroll
                  text={displayTitle}
                  maxLines={2}
                  className={cn(
                    "text-[9px] md:text-[13px] font-black uppercase tracking-[0.2em]",
                    isDefault ? "text-[#FF00FF]" : "text-[#CFFF04]"
                  )}
                />
              </div>
            </div>

            {/* Language Toggler */}
            <button
              onClick={() => setIsBangla(!isBangla)}
              className="shrink-0 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 transition-all active:scale-95 group/lang"
            >
              <Languages className="w-2.5 h-2.5 text-[#CFFF04]" />
              <span className="text-[7px] font-black text-[#CFFF04] uppercase tracking-tighter">
                {isBangla ? 'ENG' : 'বাংলা'}
              </span>
            </button>
          </div>

          {/* Message: always wraps normally, no line limit, no scroll/marquee */}
          <p className="text-[#CFFF04] font-headline font-bold text-[9px] md:text-sm leading-tight md:leading-snug whitespace-normal break-words drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            {displayMessage}
          </p>

          {(!isDefault || isAuto) && (
            <div className="flex items-center gap-1.5 mt-2 bg-emerald-500/20 px-2 py-0.5 rounded-lg border border-emerald-500/30 w-fit">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[6px] md:text-[7px] font-black text-emerald-400 uppercase tracking-widest">
                {isAuto ? `Autonomous Sync: ${activeOccasion.category}` : 'Official Broadcast'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}