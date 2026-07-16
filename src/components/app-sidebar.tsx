
"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
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
  SidebarGroupContent,
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
  Monitor,
  BarChart3,
  BarChart,
  Settings,
  Lock,
  Image as ImageIcon,
  Radio,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DonationDialog } from "./donation-dialog"
import { useFirestore, useDoc, useUser, useMemoFirebase } from '@/firebase'
import { doc } from 'firebase/firestore'
import { SidebarAudioStation } from "./sidebar-audio-station"

const publicLinks = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Meetings', href: '/meetings', icon: Handshake },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Gallery', href: '/gallery', icon: ImageIcon },
  { name: 'Leadership', href: '/leadership', icon: Users },
  { name: 'Members', href: '/members', icon: UserCheck },
  { name: 'Terminated', href: '/terminated-members', icon: UserX },
  { name: 'Grievance', href: '/#grievances', icon: MessageSquareWarning },
  { name: 'Rights', href: '/#knowledge', icon: Scale },
  { name: 'Helpline', href: '/#helpline', icon: Phone },
]

const adminLinksConfig = [
  { name: 'Donation Analytics', href: '/internal/analytics', icon: LayoutDashboard, permission: 'analytics' },
  { name: 'Member Analytics', href: '/internal/member-analytics', icon: BarChart, permission: 'memberAnalytics' },
  { name: 'Website Visitors', href: '/internal/visitors', icon: BarChart3, permission: 'visitors' },
  { name: 'Accounts', href: '/internal/accounts', icon: Wallet, permission: 'accounts' },
  { name: 'Expenses', href: '/internal/expenses', icon: TrendingDown, permission: 'expenses' },
  { name: 'Applications', href: '/internal/applications', icon: FileText, permission: 'applications' },
  { name: 'Members', href: '/internal/members', icon: Users, permission: 'members' },
  { name: 'Renewals', href: '/internal/renewals', icon: RefreshCw, permission: 'renewals' },
  { name: 'Terminated', href: '/internal/terminated-members', icon: UserX, permission: 'terminated' },
  { name: 'Occasion Greetings', href: '/internal/occasions', icon: Sparkles, permission: 'occasions' },
  { name: 'Inventory', href: '/internal/inventory', icon: Package, permission: 'inventory' },
  { name: 'Vendors', href: '/internal/vendors', icon: Truck, permission: 'vendors' },
  { name: 'Grievances', href: '/internal/grievances', icon: MessageSquareWarning, permission: 'grievances' },
  { name: 'Meetings', href: '/internal/meetings', icon: Handshake, permission: 'meetings' },
  { name: 'Events', href: '/internal/events', icon: Calendar, permission: 'events' },
  { name: 'Gallery Archive', href: '/internal/gallery', icon: ImageIcon, permission: 'gallery' },
  { name: 'Activity Hub', href: '/internal/activity-hub', icon: LayoutDashboard, permission: 'activityHub' },
  { name: 'Access Roles', href: '/internal/roles', icon: Settings, rootOnly: true },
  { name: 'Public Site View', href: '/internal/public-view', icon: Monitor, permission: 'publicView' },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [activeHash, setActiveHash] = React.useState('')
  const db = useFirestore()
  const { user } = useUser()
  const isAdminPortal = pathname?.startsWith('/internal')

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.email) return null;
    return doc(db, 'users', user.email.toLowerCase());
  }, [db, user?.email]);

  const { data: userPermissions } = useDoc(userDocRef);

  const isRoot = user?.email?.toLowerCase() === 'deydhritiman@gmail.com'

  const filteredAdminLinks = React.useMemo(() => {
    if (!isAdminPortal) return []
    return adminLinksConfig.filter(link => {
      if (isRoot) return true;
      if (link.rootOnly) return false;
      return userPermissions?.permissions?.[link.permission || ''] === true;
    })
  }, [isAdminPortal, isRoot, userPermissions])

  const links = isAdminPortal ? filteredAdminLinks : publicLinks

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleHashChange = () => {
        setActiveHash(window.location.hash || '')
      }
      window.addEventListener('hashchange', handleHashChange)
      handleHashChange()
      return () => window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  return (
    <Sidebar collapsible="icon" className="border-r bg-sidebar print:hidden">
      <SidebarHeader className="h-20 border-b flex items-center justify-center">
        <Link href="/" className="flex items-center gap-3 px-4 w-full">
          <div className="relative w-10 h-10 shrink-0">
            <Image src="/HRAT%20Logo.jpeg" alt="Logo" fill className="object-contain" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-headline font-bold text-lg leading-none text-sidebar-foreground">HRAT</span>
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Justice Shield</span>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="py-6 no-scrollbar">
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            {isAdminPortal ? (isRoot ? "ROOT GOVERNANCE" : "STAFF OPERATIONS") : "NAVIGATION"}
          </SidebarGroupLabel>
          <SidebarMenu>
            {links.map((link) => {
              let isActive = false
              
              if (isAdminPortal) {
                isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              } else {
                const isHashLink = link.href.includes('#')
                const linkPath = isHashLink ? link.href.split('#')[0] || '/' : link.href
                const linkHash = isHashLink ? '#' + link.href.split('#')[1] : ''
                
                if (isHashLink) {
                  isActive = pathname === linkPath && activeHash === linkHash
                } else {
                  isActive = pathname === link.href && activeHash === ''
                }
              }

              return (
                <SidebarMenuItem key={link.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={link.name}
                    className={cn(
                      "h-11 rounded-xl transition-all px-4",
                      isActive 
                        ? (isAdminPortal && isRoot ? "bg-red-600 text-white font-bold" : "bg-accent text-white font-bold")
                        : "hover:bg-secondary/10 hover:text-secondary group/btn"
                    )}
                  >
                    <Link 
                      href={link.href}
                      onClick={() => {
                        if (link.href.includes('#')) setActiveHash('#' + link.href.split('#')[1])
                        else if (!isAdminPortal) setActiveHash('')
                      }}
                      className="flex items-center gap-3"
                    >
                      <link.icon className={cn(
                        "w-5 h-5", 
                        isActive ? "text-white" : "text-muted-foreground group-hover/btn:text-secondary"
                      )} />
                      <span className="group-data-[collapsible=icon]:hidden">{link.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* TECHNICAL BROADCAST - ROOT EXCLUSIVE */}
        {isAdminPortal && isRoot && (
          <SidebarGroup className="mt-4 border-t border-white/5 pt-6 group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel className="flex items-center gap-2">
              <Radio className="w-3 h-3 text-orange-500 animate-pulse" />
              TECHNICAL BROADCAST
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarAudioStation />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t p-4 space-y-4">
        {!isAdminPortal && (
          <div className="group-data-[collapsible=icon]:hidden">
            <DonationDialog>
              <Button className="w-full bg-accent text-white font-bold rounded-xl gap-2 h-11 hover:bg-secondary hover:text-white transition-all">
                <HeartHandshake className="w-4 h-4" /> Support Cause
              </Button>
            </DonationDialog>
          </div>
        )}
        {isAdminPortal && (
           <div className="p-4 bg-white/5 rounded-xl border border-white/10 group-data-[collapsible=icon]:hidden">
              <div className="flex items-center gap-2 mb-2">
                 <div className={cn("w-2 h-2 rounded-full animate-pulse", isRoot ? "bg-red-600" : "bg-emerald-500")}></div>
                 <span className="text-[10px] font-black uppercase text-sidebar-foreground/70">{isRoot ? "Root Terminal" : "Operational"}</span>
              </div>
              <p className="text-[9px] font-bold text-sidebar-foreground/50 truncate">{user?.email}</p>
           </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
