import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

const hasInlineCredentials = Boolean(projectId && clientEmail && privateKey);
const hasApplicationCredentials = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || (projectId ? `${projectId}.firebasestorage.app` : undefined);
export const isFirebaseAdminConfigured = () => hasInlineCredentials || hasApplicationCredentials;
const app = isFirebaseAdminConfigured()
  ? (getApps()[0] || initializeApp({ credential: hasInlineCredentials ? cert({ projectId, clientEmail, privateKey }) : applicationDefault(), ...(storageBucket ? { storageBucket } : {}) }))
  : null;
export const firebaseAdminAuth = app ? getAuth(app) : null;
export const firebaseDb = app ? getFirestore(app) : null;
export const firebaseStorageBucket = app && storageBucket ? getStorage(app).bucket(storageBucket) : null;
