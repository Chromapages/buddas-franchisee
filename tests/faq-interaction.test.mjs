import assert from 'node:assert/strict';
import test from 'node:test';
import { copyFaqAnswer, faqAnswerUrl, faqInteractionReducer as reduce, findFaqFragment, initialFaqState, matchesFaqSearch, normalizeFaqSearchTerm } from '../src/features/franchise/faq-interaction.ts';
import { getPublicFranchiseFaqItems } from '../src/features/franchise/faq-content.ts';

const faqs = getPublicFranchiseFaqItems();
const ids = faqs.map(({ id }) => id);

test('browse defaults to first persisted ID; all can close and mixed state can expand', () => {
  let state = initialFaqState(faqs);
  assert.deepEqual([...state.browseOpen], [ids[0]]);
  state = reduce(state, { type: 'toggle', id: ids[0], open: false });
  assert.equal(state.browseOpen.size, 0);
  state = reduce(state, { type: 'toggle', id: ids[1], open: true });
  assert.equal(ids.every(id => state.browseOpen.has(id)), false);
  state = reduce(state, { type: 'bulk', ids, open: true });
  assert.deepEqual([...state.browseOpen].sort(), [...ids].sort());
  state = reduce(state, { type: 'bulk', ids, open: false });
  assert.equal(state.browseOpen.size, 0);
  assert.equal(initialFaqState([]).browseOpen.size, 0);
});

test('search opens details-only matches and leaves browse state intact', () => {
  let state = reduce(initialFaqState(faqs), { type: 'toggle', id: ids[1], open: true });
  const browse = [...state.browseOpen];
  const support = faqs.find(faq => faq.slug === 'training-and-support');
  state = reduce(state, { type: 'search', input: 'grand opening', faqs });
  assert.deepEqual([...state.searchOpen], [support.id]);
  state = reduce(state, { type: 'bulk', ids: [support.id], open: false });
  assert.equal(state.searchOpen.size, 0);
  state = reduce(state, { type: 'search', input: '  GRAND   opening ', faqs });
  assert.equal(state.searchOpen.size, 0, 'Equivalent normalization does not reopen user-collapsed results');
  state = reduce(state, { type: 'search', input: 'opening', faqs });
  assert.ok(state.searchOpen.has(support.id));
  state = reduce(state, { type: 'search', input: '', faqs });
  assert.deepEqual([...state.browseOpen], browse);
});

test('whitespace restores browsing; literal punctuation has no regex semantics', () => {
  let state = reduce(initialFaqState(faqs), { type: 'search', input: 'zzznomatch', faqs });
  assert.equal(state.searchOpen.size, 0);
  state = reduce(state, { type: 'search', input: ' \t\n ', faqs });
  assert.equal(state.query, '');
  assert.deepEqual([...state.browseOpen], [ids[0]]);
  for (const query of ['.*', '[', '<script>alert(1)</script>']) {
    assert.equal(faqs.some(faq => matchesFaqSearch(faq, query)), false);
  }
  assert.equal(matchesFaqSearch({ ...faqs[0], title: 'Literal [brackets] cost (USD).' }, '[brackets]'), true);
});

test('matching folds accents, whitespace and apostrophes, and searches across fields in editorial order', () => {
  assert.equal(normalizeFaqSearchTerm('  BUDDA’S   Café '), "buddas cafe");
  assert.deepEqual(faqs.filter(f => matchesFaqSearch(f, "Budda’s")).map(f => f.id), faqs.filter(f => matchesFaqSearch(f, "Budda's")).map(f => f.id));
  const fixture = { ...faqs[0], title: 'Café ownership', category: 'Capital', answer: 'Résumé required.' };
  assert.ok(matchesFaqSearch(fixture, 'resume capital cafe'));
  assert.equal(matchesFaqSearch(fixture, 'resume missing'), false);
  assert.deepEqual(faqs.filter(f => matchesFaqSearch(f, 'bakery')).map(f => f.id), faqs.filter(f => matchesFaqSearch(f, 'BAKERY')).map(f => f.id));
});

test('valid fragments clear filtering and reveal persisted records; unknown/malformed fragments are harmless', () => {
  const target = faqs.find(f => f.slug === 'financial-qualifications');
  assert.equal(findFaqFragment(faqs, '#financial-qualifications'), target);
  for (const hash of ['#unknown', '#%E0%A4%A', '']) assert.equal(findFaqFragment(faqs, hash), undefined);
  const state = reduce(reduce(initialFaqState(faqs), { type: 'search', input: 'zzznomatch', faqs }), { type: 'fragment', id: target.id });
  assert.equal(state.input, '');
  assert.equal(state.query, '');
  assert.ok(state.browseOpen.has(target.id));
});

test('copy uses canonical answer URL and reports absent or rejected clipboard honestly', async () => {
  const url = faqAnswerUrl('training-and-support');
  assert.equal(url, 'https://buddasfranchise.com/franchise/faq#training-and-support');
  let written;
  assert.equal(await copyFaqAnswer(url, async value => { written = value; }), true);
  assert.equal(written, url);
  assert.equal(await copyFaqAnswer(url, async () => { throw new Error('denied'); }), false);
  assert.equal(await copyFaqAnswer(url), false);
});
