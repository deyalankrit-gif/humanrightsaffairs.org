'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { Navbar } from '@/components/navbar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { HeaderActions } from '@/components/header-actions';
import { AdminQuickAccess } from '@/components/admin-quick-access';
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
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        {children}
      </div>
      <AdminQuickAccess />
    </div>
  );
}
