import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const form = fs.readFileSync("src/components/portal/support-form.tsx", "utf8");
const workspace = fs.readFileSync("src/components/portal/support-workspace.tsx", "utf8");
const actions = fs.readFileSync("src/features/portal/actions.ts", "utf8");
const resources = fs.readFileSync("src/app/portal/resources/page.tsx", "utf8");

test("support intake describes and performs one truthful create step", () => {
  assert.match(form, /Open a support request/);
  assert.match(form, /Create request/);
  assert.doesNotMatch(form, /Review &amp; submit|data-complete="true"/);
  assert.doesNotMatch(form, /<span>3<\/span>/);
});

test("support intake submits validated impact and related order context", () => {
  assert.match(form, /name="impact"/);
  assert.match(form, /name="relatedOrderId"/);
  assert.match(actions, /SUPPORT_IMPACTS\.some/);
  assert.match(actions, /getOrderById\(relatedOrderId, locationId\)/);
});

test("support filtering never keeps detail outside visible results", () => {
  assert.match(workspace, /filteredTickets\.find\(\(ticket\) => ticket\.id === selectedTicketId\) \?\? filteredTickets\[0\]/);
});

test("support message fields match server length limits", () => {
  assert.equal((workspace.match(/maxLength=\{SUPPORT_MESSAGE_LIMIT\}/g) || []).length, 2);
  assert.match(workspace, /replyMessage\.length/);
  assert.match(workspace, /reopenReason\.length/);
});

test("quick answers retain topic context in Resource Center", () => {
  for (const query of ["equipment", "logistics", "baking"]) assert.match(workspace, new RegExp(`/portal/resources\\?q=${query}`));
  assert.match(resources, /visibleResources/);
  assert.match(resources, /Clear search/);
});
