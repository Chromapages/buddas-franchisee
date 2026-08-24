import type {
  PortalAnnouncement,
  PortalLocation,
  PortalOrder,
  PortalProduct,
  PortalResource,
} from "./types";

export const portalLocations: PortalLocation[] = [
  {
    id: "HNL-014",
    name: "La'ie Origin Grill",
    code: "LAI-01",
    city: "La'ie",
    state: "HI",
    franchiseeName: "Keahi & Leilani Akana",
    isOpen: true,
  },
  {
    id: "OAH-207",
    name: "Kaka'ako Urban Kitchen",
    code: "HNL-02",
    city: "Honolulu",
    state: "HI",
    franchiseeName: "Oahu Hospitality Ventures LLC",
    isOpen: true,
  },
  {
    id: "SLC-302",
    name: "Sugar House Bakery & Grill",
    code: "SLC-01",
    city: "Salt Lake City",
    state: "UT",
    franchiseeName: "Wasatch Aloha Group",
    isOpen: true,
  },
];

export const portalProducts: PortalProduct[] = [
  {
    id: "prod-dough-50",
    sku: "DGH-BR50",
    name: "Proprietary Budda Roll Dough Base (50 lb)",
    category: "Bakery & Dough",
    description: "Signature sweet Hawaiian butter dough base. Formulated for high-yield, consistent proofing in commercial steam deck ovens.",
    packSize: "50 lb bulk bag",
    leadTimeDays: 4,
    isAvailable: true,
    price: 68.5,
    slug: "budda-roll-dough-base-50lb",
  },
  {
    id: "prod-butter-honey",
    sku: "BTR-HNY10",
    name: "Whipped Honey Butter Compound (10 lb tub)",
    category: "Bakery & Dough",
    description: "All-natural whipped honey butter infused with raw Hawaiian honey and island sea salt.",
    packSize: "10 lb pail",
    leadTimeDays: 3,
    isAvailable: true,
    price: 42.0,
    slug: "whipped-honey-butter-compound",
  },
  {
    id: "prod-box-12",
    sku: "PKG-RB12",
    name: "Branded 12-Pack Roll Takeout Boxes (Case of 200)",
    category: "Packaging",
    description: "Vented, grease-resistant corrugated boxes with vibrant Budda's brand identity and steam-release ports.",
    packSize: "200 per case",
    leadTimeDays: 5,
    isAvailable: true,
    price: 84.0,
    slug: "branded-12-pack-roll-boxes",
  },
  {
    id: "prod-uniform-apron",
    sku: "UNF-APR01",
    name: "Heavyweight Canvas Baker Apron with Logo",
    category: "Signage & Uniforms",
    description: "Charcoal washed canvas with embroidered golden mango Budda Roll emblem and cross-back straps.",
    packSize: "Pack of 5",
    leadTimeDays: 2,
    isAvailable: true,
    price: 95.0,
    slug: "heavyweight-canvas-baker-apron",
  },
];

export const portalOrders: PortalOrder[] = [
  {
    id: "ORD-9482",
    locationId: "HNL-014",
    createdAt: "2026-08-18T14:32:00Z",
    status: "Processing",
    eta: "Aug 23, 2026",
    total: 347.0,
    invoiceId: "INV-2026-0814",
    items: [
      { sku: "DGH-BR50", name: "Proprietary Budda Roll Dough Base (50 lb)", quantity: 4, price: 68.5 },
      { sku: "PKG-RB12", name: "Branded 12-Pack Roll Takeout Boxes (Case of 200)", quantity: 1, price: 84.0 },
    ],
  },
  {
    id: "ORD-9120",
    locationId: "HNL-014",
    createdAt: "2026-08-04T09:15:00Z",
    status: "Delivered",
    eta: "Aug 08, 2026",
    total: 219.0,
    invoiceId: "INV-2026-0792",
    items: [
      { sku: "BTR-HNY10", name: "Whipped Honey Butter Compound (10 lb tub)", quantity: 3, price: 42.0 },
      { sku: "UNF-APR01", name: "Heavyweight Canvas Baker Apron with Logo", quantity: 1, price: 95.0 },
    ],
  },
  {
    id: "ORD-9801",
    locationId: "SLC-302",
    createdAt: "2026-08-19T11:00:00Z",
    status: "Processing",
    eta: "Aug 24, 2026",
    total: 512.5,
    invoiceId: "INV-2026-0820",
    items: [
      { sku: "DGH-BR50", name: "Proprietary Budda Roll Dough Base (50 lb)", quantity: 5, price: 68.5 },
      { sku: "PKG-RB12", name: "Branded 12-Pack Roll Takeout Boxes (Case of 200)", quantity: 2, price: 84.0 },
    ],
  },
];

export const portalResources: PortalResource[] = [
  {
    id: "res-sop-baking",
    title: "Master Budda Roll Baking & Steam Proofing SOP",
    category: "Operations Manuals",
    version: "v3.2",
    updatedAt: "2026-07-15T00:00:00Z",
    fileSize: "4.8 MB",
    downloadUrl: "/resources/sop-baking-v3.2.pdf",
  },
  {
    id: "res-brand-kit",
    title: "Local Marketing & Social Media Brand Toolkit",
    category: "Brand & Marketing",
    version: "v2.0",
    updatedAt: "2026-08-01T00:00:00Z",
    fileSize: "18.2 MB",
    downloadUrl: "/resources/brand-toolkit-v2.0.zip",
  },
  {
    id: "res-food-safety",
    title: "Daily HACCP Food Safety Log & Temp Guidelines",
    category: "Operations Manuals",
    version: "v1.4",
    updatedAt: "2026-05-10T00:00:00Z",
    fileSize: "1.2 MB",
    downloadUrl: "/resources/haccp-guidelines.pdf",
  },
];

export const portalAnnouncements: PortalAnnouncement[] = [
  {
    id: "ann-01",
    title: "Q3 Wholesale Dough Logistics Optimization",
    body: "Regional cold-chain freight rates have been renegotiated for mainland units, providing a 4.2% reduction in landed flour cost starting Sept 1.",
    publishedAt: "2026-08-15T12:00:00Z",
  },
  {
    id: "ann-02",
    title: "Fall Seasonal Butter Spread Testing",
    body: "Lilikoi Passion Fruit Butter will launch as an optional seasonal LTO starting October 15. Training modules are now uploaded to the Resources center.",
    publishedAt: "2026-08-10T08:00:00Z",
  },
];
