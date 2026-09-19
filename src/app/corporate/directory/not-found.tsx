import Link from "next/link";
import { EmptyState } from "@/src/components/corporate/corporate-ui";
export default function DirectoryNotFound() { return <EmptyState title="Directory record not found" description="The record may be outside your permitted scope." action={<Link href="/corporate/directory" className="corporate-button-secondary">Return to directory</Link>} />; }
