
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
  SidebarMenuAction,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
  Archive,
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
  Truck,
  Package,
  Boxes,
  Navigation,
  Bell,
  ChevronDown,
  Pin,
  PinOff,
  MessageSquareQuote
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DonationDialog } from "./donation-dialog"
import { useFirestore, useDoc, useUser, useMemoFirebase } from '@/firebase'
import { doc } from 'firebase/firestore'
import { SidebarAudioStation } from "./sidebar-audio-station"
import { useToast } from "@/hooks/use-toast"

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
  { name: 'Testimonials Mgmt', href: '/internal/feedback', icon: MessageSquareQuote, permission: 'feedback' },
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

const logisticLinksConfig = [
  { name: 'Material System', href: '/internal/material-management', icon: Package, permission: 'materialManagement' },
  { name: 'Stock Inventory', href: '/internal/stock-inventory', icon: Boxes, permission: 'inventory' },
  { name: 'Logistic Tracking', href: '/internal/logistic-tracking', icon: Navigation, permission: 'kitManagement' },
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
  { name: 'Vendor Registry', href: '/internal/vendors', icon: Truck, permission: 'vendors' },
  { name: 'Payroll Suite', href: '/internal/finance/payroll', icon: IndianRupee, permission: 'financePayroll' },
  { name: 'Reports Center', href: '/internal/finance/reports', icon: FileSpreadsheet, permission: 'financeDashboard' },
  { name: 'Tax & Compliance', href: '/internal/finance/compliance', icon: Scale, permission: 'financeCompliance' },
]

const ALL_ADMIN_LINKS = [...topAnalyticsLinksConfig, ...adminLinksConfig, ...logisticLinksConfig, ...financeLinksConfig];

