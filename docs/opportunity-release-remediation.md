# Opportunity Dossier release gate

The opportunity page may not ship until all sensitive governed copy passes:

```powershell
npm run verify:opportunity-release
```

To clear the gate, the accountable owner must attach an approved source reference and review date, set `verificationStatus` to `VERIFIED`, and set `reviewStatus` to `APPROVED`. Do not change public copy merely to make the gate pass.

Use the [claims and evidence register](./opportunity-claims-evidence-register.md) to resolve every blocked record with its accountable owner.

## Required human and production checks

- Franchise Development and Brand: category-positioning and operating-model claims.
- Franchise Legal: investment, FDD, territory/offering, inquiry-boundary, and qualification claims.
- Operations and Marketing: support, training, supply-chain, opening, and response-SLA claims.
- Accessibility: keyboard-only, VoiceOver or NVDA, and forced-colors checks.
- Production: `npm run build`, deployed canonical URL, sitemap, Rich Results Test, Search Console URL Inspection, and field Core Web Vitals.

The release gate intentionally fails while evidence is missing. It does not infer approval from a claim's presence in source code.
