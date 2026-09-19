import type { PortalProduct } from "@/src/features/portal/types";

const categoryModule = (product: PortalProduct): { title: string; entries: Array<[string, string | undefined]> } | null => {
  if (product.category === "Bakery & Dough" && product.supplyDetails?.ingredient) return { title: "Ingredient handling", entries: [["Handling", product.supplyDetails.ingredient.handling], ["Storage", product.supplyDetails.ingredient.storage]] };
  if (["Packaging", "Packaging & Paper"].includes(product.category) && product.supplyDetails?.packaging) return { title: "Packaging specifications", entries: [["Dimensions", product.supplyDetails.packaging.dimensions], ["Material", product.supplyDetails.packaging.material], ["Count", product.supplyDetails.packaging.count], ["Compatibility", product.supplyDetails.packaging.compatibility]] };
  if (["Signage & Uniforms", "Uniforms"].includes(product.category) && product.supplyDetails?.uniform) return { title: "Uniform details", entries: [["Size", product.supplyDetails.uniform.size], ["Fit", product.supplyDetails.uniform.fit], ["Garment details", product.supplyDetails.uniform.garmentDetails], ["Size chart", product.supplyDetails.uniform.sizeChart], ["Approved placement", product.supplyDetails.uniform.approvedPlacement]] };
  if (["Signage & Uniforms", "Brand Materials"].includes(product.category) && product.supplyDetails?.signage) return { title: "Signage specifications", entries: [["Dimensions", product.supplyDetails.signage.dimensions], ["Application", product.supplyDetails.signage.application], ["Approved artwork", product.supplyDetails.signage.artworkVersion], ["Installation", product.supplyDetails.signage.installation]] };
  return null;
};

export const SupplyCategoryDetailModules = ({ product }: { product: PortalProduct }) => {
  const module = categoryModule(product);
  const entries = module?.entries.filter(([, value]) => Boolean(value)) ?? [];
  if (!module || !entries.length) return null;
  return <section aria-labelledby="supply-category-details-title" className="supply-category-details"><h2 id="supply-category-details-title">{module.title}</h2><dl>{entries.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>;
};
