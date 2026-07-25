
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
      (serverError: any) => {
        // Advanced path extraction strategy to provide meaningful context to the error overlay
        let pathString = 'restricted_collection';
        try {
          const q = query as any;
          
          // Strategy 1: Standard internal query path identification
          if (q._query && q._query.path && q._query.path.segments) {
            pathString = q._query.path.segments.join('/');
          }
          // Strategy 2: Direct path identification
          else if (q.path) {
            pathString = q.path;
          }
          // Strategy 3: Nested object identification
          else if (q.query && q.query.path && q.query.path.segments) {
            pathString = q.query.path.segments.join('/');
          }
        } catch (e) {
          pathString = 'unidentified_collection';
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
          'activity_events',
          'donor_tiers'
        ];

        const isPublicPath = publicPaths.some(p => lowerPath.includes(p));

        // Administrative policy: Only emit to global listener for authenticated staff on restricted data
        // This prevents the application from locking up for public users on secondary fetch failures.
        if (auth.currentUser && !isPublicPath) {
          errorEmitter.emit('permission-error', permissionError);
        }
        
        // Return empty result to maintain UI stability
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
