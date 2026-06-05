
"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { useAuth, useUser } from "@/firebase"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import {
  Home,
  Handshake,
  Calendar,
  Users,
  UserCheck,
  UserX,
  MessageSquareWarning,
  Scale,
  Phone,
  LayoutDashboard,
  TrendingDown,
  FileText,
  RefreshCw,
  Package,
  Truck,
  HeartHandshake,
  Wallet,
  LogOut,
  ExternalLink,
  UserCircle,
  Monitor
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DonationDialog } from "./donation-dialog"

const publicLinks = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Meetings', href: '/meetings', icon: Handshake },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Leadership', href: '/leadership', icon: Users },
  { name: 'Personnel', href: '/members', icon: UserCheck },
  { name: 'Revocations', href: '/terminated-members', icon: UserX },
  { name: 'Grievance', href: '/#grievances', icon: MessageSquareWarning },
  { name: 'Rights', href: '/#knowledge', icon: Scale },
  { name: 'Helpline', href: '/#helpline', icon: Phone },
]

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
  { name: 'Public Site View', href: '/internal/public-view', icon: Monitor },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const auth = useAuth()
  const { user } = useUser()
  
  const isAdminPortal = pathname.startsWith('/internal')
  const links = isAdminPortal ? adminLinks : publicLinks

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth)
      router.push('/internal/login')
    }
  }

  return (
    <Sidebar collapsible="icon" className="border-r bg-sidebar">
      <SidebarHeader className="h-20 border-b flex items-center justify-center">
        <Link href="/" className="flex items-center gap-3 px-4 w-full">
          <div className="relative w-10 h-10 shrink-0">
            <Image src="/HRAT%20Logo.jpeg" alt="Logo" fill className="object-contain" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-headline font-bold text-lg leading-none text-sidebar-foreground">HRAT</span>
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">JusticeShield</span>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            {isAdminPortal ? "Administrative Control" : "Navigation"}
          </SidebarGroupLabel>
          <SidebarMenu>
            {links.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              return (
                <SidebarMenuItem key={link.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={link.name}
                    className={cn(
                      "h-11 rounded-xl transition-all px-4",
                      isActive ? "bg-accent/10 text-accent font-bold" : "hover:bg-accent/5"
                    )}
                  >
                    <Link href={link.href} className="flex items-center gap-3">
                      <link.icon className={cn("w-5 h-5", isActive ? "text-accent" : "text-muted-foreground")} />
                      <span className="group-data-[collapsible=icon]:hidden">{link.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4 space-y-4">
        {isAdminPortal && user && (
          <div className="group-data-[collapsible=icon]:hidden space-y-4">
            <div className="bg-muted/50 p-3 rounded-2xl border border-sidebar-border">
              <div className="flex items-center gap-3 mb-3">
                <UserCircle className="w-5 h-5 text-accent" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Session Official</span>
                  <span className="text-xs font-bold truncate text-sidebar-foreground">{user.email}</span>
                </div>
              </div>
              <div className="grid gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                  className="w-full justify-start h-9 gap-2 font-bold text-[10px] uppercase tracking-wider rounded-lg hover:bg-accent/10 hover:text-accent"
                >
                  <Link href="/internal/public-view">
                    <Monitor className="w-3.5 h-3.5" /> Public Site Mirror
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="w-full justify-start h-9 gap-2 font-bold text-[10px] uppercase tracking-wider rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}

        {!isAdminPortal && (
          <div className="group-data-[collapsible=icon]:hidden">
            <DonationDialog>
              <Button className="w-full bg-accent text-primary font-bold rounded-xl gap-2 h-11">
                <HeartHandshake className="w-4 h-4" /> Support Cause
              </Button>
            </DonationDialog>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
