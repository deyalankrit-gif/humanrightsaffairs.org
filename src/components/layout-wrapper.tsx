
'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { HeaderActions } from '@/components/header-actions';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { VisitorTracker } from '@/components/visitor-tracker';

/**
 * LayoutWrapper manages the global layout structure, switching between
 * the public portal (with top navbar) and the administrative portal
 * (with left-hand sidebar).
 */
export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Determine if we are in the administrative portal
  const isAdmin = pathname?.startsWith('/internal');
  const isLoginPage = pathname === '/internal/login';

  // Prevent hydration mismatch by waiting for client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  // Administrative Dashboard Layout (Sidebar + Action Bar)
  if (isAdmin && !isLoginPage) {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen bg-background w-full">
          <AppSidebar />
          <SidebarInset className="flex flex-col">
            <header className="flex h-10 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 px-4 transition-all duration-300 print:hidden">
              <SidebarTrigger className="-ml-1 scale-90" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <div className="flex-1">
                 <h1 className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Personnel Portal <span className="text-accent/50 ml-2">Secure Dashboard</span>
                 </h1>
              </div>
              <div className="flex items-center gap-2">
                <HeaderActions />
              </div>
            </header>
            <main className="flex-1 overflow-x-hidden">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  // Public Portal Layout or Admin Login Page
  return (
    <div className="flex flex-col min-h-screen relative bg-background">
      <VisitorTracker />
      {!isAdmin && <Navbar />}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
