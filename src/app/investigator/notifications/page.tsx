"use client"

import React, { useMemo } from 'react'
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase'
import { collection, query, where, orderBy, doc } from 'firebase/firestore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  Clock, 
  History, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  User,
  Activity,
  ChevronRight,
  Target
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * Investigator Notifications Page: Real-time activity stream for investigative personnel.
 * Aggregates timeline events from all cases assigned to the authenticated investigator.
 */
export default function InvestigatorNotificationsPage() {
  const { user } = useUser()
  const db = useFirestore()

  // 1. Fetch current investigator's identity from registry
  const userRef = useMemoFirebase(() => {
    if (!db || !user?.email) return null;
    return doc(db, 'users', user.email.toLowerCase());
  }, [db, user?.email]);
  const { data: userData } = useDoc(userRef);

  // 2. Fetch all cases where the investigator is active
  const casesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'public_complaints'),
      where('status', 'not-in', ['Closed']), // Only track active cases
      orderBy('status'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: allCases, loading } = useCollection(casesQuery);

  /**
   * Derive logical notifications from the timeline of assigned cases.
   */
  const notifications = useMemo(() => {
    if (!allCases || !user || !userData) return [];
    
    const investigatorName = userData.name || '';
    const relevantCases = allCases.filter((c: any) => 
      c.assignedTo === investigatorName || 
      (c.assignedOfficers || []).some((o: any) => o.name === investigatorName) ||
      c.email === user.email
    );

    const stream: any[] = [];
    relevantCases.forEach((c: any) => {
      // Add individual timeline entries as notifications
      (c.timeline || []).forEach((entry: any) => {
        stream.push({
          ...entry,
          caseId: c.caseId,
          docId: c.id,
          subject: c.subject,
          priority: c.priority
        });
      });

      // Also add the case creation itself if it was assigned to them
      if (c.createdAt?.toDate) {
        stream.push({
          action: "Assignment Initialized",
          remark: `New case established in your docket: ${c.subject}`,
          timestamp: c.createdAt.toDate().toISOString(),
          user: "Registry System",
          type: "system",
          caseId: c.caseId,
          docId: c.id,
          subject: c.subject,
          priority: c.priority
        });
      }
    });

    // Sort by most recent activity first
    return stream.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [allCases, user, userData]);

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center gap-4">
        <Clock className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Synchronizing Notification Node...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-600 rounded-xl text-white">
                <Bell className="w-5 h-5" />
             </div>
             <h1 className="text-3xl font-headline font-bold text-primary">Live <span className="text-indigo-600">Feed</span></h1>
          </div>
          <p className="text-slate-500 font-medium">Real-time alerts and activity from your assigned investigations.</p>
        </div>
        <Badge variant="outline" className="w-fit h-7 border-indigo-100 text-indigo-600 font-bold px-4 uppercase text-[9px] tracking-widest">
           {notifications.length} Total Alerts
        </Badge>
      </header>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif, idx) => (
            <Card key={idx} className="border-none shadow-sm overflow-hidden bg-white hover:shadow-md transition-all group">
              <CardContent className="p-0">
                <div className="flex items-stretch">
                   <div className={cn(
                     "w-1.5 shrink-0",
                     notif.type === 'assignment' || notif.type === 'system' ? "bg-indigo-500" : 
                     notif.priority === 'High' ? "bg-red-500" : "bg-emerald-500"
                   )} />
                   
                   <div className="flex-1 p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <div className="flex items-start gap-5 min-w-0">
                         <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            {notif.type === 'remark' ? <MessageSquare className="w-5 h-5" /> : 
                             notif.type === 'evidence' ? <ShieldCheck className="w-5 h-5" /> :
                             <Activity className="w-5 h-5" />}
                         </div>
                         <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                               <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{notif.caseId}</span>
                               <span className="text-[10px] font-bold text-slate-300">•</span>
                               <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(notif.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <h4 className="text-sm font-bold text-primary leading-tight uppercase tracking-tight">{notif.action}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed italic line-clamp-2">"{notif.remark}"</p>
                         </div>
                      </div>

                      <Link href={`/investigator/cases/${notif.docId}`} className="shrink-0 w-full sm:w-auto">
                         <Button variant="outline" className="w-full sm:w-auto h-9 rounded-xl text-[9px] font-black uppercase tracking-widest gap-2 hover:bg-indigo-600 hover:text-white transition-all border-slate-200">
                           Access File <ChevronRight className="w-3 h-3" />
                         </Button>
                      </Link>
                   </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-40 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-4">
             <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                <History className="w-10 h-10" />
             </div>
             <div className="space-y-1">
                <h3 className="text-xl font-headline font-bold text-slate-300">Activity Registry Empty</h3>
                <p className="text-xs text-slate-400 uppercase font-black tracking-widest">No recent alerts for your assigned node</p>
             </div>
          </div>
        )}
      </div>

      <div className="pt-10 flex flex-col items-center gap-4 opacity-20">
         <ShieldCheck className="w-12 h-12 text-slate-400" />
         <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">National Investigative Feed • Node-Beta</p>
      </div>
    </div>
  )
}
