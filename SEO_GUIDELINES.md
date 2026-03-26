# SEO & Content Guidelines — Revenue Map

Unified rules for all public pages, blog posts, ideas, knowledge base, and marketing content.
Follow these when creating or editing any indexable page.

---

## 1. Page Structure Requirements

Every public page MUST have:

- **Unique `<title>`** — under 60 characters, include primary keyword
- **Meta description** — 120–155 characters, include CTA or value prop
- **Canonical URL** — `alternates.canonical` pointing to the definitive URL
- **Open Graph tags** — title, description, url (image optional but recommended)
- **H1 tag** — one per page, matches search intent, contains primary keyword
- **Breadcrumb navigation** — visual + BreadcrumbList schema (Home → Section → Page)
- **Internal links** — minimum 3 internal links per page (to related content, ideas, models, blog)
- **Structured data** — appropriate schema.org type (see section 4)

## 2. Content Quality Rules

### Minimum content
- **Ideas pages**: 500+ words of unique editorial content (overview, tips, how-to section)
- **Blog posts**: 800+ words, original analysis or perspective
- **Knowledge base**: 400+ words with formula, explanation, and practical example
- **Model pages**: 600+ words with features, use cases, and FAQs

### Anti-AI-detection patterns
Google's Helpful Content System penalizes mass-generated, templated content. Follow these rules:

1. **Vary sentence structure** — mix short and long sentences. Don't start consecutive paragraphs the same way.
2. **Include specific data** — reference concrete numbers, dates, real examples. "Revenue is projected to exceed $150B by 2027" beats "Revenue is growing fast."
3. **Add editorial perspective** — opinions, caveats, "here's what we've seen" phrasing. First person ("we picked", "we noticed") signals human curation.
4. **Break template uniformity** — not every ideas page should have identical sections. Vary the order, add unique subsections relevant to the niche.
5. **Use conversational bridges** — "Here's the thing:", "That said,", "The honest answer is" — natural transitions that AI rarely produces in bulk.
6. **Include caveats and nuance** — "This won't work if...", "The exception is...", "One risk to watch:" — balanced takes signal editorial thought.
7. **Cross-reference other site content** — link to specific blog posts, models, or knowledge base entries that are relevant. This proves topical depth.
8. **Attribution** — "Curated by the Revenue Map team", "Last updated: [month year]" — signals ongoing human maintenance.

### What to avoid
- Identical paragraph structures across sibling pages
- Generic filler ("In today's fast-paced world...")
- Lists without context or editorial commentary
- Thin pages with only structured data and no body text
- Orphan pages with no inbound internal links

## 3. Internal Linking Rules

### Every page must link to:
- At least 2 related pages in the same section (e.g., ideas → other ideas)
- At least 1 page in a different section (e.g., ideas → relevant model or blog post)
- The parent index page (e.g., ideas/[slug] → /ideas)

### Link placement priority:
1. **In-content contextual links** (highest value) — within paragraphs, naturally worded
2. **"Related" sections** — cross-link grids at bottom of content
3. **Breadcrumbs** — always present, both visual and schema
4. **Navigation** — navbar dropdown and footer links
5. **Sitemap** — every indexable page must be in sitemap.ts

### Footer link strategy:
- Include top 7-9 links per section
- Rotate featured ideas/models quarterly to distribute link equity
- Always include index pages (/ideas, /models, /knowledge-base, /blog)

## 4. Structured Data by Page Type

| Page Type | Required Schema |
|---|---|
| Ideas index | CollectionPage, FAQPage |
| Ideas/[slug] | BreadcrumbList, ItemList, FAQPage |
| Models index | CollectionPage |
| Models/[slug] | FAQPage, BreadcrumbList |
| Blog post | Article, BreadcrumbList |
| Knowledge base | BreadcrumbList, FAQPage |
| Homepage | SoftwareApplication, Organization |
| Pricing | (Organization from root layout) |

### FAQPage rules:
- Minimum 2 questions, maximum 5
- Answers must be substantial (2+ sentences)
- Questions should match real search queries (check Google autocomplete)
- Don't reuse identical Q&A across pages

## 5. Technical SEO

### robots.txt
All public content sections must be in the Allow list:
```
Allow: ["/", "/blog", "/blog/", "/pricing", "/ideas", "/ideas/", "/models", "/models/", "/knowledge-base", "/knowledge-base/"]
```

### Sitemap
- All indexable pages must be in `src/app/sitemap.ts`
- Use appropriate `changeFrequency` and `priority` values
- Blog posts: use frontmatter `sitemapPriority` and `sitemapChangeFreq`
- Remove any noindex or redirected URLs from sitemap

### Performance
- Core Web Vitals must pass (check with PageSpeed Insights)
- Images: use Next.js `<Image>` with width/height, lazy loading for below-fold
- Fonts: preload heading + body fonts (already configured)
- ISR: use `revalidate` for pages with dynamic data

### Canonical URLs
- Every page must have a canonical URL
- Use `alternates.canonical` in metadata
- Never have two pages with the same canonical
- Trailing slashes: no trailing slash (consistent with Next.js default)

## 6. New Page Checklist

Before deploying any new public page:

- [ ] Title tag unique and under 60 chars
- [ ] Meta description 120-155 chars with value prop
- [ ] Canonical URL set
- [ ] Open Graph tags present
- [ ] Single H1 containing primary keyword
- [ ] 3+ internal links in content
- [ ] Breadcrumb (visual + schema)
- [ ] Appropriate structured data (see table)
- [ ] Added to sitemap.ts
- [ ] Confirmed in robots.txt Allow list
- [ ] 500+ words of unique content
- [ ] Cross-links to related pages
- [ ] No duplicate content with other pages
- [ ] Mobile responsive
- [ ] PageSpeed score > 90

## 7. Blog Post Requirements

In addition to general rules:

- **Frontmatter**: title, date, description, category, tags, author, image
- **Optional frontmatter**: dateModified, canonicalUrl, sitemapPriority, sitemapChangeFreq
- **Images**: OG image 1200x630, inline images with alt text
- **Structure**: intro paragraph, 2-5 H2 sections, conclusion with CTA
- **Internal links**: link to at least 1 model page, 1 ideas page, 1 KB entry where relevant
- **External links**: 1-2 authoritative sources (industry reports, official docs) per post
- **Update dateModified** when making significant edits

## 8. Content Calendar Hygiene

- Review "Last updated" dates quarterly — update stale content
- Check Google Search Console monthly for "Crawled - not indexed" pages
- After fixing content issues, use "Request Indexing" in GSC
- Monitor Core Web Vitals in GSC and fix any regressions
