import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const isConfigured =
  !!firebaseConfig.apiKey &&
  !!firebaseConfig.databaseURL &&
  !firebaseConfig.databaseURL.includes('your_project_id');

export const firebaseReady = isConfigured;

let app, db, auth;

if (isConfigured) {
  app  = initializeApp(firebaseConfig);
  db   = getDatabase(app);
  auth = getAuth(app);
} else {
  db   = null;
  auth = null;
}

export { db, auth };
export const signInAnon = () => {
  if (!auth) throw new Error('Firebase not configured');
  return signInAnonymously(auth);
};
export { onAuthStateChanged };
