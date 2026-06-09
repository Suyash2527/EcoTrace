import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Hardcoded fallback values so the app always initialises, even if VITE_ env vars are absent
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            ?? 'AIzaSyC36EsxFMk2P8n8DlOdNahskU51GEayv-U',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        ?? 'ecotrace-de5c6.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         ?? 'ecotrace-de5c6',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     ?? 'ecotrace-de5c6.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '965734631284',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             ?? '1:965734631284:web:98477d97b03f04a677ce21',
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID     ?? 'G-X49LF52KLY',
};

export const app            = initializeApp(firebaseConfig);
export const auth           = getAuth(app);
export const db             = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
