"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, CircleHelp, Coins, FileText, Leaf, Link2, MapPin, Printer, Search, Store, ThumbsDown, ThumbsUp, UsersRound, X } from "lucide-react";
import { AccordionItem } from "@/src/components/ui/accordion";
import { StructuredListHighlight, type StructuredListData } from "@/src/components/public/structured-list-highlight";
import { trackFunnelEvent } from "@/src/lib/analytics";
import { FOOTER_CONTENT } from "@/src/features/footer/footer-content";
import { copyFaqAnswer, faqAnswerUrl, faqInteractionReducer, findFaqFragment, getFaqTopicCategory, initialFaqState, matchesFaqSearch, normalizeFaqSearchTerm } from "@/src/features/franchise/faq-interaction";

export type FaqItem = {
  id: string;
  slug: string;
  category: string;
  title: string;
  answer: string;
  details?: string[];
  structuredList?: StructuredListData;
  relatedSlugs?: string[];
  searchTerms?: string[];
  deepLink?: { href: string; label: string };
  helpfulnessEnabled?: boolean;
};

export type FaqRetrievalConfig = {
  searchEnabled: boolean;
  categoryFilter: {
    enabled: boolean;
    minimumQuestionsPerCategory: number;
  };
};

const faqTopics: Record<string, {
  Icon: typeof Store;
  heading: string;
  description: string;
  resources: { title: string; description: string; href: string; label: string; Icon: typeof Store }[];
}> = {
  "Concept & Operations": {
    Icon: Store,
    heading: "Questions about our model, food, and restaurant operations.",
    description: "Learn what makes Budda's different and how our bakery and restaurant operations work together to create a unique guest experience and a strong business model.",
    resources: [
      { title: "The Budda's Operating Model", description: "A closer look at our bakery, dayparts, and restaurant operations.", href: "/franchise/why-buddas", label: "Explore the operating model", Icon: FileText },
      { title: "Support for Operators", description: "Training, resources, and a team committed to your success.", href: "/franchise/the-opportunity#support-runway", label: "See operator support", Icon: UsersRound },
    ],
  },
  "Investment & Capital": {
    Icon: Coins,
    heading: "Questions about investment and capital readiness.",
    description: "Review financial qualifications and the disclosure information that informs a potential franchise partnership.",
    resources: [
      { title: "Capital & Disclosure", description: "Understand the financial information available for the opportunity.", href: "/franchise/the-opportunity#capital-disclosure", label: "Review capital details", Icon: Coins },
      { title: "The Evaluation Process", description: "See how mutual review and diligence fit together.", href: "/franchise/process", label: "Explore the process", Icon: FileText },
    ],
  },
  "Territory & Markets": {
    Icon: MapPin,
    heading: "Questions about territories and market availability.",
    description: "Learn how markets are evaluated and what an inquiry means for territory discussions.",
    resources: [
      { title: "Markets & Territory", description: "Review the public market and territory information.", href: "/franchise/the-opportunity#markets-territory", label: "Explore market details", Icon: MapPin },
      { title: "Discuss Your Market", description: "Share your background and the market you would like to discuss.", href: "/franchise/contact", label: "Request franchise information", Icon: UsersRound },
    ],
  },
  "Training & Support": {
    Icon: UsersRound,
    heading: "Questions about training and operator support.",
    description: "Explore the standards, resources, and guidance behind opening and daily restaurant operations.",
    resources: [
      { title: "Support for Operators", description: "Review the systems and resources behind the restaurant.", href: "/franchise/the-opportunity#support-runway", label: "See operator support", Icon: UsersRound },
      { title: "The Budda's Operating Model", description: "Learn how product, preparation, and hospitality work together.", href: "/franchise/why-buddas", label: "Explore the operating model", Icon: Store },
    ],
  },
  "Process & Diligence": {
    Icon: FileText,
    heading: "Questions about the development process.",
    description: "Understand the mutual evaluation stages, diligence, and preparation involved in a potential partnership.",
    resources: [
      { title: "The Development Process", description: "Review the steps from inquiry through mutual evaluation.", href: "/franchise/process", label: "Explore the process", Icon: FileText },
      { title: "The Franchise Opportunity", description: "Consider the concept, qualifications, and partnership expectations.", href: "/franchise/the-opportunity", label: "Review the opportunity", Icon: Store },
    ],
  },
};

