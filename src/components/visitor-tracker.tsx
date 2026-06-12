
'use client';

import { useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp, increment } from 'firebase/firestore';

/**
 * VisitorTracker silently logs visitor metadata to Firestore.
 * It identifies unique users via localStorage and updates activity in real-time.
 */
export function VisitorTracker() {
  const db = useFirestore();
  const { user } = useUser();

  useEffect(() => {
    if (!db) return;

    const trackVisit = async () => {
      // 1. Identify or Create Visitor ID
      let visitorId = localStorage.getItem('hrat_visitor_id');
      const isNewVisitor = !visitorId;
      
      if (isNewVisitor) {
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
        status: isNewVisitor ? 'New' : 'Returning',
        userType: user ? 'Admin' : 'Guest',
        totalVisits: increment(1),
        pagesVisited: [window.location.pathname]
      };

      if (isNewVisitor) {
        updatePayload.firstVisit = serverTimestamp();
        updatePayload.createdAt = serverTimestamp();
        updatePayload.totalVisits = 1;
      }

      setDoc(visitorRef, updatePayload, { merge: true }).catch(() => {
        // Silent fail for tracking errors to avoid disrupting user experience
      });
    };

    trackVisit();
  }, [db, user]);

  return null;
}
