'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { Navbar } from '@/components/navbar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { HeaderActions } from '@/components/header-actions';
import { AdminQuickAccess } from '@/components/admin-quick-access';
import { DonationDialog } from '@/components/donation-dialog';
import Image from 'next/image';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/internal');

  if (isAdmin) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sticky top-0 z-50 transition-all duration-300">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-none">HRAT</span>
                <span className="text-[8px] font-bold text-accent uppercase tracking-widest">JusticeShield</span>
              </div>
            </div>
            <HeaderActions />
          </header>
          <div className="flex-1">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar />
      
      {/* Floating Donate Badge */}
      <DonationDialog>
        <button className="fixed top-24 right-4 md:right-8 z-[100] cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300 group outline-none ring-offset-background focus:ring-2 focus:ring-accent rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <div className="relative w-24 h-16 md:w-40 md:h-28 border-2 border-white/30 rounded-2xl overflow-hidden bg-black">
            <Image 
              src="/donate.jpeg" 
              alt="Donate Online" 
              fill 
              className="object-cover group-hover:brightness-110"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 via-transparent to-white/5 pointer-events-none"></div>
          </div>
          {/* Pulsing indicator */}
          <div className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-accent border border-white"></span>
          </div>
        </button>
      </DonationDialog>

      <div className="flex-1">
        {children}
      </div>
      <AdminQuickAccess />
    </div>
  );
}
