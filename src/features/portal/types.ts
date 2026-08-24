export type PortalRole = "admin" | "franchisee";

export type PortalLocation = {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  franchiseeName: string;
  isOpen: boolean;
};

export type PortalProduct = {
  id: string;
  sku: string;
  name: string;
  category: "Bakery & Dough" | "Packaging" | "Signage & Uniforms" | "Equipment";
  description: string;
  packSize: string;
  leadTimeDays: number;
  isAvailable: boolean;
  price: number;
  slug: string;
};

export type PortalOrderItem = {
  sku: string;
  name: string;
  quantity: number;
  price: number;
};

export type PortalOrder = {
  id: string;
  locationId: string;
  createdAt: string;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  eta: string;
  total: number;
  invoiceId: string;
  items: PortalOrderItem[];
};

export type PortalResource = {
  id: string;
  title: string;
  category: "Operations Manuals" | "Brand & Marketing" | "Recipes & Prep" | "Equipment Guides";
  version: string;
  updatedAt: string;
  fileSize: string;
  downloadUrl: string;
  locationScope?: string[];
};

export type PortalSupportCase = {
  id: string;
  locationId: string;
  userEmail: string;
  subject: string;
  topic: string;
  details: string;
  status: "Open" | "In Review" | "Resolved";
  createdAt: string;
  updatedAt: string;
};

export type PortalAnnouncement = {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
  isUrgent?: boolean;
};