export function AppSidebar() {
  const pathname = usePathname()
  const [activeHash, setActiveHash] = React.useState('')
  const activeItemRef = React.useRef<HTMLLIElement | null>(null)
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  const isAdminPortal = pathname?.startsWith('/internal')

  const [pinnedHrefs, setPinnedHrefs] = React.useState<string[]>([])

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.email) return null;
    return doc(db, 'users', user.email.toLowerCase());
  }, [db, user?.email]);

  const { data: userPermissions } = useDoc(userDocRef);
  const isRoot = user?.email?.toLowerCase() === 'deydhritiman@gmail.com';

  // Persistence logic for pinned menus
  React.useEffect(() => {
    const saved = localStorage.getItem('hrat_pinned_menus');
    if (saved) {
      try {
        setPinnedHrefs(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const togglePin = (href: string) => {
    const isPinned = pinnedHrefs.includes(href);
    let updated: string[];
    
    if (isPinned) {
      updated = pinnedHrefs.filter(h => h !== href);
      setPinnedHrefs(updated);
      localStorage.setItem('hrat_pinned_menus', JSON.stringify(updated));
      toast({ title: "Menu Unpinned", description: "Shortcut removed from the Pinned section." });
    } else {
      if (pinnedHrefs.length >= 6) {
        toast({ 
          variant: "destructive", 
          title: "Pin Limit Reached", 
          description: "You can pin a maximum of 6 menus for optimal focus." 
        });
        return;
      }
      updated = [...pinnedHrefs, href];
      setPinnedHrefs(updated);
      localStorage.setItem('hrat_pinned_menus', JSON.stringify(updated));
      toast({ title: "Menu Pinned", description: "Shortcut added to 'Pin Menu Here' section." });
    }
  };

  // Centering logic
  React.useEffect(() => {
    const scrollActiveItem = () => {
      if (!activeItemRef.current) return;
      
      const scrollContainer = activeItemRef.current.closest('[data-sidebar="content"]');
      if (!scrollContainer) return;

      const itemRect = activeItemRef.current.getBoundingClientRect();
      const containerRect = scrollContainer.getBoundingClientRect();

      const itemCenter = itemRect.top + itemRect.height / 2;
      const containerCenter = containerRect.top + containerRect.height / 2;
      const threshold = containerRect.height * 0.15;

      const isOptimallyPositioned = (
        itemRect.top >= containerRect.top + 50 &&
        itemRect.bottom <= containerRect.bottom - 50 &&
        Math.abs(itemCenter - containerCenter) < threshold
      );

      if (!isOptimallyPositioned) {
        activeItemRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    };

    const timer = setTimeout(scrollActiveItem, 150);
    return () => clearTimeout(timer);
  }, [pathname, activeHash]);

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

  const filteredLogisticLinks = React.useMemo(() => {
    if (!isAdminPortal) return []
    return logisticLinksConfig.filter(link => {
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

  const pinnedItems = React.useMemo(() => {
    return ALL_ADMIN_LINKS.filter(link => pinnedHrefs.includes(link.href));
  }, [pinnedHrefs]);

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
      
      <SidebarContent className="py-6 custom-scrollbar scroll-smooth">
        {isAdminPortal ? (
          <>
            {/* Intelligence Section */}
            {filteredTopAnalyticsLinks.length > 0 && (
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarGroup>
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel className="cursor-pointer hover:bg-accent/5 transition-colors group-data-[collapsible=icon]:hidden text-primary font-bold flex items-center justify-between w-full pr-2">
                      INSTITUTIONAL INTELLIGENCE
                      <ChevronDown className="ml-auto h-3 w-3 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenu>
                      {filteredTopAnalyticsLinks.map((link) => {
                        const isActive = pathname === link.href
                        const isPinned = pinnedHrefs.includes(link.href)
                        return (
                          <SidebarMenuItem key={link.name} ref={isActive ? activeItemRef : null}>
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
                            {isRoot && (
                              <SidebarMenuAction 
                                onClick={() => togglePin(link.href)}
                                title="Pin Menu Here"
                                className={cn(
                                  "opacity-0 group-hover/menu-item:opacity-100 transition-opacity",
                                  isPinned ? "text-accent" : "text-slate-400"
                                )}
                              >
                                {isPinned ? <Pin className="fill-current" /> : <Pin />}
                              </SidebarMenuAction>
                            )}
                          </SidebarMenuItem>
                        )
                      })}
                    </SidebarMenu>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            )}

            {/* PINNED MENUS SECTION - Always visible for Root */}
            {isRoot && (
              <SidebarGroup className="animate-in fade-in slide-in-from-left-2 duration-500">
                <div className="group-data-[collapsible=icon]:hidden px-2 mb-4">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-accent flex items-center gap-2 leading-none">
                     Pin Menu Here
                  </h4>
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter mt-1">Maximum Six</p>
                </div>
                <SidebarMenu>
                  {pinnedItems.length > 0 ? pinnedItems.map((link) => {
                    const isActive = pathname === link.href
                    return (
                      <SidebarMenuItem key={link.name} ref={isActive ? activeItemRef : null}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={link.name}
                          className={cn(
                            "h-10 rounded-xl transition-all px-4 border border-transparent",
                            isActive ? "bg-accent text-primary font-bold shadow-lg border-accent/20" : "bg-accent/5 text-accent hover:bg-accent/10"
                          )}
                        >
                          <Link href={link.href} className="flex items-center gap-3">
                            <link.icon className="w-4.5 h-4.5" />
                            <span className="group-data-[collapsible=icon]:hidden text-[11px] font-bold uppercase">{link.name}</span>
                          </Link>
                        </SidebarMenuButton>
                        <SidebarMenuAction 
                          onClick={() => togglePin(link.href)}
                          title="Pin Menu Here"
                          className="opacity-0 group-hover/menu-item:opacity-100 text-accent"
                        >
                          <PinOff className="w-3 h-3" />
                        </SidebarMenuAction>
                      </SidebarMenuItem>
                    )
                  }) : (
                    <div className="px-4 py-3 group-data-[collapsible=icon]:hidden">
                      <p className="text-[10px] text-slate-500 italic">No pinned menus. Hover over an item to pin it.</p>
                    </div>
                  )}
                </SidebarMenu>
              </SidebarGroup>
            )}

            {/* Logistics Section */}
            {filteredLogisticLinks.length > 0 && (
              <Collapsible defaultOpen={filteredLogisticLinks.some(l => pathname === l.href)} className="group/collapsible">
                <SidebarGroup>
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel className="cursor-pointer hover:bg-blue-500/5 transition-colors group-data-[collapsible=icon]:hidden text-blue-600 font-bold uppercase tracking-widest flex items-center justify-between w-full pr-2">
                      LOGISTICAL GOVERNANCE
                      <ChevronDown className="ml-auto h-3 w-3 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenu>
                      {filteredLogisticLinks.map((link) => {
                        const isActive = pathname === link.href
                        const isPinned = pinnedHrefs.includes(link.href)
                        return (
                          <SidebarMenuItem key={link.name} ref={isActive ? activeItemRef : null}>
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
                            {isRoot && (
                              <SidebarMenuAction 
                                onClick={() => togglePin(link.href)}
                                title="Pin Menu Here"
                                className={cn(
                                  "opacity-0 group-hover/menu-item:opacity-100 transition-opacity",
                                  isPinned ? "text-accent" : "text-slate-400"
                                )}
                              >
                                {isPinned ? <Pin className="fill-current" /> : <Pin />}
                              </SidebarMenuAction>
                            )}
                          </SidebarMenuItem>
                        )
                      })}
                    </SidebarMenu>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            )}

            {/* Finance Section */}
            {filteredFinanceLinks.length > 0 && (
              <Collapsible defaultOpen={filteredFinanceLinks.some(l => pathname === l.href || pathname.startsWith(l.href))} className="group/collapsible">
                <SidebarGroup>
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel className="cursor-pointer hover:bg-red-500/5 transition-colors group-data-[collapsible=icon]:hidden text-red-600 font-bold flex items-center justify-between w-full pr-2">
                      FINANCIAL GOVERNANCE
                      <ChevronDown className="ml-auto h-3 w-3 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenu>
                      {filteredFinanceLinks.map((link) => {
                        const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                        const isPinned = pinnedHrefs.includes(link.href)
                        return (
                          <SidebarMenuItem key={link.name} ref={isActive ? activeItemRef : null}>
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
                            {isRoot && (
                              <SidebarMenuAction 
                                onClick={() => togglePin(link.href)}
                                title="Pin Menu Here"
                                className={cn(
                                  "opacity-0 group-hover/menu-item:opacity-100 transition-opacity",
                                  isPinned ? "text-accent" : "text-slate-400"
                                )}
                              >
                                {isPinned ? <Pin className="fill-current" /> : <Pin />}
                              </SidebarMenuAction>
                            )}
                          </SidebarMenuItem>
                        )
                      })}
                    </SidebarMenu>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            )}

            {/* Operations Section */}
            {filteredAdminLinks.length > 0 && (
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarGroup>
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel className="cursor-pointer hover:bg-accent/5 transition-colors group-data-[collapsible=icon]:hidden text-primary font-bold flex items-center justify-between w-full pr-2">
                      {isRoot ? "ROUTE GOVERNANCE" : "STAFF OPERATIONS"}
                      <ChevronDown className="ml-auto h-3 w-3 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenu>
                      {filteredAdminLinks.map((link) => {
                        const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                        const isPinned = pinnedHrefs.includes(link.href)
                        return (
                          <SidebarMenuItem key={link.name} ref={isActive ? activeItemRef : null}>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive}
                              tooltip={link.name}
                              className={cn(
                                "h-11 rounded-xl transition-all px-4",
                                isActive 
                                  ? (isRoot ? "bg-red-600 text-white font-bold" : "bg-accent text-white font-bold")
                                  : "hover:bg-secondary/10 hover:text-secondary group/btn"
                              )}
                            >
                              <Link href={link.href} className="flex items-center gap-3">
                                <link.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-muted-foreground group-hover/btn:text-secondary")} />
                                <span className="group-data-[collapsible=icon]:hidden">{link.name}</span>
                              </Link>
                            </SidebarMenuButton>
                            {isRoot && (
                              <SidebarMenuAction 
                                onClick={() => togglePin(link.href)}
                                title="Pin Menu Here"
                                className={cn(
                                  "opacity-0 group-hover/menu-item:opacity-100 transition-opacity",
                                  isPinned ? "text-accent" : "text-slate-400"
                                )}
                              >
                                {isPinned ? <Pin className="fill-current" /> : <Pin />}
                              </SidebarMenuAction>
                            )}
                          </SidebarMenuItem>
                        )
                      })}
                    </SidebarMenu>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            )}
          </>
        ) : (
          /* Public Portal Sidebar (Simplified) */
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">NAVIGATION</SidebarGroupLabel>
            <SidebarMenu>
              {publicLinks.map((link) => {
                const isHashLink = link.href.includes('#')
                const linkPath = isHashLink ? link.href.split('#')[0] || '/' : link.href
                const linkHash = isHashLink ? '#' + link.href.split('#')[1] : ''
                const isActive = isHashLink ? (pathname === linkPath && activeHash === linkHash) : (pathname === link.href && activeHash === '')

                return (
                  <SidebarMenuItem key={link.name} ref={isActive ? activeItemRef : null}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={link.name}
                      className={cn(
                        "h-11 rounded-xl transition-all px-4",
                        isActive ? "bg-accent text-white font-bold" : "hover:bg-secondary/10 hover:text-secondary group/btn"
                      )}
                    >
                      <Link 
                        href={link.href}
                        onClick={() => setActiveHash(isHashLink ? linkHash : '')}
                        className="flex items-center gap-3"
                      >
                        <link.icon className={cn("w-3 h-3 md:w-3.5 md:h-3.5 transition-colors", isActive ? "text-white" : "text-muted-foreground group-hover:text-white")} />
                        <span className="group-data-[collapsible=icon]:hidden">{link.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        )}

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
