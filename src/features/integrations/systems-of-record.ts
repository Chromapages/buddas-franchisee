export type SystemOfRecordDomain = "pos_sales" | "inventory" | "suppliers" | "payments" | "crm" | "identity";

export type SystemOfRecordContract = {
  domain: SystemOfRecordDomain;
  owner: string;
  authority: string;
  configurationKey: string;
  fallback: "UNAVAILABLE" | "MANUAL_VERIFIED_EVIDENCE";
  reportingEligible: boolean;
};

/**
 * Platform-wide ownership contract. A configured URL or a local projection never
 * becomes authoritative by itself; the named source must provide durable evidence.
 */
export const SYSTEMS_OF_RECORD: Record<SystemOfRecordDomain, SystemOfRecordContract> = {
  pos_sales: { domain: "pos_sales", owner: "Finance and restaurant operations", authority: "Approved POS transaction ledger", configurationKey: "POS_SYSTEM_OF_RECORD", fallback: "UNAVAILABLE", reportingEligible: false },
  inventory: { domain: "inventory", owner: "Supply chain operations", authority: "Approved inventory ledger", configurationKey: "INVENTORY_SYSTEM_OF_RECORD", fallback: "UNAVAILABLE", reportingEligible: false },
  suppliers: { domain: "suppliers", owner: "Supply chain operations", authority: "Supplier acknowledgment and reconciliation evidence stored on the order", configurationKey: "SUPPLIER_SYSTEM_OF_RECORD", fallback: "MANUAL_VERIFIED_EVIDENCE", reportingEligible: true },
  payments: { domain: "payments", owner: "Finance", authority: "Approved payment processor settlement ledger", configurationKey: "PAYMENT_SYSTEM_OF_RECORD", fallback: "UNAVAILABLE", reportingEligible: false },
  crm: { domain: "crm", owner: "Franchise development", authority: "Durable inquiry record plus configured CRM delivery receipt", configurationKey: "INQUIRY_DELIVERY_URL", fallback: "UNAVAILABLE", reportingEligible: false },
  identity: { domain: "identity", owner: "Platform administration", authority: "Firebase Authentication token plus server-owned membership record", configurationKey: "FIREBASE_PROJECT_ID", fallback: "UNAVAILABLE", reportingEligible: false },
};

export const getSystemOfRecordContract = (domain: SystemOfRecordDomain): SystemOfRecordContract => SYSTEMS_OF_RECORD[domain];
