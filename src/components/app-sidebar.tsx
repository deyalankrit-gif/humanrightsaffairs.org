
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
  Wallet,
  Monitor,
  BarChart3,
  BarChart,
  Settings,
  Image as ImageIcon,
  Radio,
  Sparkles,
  ShieldAlert,
  Award,
  ShieldQuestion,
  Archive,
  HeartHandshake,
  IndianRupee,
  Receipt,
  FileSpreadsheet,
  HardDrive,
  Building,
  ClipboardList,
  Newspaper,
  Zap,
  Search,
  Boxes
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DonationDialog } from "./donation-dialog"
import { useFirestore, useDoc, useUser, useMemoFirebase } from '@/firebase'
import { doc } from 'firebase/firestore'
import { SidebarAudioStation } from "./sidebar-audio-station"

const publicLinks = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Gallery', href: '/gallery', icon: ImageIcon },
  { name: 'Leadership', href: '/leadership', icon: Users },
  { name: 'Members', href: '/members', icon: UserCheck },
  { name: 'Terminated', href: '/terminated-members', icon: UserX },
  { name: 'Report a complaint', href: '/report-a-complaint', icon: ShieldAlert },
  { name: 'Rights', href: '/#knowledge', icon: Scale },
  { name: 'Helpline', href: '/#helpline', icon: Phone },
]

const topAnalyticsLinksConfig = [
  { name: 'Donation Analytics', href: '/internal/analytics', icon: LayoutDashboard, permission: 'analytics' },
  { name: 'Member Analytics', href: '/internal/member-analytics', icon: BarChart, permission: 'memberAnalytics' },
  { name: 'Website Visitors', href: '/internal/visitors', icon: BarChart3, permission: 'visitors' },
  { name: 'SEO Analytics Hub', href: '/internal/seo-dashboard', icon: Search, permission: 'seoDashboard' },
]

const adminLinksConfig = [
  { name: 'Applications', href: '/internal/applications', icon: FileText, permission: 'applications' },
  { name: 'Public Complaints', href: '/internal/public-complaints', icon: ShieldQuestion, permission: 'publicComplaints' },
  { name: 'Current News', href: '/internal/current-news', icon: Newspaper, permission: 'occasions' },
  { name: 'Kit Management', href: '/internal/kit-management', icon: Archive, permission: 'kitManagement' },
  { name: 'Members', href: '/internal/members', icon: Users, permission: 'members' },
  { name: 'Renewals', href: '/internal/renewals', icon: RefreshCw, permission: 'renewals' },
  { name: 'Terminated', href: '/internal/terminated-members', icon: UserX, permission: 'terminated' },
  { name: 'Occasion Greetings', href: '/internal/occasions', icon: Sparkles, permission: 'occasions' },
  { name: 'Donor Wall Mgmt', href: '/internal/donors', icon: Award, permission: 'donorWall' },
  { name: 'Grievances', href: '/internal/grievances', icon: MessageSquareWarning, permission: 'grievances' },
  { name: 'Meetings', href: '/internal/meetings', icon: Handshake, permission: 'meetings' },
  { name: 'Events', href: '/internal/events', icon: Calendar, permission: 'events' },
  { name: 'Gallery Archive', href: '/internal/gallery', icon: ImageIcon, permission: 'gallery' },
  { name: 'Activity Hub', href: '/internal/activity-hub', icon: LayoutDashboard, permission: 'activityHub' },
  { name: 'Access Roles', href: '/internal/roles', icon: Settings, rootOnly: true },
  { name: 'Public Site View', href: '/internal/public-view', icon: Monitor, permission: 'publicView' },
]

const logisticsLinksConfig = [
  { name: 'Kit Tracking', href: '/internal/kit-management', icon: Archive, permission: 'kitManagement' },
  { name: 'Vendor Registry', href: '/internal/vendors', icon: Truck, permission: 'vendors' },
]

