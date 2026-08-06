
'use client';

import { useState, useEffect } from 'react';
import { 
  onSnapshot, 
  DocumentReference, 
  DocumentData, 
  DocumentSnapshot 
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

/**
 * useDoc Hook: Provides real-time data from a single Firestore document.
 * Optimized with a silent-path protocol to prevent public configurations 
 * from triggering disruptive error overlays.
 */
export function useDoc<T = DocumentData>(docRef: DocumentReference<T> | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docRef) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot: DocumentSnapshot<T>) => {
        setData(snapshot.exists() ? { ...snapshot.data()!, id: snapshot.id } : null);
        setLoading(false);
      },
      async (serverError) => {
        const pathString = docRef.path.toLowerCase();
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'get',
        });
        
        // Institutional Silent Path Protocol: Prevents public config nodes
        // from triggering the developer error overlay.
        const silentPaths = [
          'settings',
          'occasions', 
          'events', 
          'current_news',
          'memberprofiles', 
          'leadership', 
          'gallery', 
          'public_complaints', 
          'terminatedmembers',
          'activity_events',
          'donor_tiers',
          'donations',
          'ai_announcements'
        ];

        const isSilentPath = silentPaths.some(p => pathString.includes(p));

        if (!isSilentPath) {
          errorEmitter.emit('permission-error', permissionError);
        }
        
        setError(permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRef]);

  return { data, loading, error };
}
