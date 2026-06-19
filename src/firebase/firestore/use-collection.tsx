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
    const isRestrictedPath = pathString.includes('visitors') || 
                             pathString.includes('users') || 
                             pathString.includes('expenses') || 
                             pathString.includes('accounts') || 
                             pathString.includes('inventory') || 
                             pathString.includes('vendors') ||
                             pathString.includes('donations');

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
        setError(null); // Clear any lingering error state upon a successful stream fetch
        setLoading(false);
      },
      async (serverError) => {
        // Safe Catch: Prevent internal collection streams from breaking global authentication screens
        console.warn(`Firestore stream halted cleanly for path: ${pathString}`, serverError.message);
        
        const permissionError = new FirestorePermissionError({
          path: pathString || 'unknown',
          operation: 'list',
        });
        
        errorEmitter.emit('permission-error', permissionError);
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
