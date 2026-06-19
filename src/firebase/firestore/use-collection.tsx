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

    const pathString = (query as any)._query?.path?.toString() || '';
    const auth = getAuth();
    
    // 🛡️ COMPLETE SYSTEM SAFEGUARD:
    // If an unauthenticated or newly logging-in user attempts to touch protected collections,
    // intercept the request completely on the client side before it causes a backend snapshot crash.
    // We check for inclusions of restricted keywords in the collection path.
    const path = pathString.toLowerCase();
    const isRestrictedPath = path.includes('visitors') || 
                             path.includes('users') || 
                             path.includes('expenses') || 
                             path.includes('accounts') || 
                             path.includes('inventory') || 
                             path.includes('vendors') ||
                             path.includes('donations') ||
                             path.includes('applications') ||
                             path.includes('grievances');

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
        // Safe Catch: Prevent internal collection streams from breaking global navigation
        console.warn(`Firestore stream halted for path: ${pathString}`, serverError.message);
        
        const permissionError = new FirestorePermissionError({
          path: pathString || 'unknown',
          operation: 'list',
        });
        
        // Only emit the error if we are genuinely logged in and denied
        if (auth.currentUser) {
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
