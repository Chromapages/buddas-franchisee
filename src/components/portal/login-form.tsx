"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getMultiFactorResolver,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  signInWithEmailAndPassword,
  TotpMultiFactorGenerator,
  type MultiFactorResolver,
  type User,
} from "firebase/auth";
import { AlertCircle, ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
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

  if (resolver && selectedFactor) return <form onSubmit={completeMultiFactorSignIn} className="operator-auth-form operator-auth-mfa">
    <div><p className="operator-login-label">Additional verification</p><p className="mt-2 text-sm leading-relaxed text-bds-cocoa/80">Use an enrolled factor to finish signing in to the {destination === "/corporate" ? "Corporate Operations" : "Operator"} Workspace.</p></div>
    {message ? <div role="status" aria-live="polite" className="rounded-xl border border-bds-teal-dark/20 bg-bds-cream p-4 text-sm text-bds-teal-dark">{message}</div> : null}
    {resolver.hints.length > 1 ? <label className="block"><span className="operator-login-label block mb-2">Verification method</span><select value={factorIndex} onChange={(event) => { setFactorIndex(Number(event.target.value)); setVerificationId(""); setVerificationCode(""); }} className="w-full rounded-xl border border-bds-teal-dark/20 bg-bds-cream/50 px-4 py-3.5">{resolver.hints.map((hint, index) => <option key={hint.uid} value={index}>{hint.displayName || `${hint.factorId} ending ${hint.uid.slice(-4)}`}</option>)}</select></label> : null}
    {selectedFactor.factorId === PhoneMultiFactorGenerator.FACTOR_ID && !verificationId ? <button type="button" onClick={sendPhoneCode} disabled={isPending} className="btn-primary min-h-11 w-full">{isPending ? "Sending…" : "Send verification code"}</button> : null}
    {(verificationId || selectedFactor.factorId === TotpMultiFactorGenerator.FACTOR_ID) ? <label className="block"><span className="operator-login-label block mb-2">Verification code</span><input type="text" inputMode="numeric" autoComplete="one-time-code" required value={verificationCode} onChange={(event) => setVerificationCode(event.target.value)} className="w-full rounded-xl border border-bds-teal-dark/20 bg-bds-cream/50 px-4 py-3.5 text-base font-semibold text-bds-teal-dark focus:outline-none focus:ring-2 focus:ring-bds-action-primary" /></label> : null}
    <div id="mfa-recaptcha" />
    {(verificationId || selectedFactor.factorId === TotpMultiFactorGenerator.FACTOR_ID) ? <button type="submit" disabled={isPending} className="btn-primary min-h-11 w-full">{isPending ? "Verifying…" : "Complete sign-in"}</button> : null}
    <button type="button" onClick={() => { setResolver(null); setMessage(""); }} className="btn-outline min-h-11 w-full">Back to sign-in</button>
  </form>;

  return <form onSubmit={signInWithEmail} className="operator-auth-form">
    {message ? <div role="alert" className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"><AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />{message}</div> : null}
    <div className="operator-auth-field"><label htmlFor="email">Email address</label><div><Mail aria-hidden="true" /><input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" placeholder="name@buddasbakery.com" /></div></div>
    <div className="operator-auth-field"><label htmlFor="password">Password</label><div><LockKeyhole aria-hidden="true" /><input id="password" type={isPasswordVisible ? "text" : "password"} required value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="Enter your password" /><button type="button" onClick={() => setIsPasswordVisible((value) => !value)} aria-label={isPasswordVisible ? "Hide password" : "Show password"}>{isPasswordVisible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}</button></div><Link href="/franchise/login/reset" className="operator-auth-forgot">Forgot password?</Link></div>
    <button type="submit" disabled={isPending || !isFirebaseClientConfigured()} className="operator-auth-submit">{isPending ? "Signing in…" : "Sign In"}<ArrowRight aria-hidden="true" /></button>
  </form>;
};
