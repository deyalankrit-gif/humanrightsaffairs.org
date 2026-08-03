import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

/**
 * initializeFirebase: Core institutional utility for establishing Firebase connections.
 * Supports named application instances to enable independent authenticated sessions (Auth Isolation).
 * 
 * @param name - Optional unique identifier for the application node (e.g. 'AdminTerminal')
 */
export function initializeFirebase(name?: string) {
  let app: FirebaseApp;
  const targetName = name || '[DEFAULT]';
  const existingApp = getApps().find((a) => a.name === targetName);

  if (existingApp) {
    app = existingApp;
  } else {
    // Isolate sessions by using named apps which creates distinct storage keys
    app = name ? initializeApp(firebaseConfig, name) : initializeApp(firebaseConfig);
  }

  const auth = getAuth(app);
  const db = getFirestore(app);
  
  return { app, auth, db };
}
