'use client';

import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { initializeFirebase } from './init';
import { FirebaseProvider } from './provider';

/**
 * FirebaseClientProvider: High-fidelity multi-app session provider.
 * Intelligently switches the Firebase context based on the active route.
 * 
 * [RESTORED]: Path-aware session inheritance for mirrors.
 * If the page is running in an iframe inside the Admin Portal, it inherits the AdminTerminal session
 * to enable administrative controls (Edit/Delete) in the Public Site View.
 */
export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Determine the isolated session name based on the portal context
  const sessionName = useMemo(() => {
    if (typeof window !== 'undefined') {
      // Direct access via /internal
      if (pathname?.startsWith('/internal')) return 'AdminTerminal';
      
      // Direct access via /investigator
      if (pathname?.startsWith('/investigator')) return 'InvestigatorTerminal';

      // [SESSION INHERITANCE]: Check if this is a mirror inside the Admin Terminal
      // This allows Root Admin to see Edit/Delete buttons in the iframe view
      try {
        if (window.self !== window.top && window.top.location.pathname.startsWith('/internal')) {
          return 'AdminTerminal';
        }
      } catch (e) {
        // Safe fallback for cross-origin or restricted environments
      }
    }
    
    return undefined; // [DEFAULT] session for public/members
  }, [pathname]);

  const { app, auth, db } = useMemo(() => initializeFirebase(sessionName), [sessionName]);

  return (
    <FirebaseProvider firebaseApp={app} firestore={db} auth={auth}>
      {children}
    </FirebaseProvider>
  );
}
