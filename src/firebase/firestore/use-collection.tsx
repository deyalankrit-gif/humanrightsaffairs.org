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
 * Optimized for robust synchronization across public and administrative views.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Reset state when query changes or becomes null
    if (!query) {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }

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
        // Robust path extraction for both CollectionReference and Query objects
        let pathString = 'restricted_path';
        try {
          if ('path' in query) {
            pathString = (query as any).path;
          } else if ('_query' in query && (query as any)._query.path) {
            pathString = (query as any)._query.path.toString();
          }
        } catch (e) {
          pathString = 'unknown_path';
        }
        
        const permissionError = new FirestorePermissionError({
          path: pathString,
          operation: 'list',
        });
        
        const auth = getAuth();
        const lowerPath = pathString.toLowerCase();
        
        // Define public-facing paths that should never trigger administrative blocking overlays
        const isPublicPath = lowerPath.includes('occasions') || 
                           lowerPath.includes('events') || 
                           lowerPath.includes('memberprofiles') ||
                           lowerPath.includes('leadership') ||
                           lowerPath.includes('gallery') ||
                           lowerPath.includes('public_complaints') ||
                           lowerPath.includes('terminatedmembers');

        // Only emit to the global listener if a user is authenticated and the path is restricted
        if (auth.currentUser && !isPublicPath) {
          errorEmitter.emit('permission-error', permissionError);
        }
        
        setData([]); 
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
