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

export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    // Capture the path from the query object, handling different SDK internal structures
    const pathString = (query as any).path || (query as any)._query?.path?.toString() || '';
    const auth = getAuth();
    const path = pathString.toLowerCase();
    
    // 🛡️ SECURITY INTERCEPT:
    // Define paths that are strictly for authorized personnel only.
    // Public paths are exempted to prevent hangs during auth resolution for general site visitors.
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

    // If the path is restricted and we don't have a stable Auth session, halt immediately.
    if (isRestrictedPath && !auth.currentUser) {
      setLoading(false);
      return;
    }

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
        
        // Only emit the error if it's a genuine permission failure on a sensitive path
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
