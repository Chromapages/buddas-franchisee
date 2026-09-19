# Franchise content in Sanity

Open `/studio` in the running Next.js app. The content pane contains two singleton documents:

- **Home Page** controls the fixed `/franchise` sections.
- **Site Settings** controls franchise navigation, footer content, organization data, and default SEO.

The website continues serving its built-in approved copy until valid, published singleton documents exist. Upload the hero and candidate-profile images inside Sanity before publishing the Home Page; image alternative text is required.

Set these public environment values in each deployment:

```text
NEXT_PUBLIC_SANITY_PROJECT_ID=fn7uc4b8
NEXT_PUBLIC_SANITY_DATASET=production
```

`SANITY_API_TOKEN` remains server-only and is used only by the existing protected asset-upload routes. Do not add it to a browser environment variable.
