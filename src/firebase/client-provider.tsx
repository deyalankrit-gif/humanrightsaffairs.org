'use client';

import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { initializeFirebase } from './init';
import { FirebaseProvider } from './provider';

/**
 * FirebaseClientProvider: High-fidelity multi-app session provider.
 * Intelligently switches the Firebase context based on the active route to ensure
 * total session isolation between Administrative, Investigative, and Public portals.
 * 
 * This prevents cross-terminal session conflicts (Root vs Investigator).
 */
export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Determine the isolated session name based on the portal context
  const sessionName = useMemo(() => {
    if (pathname?.startsWith('/internal')) return 'AdminTerminal';
    if (pathname?.startsWith('/investigator')) return 'InvestigatorTerminal';
    return undefined; // [DEFAULT] session for public/members
  }, [pathname]);

  const { app, auth, db } = useMemo(() => initializeFirebase(sessionName), [sessionName]);

  return (
    <FirebaseProvider firebaseApp={app} firestore={db} auth={auth}>
      {children}
    </FirebaseProvider>
  );
}