const getFaqSearchTopic = (query: string): "concept" | "financials" | "territory" | "supply" | "support" | "timeline" | "other" => {
  const normalized = normalizeFaqSearchTerm(query);
  if (/\b(fdd|investment|capital|net worth|liquid)\b/.test(normalized)) return "financials";
  if (/\b(territory|market)\b/.test(normalized)) return "territory";
  if (/\b(supply|dough|ingredient|bakery)\b/.test(normalized)) return "supply";
  if (/\b(training|support)\b/.test(normalized)) return "support";
  if (/\b(timeline|opening|process)\b/.test(normalized)) return "timeline";
  if (/\b(roll|concept|hawaiian|daypart)\b/.test(normalized)) return "concept";
  return "other";
};

const FaqHelpfulness = ({ questionId, category, position }: { questionId: string; category: string; position: number }) => {
  const storageKey = `buddas-faq-feedback-${questionId}`;
  const [response, setResponse] = useState<boolean | null>(null);
  const [confirmation, setConfirmation] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (!stored) return;
      const parsed = JSON.parse(stored) as { vote: boolean };
      setResponse(parsed.vote);
    } catch {
      // Storage may be blocked; reading an answer must still work.
    }
  }, [storageKey]);

  useEffect(() => {
    if (!confirmation) return;
    const timer = window.setTimeout(() => setConfirmation(false), 3000);
    return () => window.clearTimeout(timer);
  }, [confirmation]);

  const record = (helpful: boolean) => {
    if (response === helpful) return;
    const timestamp = new Date().toISOString();
    setResponse(helpful);
    setConfirmation(true);
    setError(false);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ vote: helpful }));
    } catch {
      setError(true);
    }
    trackFunnelEvent("faq_helpfulness_feedback", { faq_question_id: questionId, faq_category: category, faq_item_position: position, faq_helpful: helpful, faq_feedback_timestamp: timestamp });
  };

  return <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-1.5 sm:flex sm:flex-wrap sm:gap-3"><span className="min-w-0 text-sm font-semibold text-brand-charcoal">Was this answer helpful?</span><button type="button" aria-label="Mark this answer as helpful" aria-pressed={response === true} onClick={() => record(true)} className={`inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-charcoal ${response === true ? "bg-bds-teal/20 text-bds-action-primary" : "text-brand-charcoal hover:bg-brand-sand"}`}><ThumbsUp className={`h-4 w-4 ${response === true ? "fill-current" : ""}`} aria-hidden="true" /><span>Yes</span></button><button type="button" aria-label="Mark this answer as not helpful" aria-pressed={response === false} onClick={() => record(false)} className={`inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-charcoal ${response === false ? "bg-red-50 text-red-700" : "text-brand-charcoal hover:bg-brand-sand"}`}><ThumbsDown className={`h-4 w-4 ${response === false ? "fill-current" : ""}`} aria-hidden="true" /><span>No</span></button>{confirmation ? <span role="status" className="col-span-3 mt-2 text-sm font-semibold text-bds-action-primary sm:col-auto">Thanks — feedback received.</span> : null}{error ? <span role="status" className="col-span-3 mt-2 text-sm font-semibold text-red-700 sm:col-auto">Your response was not saved on this device.</span> : null}</div>;
};

const FaqContactCta = ({ resultCount }: { resultCount: number }) => (
  <aside className="faq-contact-cta" aria-labelledby="faq-inquiry-heading">
    <span className="faq-contact-icon" aria-hidden="true"><CircleHelp /></span>
      <div className="faq-contact-copy">
        <h2 id="faq-inquiry-heading">Still have a question?</h2>
        <p>Get in touch with our team for answers specific to your market or qualifications.</p>
      </div>
      <Link href="/franchise/contact" onClick={() => trackFunnelEvent("faq_inquiry_cta_click", { faq_category: "all", faq_position: "sidebar", faq_result_count: resultCount, faq_destination_id: "franchise-contact" })} className="faq-inquiry-link">Request Franchise Information<ArrowRight aria-hidden="true" /></Link>
      <p className="faq-inquiry-boundary">An inquiry is not an application, territory reservation, or offer of a franchise.</p>
  </aside>
);

const FaqCopyLink = ({ slug }: { slug: string }) => {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const url = faqAnswerUrl(slug);
  return (
    <div className="faq-copy-link faq-js-only">
      <button type="button" className="faq-tool" onClick={async () => {
        const copied = await copyFaqAnswer(url, navigator.clipboard?.writeText
          ? (value) => navigator.clipboard.writeText(value)
          : undefined);
        setStatus(copied ? "copied" : "failed");
      }}><Link2 aria-hidden="true" />Copy answer link</button>
      <span role="status">{status === "copied" ? "Link copied." : status === "failed" ? "Could not copy. Select and copy the link below." : ""}</span>
      {status === "failed" ? (
        <label className="block">
          Answer link
          <input className="mt-2 w-full rounded border border-bds-teal-dark/40 p-2" readOnly value={url} onFocus={(event) => event.currentTarget.select()} />
        </label>
      ) : null}
    </div>
  );
};

