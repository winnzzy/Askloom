# AskLoom — SEO Schema Templates

Replace placeholders only after the final marketing domain and production asset URLs exist.

## Organization
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "AskLoom",
  "url": "https://www.askloom.com",
  "logo": "https://www.askloom.com/brand/askloom-logo.png"
}
</script>
```

## SoftwareApplication
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "AskLoom",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://www.askloom.com",
  "description": "Audience intelligence for content decisions: discover audience questions, prioritize opportunities, create with context and learn from published outcomes."
}
</script>
```

Do not add `offers` until final prices are public. Do not add `aggregateRating` or `review` without genuine review data.

## BreadcrumbList example
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type":"ListItem","position":1,"name":"Home","item":"https://www.askloom.com/"},
    {"@type":"ListItem","position":2,"name":"Product","item":"https://www.askloom.com/product"},
    {"@type":"ListItem","position":3,"name":"Opportunity Engine","item":"https://www.askloom.com/opportunity-engine"}
  ]
}
</script>
```

## FAQPage
Generate from the exact FAQs visibly rendered on `/faq`. Never place hidden or unrelated questions in structured data.

## Comparison freshness
Every comparison page must show a visible `Last reviewed: <date>` and link to official competitor sources used to verify mutable claims. Review before major launches and whenever pricing/features materially change.
