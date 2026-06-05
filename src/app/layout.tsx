import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { PortalSwitcher } from '@/components/portal-switcher';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Human Rights Affairs Trust (JusticeShield)',
  description: 'Human Rights Affairs Trust (Justice Shield) is a Central Government Registered Human Rights Organization in India (Reg. No. WB/2025/0762605). Dedicated to constitutional literacy & legal aid & Social Justice.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
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
                </header>
                <FirebaseErrorListener />
                <PortalSwitcher />
                {children}
                <Toaster />
              </SidebarInset>
            </SidebarProvider>
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
