/**
 * Renders a JSON-LD `<script>` tag for a schema.org object built by
 * `lib/seo/json-ld.ts`. Server Component — no client JS involved.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    // eslint-disable-next-line react/no-danger -- JSON-LD requires raw script injection
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
