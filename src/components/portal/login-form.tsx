"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  getMultiFactorResolver,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  signInWithEmailAndPassword,
  signInWithPopup,
  TotpMultiFactorGenerator,
  type MultiFactorResolver,
  type User,
} from "firebase/auth";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { firebaseAuth, isFirebaseClientConfigured } from "@/src/lib/firebase/client";

const establishPortalSession = async (idToken: string, workspace: "operator" | "corporate") => {
  const response = await fetch("/api/auth/firebase-session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken, workspace }) });
  const result = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) throw new Error(result.error || "This identity is not assigned to the requested Budda's workspace.");
};

export const LoginForm = ({ destination = "/portal" }: { destination?: "/portal" | "/corporate" }) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState("");
  const [resolver, setResolver] = useState<MultiFactorResolver | null>(null);
  const [factorIndex, setFactorIndex] = useState(0);
  const [verificationId, setVerificationId] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const recaptcha = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => () => recaptcha.current?.clear(), []);

  const handleAutofillDemo = () => {
    if (destination === "/corporate") {
      setEmail("demo.corporate@buddasbakery.com");
    } else {
      setEmail("demo.operator@buddasbakery.com");
    }
    setPassword("BuddaDemo2026!");
    setMessage("");
  };

  const finishSignIn = async (user: User) => {
    await establishPortalSession(await user.getIdToken(true), destination === "/corporate" ? "corporate" : "operator");
    window.location.assign(destination);
  };

  const handleAuthenticationError = (error: unknown, fallback: string) => {
    if (firebaseAuth && (error as { code?: string })?.code === "auth/multi-factor-auth-required") {
      const nextResolver = getMultiFactorResolver(firebaseAuth, error as never);
      setResolver(nextResolver);
      setFactorIndex(0);
      setVerificationId("");
      setVerificationCode("");
      setMessage("Complete the additional verification required for this account.");
      return;
    }
    const errorCode = (error as { code?: string })?.code;
    if (errorCode === "auth/invalid-credential" || errorCode === "auth/wrong-password" || errorCode === "auth/user-not-found") {
      setMessage("Invalid email or password. Please verify your credentials and try again.");
      return;
    }
    if (errorCode === "auth/too-many-requests") {
      setMessage("Too many failed attempts. Please wait a moment before trying again.");
      return;
    }
    const rawMessage = error instanceof Error ? error.message : fallback;
    setMessage(rawMessage || fallback);
  };

  const signInWithEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firebaseAuth) return setMessage("Firebase authentication is not configured.");
    setIsPending(true); setMessage("");
    try { const credential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password); await finishSignIn(credential.user); }
    catch (error) { handleAuthenticationError(error, "We could not sign you in with that email and password."); }
    finally { setIsPending(false); }
  };

  const signInWithGoogle = async () => {
    if (!firebaseAuth) return setMessage("Firebase authentication is not configured.");
    setIsPending(true); setMessage("");
    try { const credential = await signInWithPopup(firebaseAuth, new GoogleAuthProvider()); await finishSignIn(credential.user); }
    catch (error) { handleAuthenticationError(error, "Google sign-in was not completed."); }
    finally { setIsPending(false); }
  };

  const selectedFactor = resolver?.hints[factorIndex];
  const sendPhoneCode = async () => {
    if (!firebaseAuth || !resolver || !selectedFactor || selectedFactor.factorId !== PhoneMultiFactorGenerator.FACTOR_ID) return;
    setIsPending(true); setMessage("");
    try {
      recaptcha.current?.clear();
      recaptcha.current = new RecaptchaVerifier(firebaseAuth, "mfa-recaptcha", { size: "invisible" });
      const provider = new PhoneAuthProvider(firebaseAuth);
      setVerificationId(await provider.verifyPhoneNumber({ multiFactorHint: selectedFactor, session: resolver.session }, recaptcha.current));
      setMessage("Verification code sent. Enter it below to complete sign-in.");
    } catch { setMessage("The verification code could not be sent. Choose another enrolled factor or try again."); }
    finally { setIsPending(false); }
  };

  const completeMultiFactorSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!resolver || !selectedFactor || !verificationCode.trim()) return;
    setIsPending(true); setMessage("");
    try {
      const assertion = selectedFactor.factorId === PhoneMultiFactorGenerator.FACTOR_ID
        ? PhoneMultiFactorGenerator.assertion(PhoneAuthProvider.credential(verificationId, verificationCode.trim()))
        : selectedFactor.factorId === TotpMultiFactorGenerator.FACTOR_ID
          ? TotpMultiFactorGenerator.assertionForSignIn(selectedFactor.uid, verificationCode.trim())
          : null;
      if (!assertion) throw new Error("This enrolled factor is not supported by the workspace.");
      const credential = await resolver.resolveSignIn(assertion);
      await finishSignIn(credential.user);
    } catch (error) { setMessage(error instanceof Error ? error.message : "The verification code was not accepted."); }
    finally { setIsPending(false); }
  };

  if (resolver && selectedFactor) return <form onSubmit={completeMultiFactorSignIn} className="w-full rounded-2xl border border-bds-teal-dark/15 bg-white p-6 shadow-sm space-y-6 sm:p-8">
    <div><p className="operator-login-label">Additional verification</p><p className="mt-2 text-sm leading-relaxed text-bds-cocoa/80">Use an enrolled factor to finish signing in to the {destination === "/corporate" ? "Corporate Operations" : "Operator"} Workspace.</p></div>
    {message ? <div role="status" aria-live="polite" className="rounded-xl border border-bds-teal-dark/20 bg-bds-cream p-4 text-sm text-bds-teal-dark">{message}</div> : null}
    {resolver.hints.length > 1 ? <label className="block"><span className="operator-login-label block mb-2">Verification method</span><select value={factorIndex} onChange={(event) => { setFactorIndex(Number(event.target.value)); setVerificationId(""); setVerificationCode(""); }} className="w-full rounded-xl border border-bds-teal-dark/20 bg-bds-cream/50 px-4 py-3.5">{resolver.hints.map((hint, index) => <option key={hint.uid} value={index}>{hint.displayName || `${hint.factorId} ending ${hint.uid.slice(-4)}`}</option>)}</select></label> : null}
    {selectedFactor.factorId === PhoneMultiFactorGenerator.FACTOR_ID && !verificationId ? <button type="button" onClick={sendPhoneCode} disabled={isPending} className="btn-primary min-h-11 w-full">{isPending ? "Sending…" : "Send verification code"}</button> : null}
    {(verificationId || selectedFactor.factorId === TotpMultiFactorGenerator.FACTOR_ID) ? <label className="block"><span className="operator-login-label block mb-2">Verification code</span><input type="text" inputMode="numeric" autoComplete="one-time-code" required value={verificationCode} onChange={(event) => setVerificationCode(event.target.value)} className="w-full rounded-xl border border-bds-teal-dark/20 bg-bds-cream/50 px-4 py-3.5 text-base font-semibold text-bds-teal-dark focus:outline-none focus:ring-2 focus:ring-bds-action-primary" /></label> : null}
    <div id="mfa-recaptcha" />
    {(verificationId || selectedFactor.factorId === TotpMultiFactorGenerator.FACTOR_ID) ? <button type="submit" disabled={isPending} className="btn-primary min-h-11 w-full">{isPending ? "Verifying…" : "Complete sign-in"}</button> : null}
    <button type="button" onClick={() => { setResolver(null); setMessage(""); }} className="btn-outline min-h-11 w-full">Back to sign-in</button>
  </form>;

  return <form onSubmit={signInWithEmail} className="w-full rounded-2xl border border-bds-teal-dark/15 bg-white p-6 shadow-sm space-y-6 sm:p-8">
    <p className="text-sm leading-relaxed text-bds-cocoa/80">Use the Firebase account assigned to your {destination === "/corporate" ? "corporate operations" : "operator"} profile.</p>
    {process.env.NODE_ENV !== "production" ? (
      <div className="flex items-center justify-between gap-2 rounded-xl border border-bds-teal-dark/15 bg-bds-cream/60 px-4 py-3 text-xs text-bds-cocoa/90">
        <div>
          <span className="font-bold text-bds-teal-dark">Demo account: </span>
          <span className="font-mono text-bds-cocoa/80">{destination === "/corporate" ? "demo.corporate@buddasbakery.com" : "demo.operator@buddasbakery.com"}</span>
        </div>
        <button
          type="button"
          onClick={handleAutofillDemo}
          className="shrink-0 rounded-lg bg-bds-teal-dark/10 px-2.5 py-1 font-semibold text-bds-teal-dark hover:bg-bds-teal-dark/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-action-primary"
          aria-label="Autofill demo credentials"
        >
          Autofill
        </button>
      </div>
    ) : null}
    {message ? <div role="alert" className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"><AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />{message}</div> : null}
    <div><label htmlFor="email" className="operator-login-label block mb-2">Email Address *</label><input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" className="w-full rounded-xl border border-bds-teal-dark/20 bg-bds-cream/50 px-4 py-3.5 text-base font-semibold text-bds-teal-dark focus:outline-none focus:ring-2 focus:ring-bds-action-primary" placeholder="you@company.com" /></div>
    <div><label htmlFor="password" className="operator-login-label block mb-2">Password *</label><div className="relative"><input id="password" type={isPasswordVisible ? "text" : "password"} required value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="w-full rounded-xl border border-bds-teal-dark/20 bg-bds-cream/50 px-4 py-3.5 pr-20 text-base font-semibold text-bds-teal-dark focus:outline-none focus:ring-2 focus:ring-bds-action-primary" /><button type="button" onClick={() => setIsPasswordVisible((value) => !value)} aria-label={isPasswordVisible ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 -translate-y-1/2 min-h-11 min-w-11 text-bds-teal-dark">{isPasswordVisible ? <EyeOff className="mx-auto h-5 w-5" /> : <Eye className="mx-auto h-5 w-5" />}</button></div><Link href="/franchise/login/reset" className="mt-2 inline-flex text-sm font-semibold text-bds-teal-dark underline underline-offset-4">Forgot password?</Link></div>
    <button type="submit" disabled={isPending || !isFirebaseClientConfigured()} className="btn-primary min-h-11 w-full py-3 text-base font-semibold">{isPending ? "Signing in…" : "Sign In"}</button>
    <div className="relative text-center text-xs text-bds-cocoa/60 before:absolute before:inset-x-0 before:top-1/2 before:border-t before:border-bds-cream"><span className="relative bg-white px-3">or</span></div>
    <button type="button" onClick={signInWithGoogle} disabled={isPending || !isFirebaseClientConfigured()} className="btn-outline min-h-11 w-full py-3 text-base font-semibold">Continue with Google</button>
  </form>;
};
