import { createHash } from "node:crypto";
import { firebaseDb } from "../src/lib/firebase/admin.ts";

const apply = process.argv.includes("--apply");
const fields = ["sku", "name", "category", "description", "packSize", "leadTimeDays", "isAvailable", "price", "slug", "imageUrl"] as const;

const canonical = (raw: Record<string, unknown>) => Object.fromEntries(fields.flatMap((field) => raw[field] === undefined ? [] : [[field, raw[field]]]));
const digest = (raw: Record<string, unknown>) => createHash("sha256").update(JSON.stringify(canonical(raw))).digest("hex");

async function main() {
  if (!firebaseDb) throw new Error("Firebase Admin is not configured.");
  const units = await firebaseDb.collection("units").get();
  const activeUnitIds = units.docs.filter((document) => {
    const data = document.data();
    return data.hiddenFromCorporateDirectory !== true && data.operatingStatus === "ACTIVE" && data.verification?.status === "VERIFIED";
  }).map((document) => document.id);
  const groups = new Map<string, Array<{ locationId: string; id: string; data: Record<string, unknown>; digest: string }>>();
  for (const unit of units.docs.filter((document) => document.data().hiddenFromCorporateDirectory !== true)) {
    const products = await unit.ref.collection("products").get();
    for (const product of products.docs) {
      const data = product.data();
      const sku = typeof data.sku === "string" ? data.sku.trim().toUpperCase() : "";
      if (!sku) continue;
      groups.set(sku, [...(groups.get(sku) || []), { locationId: unit.id, id: product.id, data, digest: digest(data) }]);
    }
  }

  let ready = 0;
  let conflicts = 0;
  for (const [sku, copies] of [...groups.entries()].sort(([left], [right]) => left.localeCompare(right))) {
    if (new Set(copies.map((copy) => copy.digest)).size !== 1) {
      conflicts += 1;
      console.log(`${sku}: CONFLICT across ${copies.map((copy) => copy.locationId).join(", ")}; review before migration.`);
      continue;
    }
    const locationIds = [...new Set(copies.map((copy) => copy.locationId))];
    const universal = activeUnitIds.length > 0 && activeUnitIds.every((locationId) => locationIds.includes(locationId));
    const source = copies[0];
    const item = {
      id: source.id,
      ...canonical(source.data),
      scopeType: universal ? "UNIVERSAL" : "SELECTED",
      locationIds: universal ? [] : locationIds,
      publicationBatchId: `migration-${createHash("sha256").update(sku).digest("hex").slice(0, 16)}`,
      createdAt: typeof source.data.createdAt === "string" ? source.data.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedByName: "Catalog migration",
    };
    ready += 1;
    console.log(`${sku}: ${item.scopeType}${universal ? ` across ${activeUnitIds.length} active stores` : ` for ${locationIds.length} selected stores`}.`);
    if (apply) await firebaseDb.collection("corporateCatalogItems").doc(source.id).set(item);
  }
  console.log(`${apply ? "Migrated" : "Ready to migrate"} ${ready} items; ${conflicts} conflicts require review. Legacy store products were not deleted.`);
  if (!apply) console.log("Dry run only. Re-run with --apply after reviewing every conflict and scope.");
}

main().catch((error) => { console.error(error instanceof Error ? error.message : "Catalog migration failed."); process.exitCode = 1; });
