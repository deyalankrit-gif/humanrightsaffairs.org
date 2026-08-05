import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

/**
 * initializeFirebase: Core institutional utility for establishing Firebase connections.
 * Supports named application instances to enable independent authenticated sessions (Auth Isolation).
 * 
 * [STABILITY]: Configures Firestore with long-polling to prevent "Unexpected Response" errors
 * caused by workstation proxy interference with streaming connections.
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
  
  // Initialize Firestore with long-polling for maximum stability in proxy environments
  // [STABILITY FIX]: Wrapped in a try-catch to safely handle cases where the instance 
  // is already active, which frequently occurs during hot-module replacement (HMR) 
  // or nested provider mount cycles.
  let db: Firestore;
  try {
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } catch (e) {
    // If Firestore is already initialized for this app node, retrieve the existing instance.
    // Note: Settings for an app's Firestore instance are locked after the first initialization call.
    db = getFirestore(app);
  }
  
  return { app, auth, db };
}
