import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseClientConfigured = () => Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
export const firebaseClientApp = isFirebaseClientConfigured() ? (getApps()[0] || initializeApp(config)) : null;
export const firebaseAuth = firebaseClientApp ? getAuth(firebaseClientApp) : null;
