'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  onSnapshot, 
  Query, 
  DocumentData, 
  QuerySnapshot 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

/**
 * useCollection Hook: Provides real-time data from a Firestore collection or query.
 * Updated for extreme robustness in real-time synchronization across public and administrative views.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If no query is provided, signal that we are not loading but have no data
    if (!query) {
      setLoading(false);
      setData(null);
      return;
    }

    // Always reset loading state when a new query is initialized
    setLoading(true);

    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        const docs = snapshot.docs.map((doc) => ({
          ...(doc.data() as any),
          id: doc.id,
        }));
        setData(docs);
        setError(null);
        setLoading(false);
      },
      async (serverError) => {
        // Robust path identification for error suppression on public collections
        const pathString = (query as any).path || (query as any)._query?.path?.toString() || 'unknown';
        const permissionError = new FirestorePermissionError({
          path: pathString,
          operation: 'list',
        });
        
        const auth = getAuth();
        const path = pathString.toLowerCase();
        
        // Public collections should never trigger the administrative error overlay
        const isPublicPath = path.includes('occasions') || 
                           path.includes('events') || 
                           path.includes('memberprofiles') ||
                           path.includes('leadership') ||
                           path.includes('gallery') ||
                           path.includes('terminatedmembers');

        // Only emit to the global listener for restricted administrative failures
        if (auth.currentUser && !isPublicPath) {
          errorEmitter.emit('permission-error', permissionError);
        }
        
        setData([]); // Clear data on error to prevent stale displays
        setError(permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}

export function useMemoFirebase<T>(factory: () => T, deps: any[]): T {
  return useMemo(factory, deps);
}
