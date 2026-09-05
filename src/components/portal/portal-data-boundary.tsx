"use client";

import { Component, useState, useTransition } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCw } from "lucide-react";

type BoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type BoundaryState = { hasError: boolean };

class DataErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  public state: BoundaryState = { hasError: false };

  public static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    // Server modules log diagnostic details. Operators only receive the scoped recovery state.
  }

  public render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export const PortalDataBoundary = ({
  children,
  title,
  description,
  className = "",
}: {
  children: ReactNode;
  title: string;
  description: string;
  className?: string;
}) => {
  const router = useRouter();
  const [attempt, setAttempt] = useState(0);
  const [isPending, startTransition] = useTransition();

  const retry = () => {
    setAttempt((value) => value + 1);
    startTransition(() => router.refresh());
  };

  const fallback = (
    <section role="alert" className={`rounded-2xl border border-bds-teal-dark/15 bg-white p-6 shadow-sm sm:p-8 ${className}`}>
      <AlertCircle className="h-5 w-5 text-bds-teal-dark" aria-hidden="true" />
      <h3 className="mt-3 heading-minor text-bds-teal-dark">{title}</h3>
      <p className="mt-2 text-sm text-bds-cocoa/80">{description}</p>
      <button type="button" onClick={retry} disabled={isPending} className="btn-outline mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
        <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} aria-hidden="true" />
        {isPending ? "Retrying" : "Retry"}
      </button>
    </section>
  );

  return <DataErrorBoundary key={attempt} fallback={fallback}>{children}</DataErrorBoundary>;
};
