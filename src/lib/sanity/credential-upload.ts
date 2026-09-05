import "server-only";

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;
const apiToken = process.env.SANITY_API_TOKEN;
const apiVersion = process.env.SANITY_API_VERSION || "v2025-02-19";
const maxFileSizeBytes = 10 * 1024 * 1024;
const acceptedMimeTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);

export const isSanityCredentialUploadConfigured = (): boolean => Boolean(projectId && dataset && apiToken);

export type SanityCredentialAsset = {
  id: string;
  url: string;
  mimeType: string;
  size: number;
  filename: string;
};

export const uploadCredentialAsset = async (file: File): Promise<SanityCredentialAsset> => {
  if (!isSanityCredentialUploadConfigured() || !projectId || !dataset || !apiToken) {
    throw new Error("Credential uploads are not configured.");
  }
  if (!acceptedMimeTypes.has(file.type) || file.size <= 0 || file.size > maxFileSizeBytes) {
    throw new Error("Use a PDF, JPEG, or PNG file up to 10 MB.");
  }

  const query = new URLSearchParams({ filename: file.name, label: "food-safety-credential" });
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
