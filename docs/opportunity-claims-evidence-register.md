# Opportunity Dossier claims and evidence register

This register is the source-approval input for `npm run verify:opportunity-release`. A planning or design brief may identify a direction, but it is not by itself approval to publish a sensitive claim.

| Governed record | Claim category | Accountable owner | Candidate internal reference | Required evidence before verification | Status |
| --- | --- | --- | --- | --- | --- |
| `hero.title` | Brand positioning | Brand & Franchise Development | Website PRD §§1.3–1.4; Discovery Brief §Brand foundation | Approved positioning source specifically supporting “Category-Defining,” or approved replacement copy | UNVERIFIED |
| `thesis.items[0].title` | Operating model | Operations | Website PRD §Bakery-Led Hawaiian Comfort | Current product/operations specification | UNVERIFIED |
| `thesis.items[1].title` | Daypart model | Operations | Website PRD §Why Operators Look Twice | Approved menu/daypart operating evidence | UNVERIFIED |
| `thesis.items[2].title` | Production process | Operations | Discovery Brief §Product truth | Current documented production SOP and owner approval | UNVERIFIED |
| `thesis.items[3].title` | Hospitality expectations | Franchise Development | Discovery Brief §Brand foundation | Approved operator standards source | UNVERIFIED |
| `fit.operatingRequirement` | Candidate qualification | Franchise Development | Website PRD approved qualification boundary | Approved qualification policy and legal review | UNVERIFIED |
| `support.phases[0].support` | Site-selection support | Franchise Development | Platform discovery readiness requirements | Current support commitment and operational owner approval | UNVERIFIED |
| `support.phases[1].support` | Training / supply support | Operations | Platform discovery readiness requirements | Current training curriculum and supply-chain approval | UNVERIFIED |
| `support.phases[2].support` | Opening / marketing support | Marketing & Operations | Platform discovery readiness requirements | Current launch-support commitment and owner approval | UNVERIFIED |
| `support.phases[3].support` | Ongoing support | Marketing & Operations | Platform discovery readiness requirements | Current ongoing-support commitment and owner approval | UNVERIFIED |
| `finalDecision.description` | Response SLA | Franchise Development | Website PRD response-standard target | Approved operating SLA and owner approval | UNVERIFIED |
| `finalDecision.boundary` | Inquiry / offer boundary | Franchise Legal & Development | Discovery Brief §Mutual evaluation | Approved legal inquiry-boundary language | UNVERIFIED |

## Completion protocol

For each row, the accountable owner must attach a durable source reference and review date to the corresponding governed record, set `verificationStatus` to `VERIFIED`, and set `reviewStatus` to `APPROVED`. The release gate must then pass without editing the claim merely to clear validation.
