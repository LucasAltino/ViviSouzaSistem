import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB5QGmRuyjxw3zq_JvfYrCEjLmeOazlwOc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "vivisouza.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "vivisouza",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "vivisouza.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "113239228856",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:113239228856:web:ea09790a682e61e1a70f4d",
};

// Check if variables are valid and not placeholders
export const isFirebaseConfigured = 
  !!firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'seu_api_key_aqui' &&
  !!firebaseConfig.projectId;

let app;
let db: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    console.log('🔥 Firebase inicializado com sucesso.');
  } catch (error) {
    console.error('❌ Erro ao inicializar o Firebase:', error);
  }
} else {
  console.log('⚠️ Firebase não configurado. Utilizando LocalStorage local.');
}

export { db };
export default db;
