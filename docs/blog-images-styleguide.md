# Blog Images Style Guide — Revenue Map

All blog images follow a consistent dark-theme dashboard aesthetic matching the Revenue Map UI kit.

## Dimensions & Format
- **All images:** 1200 × 630 px (1.91:1 ratio), JPEG quality 92
- **Cover images:** `/public/blog/[slug]/cover.jpg`
- **Inline images:** `/public/blog/[slug]/inline-01.jpg` (sequential numbering)

## Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#0F172A` | Main background |
| Grid | `#1E293B` | Subtle grid lines, borders, card strokes |
| Card fill | `#1E293B` | Metric cards, panels |
| Card stroke | `#334155` | Card borders |
| Chart bg | `#0D1117` | Chart panel background |
| Text primary | `#F8FAFC` | Titles, metric values |
| Text secondary | `#94A3B8` | Labels, descriptions |
| Text muted | `#64748B` | Footer, branding |
| Text faint | `#475569` | Footer text |
| Red | `#EF4444` | Churn, negative trends |
| Green | `#10B981` | Growth, positive trends |
| Blue | `#3B82F6` | Primary accent, scenarios |
| Sky | `#0EA5E9` | E-commerce category |
| Purple | `#8B5CF6` | MRR/SaaS metrics category |
| Amber | `#F59E0B` | Secondary chart series |

## Typography
- **Font family:** Lato (Google Fonts) — weights 400, 700, 900
- **Branding:** "REVENUE MAP" — 14px, weight 700, `#64748B`, letter-spacing 0.05em
- **Title:** 42px (covers) / 36px (inline), weight 900, `#F8FAFC`
- **Subtitle:** 20px (covers) / 16px (inline), weight 400, `#94A3B8`
- **Category badge:** 13px, weight 700, accent color
- **Metric label:** 12px, `#94A3B8`
- **Metric value:** 28px, weight 700, `#F8FAFC`
- **Footer:** 13px, `#475569`

## Layout Structure (Cover Images)
```
┌──────────────────────────────────────────────────┐
│  REVENUE MAP                                      │
│  [Category Badge]                                 │
│                                                    │
│  Title (42px bold)                    ┌──────────┐│
│  Subtitle (20px)                      │  Chart   ││
│                                       │  Panel   ││
│  ┌─────┐ ┌─────┐ ┌─────┐            │  460×300 ││
│  │Card1│ │Card2│ │Card3│            │          ││
│  │180px│ │180px│ │180px│            └──────────┘│
│  └─────┘ └─────┘ └─────┘                        │
│──────────────────────────────────────────────────│
│  revenuemap.app          Financial Modeling...    │
└──────────────────────────────────────────────────┘
```

## Category Accent Colors
- **SaaS Metrics:** `#EF4444` (red) or `#8B5CF6` (purple)
- **E-commerce:** `#0EA5E9` (sky)
- **Financial Modeling:** `#10B981` (green)
- **Default / Blog:** `#3B82F6` (blue)

## Chart Types
- **line-up:** Growth curve with area fill (10% opacity), dashed optimistic line
- **line-down:** Declining curve with area fill, dot markers
- **bars:** Grouped vertical bars (two series)
- **waterfall:** Stacked blocks with connecting dashes

## Generation
```bash
# Generate all blog images (covers + inline)
node scripts/generate-covers.mjs

# Requires: playwright (npm install --save-dev playwright)
# First time: npx playwright install chromium
```
