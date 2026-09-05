import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getPublicFranchiseFaqItems } from "../src/features/franchise/faq-content.ts";

const require = createRequire(import.meta.url);
const read = file => fs.readFileSync(path.resolve(file), "utf8");
// Exercise real SSR markup without adding a JSX test runner.
const loadTsx = file => {
  const result = ts.transpileModule(read(file), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const module = { exports: {} };
  const resolve = name => name.startsWith("@/")
    ? loadTsx(name.slice(2) + ".tsx")
    : require(name);
  new Function("require", "module", "exports", result.outputText)(resolve, module, module.exports);
  return module.exports;
};
const { AccordionItem } = loadTsx("src/components/ui/accordion.tsx");
const h = React.createElement;
const faqs = getPublicFranchiseFaqItems();

test("native fallback SSR contains every answer and stable details/summary controls without JavaScript", () => {
  const html = renderToStaticMarkup(h("div", null, faqs.map((faq, index) => h(AccordionItem, {
    key: faq.id, id: faq.slug, title: faq.title, category: faq.category, headingLevel: 2,
    nativeDisclosure: true, isOpen: index === 0,
  }, h("p", null, faq.answer), ...(faq.details ?? []).map(detail => h("p", { key: detail }, detail))))));
  assert.equal((html.match(/<details\b/g) ?? []).length, faqs.length);
  assert.equal((html.match(/<details[^>]* open=""/g) ?? []).length, 1);
  assert.equal((html.match(/<summary\b/g) ?? []).length, faqs.length);
  assert.doesNotMatch(html, /aria-hidden="true"[^>]*id="accordion-content|role="region"/);
  for (const faq of faqs) {
    assert.ok(html.includes('id="' + faq.slug + '"'));
    assert.ok(html.includes('aria-controls="accordion-content-' + faq.slug + '"'));
    assert.ok(html.includes('id="accordion-content-' + faq.slug + '"'));
    assert.ok(html.includes(renderToStaticMarkup(h("p", null, faq.answer))));
    for (const detail of faq.details ?? []) assert.ok(html.includes(renderToStaticMarkup(h("p", null, detail))));
  }
});

test("existing button accordions retain stable controls, state, and inert collapsed panels", () => {
  const html = renderToStaticMarkup(h(AccordionItem, { id: "existing", title: "Existing accordion", headingLevel: 2 },
    h("a", { href: "/source" }, "Source")));
  assert.match(html, /<h2><button/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-controls="accordion-content-existing"/);
  assert.match(html, /inert=""/);
  assert.doesNotMatch(html, /<details/);
});

test("FAQ keeps canonical route, inquiry disclaimer, and source links", () => {
  const page = read("src/app/franchise/faq/page.tsx");
  const explorer = read("src/components/public/faq-explorer.tsx");
  assert.match(page, /canonical: "\/franchise\/faq"/);
  assert.doesNotMatch(page, /FAQPage|QAPage/);
  assert.match(explorer, /An inquiry is not an application, territory reservation, or offer of a franchise\./);
  assert.match(explorer, /href="\/franchise\/contact"/);
  assert.match(explorer, /href=\{faq.deepLink.href\}/);
  assert.doesNotMatch(explorer, /history\.pushState|history\.replaceState/);
});
