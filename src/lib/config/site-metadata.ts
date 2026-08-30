// Shared across layout.tsx and every page-level generateMetadata — Next
// fully replaces (not merges) a segment's openGraph/twitter object the
// moment a page defines its own, so these fallback fields have to be
// re-spread into each one rather than relied on via inheritance. See
// node_modules/next/dist/docs/.../generate-metadata.md#merging.
export const SITE_NAME = "claimone.lol";
export const DEFAULT_OG_IMAGE = "/claimone-logo-light.png";