const financeLinksConfig = [
  { name: 'Finance Dashboard', href: '/internal/finance/dashboard', icon: BarChart3, permission: 'financeDashboard' },
  { name: 'Accounts', href: '/internal/accounts', icon: Wallet, permission: 'accounts' },
  { name: 'Expenses', href: '/internal/expenses', icon: TrendingDown, permission: 'expenses' },
  { name: 'Voucher System (VMS)', href: '/internal/finance/vms', icon: Receipt, permission: 'financeVouchers' },
  { name: 'General Ledger', href: '/internal/finance/ledger', icon: ClipboardList, permission: 'financeLedger' },
  { name: 'Institutional Donors', href: '/internal/finance/donors', icon: HeartHandshake, permission: 'financeLedger' },
  { name: 'Project Accounting', href: '/internal/finance/projects', icon: Building, permission: 'financeProjects' },
  { name: 'Asset Registry', href: '/internal/finance/assets', icon: HardDrive, permission: 'financeAssets' },
  { name: 'Payroll Suite', href: '/internal/finance/payroll', icon: IndianRupee, permission: 'financePayroll' },
  { name: 'Reports Center', href: '/internal/finance/reports', icon: FileSpreadsheet, permission: 'financeDashboard' },
  { name: 'Tax & Compliance', href: '/internal/finance/compliance', icon: Scale, permission: 'financeCompliance' },
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

  const isRoot = user?.email?.toLowerCase() === 'deydhritiman@gmail.com';

  const filteredTopAnalyticsLinks = React.useMemo(() => {
    if (!isAdminPortal) return []
    return topAnalyticsLinksConfig.filter(link => {
      if (isRoot) return true;
      return userPermissions?.permissions?.[link.permission || ''] === true;
    })
  }, [isAdminPortal, isRoot, userPermissions])

  const filteredAdminLinks = React.useMemo(() => {
    if (!isAdminPortal) return []
    return adminLinksConfig.filter(link => {
      if (isRoot) return true;
      if (link.rootOnly) return false;
      return userPermissions?.permissions?.[link.permission || ''] === true;
    })
  }, [isAdminPortal, isRoot, userPermissions])

  const filteredLogisticsLinks = React.useMemo(() => {
    if (!isAdminPortal) return []
    return logisticsLinksConfig.filter(link => {
      if (isRoot) return true;
      return userPermissions?.permissions?.[link.permission || ''] === true;
    })
  }, [isAdminPortal, isRoot, userPermissions])

  const filteredFinanceLinks = React.useMemo(() => {
    if (!isAdminPortal) return []
    return financeLinksConfig.filter(link => {
      if (isRoot) return true;
      return userPermissions?.permissions?.[link.permission || ''] === true;
    })
  }, [isAdminPortal, isRoot, userPermissions])

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
        {isAdminPortal && filteredTopAnalyticsLinks.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-primary font-bold">
              INSTITUTIONAL INTELLIGENCE
            </SidebarGroupLabel>
            <SidebarMenu>
              {filteredTopAnalyticsLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <SidebarMenuItem key={link.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={link.name}
                      className={cn(
                        "h-11 rounded-xl transition-all px-4",
                        isActive ? "bg-accent text-white font-bold" : "hover:bg-accent/10 hover:text-accent group/btn"
                      )}
                    >
                      <Link href={link.href} className="flex items-center gap-3">
                        <link.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-muted-foreground group-hover/btn:text-accent")} />
                        <span className="group-data-[collapsible=icon]:hidden">{link.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* LOGISTICS MODULE GROUP */}
        {isAdminPortal && filteredLogisticsLinks.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-accent font-bold">
              LOGISTICAL OPERATIONS
            </SidebarGroupLabel>
            <SidebarMenu>
              {filteredLogisticsLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <SidebarMenuItem key={link.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={link.name}
                      className={cn(
                        "h-11 rounded-xl transition-all px-4",
                        isActive ? "bg-accent text-white font-bold" : "hover:bg-accent/10 hover:text-accent group/btn"
                      )}
                    >
                      <Link href={link.href} className="flex items-center gap-3">
                        <link.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-muted-foreground group-hover/btn:text-accent")} />
                        <span className="group-data-[collapsible=icon]:hidden">{link.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* FINANCE MODULE GROUP */}
        {isAdminPortal && filteredFinanceLinks.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-red-600 font-bold">
              FINANCIAL GOVERNANCE
            </SidebarGroupLabel>
            <SidebarMenu>
              {filteredFinanceLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                return (
                  <SidebarMenuItem key={link.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={link.name}
                      className={cn(
                        "h-11 rounded-xl transition-all px-4",
                        isActive ? "bg-emerald-600 text-white font-bold" : "hover:bg-emerald-500/10 hover:text-emerald-500 group/btn"
                      )}
                    >
                      <Link href={link.href} className="flex items-center gap-3">
                        <link.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-muted-foreground group-hover/btn:text-emerald-500")} />
                        <span className="group-data-[collapsible=icon]:hidden">{link.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            {isAdminPortal ? (
              isRoot ? (
                <span className="text-emerald-500 font-bold uppercase tracking-widest">Route Governance</span>
              ) : (
                "STAFF OPERATIONS"
              )
            ) : (
              "NAVIGATION"
            )}
          </SidebarGroupLabel>
          <SidebarMenu>
            {(isAdminPortal ? filteredAdminLinks : publicLinks).map((link) => {
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
                        if (!isAdminPortal && link.href.includes('#')) setActiveHash('#' + link.href.split('#')[1])
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
