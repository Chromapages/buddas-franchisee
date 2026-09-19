import Link from "next/link";
import type { ReactNode } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, LoaderCircle, LockKeyhole } from "lucide-react";

export function CorporatePageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return <header className="corporate-page-header"><div><p>{eyebrow}</p><h1>{title}</h1><div className="corporate-page-description">{description}</div></div>{actions ? <div className="corporate-page-actions">{actions}</div> : null}</header>;
}

export function CorporatePanel({ title, eyebrow, description, action, children, className = "" }: { title: string; eyebrow?: string; description?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`corporate-panel ${className}`.trim()}><header className="corporate-panel-header"><div>{eyebrow ? <p>{eyebrow}</p> : null}<h2>{title}</h2>{description ? <span>{description}</span> : null}</div>{action}</header>{children}</section>;
}

export function StatusBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "attention" | "success" | "waiting" | "danger" }) {
  return <span className={`corporate-status corporate-status-${tone}`}>{children}</span>;
}

export type WorkRow = {
  href: string;
  reference: string;
  type: string;
  summary: string;
  location: string;
  state: string;
  nextAction: string;
  owner: string;
  timing: string;
  tone?: "neutral" | "attention" | "success" | "waiting" | "danger";
};

export function WorkTable({ rows, caption = "Authorized work records", variant = "standard" }: { rows: WorkRow[]; caption?: string; variant?: "standard" | "dashboard" }) {
  if (rows.length === 0) return <EmptyState title="No work in this view" description="Try another filter or return when new records are assigned." />;
  const dashboard = variant === "dashboard";
  return <div className={`corporate-table-region${dashboard ? " corporate-dashboard-table-region" : ""}`} role="region" aria-label={caption} tabIndex={0}><table className={`corporate-table${dashboard ? " corporate-dashboard-work-table" : ""}`}><caption className="sr-only">{caption}</caption>{dashboard ? <colgroup><col className="corporate-dashboard-work-record" /><col className="corporate-dashboard-work-location" /><col className="corporate-dashboard-work-state" /><col className="corporate-dashboard-work-action" /><col className="corporate-dashboard-work-owner" /></colgroup> : null}<thead><tr><th scope="col">Record</th><th scope="col">Location</th><th scope="col">State</th><th scope="col">Next action</th><th scope="col">Owner</th>{!dashboard ? <th scope="col">Due / age</th> : null}</tr></thead><tbody>{rows.map((row) => <tr key={`${row.type}-${row.reference}`}><th scope="row"><Link href={row.href}><small>{row.type} · {row.reference}</small><strong>{row.summary}</strong></Link></th><td>{row.location}</td><td><StatusBadge tone={row.tone}>{row.state}</StatusBadge>{dashboard ? <small className="corporate-dashboard-work-timing">{row.timing}</small> : null}</td><td>{row.nextAction}</td><td>{row.owner}</td>{!dashboard ? <td className="corporate-tabular">{row.timing}</td> : null}</tr>)}</tbody></table></div>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="corporate-state corporate-empty-state" role="status"><CheckCircle2 size={23} aria-hidden="true" /><div><h3>{title}</h3><p>{description}</p></div>{action}</div>;
}

export function ErrorState({ title, description, retryHref }: { title: string; description: string; retryHref: string }) {
  return <div className="corporate-state corporate-error-state" role="alert"><AlertCircle size={23} aria-hidden="true" /><div><h2>{title}</h2><p>{description}</p></div><Link href={retryHref}>Try again</Link></div>;
}

export function PermissionState({ description = "Your current corporate access does not include this workspace." }: { description?: string }) {
  return <div className="corporate-state corporate-permission-state" role="status"><LockKeyhole size={23} aria-hidden="true" /><div><h1>Access is limited</h1><p>{description} Ask an access steward if your responsibilities have changed.</p></div><Link href="/corporate/support">Get help</Link></div>;
}

export function LoadingState({ label }: { label: string }) {
  return <div className="corporate-loading" aria-busy="true"><LoaderCircle size={20} aria-hidden="true" /><span role="status">Loading {label}…</span></div>;
}

export function MetricLink({ href, label, value, detail, tone = "default" }: { href: string; label: string; value: string | number; detail: string; tone?: "default" | "attention" }) {
  return <Link href={href} className={`corporate-metric corporate-metric-${tone}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small><ArrowRight size={18} aria-hidden="true" /></Link>;
}

export function FilterBar({ children, resultCount }: { children: ReactNode; resultCount?: number }) {
  return <form className="corporate-filter-bar" method="get">{children}<button className="corporate-button-secondary" type="submit">Apply filters</button>{typeof resultCount === "number" ? <output aria-live="polite">{resultCount} record{resultCount === 1 ? "" : "s"}</output> : null}</form>;
}

export function DefinitionList({ items }: { items: Array<{ label: string; value: ReactNode }> }) {
  return <dl className="corporate-definition-list">{items.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>;
}

export function CorporateBreadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return <nav aria-label="Breadcrumb" className="corporate-breadcrumbs"><ol>{items.map((item, index) => <li key={item.label}>{index > 0 ? <span aria-hidden="true">/</span> : null}{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</li>)}</ol></nav>;
}
