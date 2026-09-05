import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

const hasInlineCredentials = Boolean(projectId && clientEmail && privateKey);
const hasApplicationCredentials = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);
export const isFirebaseAdminConfigured = () => hasInlineCredentials || hasApplicationCredentials;
const app = isFirebaseAdminConfigured()
  ? (getApps()[0] || initializeApp({ credential: hasInlineCredentials ? cert({ projectId, clientEmail, privateKey }) : applicationDefault() }))
  : null;
export const firebaseAdminAuth = app ? getAuth(app) : null;
export const firebaseDb = app ? getFirestore(app) : null;
