'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp, increment, arrayUnion } from 'firebase/firestore';

/**
 * VisitorTracker captures real-time technical and geographic metadata.
 * Updated to monitor pathname changes for instant interaction logging.
 * Enhanced to detect specific device types: Smartphone, Tablet, or Computer/Laptop.
 */
export function VisitorTracker() {
  const db = useFirestore();
  // Destructure loading to prevent firing writes before auth resolves
  const { user, loading: authLoading } = useUser();
  const pathname = usePathname();

  useEffect(() => {
    // 🛡️ CODE GUARD: Halt execution if Firestore is not ready,
    // or if Firebase Auth is still resolving the initial session state.
    if (!db || authLoading) return;

    const trackVisit = async () => {
      // Identify unique user via localStorage
      let visitorId = localStorage.getItem('hrat_visitor_id');
      const isNewSession = !sessionStorage.getItem('hrat_session_active');
      
      if (!visitorId) {
        visitorId = `VIS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        localStorage.setItem('hrat_visitor_id', visitorId!);
      }

      // Technical profile
      const userAgent = window.navigator.userAgent;
      const platform = window.navigator.platform;
      
      // Granular Device Detection
      const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(userAgent);
      const isMobile = /iPhone|iPod|Android|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) && !isTablet;
      
      let deviceType = "Computer/Laptop";
      if (isTablet) deviceType = "Tablet";
      else if (isMobile) deviceType = "Smartphone";
      
      let browser = "Unknown";
      if (userAgent.includes("Chrome")) browser = "Chrome";
      else if (userAgent.includes("Firefox")) browser = "Firefox";
      else if (userAgent.includes("Safari")) browser = "Safari";
      else if (userAgent.includes("Edge")) browser = "Edge";

      // Silent Geographic Mock (IP API)
      let geoData = { city: "Kolkata", country: "IN", state: "West Bengal", region: "Asia/Kolkata" };
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data && !data.error) {
          geoData = {
            city: data.city || "Unknown",
            country: data.country_name || "IN",
            state: data.region || "Unknown",
            region: data.timezone || "Asia/Kolkata"
          };
        }
      } catch (e) {}

      const visitorRef = doc(db, 'visitors', visitorId!);
      
      // Date string for daily views tracking (YYYY_MM_DD)
      const todayStr = new Date().toLocaleDateString('en-CA').replace(/-/g, '_');

      const updatePayload: any = {
        name: user?.displayName || 'Anonymous Guest',
        email: user?.email || '',
        deviceType,
        browser,
        os: platform,
        lastActivity: serverTimestamp(),
        lastVisit: serverTimestamp(),
        timeZone: geoData.region,
        city: geoData.city,
        state: geoData.state,
        country: geoData.country,
        status: isNewSession ? 'Returning' : 'Active',
        userType: user ? 'Admin' : 'Guest',
        pagesVisited: arrayUnion(pathname),
        pageViews: increment(1), // Total views across all time
        [`views_${todayStr}`]: increment(1) // Segmented daily views
      };

      if (isNewSession) {
        updatePayload.totalVisits = increment(1);
        sessionStorage.setItem('hrat_session_active', 'true');
        
        if (!localStorage.getItem('hrat_visitor_exists')) {
          updatePayload.status = 'New';
          updatePayload.firstVisit = serverTimestamp();
          updatePayload.createdAt = serverTimestamp();
          localStorage.setItem('hrat_visitor_exists', 'true');
        }
      }

      setDoc(visitorRef, updatePayload, { merge: true }).catch(() => {
        // Silent fail for tracker
      });
    };

    trackVisit();
  }, [db, user, authLoading, pathname]); // Added authLoading to effect dependency array

  return null;
}