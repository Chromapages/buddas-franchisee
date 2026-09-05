export type SearchableFaq = {
  id: string;
  slug: string;
  title: string;
  category: string;
  answer: string;
  details?: string[];
  searchTerms?: string[];
  structuredList?: { items: { label: string; detail: string }[] };
  deepLink?: { label: string };
};

export const FAQ_CANONICAL_URL = "https://buddasfranchise.com/franchise/faq";

export const normalizeFaqSearchTerm = (value: string) => value
  .normalize("NFKD")
  .replace(/\p{M}/gu, "")
  .toLowerCase()
  .replace(/[’‘']/g, "")
  .replace(/\s+/g, " ")
  .trim();

export const matchesFaqSearch = (faq: SearchableFaq, query: string) => {
  const haystack = normalizeFaqSearchTerm([
    faq.title, faq.category, faq.answer, ...(faq.details ?? []),
    ...(faq.searchTerms ?? []),
    ...(faq.structuredList?.items.flatMap((item) => [item.label, item.detail]) ?? []),
    faq.deepLink?.label ?? "",
  ].join(" "));
  return normalizeFaqSearchTerm(query).split(" ").filter(Boolean).every((token) => haystack.includes(token));
};

export const findFaqFragment = <T extends SearchableFaq>(faqs: readonly T[], hash: string) => {
  try {
    const slug = decodeURIComponent(hash.replace(/^#/, ""));
    return faqs.find((faq) => faq.slug === slug);
  } catch { return undefined; }
};

export const faqAnswerUrl = (slug: string) => `${FAQ_CANONICAL_URL}#${encodeURIComponent(slug)}`;

export const copyFaqAnswer = async (url: string, write?: (value: string) => Promise<void>) => {
  if (!write) return false;
  try { await write(url); return true; } catch { return false; }
};

export type FaqInteractionState = {
  input: string;
  query: string;
  browseOpen: Set<string>;
  searchOpen: Set<string>;
};

export const initialFaqState = (faqs: readonly SearchableFaq[]): FaqInteractionState => ({
  input: "", query: "", browseOpen: new Set(faqs[0] ? [faqs[0].id] : []), searchOpen: new Set(),
});

export type FaqAction =
  | { type: "search"; input: string; faqs: readonly SearchableFaq[] }
  | { type: "toggle"; id: string; open: boolean }
  | { type: "bulk"; ids: string[]; open: boolean }
  | { type: "fragment"; id: string };

export const faqInteractionReducer = (state: FaqInteractionState, action: FaqAction): FaqInteractionState => {
  if (action.type === "search") {
    const query = normalizeFaqSearchTerm(action.input);
    return {
      ...state, input: action.input, query,
      searchOpen: query !== state.query
        ? new Set(query ? action.faqs.filter((faq) => matchesFaqSearch(faq, query)).map((faq) => faq.id) : [])
        : state.searchOpen,
    };
  }
  if (action.type === "fragment") {
    return { ...state, input: "", query: "", browseOpen: new Set([...state.browseOpen, action.id]) };
  }
  const key = state.query ? "searchOpen" : "browseOpen";
  const next = new Set(state[key]);
  const ids = action.type === "bulk" ? action.ids : [action.id];
  for (const id of ids) {
    if (action.open) next.add(id); else next.delete(id);
  }
  return { ...state, [key]: next };
};