export const FaqExplorer = ({
  faqs,
  retrieval,
}: {
  faqs: FaqItem[];
  retrieval: FaqRetrievalConfig;
}) => {
  const [state, dispatch] = useReducer(faqInteractionReducer, faqs, initialFaqState);
  const { input: searchInput, query } = state;
  const [category, setCategory] = useState(retrieval.categoryFilter.enabled ? getFaqTopicCategory(faqs[0]?.category ?? "") : "");
  const openFaqIds = query ? state.searchOpen : state.browseOpen;
  const [enhanced, setEnhanced] = useState(false);
  const [revealSlug, setRevealSlug] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const printingRef = useRef(false);
  const [announcedResultSummary, setAnnouncedResultSummary] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const lastSearchAnalyticsKey = useRef("");

  useEffect(() => { setEnhanced(true); }, []);

  useEffect(() => {
    if (!retrieval.searchEnabled) return;
    const focusSearch = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey && !target?.matches("input, textarea, select, [contenteditable='true']")) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, [retrieval.searchEnabled]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const faq of faqs) {
      const topic = getFaqTopicCategory(faq.category);
      counts.set(topic, (counts.get(topic) ?? 0) + 1);
    }
    return counts;
  }, [faqs]);
  const showCategoryFilter = retrieval.categoryFilter.enabled && categoryCounts.size > 1;
  const selectedTopic = !query && enhanced ? faqTopics[category] : undefined;

  const visibleFaqs = useMemo(() => {
    return faqs.filter((faq) => (!enhanced || !category || query || getFaqTopicCategory(faq.category) === category) && matchesFaqSearch(faq, query));
  }, [category, enhanced, faqs, query]);
  const areAllVisibleOpen = visibleFaqs.length > 0 && visibleFaqs.every((faq) => openFaqIds.has(faq.id));

  const setFaqOpen = (id: string, isOpen: boolean) => {
    dispatch({ type: "toggle", id, open: isOpen });
  };
  const getViewport = (): "mobile" | "tablet" | "desktop" => window.innerWidth < 768 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop";
  const handleFaqOpenChange = (faq: FaqItem, isOpen: boolean) => {
    if (printingRef.current) return;
    const panel = document.getElementById(`accordion-content-${faq.slug}`);
    if (!isOpen && panel?.contains(document.activeElement)) {
      document.getElementById(`accordion-header-${faq.slug}`)?.focus();
    }
    setFaqOpen(faq.id, isOpen);
    trackFunnelEvent(isOpen ? "faq_open" : "faq_close", { faq_question_id: faq.id, faq_slug: faq.slug, faq_category: faq.category, faq_item_position: visibleFaqs.findIndex((item) => item.id === faq.id) + 1, faq_result_count: visibleFaqs.length, faq_viewport: getViewport() });
  };
  const toggleVisibleAccordions = () => {
    trackFunnelEvent(areAllVisibleOpen ? "faq_close_all" : "faq_open_all", { faq_result_count: visibleFaqs.length, faq_filter_id: category || "all" });
    dispatch({ type: "bulk", ids: visibleFaqs.map((faq) => faq.id), open: !areAllVisibleOpen });
  };
  const printVisibleFaqs = () => {
    trackFunnelEvent("faq_print", { faq_result_count: visibleFaqs.length, faq_filter_id: category || "all" });
    window.print();
  };
  const clearSearch = () => {
    if (searchInput || query) trackFunnelEvent("faq_search_cleared", { faq_result_count: faqs.length });
    dispatch({ type: "search", input: "", faqs });
    searchInputRef.current?.focus();
  };
  const applyCategoryFilter = (nextCategory: string) => {
    setCategory(nextCategory);
    dispatch({ type: "search", input: "", faqs });
    trackFunnelEvent("faq_filter_applied", { faq_filter_id: nextCategory || "all", faq_result_count: nextCategory ? categoryCounts.get(nextCategory) ?? 0 : faqs.length });
  };
  useEffect(() => {
    const openHashTarget = () => {
      const faq = findFaqFragment(faqs, window.location.hash);
      if (!faq) return;
      setCategory(getFaqTopicCategory(faq.category));
      dispatch({ type: "fragment", id: faq.id });
      setRevealSlug(faq.slug);
      trackFunnelEvent("faq_deep_link_visit", { faq_question_id: faq.id, faq_slug: faq.slug, faq_category: faq.category, faq_viewport: getViewport() });
    };
    openHashTarget();
    window.addEventListener("hashchange", openHashTarget);
    return () => window.removeEventListener("hashchange", openHashTarget);
  }, [faqs]);

  useEffect(() => {
    if (!revealSlug) return;
    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(revealSlug);
      // Fragment navigation only: typing and toggling never scroll the page.
      target?.scrollIntoView({ behavior: "instant", block: "start" });
      document.getElementById(`accordion-header-${revealSlug}`)?.focus({ preventScroll: true });
      setRevealSlug(null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [revealSlug]);

  useEffect(() => {
    let beforePrint: { element: HTMLDetailsElement; open: boolean }[] = [];
    let restoreTimer: ReturnType<typeof setTimeout>;
    const prepare = () => {
      printingRef.current = true;
      beforePrint = Array.from(rootRef.current?.querySelectorAll<HTMLDetailsElement>("details") ?? [])
        .map((element) => ({ element, open: element.open }));
      beforePrint.forEach(({ element }) => { element.open = true; });
    };
    const restore = () => {
      beforePrint.forEach(({ element, open }) => { element.open = open; });
      restoreTimer = setTimeout(() => { printingRef.current = false; }, 0);
    };
    window.addEventListener("beforeprint", prepare);
    window.addEventListener("afterprint", restore);
    return () => {
      clearTimeout(restoreTimer);
      window.removeEventListener("beforeprint", prepare);
      window.removeEventListener("afterprint", restore);
    };
  }, []);
  useEffect(() => {
    if (!retrieval.searchEnabled || query.length < 2 || lastSearchAnalyticsKey.current === query) return;
    lastSearchAnalyticsKey.current = query;
    trackFunnelEvent("faq_search", { faq_category: "all", faq_result_count: visibleFaqs.length, faq_search_topic: getFaqSearchTopic(query), faq_zero_results: visibleFaqs.length === 0 });
  }, [query, retrieval.searchEnabled, visibleFaqs.length]);
  useEffect(() => {
    const summary = `${visibleFaqs.length} ${visibleFaqs.length === 1 ? "question" : "questions"} available${category && !query ? ` in ${category}` : ""}${query ? ` for ${query}` : ""}`;
    const timer = window.setTimeout(() => setAnnouncedResultSummary(summary), 200);
    return () => window.clearTimeout(timer);
  }, [category, query, visibleFaqs.length]);

  return (
    <div className="faq-answer-index faq-frame" ref={rootRef}>
      <noscript><style>{".faq-page .faq-toolbar, .faq-page .faq-js-only, .faq-page .accordion-footer { display: none !important; }"}</style></noscript>
      <div className="faq-toolbar">
        {retrieval.searchEnabled ? (
          <form className="faq-search" role="search" aria-label="Search franchise FAQs" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="faq-search" className="sr-only">Search questions and answers</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-bds-text-body" aria-hidden="true" />
              <input
                ref={searchInputRef}
                id="faq-search"
                type="search"
                disabled={!enhanced}
                value={searchInput}
                onChange={(event) => {
                  const value = event.target.value;
                  dispatch({ type: "search", input: value, faqs });
                }}
                className={`w-full rounded-xl py-3 pl-10 placeholder:text-bds-text-body/80 ${searchInput ? "pr-12" : "pr-4"}`}
                placeholder="Search by topic or keyword"
              />
              {searchInput ? (
                <button type="button" onClick={clearSearch} aria-label="Clear search" className="absolute right-1 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-bds-teal-dark">
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </form>
        ) : null}
        <div className="faq-toolbar-actions">
          <p id="faq-results-heading" className="faq-result-count">
            {query ? visibleFaqs.length : faqs.length} {query ? "matching " : ""}{(query ? visibleFaqs.length : faqs.length) === 1 ? "question" : "questions"}
          </p>
          {visibleFaqs.length ? (
            <button type="button" disabled={!enhanced} onClick={toggleVisibleAccordions} className="faq-tool">
              {areAllVisibleOpen ? "Hide all answers" : "Show all answers"}
            </button>
          ) : null}
          <button type="button" disabled={!enhanced} onClick={printVisibleFaqs} className="faq-tool">
            <Printer className="h-4 w-4" aria-hidden="true" />Print
          </button>
        </div>
      </div>

      <div className="faq-desk-layout">
        <aside className="faq-sidebar">
          {showCategoryFilter && <nav className="faq-topics faq-js-only" aria-label="Browse FAQ topics">
            <p className="faq-eyebrow">Browse by topic</p>
            <ul>{[...categoryCounts].map(([name, count]) => {
              const TopicIcon = faqTopics[name]?.Icon ?? FileText;
              return <li key={name}><button type="button" disabled={!enhanced} aria-pressed={!query && category === name} onClick={() => applyCategoryFilter(name)}>
                <span className="faq-topic-icon" aria-hidden="true"><TopicIcon /></span>
                <span><strong>{name}</strong><small>{count} {count === 1 ? "question" : "questions"}</small></span>
                <ChevronRight aria-hidden="true" />
              </button></li>;
            })}</ul>
          </nav>}
          <FaqContactCta resultCount={visibleFaqs.length} />
        </aside>
      <section id="faq-results" aria-labelledby="faq-topic-heading">
        <p aria-live="polite" aria-atomic="true" className="sr-only">{announcedResultSummary}</p>
        <header className="faq-topic-header">
          <div className="faq-topic-meta"><p className="faq-eyebrow">{query ? "Search results" : selectedTopic ? category : "All topics"}</p><p className="faq-eyebrow">{visibleFaqs.length} {visibleFaqs.length === 1 ? "question" : "questions"}</p></div>
          <h2 id="faq-topic-heading">{query ? "Answers matching your search." : selectedTopic?.heading ?? "Browse all franchise questions."}</h2>
          {selectedTopic && <p>{selectedTopic.description}</p>}
        </header>
        {visibleFaqs.length ? (
          <div className="faq-answer-list">
            {visibleFaqs.map((faq, index) => {
              return (
                <AccordionItem
                  key={faq.id}
                  id={faq.slug}
                  title={faq.title}
                  category={query ? getFaqTopicCategory(faq.category) : undefined}
                  headingLevel={3}
                  variant="ledger"
                  nativeDisclosure
                  isOpen={openFaqIds.has(faq.id)}
                  onOpenChange={(isOpen) => handleFaqOpenChange(faq, isOpen)}
                  footer={faq.helpfulnessEnabled ? <FaqHelpfulness questionId={faq.id} category={faq.category} position={index + 1} /> : undefined}
                >
                  <div className="faq-answer-layout">
                  <div className="faq-answer-content space-y-4">
                    <p>{faq.answer}</p>
                    {faq.details?.map((detail) => <p key={detail}>{detail}</p>)}
                  </div>
                  {faq.structuredList ? <div className="faq-answer-highlights"><StructuredListHighlight data={faq.structuredList} layout="reference" /></div> : null}
                  </div>
                  <div className="faq-answer-actions">
                    {faq.deepLink ? (
                      <Link
                        href={faq.deepLink.href}
                        onClick={() => trackFunnelEvent("faq_deep_link_click", {
                          faq_question_id: faq.id,
                          faq_category: faq.category,
                          faq_item_position: index + 1,
                          faq_destination_id: faq.deepLink?.href,
                        })}
                        className="faq-deep-link touch-target-inline mt-4 inline-flex text-sm font-bold text-bds-teal-dark underline underline-offset-4"
                      >
                        {faq.deepLink.label}<ArrowRight aria-hidden="true" />
                      </Link>
                    ) : null}
                    <FaqCopyLink slug={faq.slug} />
                  </div>
                </AccordionItem>
              );
            })}
          </div>
        ) : (
          <div className="py-8">
            <h2 className="heading-compact text-bds-teal-dark">No matching questions</h2>
            <p className="mt-2 break-words text-sm text-bds-text-body">No questions match <strong>“{searchInput.trim()}”</strong>.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={clearSearch} className="faq-tool">Clear search</button>
              <button type="button" onClick={() => applyCategoryFilter("")} className="faq-tool">View all questions</button>
            </div>
          </div>
        )}
        {selectedTopic && <section className="faq-related" aria-labelledby="faq-related-heading">
          <h3 id="faq-related-heading" className="faq-eyebrow">Related resources</h3>
          <div className="faq-resource-grid">{selectedTopic.resources.map(({ title, description, href, label, Icon }) => <article key={href}>
            <span className="faq-topic-icon" aria-hidden="true"><Icon /></span>
            <div><h4>{title}</h4><p>{description}</p><Link href={href}>{label}<ArrowRight aria-hidden="true" /></Link></div>
          </article>)}</div>
        </section>}
        <p className="faq-print-legal hidden text-xs leading-5">{FOOTER_CONTENT.legalDisclaimer}</p>
      </section>
      </div>
      <div className="faq-brand-strip"><p>People. Food. Community.<br />A brighter tomorrow together.</p><span aria-hidden="true" /><p><Leaf aria-hidden="true" />Budda&apos;s Hawaiian</p></div>
    </div>
  );
};
