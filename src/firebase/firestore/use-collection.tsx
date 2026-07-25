
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
        // Advanced path extraction strategy
        let pathString = 'restricted_path';
        try {
          const q = query as any;
          // Check for standard CollectionReference/Query path properties
          if (q.path) {
            pathString = q.path;
          } else if (q._query?.path?.segments) {
            pathString = q._query.path.segments.join('/');
          } else if (q._query?.path) {
            pathString = q._query.path.toString();
          } else if (q.converter?._query?.path?.segments) {
            pathString = q.converter._query.path.segments.join('/');
          }
        } catch (e) {
          pathString = 'unknown_collection';
        }
        
        const permissionError = new FirestorePermissionError({
          path: pathString,
          operation: 'list',
        });
        
        const auth = getAuth();
        const lowerPath = pathString.toLowerCase();
        
        // Comprehensive list of public-facing paths that should not trigger blocking overlays
        const publicPaths = [
          'occasions', 
          'events', 
          'memberprofiles', 
          'leadership', 
          'gallery', 
          'public_complaints', 
          'terminatedmembers',
          'activity_events'
        ];

        const isPublicPath = publicPaths.some(p => lowerPath.includes(p));

        // Administrative policy: Only emit to global listener for authenticated staff on restricted data
        if (auth.currentUser && !isPublicPath) {
          errorEmitter.emit('permission-error', permissionError);
        }
        
        // Set empty result on failure to prevent stale data UI
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
