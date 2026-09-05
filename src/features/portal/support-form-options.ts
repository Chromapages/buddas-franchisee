export const SUPPORT_SUBJECT_LIMIT = 160;
export const SUPPORT_DETAILS_LIMIT = 5000;
export const SUPPORT_TOPICS = [
  { value: "Supply Logistics & Freight", label: "Supply logistics & freight", hint: "Include the order or invoice number, affected items, and what arrived or is missing." },
  { value: "Equipment & Steam Deck Oven Maintenance", label: "Equipment & oven maintenance", hint: "Include the equipment model, symptoms or error code, and troubleshooting already tried." },
  { value: "Baking Quality & Recipe Adherence", label: "Baking quality & recipe adherence", hint: "Include the recipe or product, batch details, and the result you expected compared with what happened." },
  { value: "POS & Inventory Systems", label: "POS & inventory systems", hint: "Include the affected system, the steps that caused the issue, and any error message." },
  { value: "Local Marketing & Grand Opening", label: "Local marketing & grand opening", hint: "Include the campaign or event, the materials you need, and any relevant deadline." },
] as const;
