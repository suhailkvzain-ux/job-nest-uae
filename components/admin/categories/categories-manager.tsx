/**
 * Deprecated — `/admin/categories` no longer uses the generic Master
 * Data table/modal system (see `CategoryGrid`/`CategoryForm`/
 * `CategoryToolbar` instead). Kept as an empty module rather than
 * removed outright so nothing needs touching if a stray import
 * resurfaces; there is intentionally no component exported here
 * anymore since `createCategoryAction`'s input shape grew far beyond
 * what `MasterDataFormValues` can express (icon, ordering, visibility,
 * SEO fields).
 */
export {};
