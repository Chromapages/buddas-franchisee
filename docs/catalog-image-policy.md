# Supplies Catalog image policy

## Audit result

- The public image inventory contains marketing, restaurant, and bakery assets, but no curated SKU catalog asset directory.
- Local development catalog records contain no product image assignments.
- The active verified browser scenario displayed an Apron SKU without a verified image record; it now uses the Uniform/Signage placeholder.
- The Firestore import script previously assigned a consumer bakery image when no image was supplied. That default has been removed.
- Raw Firestore or database `imageUrl` values are not treated as product evidence. They are ignored unless they meet the verification contract below.

## Rendering contract

An image renders only when all fields are present and valid:

- `imageUrl` begins with `/images/catalog/`
- `imageAlt` identifies the exact SKU/package
- `imageVerified` is `true`

The list uses a fixed 96px square with `object-contain`; the detail page reserves a fixed responsive visual frame. Informative verified images use `imageAlt`. Category placeholders are decorative because the product title, SKU, and category remain adjacent as text.

## Placeholder rules

| Product class | Placeholder |
| --- | --- |
| Bakery & Dough | Ingredient supply |
| Packaging | Packaging supply |
| Signage & Uniforms | Uniform or signage supply |
| Equipment | Equipment supply |

No unrelated bakery, lifestyle, restaurant, or campaign imagery may substitute for a supply item.

## Publishing rule

Corporate catalog users can upload a JPEG, PNG, or WebP product image up to 10 MB after entering a valid item name and SKU. The server validates the declared image type against its file signature, generates an unguessable filename, stores the image in the configured Firebase Storage bucket, and returns a Firebase download URL. Local development without Firebase credentials stores the validated image in `public/images/catalog`; the legacy Sanity image path remains available only when Firebase Storage is not configured.

The publisher requires the operator to confirm that the uploaded image depicts the exact item or package for the entered SKU before publishing it. That confirmation writes the identifying alt text and `imageVerified: true` with the catalog item. Without confirmation, the image is preview-only and the operator portal keeps its category placeholder.

Reviewed CLI imports remain supported for `/images/catalog/` assets. Omitting an image remains valid for SKUs without a curated asset.
