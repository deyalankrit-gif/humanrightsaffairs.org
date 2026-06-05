'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { HeaderActions } from '@/components/header-actions';
import Image from 'next/image';
import Link from 'next/link';
import { signOut } from "firebase/auth";
import { useAuth, useUser } from "@/firebase";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  TrendingDown,
  FileText,
  RefreshCw,
  Package,
  Truck,
  Wallet,
  LogOut,
  Handshake,
  Calendar,
  MessageSquareWarning,
  Monitor,
  Users
} from "lucide-react";

const adminLinks = [
  { name: 'Analytics', href: '/internal/analytics', icon: LayoutDashboard },
  { name: 'Accounts', href: '/internal/accounts', icon: Wallet },
  { name: 'Expenses', href: '/internal/expenses', icon: TrendingDown },
  { name: 'Applications', href: '/internal/applications', icon: FileText },
  { name: 'Personnel', href: '/internal/members', icon: Users },
  { name: 'Renewals', href: '/internal/renewals', icon: RefreshCw },
  { name: 'Inventory', href: '/internal/inventory', icon: Package },
  { name: 'Vendors', href: '/internal/vendors', icon: Truck },
  { name: 'Grievances', href: '/internal/grievances', icon: MessageSquareWarning },
  { name: 'Meetings', href: '/internal/meetings', icon: Handshake },
  { name: 'Events', href: '/internal/events', icon: Calendar },
  { name: 'Public View', href: '/internal/public-view', icon: Monitor },
]

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user } = useUser();
  const isAdmin = pathname.startsWith('/internal');

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/internal/login');
    }
  };

  if (isAdmin && pathname !== '/internal/login') {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="flex h-16 shrink-0 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 transition-all duration-300">
          {/* Logo Section */}
          <div className="flex items-center gap-2 px-4 shrink-0 border-r h-full bg-slate-50/50 dark:bg-slate-900/50">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-8 h-8 transition-transform group-hover:scale-110">
                <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain" />
              </div>
              <div className="flex flex-col hidden sm:flex">
                <span className="text-xs font-bold leading-none">HRAT</span>
                <span className="text-[8px] font-bold text-accent uppercase tracking-widest">JusticeShield</span>
              </div>
            </Link>
          </div>

          {/* Scrollable Nav Area with Visible Scrollbar */}
          <nav className="flex-1 flex items-center overflow-x-auto admin-scrollbar h-full px-2 gap-1 scroll-smooth">
            {adminLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/internal/analytics' && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap shrink-0",
                    isActive 
                      ? "bg-accent text-primary shadow-lg shadow-accent/10" 
                      : "text-muted-foreground hover:bg-accent/10 hover:text-accent"
                  )}
                >
                  <link.icon className={cn("w-3.5 h-3.5", isActive ? "text-primary" : "text-muted-foreground")} />
                  <span>{link.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Actions Area */}
          <div className="flex items-center gap-2 px-4 shrink-0 border-l h-full">
             <div className="hidden xl:flex flex-col items-end mr-3">
               <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Session Official</span>
               <span className="text-[10px] font-bold truncate max-w-[120px]">{user?.email?.split('@')[0]}</span>
             </div>
            {user && (
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Sign Out</span>
              </button>
            )}
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1"></div>
            <HeaderActions />
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    );
  }

  // Handle Login Page or Public Navigation
  return (
    <div className="flex flex-col min-h-screen relative bg-background">
      {!isAdmin && <Navbar />}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}