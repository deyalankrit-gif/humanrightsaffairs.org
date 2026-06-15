
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp, increment, arrayUnion } from 'firebase/firestore';

/**
 * VisitorTracker silently logs visitor metadata to Firestore.
 * It identifies unique users via localStorage and updates activity in real-time
 * on every page navigation.
 */
export function VisitorTracker() {
  const db = useFirestore();
  const { user } = useUser();
  const pathname = usePathname();

  useEffect(() => {
    if (!db) return;

    const trackVisit = async () => {
      // 1. Identify or Create Visitor ID
      let visitorId = localStorage.getItem('hrat_visitor_id');
      const isNewSession = !sessionStorage.getItem('hrat_session_active');
      
      if (!visitorId) {
        visitorId = `VIS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        localStorage.setItem('hrat_visitor_id', visitorId!);
      }

      // 2. Gather Technical Profile
      const userAgent = window.navigator.userAgent;
      const platform = window.navigator.platform;
      const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
      
      let browser = "Unknown";
      if (userAgent.includes("Chrome")) browser = "Chrome";
      else if (userAgent.includes("Firefox")) browser = "Firefox";
      else if (userAgent.includes("Safari")) browser = "Safari";
      else if (userAgent.includes("Edge")) browser = "Edge";

      // 3. Gather Geographic Profile (Silent Mock or Public API)
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
      } catch (e) {
        // Fallback to defaults if API fails
      }

      // 4. Commit to Firestore
      const visitorRef = doc(db, 'visitors', visitorId!);
      
      const updatePayload: any = {
        name: user?.displayName || 'Anonymous Guest',
        email: user?.email || '',
        deviceType: isMobile ? 'Mobile' : 'Desktop',
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
        pagesVisited: arrayUnion(pathname)
      };

      // Handle first-time visitor or new session increment
      if (isNewSession) {
        updatePayload.totalVisits = increment(1);
        sessionStorage.setItem('hrat_session_active', 'true');
        
        // If they don't even have a visitor record in storage, they are "New"
        if (!localStorage.getItem('hrat_visitor_exists')) {
          updatePayload.status = 'New';
          updatePayload.firstVisit = serverTimestamp();
          updatePayload.createdAt = serverTimestamp();
          localStorage.setItem('hrat_visitor_exists', 'true');
        }
      }

      setDoc(visitorRef, updatePayload, { merge: true }).catch(() => {
        // Silent fail for tracking errors
      });
    };

    trackVisit();
  }, [db, user, pathname]);

  return null;
}
