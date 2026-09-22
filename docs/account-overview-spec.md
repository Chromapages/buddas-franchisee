# Account Overview design spec

## Purpose

Give an operator a clear starting point for Account & Access without repeating the detailed records on its four destination pages.

## Scope and success criteria

| Element | Requirement | Evaluation / success criterion |
| --- | --- | --- |
| Identity | Retain the signed-in operator's name, email, role, and working account context. | Values come from the authorized session; no unverified account-standing claim appears. |
| Identity layout | Keep the status panel readable when the main column narrows. | At middle desktop widths the status spans the identity card instead of leaving an uneven partial row. |
| Section navigation | Show Business & Billing, Compliance, Units & Access, and Security as distinct linked cards below identity. | Each entire card opens its existing route and has one descriptive label. |
| Content | Describe what each destination contains without inventing records or counts. | Unit count uses authorized `managedLocationIds`; other cards make no status or financial claims. |
| Responsive layout | Use two card columns on desktop and one on mobile. | No horizontal page overflow at 390px, 768px, or 1440px. |
| Accessibility | Use native links, one page heading, visible focus, and existing design tokens. | All four cards are keyboard reachable; card labels identify their destinations. |

## Plan

1. Reuse the existing Overview identity and four-card section.
2. Replace the hard-coded account-standing message with the verified signed-in state.
3. Check card layout, focus, and destinations at mobile, tablet, and desktop widths.

## Boundaries

Detailed records and actions remain on their respective pages. No new account status, payment, compliance result, or API request is introduced.
