import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

/**
 * initializeFirebase: Core institutional utility for establishing Firebase connections.
 * Supports named application instances to enable independent authenticated sessions (Role Isolation).
 * 
 * @param name - Optional unique identifier for the application node (e.g. 'InvestigatorTerminal')
 */
export function initializeFirebase(name?: string) {
  let app: FirebaseApp;
  const targetName = name || '[DEFAULT]';
  const existingApp = getApps().find((a) => a.name === targetName);

  if (existingApp) {
    app = existingApp;
  } else {
    // FIX: Explicitly handle the initialization of named vs default apps
    // This ensures that different portals on the same domain use separate storage keys
    app = name ? initializeApp(firebaseConfig, name) : initializeApp(firebaseConfig);
  }

  const auth = getAuth(app);
  const db = getFirestore(app);
  
  return { app, auth, db };
}
