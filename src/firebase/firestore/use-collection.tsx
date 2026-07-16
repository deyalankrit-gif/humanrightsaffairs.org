'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  Query, 
  DocumentData, 
  QuerySnapshot 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

/**
 * useCollection Hook: Provides real-time data from a Firestore collection or query.
 * Updated to handle public vs. restricted paths and ensure stable loading state transitions.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If no query is provided (e.g. database not yet initialized), halt and signal ready
    if (!query) {
      setLoading(false);
      return;
    }

    // Reset loading state for new query initialization
    setLoading(true);

    // Extract path for security intercept logic
    const pathString = (query as any).path || (query as any)._query?.path?.toString() || '';
    const auth = getAuth();
    const path = pathString.toLowerCase();
    
    // 🛡️ SECURITY INTERCEPT:
    // Ensure public paths are readable without auth to prevent synchronization hangs for guests.
    const isPublicPath = path.includes('occasions') || 
                       path.includes('events') || 
                       path.includes('memberprofiles') ||
                       path.includes('leadership') ||
                       path.includes('gallery') ||
                       path.includes('terminatedmembers');

    const isRestrictedPath = !isPublicPath && (
                             path.includes('visitors') || 
                             path.includes('users') || 
                             path.includes('expenses') || 
                             path.includes('accounts') || 
                             path.includes('inventory') || 
                             path.includes('vendors') ||
                             path.includes('donations') ||
                             path.includes('applications') ||
                             path.includes('grievances'));

    // Block restricted paths if no active authenticated session exists
    if (isRestrictedPath && !auth.currentUser) {
      setLoading(false);
      return;
    }

    // Establish real-time listener
    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setData(docs);
        setError(null);
        setLoading(false);
      },
      async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: pathString || 'unknown',
          operation: 'list',
        });
        
        // Emit error only for genuine permission failures on non-public data
        if (auth.currentUser && !isPublicPath) {
          errorEmitter.emit('permission-error', permissionError);
        }
        
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
