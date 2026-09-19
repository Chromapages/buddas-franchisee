import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { firebaseStorageBucket } from "@/src/lib/firebase/admin";

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;
const apiToken = process.env.SANITY_API_TOKEN;
const apiVersion = process.env.SANITY_API_VERSION || "v2025-02-19";
const maxFileSizeBytes = 10 * 1024 * 1024;
const acceptedMimeTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
const catalogImageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const isSanityCredentialUploadConfigured = (): boolean => Boolean(projectId && dataset && apiToken);

export type SanityCredentialAsset = {
  id: string;
  url: string;
  mimeType: string;
  size: number;
  filename: string;
};

export type SanityCatalogImageAsset = SanityCredentialAsset;

const sanitizedFilename = (filename: string): string => filename.normalize("NFKC").replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120) || "catalog-image";

const hasExpectedImageSignature = (file: File, bytes: Uint8Array): boolean => {
  if (file.type === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.type === "image/png") return bytes.length >= 8 && bytes.subarray(0, 8).every((value, index) => value === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index]);
  return file.type === "image/webp" && bytes.length >= 12 && String.fromCharCode(...bytes.subarray(0, 4)) === "RIFF" && String.fromCharCode(...bytes.subarray(8, 12)) === "WEBP";
};

const uploadSanityFileAsset = async (file: File, label: string): Promise<SanityCredentialAsset> => {
  if (!isSanityCredentialUploadConfigured() || !projectId || !dataset || !apiToken) {
    throw new Error("Document uploads are not configured.");
  }
  if (!acceptedMimeTypes.has(file.type) || file.size <= 0 || file.size > maxFileSizeBytes) {
    throw new Error("Use a PDF, JPEG, or PNG file up to 10 MB.");
  }

  const query = new URLSearchParams({ filename: file.name, label });
  const response = await fetch(`https://${projectId}.api.sanity.io/${apiVersion}/assets/files/${dataset}?${query}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": file.type,
    },
    body: Buffer.from(await file.arrayBuffer()),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Credential upload could not be completed.");
  }

  const payload = await response.json() as { document?: Record<string, unknown> };
  const document = payload.document;
  const id = typeof document?._id === "string" ? document._id : "";
  const url = typeof document?.url === "string" ? document.url : "";
  const mimeType = typeof document?.mimeType === "string" ? document.mimeType : file.type;
  const size = typeof document?.size === "number" && Number.isFinite(document.size) ? document.size : file.size;
  const filename = typeof document?.originalFilename === "string" ? document.originalFilename : file.name;
  if (!id || !url || !url.startsWith("https://cdn.sanity.io/")) {
    throw new Error("Credential upload returned an invalid file record.");
  }
  return { id, url, mimeType, size, filename };
};

export const uploadCatalogImageAsset = async (file: File, sku: string): Promise<SanityCatalogImageAsset> => {
  if (!catalogImageMimeTypes.has(file.type) || file.size <= 0 || file.size > maxFileSizeBytes) throw new Error("Use a JPEG, PNG, or WebP image up to 10 MB.");
  const contents = Buffer.from(await file.arrayBuffer());
  if (!hasExpectedImageSignature(file, contents)) throw new Error("The image file content does not match its declared type.");

  if (firebaseStorageBucket) {
    const extension = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
    const filename = `${sku.toLowerCase()}-${randomUUID()}.${extension}`;
    const objectPath = `catalog-images/${sku.toLowerCase()}/${filename}`;
    const token = randomUUID();
    try {
      await firebaseStorageBucket.file(objectPath).save(contents, {
        resumable: false,
        preconditionOpts: { ifGenerationMatch: 0 },
        metadata: { contentType: file.type, cacheControl: "public,max-age=31536000,immutable", metadata: { firebaseStorageDownloadTokens: token, catalogSku: sku } },
      });
      return { id: `firebase-${objectPath}`, url: `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(firebaseStorageBucket.name)}/o/${encodeURIComponent(objectPath)}?alt=media&token=${token}`, mimeType: file.type, size: file.size, filename };
    } catch {
      throw new Error("Firebase Storage could not save this product image. Check the configured bucket and try again.");
    }
  }

  if (!isSanityCredentialUploadConfigured() || !projectId || !dataset || !apiToken) {
    if (process.env.NODE_ENV === "production") throw new Error("Product image uploads are not configured.");
    const extension = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
    const filename = `${sku.toLowerCase()}-${randomUUID()}.${extension}`;
    const directory = path.join(process.cwd(), "public", "images", "catalog");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), contents, { flag: "wx" });
    return { id: `local-${filename}`, url: `/images/catalog/${filename}`, mimeType: file.type, size: file.size, filename };
  }

  const query = new URLSearchParams({ filename: sanitizedFilename(file.name), label: `catalog-${sku.toLowerCase()}` });
  const response = await fetch(`https://${projectId}.api.sanity.io/${apiVersion}/assets/images/${dataset}?${query}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": file.type },
    body: contents,
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Product image upload could not be completed.");

  const payload = await response.json() as { document?: Record<string, unknown> };
  const document = payload.document;
  const id = typeof document?._id === "string" ? document._id : "";
  const url = typeof document?.url === "string" ? document.url : "";
  const mimeType = typeof document?.mimeType === "string" ? document.mimeType : file.type;
  const size = typeof document?.size === "number" && Number.isFinite(document.size) ? document.size : file.size;
  const filename = typeof document?.originalFilename === "string" ? document.originalFilename : sanitizedFilename(file.name);
  if (!id || !url || !url.startsWith("https://cdn.sanity.io/images/")) throw new Error("Product image upload returned an invalid image record.");
  return { id, url, mimeType, size, filename };
};

export const uploadCredentialAsset = async (file: File): Promise<SanityCredentialAsset> =>
  uploadSanityFileAsset(file, "food-safety-credential");

/**
 * Sanity's asset CDN is appropriate only for non-sensitive operating material.
 * Legal signatures and confidential returns must use protected storage instead.
 */
export const uploadOperationalResourceAsset = async (file: File): Promise<SanityCredentialAsset> =>
  uploadSanityFileAsset(file, "operational-resource");
