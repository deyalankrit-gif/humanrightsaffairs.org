
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
  { name: 'Members', href: '/members', icon: UserCheck },
  { name: 'Terminated', href: '/terminated-members', icon: UserX },
  { name: 'Grievance', href: '/#grievances', icon: MessageSquareWarning },
  { name: 'Rights', href: '/#knowledge', icon: Scale },
  { name: 'Helpline', href: '/#helpline', icon: Phone },
]

const adminLinks = [
  { name: 'Analytics', href: '/internal/analytics', icon: LayoutDashboard },
  { name: 'Accounts', href: '/internal/accounts', icon: Wallet },
  { name: 'Expenses', href: '/internal/expenses', icon: TrendingDown },
  { name: 'Applications', href: '/internal/applications', icon: FileText },
  { name: 'Members', href: '/internal/members', icon: Users },
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
  const [activeHash, setActiveHash] = React.useState('')
  const isAdminPortal = pathname.startsWith('/internal')
  const links = isAdminPortal ? adminLinks : publicLinks

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleHashChange = () => {
        setActiveHash(window.location.hash.replace('#', ''))
      }
      window.addEventListener('hashchange', handleHashChange)
      handleHashChange()

      return () => window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

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
              let isActive = false
              
              if (isAdminPortal) {
                isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              } else {
                const isHashLink = link.href.includes('#')
                const linkPath = isHashLink ? link.href.split('#')[0] || '/' : link.href
                const linkHash = isHashLink ? link.href.split('#')[1] : ''
                
                if (isHashLink) {
                  isActive = (pathname === linkPath) && activeHash === linkHash
                } else if (link.href === '/') {
                  isActive = pathname === '/' && activeHash === ''
                } else {
                  isActive = pathname === link.href
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
                        ? "bg-accent text-white font-bold hover:bg-secondary hover:text-white shadow-md" 
                        : "hover:bg-secondary/10 hover:text-secondary"
                    )}
                  >
                    <Link 
                      href={link.href}
                      onClick={() => {
                        if (link.href.includes('#')) setActiveHash(link.href.split('#')[1])
                        else if (!isAdminPortal) setActiveHash('')
                      }}
                      className="flex items-center gap-3"
                    >
                      <link.icon className={cn(
                        "w-5 h-5", 
                        isActive ? "text-white" : "text-muted-foreground"
                      )} />
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
        {!isAdminPortal && (
          <div className="group-data-[collapsible=icon]:hidden">
            <DonationDialog>
              <Button className="w-full bg-accent text-white font-bold rounded-xl gap-2 h-11 hover:bg-secondary hover:text-white transition-all">
                <HeartHandshake className="w-4 h-4" /> Support Cause
              </Button>
            </DonationDialog>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
