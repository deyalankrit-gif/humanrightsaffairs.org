
'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  onSnapshot, 
  Query, 
  DocumentData, 
  QuerySnapshot 
} from 'firebase/firestore';
import { useAuth } from '../provider';
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
  const auth = useAuth();

  useEffect(() => {
    // Reset state when query changes or becomes null to ensure real-time responsiveness
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
        // Robust path extraction strategy for accurate security auditing
        let pathString = 'restricted_collection';
        try {
          const q = query as any;
          if (q._query && q._query.path) {
            pathString = q._query.path.segments.join('/');
          } else if (q.path) {
            pathString = q.path;
          }
        } catch (e) {
          pathString = 'unidentified_stream';
        }
        
        const permissionError = new FirestorePermissionError({
          path: pathString,
          operation: 'list',
        });
        
        const lowerPath = pathString.toLowerCase();
        
        // Exemption list for public-facing data streams or common registry nodes
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
          'ai_announcements',
          'visitors',
          'feedback',
          'materials',
          'vendors',
          'current_news_state',
          'finance_donors',
          'finance_summary',
          'website_scans',
          'seo_tasks'
        ];

        const isSilentPath = silentPaths.some(p => lowerPath.includes(p));

        // Administrative policy: Only emit to global listener for authenticated staff on restricted data
        if (auth.currentUser && !isSilentPath) {
          errorEmitter.emit('permission-error', permissionError);
        }
        
        // Return empty result to maintain UI stability during transition
        setData([]); 
        setError(permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query, auth]);

  return { data, loading, error };
}

export function useMemoFirebase<T>(factory: () => T, deps: any[]): T {
  return useMemo(factory, deps);
}
