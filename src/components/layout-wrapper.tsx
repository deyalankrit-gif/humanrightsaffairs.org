
'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { HeaderActions } from '@/components/header-actions';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { VisitorTracker } from '@/components/visitor-tracker';
import { PublicFooter } from '@/components/public-footer';
import { AdminFooter } from '@/components/admin-footer';
import { FeedbackSystem } from '@/components/feedback-system';
import { ContextualHelp } from '@/components/contextual-help';
import { useUser } from '@/firebase';
import { cn } from '@/lib/utils';

/**
 * LayoutWrapper manages the global layout structure, switching between
 * the public portal (with top navbar and PublicFooter) and the administrative 
 * portal (with left-hand sidebar and AdminFooter).
 */
export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);

  // Determine if we are in the administrative portal
  const isAdmin = pathname?.startsWith('/internal');
  
  // STRICT GOVERNANCE HIERARCHY
  const isRoot = user?.email?.toLowerCase() === 'deydhritiman@gmail.com';
  
  // Both login pages should have the same clean layout without sidebar/header/footer
  const isLoginPage = pathname === '/internal/login' || pathname === '/internal/super-login';

  // Prevent hydration mismatch by waiting for client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  // Administrative Dashboard Layout (Sidebar + Action Bar + AdminFooter)
  if (isAdmin && !isLoginPage) {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen bg-background w-full">
          <AppSidebar />
          <SidebarInset className="flex flex-col min-w-0">
            <header className="flex h-12 md:h-10 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 px-4 transition-all duration-300 print:hidden">
              <SidebarTrigger className="-ml-1 scale-90" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <div className="flex-1 min-w-0">
                 <h1 className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] text-slate-400 truncate">
                    Personnel Portal <span className={cn("ml-1 md:ml-2 font-black", isRoot ? "text-red-500" : "text-emerald-500")}>
                      {isRoot ? "Root Terminal" : "Staff Terminal"}
                    </span>
                 </h1>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <HeaderActions />
              </div>
            </header>
            <main className="flex-1 overflow-x-hidden w-full">
              {/* Contextual Help Injected into Admin Layout */}
              <ContextualHelp />
              {children}
            </main>
            <AdminFooter />
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  // Public Portal Layout or Admin Login Page
  return (
    <div className="flex flex-col min-h-screen relative bg-background w-full overflow-x-hidden">
      <VisitorTracker />
      {!isAdmin && <Navbar />}
      <div className="flex-1 w-full">
        {children}
      </div>
      {!isAdmin && !isLoginPage && <FeedbackSystem />}
      {!isLoginPage && (isAdmin ? <AdminFooter /> : <PublicFooter />)}
    </div>
  );
}
