import type { Metadata } from "next";
import { AccountWorkspace } from "./account-workspace";

export const metadata: Metadata = { title: "Account Overview" };

export default function AccountPage() {
  return <AccountWorkspace section="overview" />;
}
