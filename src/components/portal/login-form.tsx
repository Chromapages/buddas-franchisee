"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { firebaseAuth, isFirebaseClientConfigured } from "@/src/lib/firebase/client";

const establishPortalSession = async (idToken: string) => {
  const response = await fetch("/api/auth/firebase-session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }) });
  if (!response.ok) throw new Error("Your account could not start an Operator Workspace session.");
};

export const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState("");

  const finishSignIn = async (getToken: () => Promise<string>) => {
    setIsPending(true); setMessage("");
    try { await establishPortalSession(await getToken()); router.replace("/portal"); router.refresh(); }
    catch { setMessage("Sign-in succeeded, but this account is not authorized for the Operator Workspace."); }
    finally { setIsPending(false); }
  };

  const signInWithEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firebaseAuth) return setMessage("Firebase authentication is not configured.");
    try { const credential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password); await finishSignIn(() => credential.user.getIdToken()); }
    catch { setMessage("We could not sign you in with that email and password."); }
  };

  const signInWithGoogle = async () => {
    if (!firebaseAuth) return setMessage("Firebase authentication is not configured.");
    try { const credential = await signInWithPopup(firebaseAuth, new GoogleAuthProvider()); await finishSignIn(() => credential.user.getIdToken()); }
    catch { setMessage("Google sign-in was not completed."); }
  };

  return <form onSubmit={signInWithEmail} className="w-full rounded-2xl border border-bds-teal-dark/15 bg-white p-6 shadow-sm space-y-6 sm:p-8">
    <p className="text-sm leading-relaxed text-bds-cocoa/80">Use the Firebase account assigned to your operator profile.</p>
    {message ? <div role="alert" className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"><AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />{message}</div> : null}
    <div><label htmlFor="email" className="operator-login-label block mb-2">Operator Email Address *</label><input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" className="w-full rounded-xl border border-bds-teal-dark/20 bg-bds-cream/50 px-4 py-3.5 text-base font-semibold text-bds-teal-dark focus:outline-none focus:ring-2 focus:ring-bds-action-primary" placeholder="you@company.com" /></div>
    <div><label htmlFor="password" className="operator-login-label block mb-2">Password *</label><div className="relative"><input id="password" type={isPasswordVisible ? "text" : "password"} required value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="w-full rounded-xl border border-bds-teal-dark/20 bg-bds-cream/50 px-4 py-3.5 pr-20 text-base font-semibold text-bds-teal-dark focus:outline-none focus:ring-2 focus:ring-bds-action-primary" /><button type="button" onClick={() => setIsPasswordVisible((value) => !value)} aria-label={isPasswordVisible ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 -translate-y-1/2 min-h-11 min-w-11 text-bds-teal-dark">{isPasswordVisible ? <EyeOff className="mx-auto h-5 w-5" /> : <Eye className="mx-auto h-5 w-5" />}</button></div><Link href="/franchise/login/reset" className="mt-2 inline-flex text-sm font-semibold text-bds-teal-dark underline underline-offset-4">Forgot password?</Link></div>
    <button type="submit" disabled={isPending || !isFirebaseClientConfigured()} className="btn-primary min-h-11 w-full py-3 text-base font-semibold">{isPending ? "Signing in…" : "Sign In"}</button>
    <div className="relative text-center text-xs text-bds-cocoa/60 before:absolute before:inset-x-0 before:top-1/2 before:border-t before:border-bds-cream"><span className="relative bg-white px-3">or</span></div>
    <button type="button" onClick={signInWithGoogle} disabled={isPending || !isFirebaseClientConfigured()} className="btn-outline min-h-11 w-full py-3 text-base font-semibold">Continue with Google</button>
  </form>;
};
