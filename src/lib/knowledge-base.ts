import type { ProductType } from "./model-registry";

/* ─── Category definitions ─── */

export const METRIC_CATEGORIES = [
  "revenue",
  "acquisition",
  "retention",
  "unit-economics",
  "growth",
  "financial",
  "operational",
] as const;

export type MetricCategory = (typeof METRIC_CATEGORIES)[number];

export const CATEGORY_META: Record<
  MetricCategory,
  { label: string; description: string; color: string }
> = {
  revenue: {
    label: "Revenue Metrics",
    description: "Track and forecast recurring and transactional revenue streams",
    color: "#10B981",
  },
  acquisition: {
    label: "Acquisition Metrics",
    description: "Measure the cost and efficiency of acquiring new customers",
    color: "#F59E0B",
  },
  retention: {
    label: "Retention & Churn",
    description: "Understand how well you keep customers and revenue over time",
    color: "#EF4444",
  },
  "unit-economics": {
    label: "Unit Economics",
    description: "Evaluate per-customer profitability and payback periods",
    color: "#8B5CF6",
  },
  growth: {
    label: "Growth & Efficiency",
    description: "Assess growth quality and capital efficiency at scale",
    color: "#2163E7",
  },
  financial: {
    label: "Financial Health",
    description: "Monitor cash position, burn rate, and overall profitability",
    color: "#6366F1",
  },
  operational: {
    label: "Operational Metrics",
    description: "Track funnel conversions, user activity, and pipeline health",
    color: "#0EA5E9",
  },
};

/* ─── Calculator field types ─── */

export interface CalculatorField {
  name: string;
  label: string;
  defaultValue: number;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
}

export interface CalculatorResult {
  label: string;
  prefix?: string;
  suffix?: string;
}

/* ─── Benchmark row ─── */

export interface BenchmarkRow {
  segment: string;
  good: string;
  average: string;
  poor: string;
}

/* ─── FAQ item ─── */

export interface FaqItem {
  question: string;
  answer: string;
}

/* ─── Metric definition ─── */

export interface MetricDefinition {
  slug: string;
  name: string;
  shortName: string;
  category: MetricCategory;
  description: string;
  whyItMatters: string;
  howToCalculate: string;
  formula: string;
  formulaLabel: string;
  calculatorFields: CalculatorField[];
  calculatorResult: CalculatorResult;
  calculatorFormula: string;
  benchmarks: BenchmarkRow[];
  models: ProductType[];
  expertTips: string[];
  faq: FaqItem[];
  relatedSlugs: string[];
  keyword: string;
  speakable: string;
}

/* ─── Registry ─── */

export const METRICS: MetricDefinition[] = [
  // ════════════════════════════════════════════════════════════
  // REVENUE METRICS
  // ════════════════════════════════════════════════════════════
  {
    slug: "mrr",
    name: "Monthly Recurring Revenue (MRR)",
    shortName: "MRR",
    category: "revenue",
    description:
      "Monthly Recurring Revenue is the predictable revenue a business earns every month from active subscriptions. It normalizes weekly, monthly, and annual plans into a single monthly figure — making it the foundation metric for any recurring revenue business.",
    whyItMatters:
      "MRR is the single most important metric for subscription and SaaS businesses because it captures revenue momentum in real time. Unlike total revenue, MRR strips out one-time charges and gives you a clean signal of recurring health. Investors use MRR to evaluate growth rate, and operators use it to forecast cash flow, plan hiring, and set targets. A business growing MRR at 15%+ month-over-month in early stages is generally on a strong trajectory. Without MRR, you are flying blind on whether your recurring engine is accelerating or stalling.",
    howToCalculate:
      "Sum the monthly-normalized value of every active subscription. Weekly plans are multiplied by ~4.33, annual plans are divided by 12. Only include recurring charges — exclude one-time fees, setup charges, and usage overages unless they recur predictably.",
    formula: "MRR = Σ (Monthly subscription value of each active customer)",
    formulaLabel: "MRR Formula",
    calculatorFields: [
      { name: "customers", label: "Active Subscribers", defaultValue: 500, min: 0, step: 10 },
      { name: "arpu", label: "Avg Revenue per User / Month", defaultValue: 29, min: 0, prefix: "$", step: 1 },
    ],
    calculatorResult: { label: "Monthly Recurring Revenue", prefix: "$" },
    calculatorFormula: "customers * arpu",
    benchmarks: [
      { segment: "Early-stage SaaS", good: ">$50K", average: "$10K–$50K", poor: "<$10K" },
      { segment: "Growth SaaS", good: ">$500K", average: "$100K–$500K", poor: "<$100K" },
      { segment: "Consumer Subscription", good: ">$100K", average: "$20K–$100K", poor: "<$20K" },
      { segment: "Mobile App", good: ">$30K", average: "$5K–$30K", poor: "<$5K" },
    ],
    models: ["subscription", "saas", "fintech", "healthtech", "edtech", "ai-ml"],
    expertTips: [
      "Track MRR by component: New MRR, Expansion MRR, Contraction MRR, and Churned MRR. The net tells you where growth is actually coming from.",
      "Never include one-time revenue in MRR. Setup fees, professional services, and hardware sales distort the recurring picture and mislead investors.",
      "Compare MRR growth rate month-over-month, not absolute MRR. A $5K MRR company growing 20% monthly will outperform a $50K MRR company growing 3% within a year.",
      "If you offer annual plans, track the split between monthly and annual MRR separately. Annual contracts reduce churn risk but can mask monthly retention problems.",
    ],
    faq: [
      {
        question: "What is MRR and why is it important?",
        answer:
          "MRR (Monthly Recurring Revenue) is the total predictable revenue your business earns each month from subscriptions. It's the primary metric for subscription businesses because it shows revenue momentum, helps forecast cash flow, and is the first number investors look at when evaluating recurring revenue companies.",
      },
      {
        question: "How is MRR different from total revenue?",
        answer:
          "Total revenue includes one-time payments, setup fees, and non-recurring charges. MRR only counts recurring subscription revenue, normalized to a monthly basis. This makes MRR a cleaner measure of your business's sustainable revenue engine.",
      },
      {
        question: "What is a good MRR growth rate?",
        answer:
          "For early-stage startups, 15-20% month-over-month MRR growth is considered strong. As companies scale past $1M ARR, growth rates typically slow to 5-10% monthly. The T2D3 framework (triple, triple, double, double, double annually) is a common benchmark for venture-backed SaaS.",
      },
      {
        question: "How do I calculate MRR from annual plans?",
        answer:
          "Divide the annual subscription value by 12. For example, a $1,200/year plan contributes $100/month to MRR. Do not recognize the full annual amount upfront — that would overstate your monthly recurring revenue.",
      },
    ],
    relatedSlugs: ["arr", "net-new-mrr", "nrr", "arpu", "churn-rate"],
    keyword: "monthly recurring revenue MRR",
    speakable:
      "Monthly Recurring Revenue, or MRR, is the total predictable revenue earned each month from active subscriptions. Calculate it by summing the monthly value of all active subscriptions. For early-stage SaaS, MRR above $50,000 is considered healthy. MRR is the foundation metric for any subscription or SaaS business.",
  },
  {
    slug: "arr",
    name: "Annual Recurring Revenue (ARR)",
    shortName: "ARR",
    category: "revenue",
    description:
      "Annual Recurring Revenue is MRR multiplied by 12. It represents the annualized value of your recurring subscription revenue and is the standard metric used by B2B SaaS companies to communicate scale to investors and stakeholders.",
    whyItMatters:
      "ARR is the lingua franca of SaaS valuation. Revenue multiples, growth benchmarks, and funding milestones are all expressed in ARR terms. Crossing $1M ARR, $10M ARR, and $100M ARR are recognized inflection points that unlock different investor classes and valuation tiers. ARR also smooths out monthly noise, making it easier to spot long-term trends.",
    howToCalculate:
      "Multiply your current MRR by 12. ARR should only include recurring revenue — exclude professional services, one-time implementation fees, and variable usage charges unless contracted.",
    formula: "ARR = MRR × 12",
    formulaLabel: "ARR Formula",
    calculatorFields: [
      { name: "mrr", label: "Current MRR", defaultValue: 45000, min: 0, prefix: "$", step: 1000 },
    ],
    calculatorResult: { label: "Annual Recurring Revenue", prefix: "$" },
    calculatorFormula: "mrr * 12",
    benchmarks: [
      { segment: "Seed-stage SaaS", good: ">$1M", average: "$300K–$1M", poor: "<$300K" },
      { segment: "Series A SaaS", good: ">$5M", average: "$1M–$5M", poor: "<$1M" },
      { segment: "Series B SaaS", good: ">$20M", average: "$5M–$20M", poor: "<$5M" },
      { segment: "Growth-stage SaaS", good: ">$50M", average: "$20M–$50M", poor: "<$20M" },
    ],
    models: ["saas", "fintech", "healthtech", "edtech", "ai-ml"],
    expertTips: [
      "Use ARR for annual planning and investor communication, but use MRR for operational decisions. ARR smooths over monthly dynamics you need to see.",
      "Only count contracted recurring revenue. Pipeline, trials, and usage estimates should not be included in ARR.",
      "Track net new ARR per quarter as your primary growth metric once past $1M ARR. It shows absolute growth momentum better than percentage growth rates at scale.",
      "ARR milestones ($1M, $5M, $10M, $100M) correlate with specific operational challenges — hiring, process, and go-to-market shifts. Use them as planning triggers.",
    ],
    faq: [
      {
        question: "What is ARR in SaaS?",
        answer:
          "ARR (Annual Recurring Revenue) is the annualized value of your recurring subscription revenue, calculated as MRR × 12. It's the standard metric for B2B SaaS companies to communicate business scale, set valuation benchmarks, and plan annual budgets.",
      },
      {
        question: "When should I use ARR vs MRR?",
        answer:
          "Use MRR for operational decisions, monthly tracking, and identifying trends. Use ARR for investor communication, annual planning, valuation discussions, and comparing against industry benchmarks. Most B2B SaaS companies report ARR externally and track MRR internally.",
      },
      {
        question: "What is a good ARR growth rate?",
        answer:
          "The T2D3 benchmark suggests tripling ARR twice, then doubling three times. At $1M ARR, 200% year-over-year growth is strong. At $10M ARR, 100% is strong. At $50M+, 50%+ is considered top-quartile growth.",
      },
      {
        question: "Does ARR include one-time revenue?",
        answer:
          "No. ARR should only include recurring subscription revenue. One-time fees like setup charges, professional services, and hardware sales should be excluded to keep ARR a clean measure of recurring revenue.",
      },
    ],
    relatedSlugs: ["mrr", "nrr", "rule-of-40", "net-new-mrr"],
    keyword: "annual recurring revenue ARR",
    speakable:
      "Annual Recurring Revenue, or ARR, equals MRR multiplied by 12. It represents the annualized value of subscription revenue and is the standard growth metric for B2B SaaS. Seed-stage companies typically target $1M ARR, Series A targets $5M, and Series B targets $20M or more.",
  },
  {
    slug: "net-new-mrr",
    name: "Net New MRR",
    shortName: "Net New MRR",
    category: "revenue",
    description:
      "Net New MRR is the net change in Monthly Recurring Revenue over a period. It combines new customer revenue, expansion revenue from existing customers, and subtracts contraction and churn — giving you the true growth signal of your recurring business.",
    whyItMatters:
      "Net New MRR tells you whether your recurring revenue engine is accelerating or decelerating. A business can add $50K in new MRR but still shrink if churn and contraction exceed that amount. Decomposing Net New MRR into its four components (new, expansion, contraction, churn) reveals which lever drives growth and which one drags it.",
    howToCalculate:
      "Add New MRR and Expansion MRR, then subtract Contraction MRR and Churned MRR. A positive result means your recurring base grew; negative means it shrank.",
    formula: "Net New MRR = New MRR + Expansion MRR − Contraction MRR − Churned MRR",
    formulaLabel: "Net New MRR Formula",
    calculatorFields: [
      { name: "newMrr", label: "New MRR", defaultValue: 15000, min: 0, prefix: "$", step: 500 },
      { name: "expansion", label: "Expansion MRR", defaultValue: 5000, min: 0, prefix: "$", step: 500 },
      { name: "contraction", label: "Contraction MRR", defaultValue: 2000, min: 0, prefix: "$", step: 500 },
      { name: "churned", label: "Churned MRR", defaultValue: 3000, min: 0, prefix: "$", step: 500 },
    ],
    calculatorResult: { label: "Net New MRR", prefix: "$" },
    calculatorFormula: "newMrr + expansion - contraction - churned",
    benchmarks: [
      { segment: "Early-stage SaaS", good: ">20% of MRR", average: "5–20% of MRR", poor: "<5% or negative" },
      { segment: "Growth SaaS", good: ">10% of MRR", average: "3–10% of MRR", poor: "<3% of MRR" },
      { segment: "Mature SaaS", good: ">5% of MRR", average: "1–5% of MRR", poor: "<1% of MRR" },
      { segment: "Consumer Subscription", good: ">15% of MRR", average: "5–15% of MRR", poor: "<5% of MRR" },
    ],
    models: ["subscription", "saas"],
    expertTips: [
      "If churned MRR consistently exceeds new MRR, you have a leaky bucket problem that no amount of sales will fix. Focus on retention before acquisition.",
      "Expansion MRR from existing customers is the cheapest revenue you can earn. If expansion is less than 20% of net new, you likely have a pricing or upsell gap.",
      "Chart each component monthly on a stacked bar graph. Visually seeing the balance between growth and loss is more powerful than any single number.",
      "Track net new MRR per sales rep and per cohort to isolate which channels and customer segments contribute most to sustainable growth.",
    ],
    faq: [
      {
        question: "What is Net New MRR?",
        answer:
          "Net New MRR is the net change in your monthly recurring revenue. It equals new customer MRR plus expansion revenue from existing customers, minus contraction (downgrades) and churned (cancelled) MRR. It tells you whether your recurring revenue base is growing or shrinking.",
      },
      {
        question: "What are the components of Net New MRR?",
        answer:
          "The four components are: New MRR (revenue from first-time subscribers), Expansion MRR (upgrades and add-ons from existing customers), Contraction MRR (downgrades), and Churned MRR (cancellations). Each component tells you something different about business health.",
      },
      {
        question: "What is a healthy Net New MRR ratio?",
        answer:
          "For early-stage companies, net new MRR should represent 15-25% of total MRR each month. For growth-stage companies, 5-15% is typical. If net new MRR is negative, you're losing more revenue than you're adding — an urgent signal to investigate churn.",
      },
      {
        question: "How does Net New MRR relate to NRR?",
        answer:
          "NRR measures retention from existing customers only (expansion minus contraction minus churn). Net New MRR adds new customer revenue on top of that. You can have positive Net New MRR even with poor NRR if new sales outpace losses — but this isn't sustainable.",
      },
    ],
    relatedSlugs: ["mrr", "nrr", "churn-rate", "quick-ratio"],
    keyword: "net new MRR formula",
    speakable:
      "Net New MRR is the net change in monthly recurring revenue: new MRR plus expansion MRR minus contraction MRR minus churned MRR. A positive net new MRR means your revenue base is growing. For early-stage SaaS, net new MRR above 15% of total MRR is healthy.",
  },
  {
    slug: "arpu",
    name: "Average Revenue Per User (ARPU)",
    shortName: "ARPU",
    category: "revenue",
    description:
      "ARPU measures the average monthly revenue generated per active user or subscriber. It reflects pricing power, plan mix, and monetization efficiency across your customer base.",
    whyItMatters:
      "ARPU connects your pricing strategy to actual revenue outcomes. Rising ARPU means customers are upgrading or buying more; declining ARPU suggests plan mix is shifting downmarket or discounting is eroding value. Multiplied by user count, ARPU directly determines MRR — so improving it is one of the highest-leverage growth levers available without acquiring a single new customer.",
    howToCalculate:
      "Divide total MRR by the number of active paying users at the end of the period. Only include recurring revenue and only count users with active paid subscriptions.",
    formula: "ARPU = Total MRR ÷ Active Paying Users",
    formulaLabel: "ARPU Formula",
    calculatorFields: [
      { name: "mrr", label: "Total MRR", defaultValue: 50000, min: 0, prefix: "$", step: 1000 },
      { name: "users", label: "Active Paying Users", defaultValue: 1200, min: 1, step: 10 },
    ],
    calculatorResult: { label: "ARPU", prefix: "$" },
    calculatorFormula: "mrr / users",
    benchmarks: [
      { segment: "Consumer App", good: ">$15/mo", average: "$5–$15/mo", poor: "<$5/mo" },
      { segment: "Prosumer / SMB SaaS", good: ">$50/mo", average: "$20–$50/mo", poor: "<$20/mo" },
      { segment: "Mid-market SaaS", good: ">$500/mo", average: "$100–$500/mo", poor: "<$100/mo" },
      { segment: "Enterprise SaaS", good: ">$5,000/mo", average: "$1K–$5K/mo", poor: "<$1K/mo" },
    ],
    models: ["subscription", "saas", "gametech", "edtech", "healthtech", "fintech", "ai-ml"],
    expertTips: [
      "Segment ARPU by plan tier and cohort. A rising blended ARPU can mask a declining ARPU within each tier if the mix simply shifts to higher plans.",
      "Use ARPU trends to validate pricing changes. If you raise prices and ARPU increases without increased churn, the price increase was justified.",
      "Compare ARPU against CAC to get a quick sense of payback. If ARPU is $30/mo and CAC is $300, payback is 10 months — reasonable for most subscription businesses.",
      "For gaming and consumer apps, track ARPU alongside ARPPU (revenue per paying user) to separate monetization rate from paying user value.",
    ],
    faq: [
      {
        question: "What is ARPU?",
        answer:
          "ARPU (Average Revenue Per User) is total MRR divided by active paying users. It measures how much revenue each customer generates on average per month and reflects your pricing power and monetization efficiency.",
      },
      {
        question: "What is a good ARPU for SaaS?",
        answer:
          "ARPU varies dramatically by segment. Consumer apps typically see $5-15/month, SMB SaaS $20-50/month, mid-market $100-500/month, and enterprise $1,000-10,000+/month. The right benchmark depends on your target market and sales model.",
      },
      {
        question: "How can I increase ARPU?",
        answer:
          "Common strategies include introducing higher-priced tiers, adding premium features or add-ons, usage-based pricing components, seat-based expansion, and reducing discounts. The most sustainable approach is building features that deliver enough value to justify higher prices.",
      },
      {
        question: "What is the difference between ARPU and ARPA?",
        answer:
          "ARPU is per user; ARPA is per account. In B2B SaaS with multi-seat accounts, ARPA is usually more meaningful because one account may have many users. In consumer apps, ARPU and ARPA are typically the same since each user is their own account.",
      },
    ],
    relatedSlugs: ["mrr", "ltv", "cac", "churn-rate"],
    keyword: "average revenue per user ARPU",
    speakable:
      "Average Revenue Per User, or ARPU, equals total MRR divided by active paying users. It measures per-customer monetization efficiency. Consumer apps typically see ARPU of $5 to $15 per month, while mid-market SaaS ranges from $100 to $500 per month.",
  },
  {
    slug: "aov",
    name: "Average Order Value (AOV)",
    shortName: "AOV",
    category: "revenue",
    description:
      "Average Order Value is the mean revenue generated per transaction. It is the fundamental revenue metric for e-commerce, marketplace, and transaction-driven businesses — multiplied by order volume, it produces gross revenue.",
    whyItMatters:
      "AOV directly multiplies into revenue, so even small percentage improvements compound significantly at scale. A 10% AOV increase on 10,000 monthly orders at $50 AOV adds $50,000 in monthly revenue with zero additional customer acquisition cost. AOV also feeds into LTV calculations, profitability analysis, and marketing budget allocation — making it one of the most actionable metrics in e-commerce.",
    howToCalculate:
      "Divide total revenue by the number of orders in a given period. Use gross revenue before returns and discounts for the headline number, but also calculate net AOV (after returns and discounts) for profitability analysis.",
    formula: "AOV = Total Revenue ÷ Number of Orders",
    formulaLabel: "AOV Formula",
    calculatorFields: [
      { name: "revenue", label: "Total Revenue", defaultValue: 250000, min: 0, prefix: "$", step: 5000 },
      { name: "orders", label: "Number of Orders", defaultValue: 5000, min: 1, step: 100 },
    ],
    calculatorResult: { label: "Average Order Value", prefix: "$" },
    calculatorFormula: "revenue / orders",
    benchmarks: [
      { segment: "Fashion / Apparel", good: ">$80", average: "$50–$80", poor: "<$50" },
      { segment: "Electronics", good: ">$200", average: "$100–$200", poor: "<$100" },
      { segment: "Food Delivery", good: ">$35", average: "$20–$35", poor: "<$20" },
      { segment: "Beauty / Health", good: ">$60", average: "$30–$60", poor: "<$30" },
    ],
    models: ["ecommerce", "marketplace", "foodtech", "traveltech", "proptech"],
    expertTips: [
      "Bundle products to increase AOV without discounting. Customers perceive bundles as higher value even when the per-item margin is the same.",
      "Set free shipping thresholds 15-20% above current AOV. This simple tactic consistently lifts AOV across e-commerce categories.",
      "Track AOV by acquisition channel. Paid social often drives lower AOV than organic search — factor this into ROAS calculations.",
      "Monitor AOV trends alongside conversion rate. A rising AOV with falling conversion may mean you're losing price-sensitive customers.",
    ],
    faq: [
      {
        question: "What is AOV?",
        answer:
          "AOV (Average Order Value) is total revenue divided by the number of orders. It tells you how much a customer spends per transaction on average and is the primary revenue metric for e-commerce and transactional businesses.",
      },
      {
        question: "What is a good AOV for e-commerce?",
        answer:
          "AOV varies by category: fashion averages $50-80, electronics $100-200, beauty $30-60, and food delivery $20-35. The right benchmark depends on your product category and price positioning.",
      },
      {
        question: "How can I increase my AOV?",
        answer:
          "Proven tactics include product bundling, free shipping thresholds above current AOV, cross-sell recommendations at checkout, volume discounts, and loyalty programs that reward larger purchases. Test one tactic at a time to measure its isolated impact.",
      },
      {
        question: "Is AOV or conversion rate more important?",
        answer:
          "Both matter because revenue equals traffic times conversion rate times AOV. Improving either one lifts revenue. However, AOV improvements don't require more traffic or lower acquisition costs — making them higher-margin growth levers.",
      },
    ],
    relatedSlugs: ["ltv", "cac", "gross-margin", "repeat-rate"],
    keyword: "average order value AOV",
    speakable:
      "Average Order Value, or AOV, equals total revenue divided by the number of orders. Fashion e-commerce typically averages $50 to $80 per order, while food delivery averages $20 to $35. Increasing AOV is one of the highest-leverage growth tactics because it lifts revenue without requiring additional customer acquisition.",
  },

  // ════════════════════════════════════════════════════════════
  // ACQUISITION METRICS
  // ════════════════════════════════════════════════════════════
  {
    slug: "cac",
    name: "Customer Acquisition Cost (CAC)",
    shortName: "CAC",
    category: "acquisition",
    description:
      "Customer Acquisition Cost is the total cost of acquiring a new paying customer, including all sales and marketing spend. It is the entry point of unit economics — every profitability metric depends on how efficiently you convert spend into customers.",
    whyItMatters:
      "CAC determines whether your growth is sustainable or burning cash. A business with strong revenue but unsustainable CAC will run out of runway before reaching profitability. The LTV/CAC ratio, CAC payback period, and gross margin all depend directly on CAC. Investors scrutinize CAC because it reveals whether a company can scale efficiently — doubling spend should ideally less-than-double CAC as channels mature and brand builds.",
    howToCalculate:
      "Divide total sales and marketing spend (including salaries, tools, ad spend, commissions, and allocated overhead) by the number of new customers acquired in the same period. Use a consistent time window — monthly or quarterly.",
    formula: "CAC = Total Sales & Marketing Spend ÷ New Customers Acquired",
    formulaLabel: "CAC Formula",
    calculatorFields: [
      { name: "spend", label: "Total S&M Spend", defaultValue: 50000, min: 0, prefix: "$", step: 1000 },
      { name: "customers", label: "New Customers Acquired", defaultValue: 200, min: 1, step: 10 },
    ],
    calculatorResult: { label: "CAC", prefix: "$" },
    calculatorFormula: "spend / customers",
    benchmarks: [
      { segment: "Consumer App", good: "<$25", average: "$25–$75", poor: ">$75" },
      { segment: "E-Commerce", good: "<$45", average: "$45–$120", poor: ">$120" },
      { segment: "SMB SaaS", good: "<$300", average: "$300–$800", poor: ">$800" },
      { segment: "Enterprise SaaS", good: "<$5,000", average: "$5K–$15K", poor: ">$15K" },
    ],
    models: ["subscription", "ecommerce", "saas", "marketplace", "foodtech", "traveltech", "gametech", "fintech", "healthtech", "edtech", "proptech", "ai-ml"],
    expertTips: [
      "Always calculate fully loaded CAC — include sales salaries, tools, content production, and agency fees, not just ad spend. Blended CAC that only counts ad spend understates true acquisition cost by 30-60%.",
      "Segment CAC by channel. Blended CAC masks that some channels (organic, referral) are nearly free while others (paid social, SEM) are expensive. Allocate budget to the most efficient channels first.",
      "Track CAC payback period alongside CAC. A $500 CAC that pays back in 3 months is better than a $200 CAC that takes 18 months because of low ARPU.",
      "Rising CAC is normal as you scale — the cheapest customers come first. Plan for 20-30% CAC inflation year-over-year and bake it into your financial model.",
    ],
    faq: [
      {
        question: "What is CAC?",
        answer:
          "CAC (Customer Acquisition Cost) is the total sales and marketing spend required to acquire one new paying customer. It includes ad spend, salaries, tools, commissions, and any other cost directly tied to customer acquisition.",
      },
      {
        question: "What is a good CAC for SaaS?",
        answer:
          "For SMB SaaS, CAC under $300 is strong. For mid-market, under $3,000 is healthy. For enterprise, $5,000-$15,000 is typical. The absolute number matters less than the LTV/CAC ratio — aim for 3:1 or higher.",
      },
      {
        question: "How do I reduce CAC?",
        answer:
          "Focus on organic channels (SEO, content, referrals), improve conversion rates through better onboarding, optimize ad targeting, and build word-of-mouth through product quality. Each percentage point of conversion improvement directly reduces CAC.",
      },
      {
        question: "Should I use blended or channel-specific CAC?",
        answer:
          "Both. Use blended CAC for overall business health and investor communication. Use channel-specific CAC for budget allocation decisions — it tells you which channels to invest more in and which to reduce.",
      },
    ],
    relatedSlugs: ["ltv", "ltv-cac-ratio", "cac-payback", "roas"],
    keyword: "customer acquisition cost CAC",
    speakable:
      "Customer Acquisition Cost, or CAC, equals total sales and marketing spend divided by new customers acquired. For SMB SaaS, CAC under $300 is healthy. For e-commerce, under $45 is strong. The key benchmark is the LTV to CAC ratio — aim for 3 to 1 or higher.",
  },
  {
    slug: "cpi",
    name: "Cost Per Install (CPI)",
    shortName: "CPI",
    category: "acquisition",
    description:
      "Cost Per Install measures the average advertising spend required to generate one app install. It is the top-of-funnel acquisition metric for mobile apps and games — the entry point before trial conversion, subscription, or monetization.",
    whyItMatters:
      "CPI sets the floor for your customer acquisition cost. If CPI is $3 and only 5% of installs convert to paid, your effective CAC is $60. Every dollar of CPI increase multiplies through the funnel. Tracking CPI by channel, creative, and geography lets you optimize spend before it cascades into unaffordable acquisition economics.",
    howToCalculate:
      "Divide total paid advertising spend by the number of installs attributed to that spend. Only count paid installs — organic installs should be tracked separately.",
    formula: "CPI = Paid Ad Spend ÷ Paid Installs",
    formulaLabel: "CPI Formula",
    calculatorFields: [
      { name: "adSpend", label: "Paid Ad Spend", defaultValue: 10000, min: 0, prefix: "$", step: 500 },
      { name: "installs", label: "Paid Installs", defaultValue: 5000, min: 1, step: 100 },
    ],
    calculatorResult: { label: "Cost Per Install", prefix: "$" },
    calculatorFormula: "adSpend / installs",
    benchmarks: [
      { segment: "Casual Game (iOS)", good: "<$1.50", average: "$1.50–$3.00", poor: ">$3.00" },
      { segment: "Mid-core Game (iOS)", good: "<$4", average: "$4–$8", poor: ">$8" },
      { segment: "Utility App", good: "<$2", average: "$2–$5", poor: ">$5" },
      { segment: "Subscription App (iOS)", good: "<$3", average: "$3–$7", poor: ">$7" },
    ],
    models: ["subscription", "gametech"],
    expertTips: [
      "CPI varies 2-5x by geography. US/UK installs cost 3-5x more than Southeast Asia. Model LTV by geography alongside CPI to find profitable markets.",
      "Creative fatigue increases CPI over time. Refresh ad creatives every 2-4 weeks to maintain CPI efficiency.",
      "iOS CPIs are typically 30-60% higher than Android due to higher user value. Track CPI and LTV by platform separately.",
      "Organic installs reduce blended CPI but can mask paid channel inefficiency. Always track paid CPI separately from blended CPI.",
    ],
    faq: [
      {
        question: "What is CPI in mobile marketing?",
        answer:
          "CPI (Cost Per Install) is the average amount spent on advertising to generate one app install. It's the top-of-funnel acquisition metric for mobile apps and games, typically ranging from $1 to $7 depending on platform, genre, and geography.",
      },
      {
        question: "What is a good CPI for mobile apps?",
        answer:
          "For casual games on iOS, CPI under $1.50 is strong. For subscription apps, under $3 is healthy. CPIs vary significantly by geography — US installs cost 3-5x more than emerging markets but typically generate higher LTV.",
      },
      {
        question: "How is CPI different from CAC?",
        answer:
          "CPI measures the cost to get someone to install your app. CAC measures the cost to convert them into a paying customer. If CPI is $2 and 10% of installs become paid users, your CAC is $20. CPI is always lower than CAC.",
      },
      {
        question: "How do I lower my CPI?",
        answer:
          "Optimize ad creatives and targeting, test new channels and ad networks, expand into lower-CPI geographies, improve app store conversion rate (icon, screenshots, description), and increase organic installs through ASO and virality.",
      },
    ],
    relatedSlugs: ["cac", "ltv", "roas", "arpu"],
    keyword: "cost per install CPI",
    speakable:
      "Cost Per Install, or CPI, is paid ad spend divided by paid installs. For casual mobile games on iOS, a good CPI is under $1.50. For subscription apps, under $3 is healthy. CPI sets the floor for customer acquisition cost — every dollar of CPI increase multiplies through the conversion funnel.",
  },
  {
    slug: "roas",
    name: "Return on Ad Spend (ROAS)",
    shortName: "ROAS",
    category: "acquisition",
    description:
      "ROAS measures the revenue generated for every dollar spent on advertising. It is the primary efficiency metric for paid acquisition — telling you whether your ad spend is generating profitable returns or burning cash.",
    whyItMatters:
      "ROAS directly measures whether your advertising is profitable. A ROAS below 1.0 means you're spending more on ads than you're earning back. Above 3.0 is generally considered healthy for most business models. Unlike CAC, ROAS is immediately actionable — you can calculate it daily, by channel, by creative, and by audience segment to optimize spend allocation in real time.",
    howToCalculate:
      "Divide the revenue attributed to ad campaigns by the total ad spend for those campaigns. Use the same attribution window consistently (7-day, 28-day, etc.).",
    formula: "ROAS = Revenue from Ads ÷ Ad Spend",
    formulaLabel: "ROAS Formula",
    calculatorFields: [
      { name: "revenue", label: "Revenue from Ads", defaultValue: 150000, min: 0, prefix: "$", step: 5000 },
      { name: "adSpend", label: "Total Ad Spend", defaultValue: 40000, min: 1, prefix: "$", step: 1000 },
    ],
    calculatorResult: { label: "ROAS", suffix: "x" },
    calculatorFormula: "revenue / adSpend",
    benchmarks: [
      { segment: "E-Commerce", good: ">4x", average: "2x–4x", poor: "<2x" },
      { segment: "SaaS", good: ">5x", average: "2x–5x", poor: "<2x" },
      { segment: "Mobile App", good: ">3x", average: "1.5x–3x", poor: "<1.5x" },
      { segment: "Marketplace", good: ">3x", average: "1.5x–3x", poor: "<1.5x" },
    ],
    models: ["subscription", "ecommerce", "saas", "marketplace", "foodtech", "traveltech", "gametech", "fintech", "healthtech", "edtech", "proptech", "ai-ml"],
    expertTips: [
      "ROAS without margin context is misleading. A 3x ROAS with 30% gross margins means you barely break even after fulfillment. Always pair ROAS with gross margin analysis.",
      "Track both immediate ROAS (first purchase) and cumulative ROAS (over customer lifetime). Subscription businesses often have negative Day-0 ROAS but strong 90-day ROAS.",
      "Different channels have different ROAS profiles. Google Search often has higher ROAS than social media because intent is higher — but social scales better.",
      "Set channel-specific ROAS targets based on your margin structure. Don't apply a single ROAS target across channels with different gross margins.",
    ],
    faq: [
      {
        question: "What is ROAS?",
        answer:
          "ROAS (Return on Ad Spend) measures how much revenue you generate for every dollar spent on advertising. A ROAS of 4x means you earned $4 in revenue for every $1 in ad spend.",
      },
      {
        question: "What is a good ROAS?",
        answer:
          "For e-commerce, ROAS above 4x is strong. For SaaS, above 5x is healthy because of higher margins. For mobile apps, above 3x is good. The minimum viable ROAS depends on your gross margin — lower margins require higher ROAS to be profitable.",
      },
      {
        question: "How is ROAS different from ROI?",
        answer:
          "ROAS measures revenue per ad dollar; ROI measures profit per total investment dollar. ROAS only considers ad spend and revenue; ROI includes all costs (COGS, operations, salaries) and measures net profit. A positive ROAS can still mean negative ROI.",
      },
      {
        question: "Why is my ROAS declining?",
        answer:
          "Common causes include audience saturation, creative fatigue, increased competition in your ad auctions, attribution window changes, or seasonality. Test new creatives, audiences, and channels to reverse the trend.",
      },
    ],
    relatedSlugs: ["cac", "ltv", "gross-margin", "cpi"],
    keyword: "return on ad spend ROAS",
    speakable:
      "Return on Ad Spend, or ROAS, equals revenue from ads divided by ad spend. A ROAS of 4x means you earn $4 for every $1 spent. For e-commerce, ROAS above 4x is considered healthy. Always pair ROAS with gross margin analysis — high ROAS with low margins can still mean unprofitable advertising.",
  },

  // ════════════════════════════════════════════════════════════
  // RETENTION & CHURN METRICS
  // ════════════════════════════════════════════════════════════
  {
    slug: "churn-rate",
    name: "Churn Rate",
    shortName: "Churn Rate",
    category: "retention",
    description:
      "Churn rate measures the percentage of customers or revenue lost over a given period. It is the inverse of retention and the single biggest threat to subscription and SaaS business growth — even small changes in churn compound dramatically over time.",
    whyItMatters:
      "Churn is the silent killer of recurring revenue businesses. At 5% monthly churn, you lose 46% of your customers in a year. At 3%, you lose 31%. At 1%, only 11%. This means a 2-percentage-point improvement in monthly churn can nearly double your annual retention. Churn also directly determines LTV: a customer with 5% monthly churn has an expected lifetime of 20 months; at 2%, it's 50 months. Every improvement in churn multiplies the return on every acquisition dollar you've ever spent.",
    howToCalculate:
      "Divide the number of customers (or MRR) lost during a period by the number at the start of that period. Monthly churn rate is most common. For annual churn, use the same formula over a 12-month window.",
    formula: "Monthly Churn Rate = Customers Lost in Month ÷ Customers at Start of Month × 100%",
    formulaLabel: "Churn Rate Formula",
    calculatorFields: [
      { name: "lost", label: "Customers Lost This Month", defaultValue: 50, min: 0, step: 5 },
      { name: "start", label: "Customers at Start of Month", defaultValue: 1000, min: 1, step: 10 },
    ],
    calculatorResult: { label: "Monthly Churn Rate", suffix: "%" },
    calculatorFormula: "(lost / start) * 100",
    benchmarks: [
      { segment: "Enterprise SaaS", good: "<1%/mo", average: "1–2%/mo", poor: ">2%/mo" },
      { segment: "SMB SaaS", good: "<3%/mo", average: "3–5%/mo", poor: ">5%/mo" },
      { segment: "Consumer Subscription", good: "<5%/mo", average: "5–8%/mo", poor: ">8%/mo" },
      { segment: "Mobile App", good: "<6%/mo", average: "6–10%/mo", poor: ">10%/mo" },
    ],
    models: ["subscription", "saas", "fintech", "healthtech", "edtech", "ai-ml", "gametech"],
    expertTips: [
      "Distinguish voluntary churn (cancellations) from involuntary churn (failed payments). Involuntary churn is often 20-40% of total churn and can be reduced with dunning emails and payment retry logic.",
      "Cohort-based churn analysis reveals whether your product is improving. If newer cohorts churn less than older ones, your retention strategy is working.",
      "Revenue churn (MRR lost) is more important than logo churn (customers lost). Losing 10 small customers is less damaging than losing 1 enterprise account.",
      "Always analyze churn by segment, plan tier, and tenure. Month-1 churn is typically 2-3x higher than month-6+ churn — focus onboarding improvements where the drop-off is steepest.",
    ],
    faq: [
      {
        question: "What is churn rate?",
        answer:
          "Churn rate is the percentage of customers or revenue lost over a period, typically measured monthly. A 5% monthly churn rate means you lose 5 out of every 100 customers each month. It's the inverse of retention and the primary health metric for subscription businesses.",
      },
      {
        question: "What is a good churn rate for SaaS?",
        answer:
          "For enterprise SaaS, monthly churn below 1% is excellent. For SMB SaaS, below 3% is healthy. For consumer subscriptions, below 5% is good. Annual churn rates of 5-7% are considered world-class for B2B SaaS.",
      },
      {
        question: "How does churn rate affect LTV?",
        answer:
          "LTV equals ARPU divided by churn rate. So a customer with $50 ARPU and 5% monthly churn has an LTV of $1,000. Reducing churn to 2% increases LTV to $2,500 — a 150% improvement from a 3-percentage-point churn reduction.",
      },
      {
        question: "What causes high churn?",
        answer:
          "Common causes include poor onboarding, lack of product-market fit, pricing misalignment, missing features, poor customer support, and competitive alternatives. Analyzing churn by cohort, segment, and tenure helps identify the root cause.",
      },
    ],
    relatedSlugs: ["nrr", "grr", "ltv", "mrr", "quick-ratio"],
    keyword: "churn rate calculation",
    speakable:
      "Churn rate is the percentage of customers lost over a period. Monthly churn rate equals customers lost divided by customers at start of month. For enterprise SaaS, below 1% monthly is excellent. For SMB SaaS, below 3% is healthy. Reducing churn from 5% to 2% monthly increases customer lifetime value by 150%.",
  },
  {
    slug: "nrr",
    name: "Net Revenue Retention (NRR)",
    shortName: "NRR",
    category: "retention",
    description:
      "Net Revenue Retention measures the percentage of recurring revenue retained from existing customers over a period, including expansion (upgrades, add-ons) and contraction (downgrades, churn). NRR above 100% means you grow even without acquiring new customers.",
    whyItMatters:
      "NRR is the single most powerful predictor of long-term SaaS success. A company with 120% NRR doubles its existing customer revenue every ~3.8 years even if it never acquires another customer. This compounding effect is why high-NRR companies command premium valuations — Snowflake, Datadog, and Twilio all had NRR above 130% during their hypergrowth phases. NRR above 100% is the clearest signal of product-market fit because it means customers are voluntarily spending more over time.",
    howToCalculate:
      "Take the MRR from a cohort of customers at the start of a period. At the end of the period, sum their current MRR (including expansions and after subtracting contractions and churn). Divide the end amount by the start amount.",
    formula: "NRR = (Starting MRR + Expansion − Contraction − Churn) ÷ Starting MRR × 100%",
    formulaLabel: "NRR Formula",
    calculatorFields: [
      { name: "startMrr", label: "Starting MRR (existing customers)", defaultValue: 100000, min: 0, prefix: "$", step: 5000 },
      { name: "expansion", label: "Expansion MRR", defaultValue: 15000, min: 0, prefix: "$", step: 1000 },
      { name: "contraction", label: "Contraction MRR", defaultValue: 3000, min: 0, prefix: "$", step: 1000 },
      { name: "churn", label: "Churned MRR", defaultValue: 5000, min: 0, prefix: "$", step: 1000 },
    ],
    calculatorResult: { label: "Net Revenue Retention", suffix: "%" },
    calculatorFormula: "((startMrr + expansion - contraction - churn) / startMrr) * 100",
    benchmarks: [
      { segment: "Enterprise SaaS", good: ">130%", average: "110–130%", poor: "<110%" },
      { segment: "Mid-market SaaS", good: ">115%", average: "100–115%", poor: "<100%" },
      { segment: "SMB SaaS", good: ">100%", average: "85–100%", poor: "<85%" },
      { segment: "Consumer Subscription", good: ">95%", average: "80–95%", poor: "<80%" },
    ],
    models: ["saas", "subscription", "fintech", "healthtech", "edtech", "ai-ml"],
    expertTips: [
      "NRR above 100% is the strongest signal of product-market fit. If existing customers spend more over time, your product delivers increasing value.",
      "To improve NRR, build natural expansion paths: usage-based pricing, seat-based growth, premium features, and add-on modules.",
      "Track NRR by cohort to see if newer customers expand faster. If they do, your product and onboarding are improving.",
      "NRR below 100% means your revenue base shrinks every period — you need to acquire new customers just to stay flat. This is unsustainable at scale.",
    ],
    faq: [
      {
        question: "What is NRR?",
        answer:
          "NRR (Net Revenue Retention) measures the percentage of revenue retained from existing customers over time, including expansion and contraction. NRR of 120% means existing customers generate 20% more revenue this period than last, even before counting new customers.",
      },
      {
        question: "What is a good NRR for SaaS?",
        answer:
          "For enterprise SaaS, NRR above 130% is world-class (Snowflake, Datadog levels). For mid-market, above 115% is strong. For SMB, above 100% is the target. NRR below 100% means you're losing revenue from existing customers.",
      },
      {
        question: "How is NRR different from GRR?",
        answer:
          "GRR (Gross Revenue Retention) measures revenue retained excluding expansion — it only accounts for churn and contraction. NRR adds expansion back in. GRR shows your retention floor; NRR shows the full picture including growth from existing customers.",
      },
      {
        question: "How do I improve NRR?",
        answer:
          "Reduce churn through better onboarding and support. Increase expansion through usage-based pricing, seat growth, premium tiers, and add-on products. The best lever depends on whether your NRR problem is driven by high churn or low expansion.",
      },
    ],
    relatedSlugs: ["grr", "churn-rate", "mrr", "arr", "quick-ratio"],
    keyword: "net revenue retention NRR",
    speakable:
      "Net Revenue Retention, or NRR, measures the percentage of recurring revenue retained from existing customers including expansions and churn. NRR above 100% means you grow without new customers. Enterprise SaaS companies with NRR above 130% are considered world-class.",
  },
  {
    slug: "grr",
    name: "Gross Revenue Retention (GRR)",
    shortName: "GRR",
    category: "retention",
    description:
      "Gross Revenue Retention measures the percentage of recurring revenue retained from existing customers excluding any expansion. It shows the pure retention floor — how much revenue you keep before upsells compensate for losses.",
    whyItMatters:
      "GRR reveals the raw health of your customer base without the masking effect of expansion revenue. A company with 85% GRR and 115% NRR looks healthy on NRR, but is actually losing 15% of revenue from existing customers every period — expansion is just compensating. GRR is the metric that tells you if you have a leaky bucket, while NRR tells you if you're filling it fast enough. Investors increasingly look at GRR alongside NRR because it's harder to game.",
    howToCalculate:
      "Take the MRR at the start of a period from a customer cohort. Subtract contraction and churned MRR (but do not add expansion). Divide by starting MRR. GRR is always ≤100%.",
    formula: "GRR = (Starting MRR − Contraction − Churn) ÷ Starting MRR × 100%",
    formulaLabel: "GRR Formula",
    calculatorFields: [
      { name: "startMrr", label: "Starting MRR", defaultValue: 100000, min: 0, prefix: "$", step: 5000 },
      { name: "contraction", label: "Contraction MRR", defaultValue: 3000, min: 0, prefix: "$", step: 500 },
      { name: "churn", label: "Churned MRR", defaultValue: 5000, min: 0, prefix: "$", step: 500 },
    ],
    calculatorResult: { label: "Gross Revenue Retention", suffix: "%" },
    calculatorFormula: "((startMrr - contraction - churn) / startMrr) * 100",
    benchmarks: [
      { segment: "Enterprise SaaS", good: ">95%", average: "90–95%", poor: "<90%" },
      { segment: "Mid-market SaaS", good: ">90%", average: "85–90%", poor: "<85%" },
      { segment: "SMB SaaS", good: ">85%", average: "75–85%", poor: "<75%" },
      { segment: "Consumer Subscription", good: ">80%", average: "65–80%", poor: "<65%" },
    ],
    models: ["saas"],
    expertTips: [
      "GRR below 80% is a red flag for most SaaS investors. It means you lose more than 20% of existing revenue annually — expansion can't sustainably compensate for that.",
      "The gap between GRR and NRR tells you how dependent you are on expansion. If the gap is large, losing your expansion engine would reveal a serious retention problem.",
      "GRR benchmarks differ by segment: enterprise SaaS should target 95%+, mid-market 90%+, SMB 85%+. These reflect the stickiness difference between contract sizes.",
      "If GRR is declining quarter-over-quarter, investigate by cohort. Newer cohorts with lower GRR suggest product or market fit is deteriorating.",
    ],
    faq: [
      {
        question: "What is GRR?",
        answer:
          "GRR (Gross Revenue Retention) measures the percentage of recurring revenue retained from existing customers, accounting for churn and contraction but excluding expansion. GRR is always 100% or less and shows your retention floor.",
      },
      {
        question: "What is a good GRR for SaaS?",
        answer:
          "Enterprise SaaS should target GRR above 95%. Mid-market above 90%. SMB above 85%. GRR below 80% is a red flag indicating serious retention issues that expansion revenue is masking.",
      },
      {
        question: "How is GRR different from NRR?",
        answer:
          "GRR excludes expansion revenue; NRR includes it. GRR shows pure retention — how much revenue you keep without upsells. NRR shows the net effect including expansion. GRR ≤ 100% always; NRR can exceed 100%.",
      },
      {
        question: "Can GRR be above 100%?",
        answer:
          "No. GRR is capped at 100% because it only accounts for losses (churn and contraction), not gains (expansion). If you retained all revenue with zero churn and zero downgrades, GRR would be exactly 100%.",
      },
    ],
    relatedSlugs: ["nrr", "churn-rate", "mrr", "quick-ratio"],
    keyword: "gross revenue retention GRR",
    speakable:
      "Gross Revenue Retention, or GRR, measures the percentage of recurring revenue retained from existing customers, excluding expansion. Enterprise SaaS should target GRR above 95%. GRR below 80% is a red flag — it means you lose more than 20% of revenue from existing customers annually.",
  },
  {
    slug: "repeat-rate",
    name: "Repeat Purchase Rate",
    shortName: "Repeat Rate",
    category: "retention",
    description:
      "Repeat Purchase Rate measures the percentage of customers who make more than one purchase. It is the primary retention metric for e-commerce and transactional businesses — where revenue depends on customers coming back, not just converting once.",
    whyItMatters:
      "Acquiring a new customer costs 5-7x more than retaining an existing one. A repeat rate of 30% means 70% of your customers buy once and never return — you are essentially paying full acquisition cost for every sale. Improving repeat rate from 25% to 40% doesn't just increase retention — it fundamentally changes your unit economics by amortizing CAC across more purchases, increasing LTV, and reducing dependence on paid acquisition.",
    howToCalculate:
      "Divide the number of customers who made 2+ purchases by the total number of customers in a cohort over a given time window. Use a consistent window (90 days, 6 months, or 12 months).",
    formula: "Repeat Rate = Customers with 2+ Orders ÷ Total Customers × 100%",
    formulaLabel: "Repeat Rate Formula",
    calculatorFields: [
      { name: "repeat", label: "Customers with 2+ Orders", defaultValue: 1200, min: 0, step: 50 },
      { name: "total", label: "Total Customers", defaultValue: 4000, min: 1, step: 50 },
    ],
    calculatorResult: { label: "Repeat Purchase Rate", suffix: "%" },
    calculatorFormula: "(repeat / total) * 100",
    benchmarks: [
      { segment: "Fashion / Apparel", good: ">40%", average: "25–40%", poor: "<25%" },
      { segment: "Grocery / Food", good: ">60%", average: "40–60%", poor: "<40%" },
      { segment: "Beauty / Health", good: ">45%", average: "30–45%", poor: "<30%" },
      { segment: "Electronics", good: ">20%", average: "10–20%", poor: "<10%" },
    ],
    models: ["ecommerce", "marketplace", "foodtech", "traveltech", "proptech"],
    expertTips: [
      "The single most impactful tactic for repeat rate is post-purchase email sequences — a well-timed reorder reminder can lift repeat rate by 10-15 percentage points.",
      "Loyalty programs work, but only if the reward is achievable. Programs where customers need 20+ purchases for a reward have low engagement.",
      "Track repeat rate by cohort month. If newer cohorts have higher repeat rates, your product experience and retention efforts are improving.",
      "Subscription or auto-replenish options convert one-time buyers into recurring revenue. Even a 5% subscription conversion rate meaningfully lifts blended repeat rate.",
    ],
    faq: [
      {
        question: "What is repeat purchase rate?",
        answer:
          "Repeat purchase rate is the percentage of customers who place two or more orders within a defined time window. It measures how effectively you convert first-time buyers into returning customers.",
      },
      {
        question: "What is a good repeat purchase rate for e-commerce?",
        answer:
          "It depends on the category. Grocery and consumables target 60%+. Fashion targets 40%+. Beauty targets 45%+. Electronics is naturally lower at 20%+ due to longer purchase cycles.",
      },
      {
        question: "How can I improve repeat purchase rate?",
        answer:
          "Use post-purchase email sequences, loyalty programs, subscription options, personalized product recommendations, and reorder reminders. Each tactic targets a different reason customers don't return.",
      },
      {
        question: "How does repeat rate affect LTV?",
        answer:
          "Repeat rate directly multiplies LTV. If AOV is $50 and customers average 1.3 purchases, LTV is $65. Improving to 2.0 purchases raises LTV to $100 — a 54% increase with zero change in AOV or acquisition cost.",
      },
    ],
    relatedSlugs: ["ltv", "aov", "cac", "cac-payback"],
    keyword: "repeat purchase rate ecommerce",
    speakable:
      "Repeat purchase rate is the percentage of customers who make two or more purchases. Fashion e-commerce targets above 40%. Grocery targets above 60%. Improving repeat rate from 25% to 40% fundamentally changes unit economics by amortizing customer acquisition cost across more purchases.",
  },

  // ════════════════════════════════════════════════════════════
  // UNIT ECONOMICS
  // ════════════════════════════════════════════════════════════
  {
    slug: "ltv",
    name: "Customer Lifetime Value (LTV)",
    shortName: "LTV",
    category: "unit-economics",
    description:
      "Customer Lifetime Value is the total revenue (or profit) a business expects to earn from a single customer over their entire relationship. It is the fundamental unit economics metric — every acquisition, pricing, and retention decision should be evaluated against LTV.",
    whyItMatters:
      "LTV defines how much you can afford to spend acquiring a customer. A business with $500 LTV can sustainably spend up to ~$167 on acquisition (at a 3:1 LTV/CAC ratio). A business with $5,000 LTV can spend $1,667. This 10x difference in allowable CAC means the high-LTV business can access expensive channels (enterprise sales, conferences, outbound) that the low-LTV business cannot. LTV also compounds with retention improvements — reducing churn by 2 percentage points can increase LTV by 50-100%.",
    howToCalculate:
      "For subscription businesses: ARPU ÷ Monthly Churn Rate. For e-commerce: AOV × Average Purchase Frequency × Average Customer Lifespan. For more precision, use cohort-based LTV analysis that tracks actual revenue over time rather than relying on averages.",
    formula: "LTV = ARPU ÷ Monthly Churn Rate (subscription) or AOV × Frequency × Lifespan (e-commerce)",
    formulaLabel: "LTV Formula",
    calculatorFields: [
      { name: "arpu", label: "Monthly ARPU", defaultValue: 49, min: 0, prefix: "$", step: 1 },
      { name: "churn", label: "Monthly Churn Rate", defaultValue: 4, min: 0.1, max: 100, suffix: "%", step: 0.5 },
    ],
    calculatorResult: { label: "Customer Lifetime Value", prefix: "$" },
    calculatorFormula: "arpu / (churn / 100)",
    benchmarks: [
      { segment: "Consumer App", good: ">$200", average: "$50–$200", poor: "<$50" },
      { segment: "SMB SaaS", good: ">$3,000", average: "$1K–$3K", poor: "<$1K" },
      { segment: "Mid-market SaaS", good: ">$25,000", average: "$10K–$25K", poor: "<$10K" },
      { segment: "Enterprise SaaS", good: ">$100,000", average: "$50K–$100K", poor: "<$50K" },
    ],
    models: ["subscription", "ecommerce", "saas", "marketplace", "foodtech", "traveltech", "gametech", "fintech", "healthtech", "edtech", "proptech", "ai-ml"],
    expertTips: [
      "Use cohort-based LTV, not formula-based LTV, for strategic decisions. Formula LTV (ARPU/churn) assumes constant churn, which is rarely true — early churn is higher than mature churn.",
      "Track LTV by acquisition channel. Organic customers typically have 2-3x higher LTV than paid acquisition customers. This changes your blended economics significantly.",
      "LTV should be calculated on a gross margin basis for accuracy. Revenue-based LTV overstates the value if your margins are thin.",
      "Set a maximum allowable CAC at LTV/3. This ensures you have room for operational costs and profit between the cost of acquisition and the value of the customer.",
    ],
    faq: [
      {
        question: "What is LTV?",
        answer:
          "LTV (Customer Lifetime Value) is the total revenue or profit expected from a single customer over their entire relationship with your business. For subscriptions, it equals ARPU divided by monthly churn rate. It's the foundation of unit economics.",
      },
      {
        question: "What is a good LTV for SaaS?",
        answer:
          "LTV varies by segment: consumer apps target $50-200, SMB SaaS targets $1K-3K, mid-market targets $10K-25K, and enterprise targets $50K+. The absolute number matters less than the LTV/CAC ratio — aim for 3:1 or higher.",
      },
      {
        question: "How do I increase LTV?",
        answer:
          "Three levers: reduce churn (extends customer lifetime), increase ARPU (through upsells, price increases, or usage growth), and improve retention quality (through better onboarding and product experience). Churn reduction is usually the highest-leverage starting point.",
      },
      {
        question: "Should I use revenue LTV or gross profit LTV?",
        answer:
          "Gross profit LTV is more accurate for decision-making because it accounts for the cost of serving each customer. Revenue LTV overstates the value if margins vary by segment. Use revenue LTV for benchmarking comparisons since it's the industry standard.",
      },
    ],
    relatedSlugs: ["ltv-cac-ratio", "cac", "churn-rate", "arpu", "cac-payback"],
    keyword: "customer lifetime value LTV",
    speakable:
      "Customer Lifetime Value, or LTV, is the total revenue expected from a customer over their entire relationship. For subscriptions, LTV equals ARPU divided by monthly churn rate. SMB SaaS typically targets LTV of $1,000 to $3,000. The LTV to CAC ratio should be 3 to 1 or higher for sustainable growth.",
  },
  {
    slug: "ltv-cac-ratio",
    name: "LTV/CAC Ratio",
    shortName: "LTV/CAC",
    category: "unit-economics",
    description:
      "The LTV/CAC ratio compares customer lifetime value to customer acquisition cost. It is the master unit economics metric — a single number that tells you whether your business model is fundamentally viable and how efficiently you convert acquisition spend into long-term value.",
    whyItMatters:
      "LTV/CAC is the single most cited metric in startup fundraising because it answers the fundamental question: can this company grow profitably? A ratio below 1.0 means you're destroying value on every customer. Between 1.0 and 3.0 means growth is possible but tight. Above 3.0 means you have room to invest aggressively in growth. Above 5.0 may mean you're underinvesting in growth. The ratio also reveals which customer segments and channels are most profitable — guiding where to double down and where to cut.",
    howToCalculate:
      "Divide LTV by CAC. Use the same LTV basis (revenue or gross profit) consistently. Both inputs should use the same time period methodology.",
    formula: "LTV/CAC Ratio = Customer Lifetime Value ÷ Customer Acquisition Cost",
    formulaLabel: "LTV/CAC Formula",
    calculatorFields: [
      { name: "ltv", label: "Customer Lifetime Value", defaultValue: 2400, min: 0, prefix: "$", step: 100 },
      { name: "cac", label: "Customer Acquisition Cost", defaultValue: 600, min: 1, prefix: "$", step: 50 },
    ],
    calculatorResult: { label: "LTV/CAC Ratio", suffix: "x" },
    calculatorFormula: "ltv / cac",
    benchmarks: [
      { segment: "SaaS (all segments)", good: ">3x", average: "2x–3x", poor: "<2x" },
      { segment: "E-Commerce", good: ">3x", average: "1.5x–3x", poor: "<1.5x" },
      { segment: "Consumer App", good: ">3x", average: "2x–3x", poor: "<2x" },
      { segment: "Marketplace", good: ">4x", average: "2x–4x", poor: "<2x" },
    ],
    models: ["subscription", "ecommerce", "saas", "marketplace", "foodtech", "traveltech", "gametech", "fintech", "healthtech", "edtech", "proptech", "ai-ml"],
    expertTips: [
      "The 3:1 benchmark is a guideline, not a law. Capital-efficient businesses can operate at 2:1 with fast payback. Capital-intensive businesses may need 5:1+ due to higher operational overhead.",
      "LTV/CAC above 5x often signals underinvestment in growth — you could spend more on acquisition and still maintain healthy economics.",
      "Segment LTV/CAC by channel, geography, and customer size. A blended 3:1 might hide a profitable enterprise channel at 8:1 and an unprofitable SMB channel at 1.5:1.",
      "LTV/CAC is a lagging indicator. By the time you see it deteriorate, the problem (rising CAC or increasing churn) has been building for months. Track leading indicators too.",
    ],
    faq: [
      {
        question: "What is the LTV/CAC ratio?",
        answer:
          "The LTV/CAC ratio divides Customer Lifetime Value by Customer Acquisition Cost. It measures how efficiently you convert acquisition spend into long-term customer value. A ratio of 3:1 means every $1 spent on acquisition generates $3 in customer value.",
      },
      {
        question: "What is a good LTV/CAC ratio?",
        answer:
          "3:1 is the standard benchmark for SaaS and subscription businesses. Below 1:1 means you lose money on every customer. 1-3x means growth is possible but tight. Above 5x may indicate you should invest more in growth.",
      },
      {
        question: "How do I improve my LTV/CAC ratio?",
        answer:
          "Either increase LTV (reduce churn, increase ARPU, improve expansion) or decrease CAC (improve conversion rates, invest in organic channels, optimize ad targeting). Churn reduction typically has the highest impact because it improves LTV exponentially.",
      },
      {
        question: "Is LTV/CAC the same for all business models?",
        answer:
          "The 3:1 benchmark applies broadly, but context matters. Marketplace businesses often target 4:1+ due to two-sided acquisition costs. Enterprise SaaS with annual contracts may accept lower ratios due to higher certainty. E-commerce with thin margins may need higher ratios.",
      },
    ],
    relatedSlugs: ["ltv", "cac", "cac-payback", "gross-margin"],
    keyword: "LTV CAC ratio",
    speakable:
      "The LTV to CAC ratio divides Customer Lifetime Value by Customer Acquisition Cost. A ratio of 3 to 1 is the standard benchmark — meaning every dollar spent on acquisition generates 3 dollars in customer value. Below 1 to 1 means the business loses money on every customer. Above 5 to 1 may signal underinvestment in growth.",
  },
  {
    slug: "cac-payback",
    name: "CAC Payback Period",
    shortName: "CAC Payback",
    category: "unit-economics",
    description:
      "CAC Payback Period is the number of months required to recover the cost of acquiring a customer through their revenue contribution. It measures capital efficiency — how quickly acquisition spend turns into return.",
    whyItMatters:
      "CAC payback determines your cash flow requirements. A 6-month payback means you need 6 months of working capital per new customer before breaking even. An 18-month payback means 18 months. This directly impacts how fast you can grow without external funding — shorter payback lets you reinvest acquisition returns faster, creating a self-funding growth engine. Investors target payback under 12 months for capital-efficient SaaS and under 18 months for enterprise.",
    howToCalculate:
      "Divide CAC by the monthly gross profit per customer (ARPU × gross margin). For e-commerce, divide CAC by gross profit per order and multiply by the expected time between orders.",
    formula: "CAC Payback = CAC ÷ (ARPU × Gross Margin %)",
    formulaLabel: "CAC Payback Formula",
    calculatorFields: [
      { name: "cac", label: "Customer Acquisition Cost", defaultValue: 500, min: 0, prefix: "$", step: 50 },
      { name: "arpu", label: "Monthly ARPU", defaultValue: 49, min: 0.01, prefix: "$", step: 1 },
      { name: "margin", label: "Gross Margin", defaultValue: 80, min: 1, max: 100, suffix: "%", step: 1 },
    ],
    calculatorResult: { label: "CAC Payback Period", suffix: " months" },
    calculatorFormula: "cac / (arpu * (margin / 100))",
    benchmarks: [
      { segment: "Top-quartile SaaS", good: "<6 months", average: "6–12 months", poor: ">12 months" },
      { segment: "Median SaaS", good: "<12 months", average: "12–18 months", poor: ">18 months" },
      { segment: "E-Commerce", good: "<3 months", average: "3–6 months", poor: ">6 months" },
      { segment: "Consumer App", good: "<3 months", average: "3–9 months", poor: ">9 months" },
    ],
    models: ["subscription", "ecommerce", "saas", "marketplace", "foodtech", "traveltech", "gametech", "fintech", "healthtech", "edtech", "proptech", "ai-ml"],
    expertTips: [
      "CAC payback on a gross margin basis is more accurate than revenue basis. A $50 ARPU with 80% margin produces $40 of monthly gross profit — payback is 25% longer than the revenue-based calculation suggests.",
      "If payback exceeds 18 months, prioritize reducing CAC or increasing ARPU before scaling acquisition spend. Scaling with long payback burns cash fast.",
      "Annual contracts with upfront payment can dramatically improve effective payback — you recover CAC immediately instead of over 12+ months.",
      "Track payback by cohort. If newer cohorts have longer payback, your unit economics may be deteriorating even if aggregate metrics look stable.",
    ],
    faq: [
      {
        question: "What is CAC payback period?",
        answer:
          "CAC payback period is the number of months it takes to recover the cost of acquiring a customer through their gross profit contribution. A 10-month payback means a customer becomes profitable after 10 months.",
      },
      {
        question: "What is a good CAC payback for SaaS?",
        answer:
          "Under 12 months is strong for most SaaS businesses. Top-quartile companies achieve under 6 months. Enterprise SaaS with longer sales cycles may accept up to 18 months. Beyond 18 months is a warning sign for capital efficiency.",
      },
      {
        question: "How do I reduce CAC payback?",
        answer:
          "Three paths: lower CAC (better conversion, organic channels), increase ARPU (higher pricing, upsells), or improve gross margin (reduce serving costs). Annual upfront billing also recovers CAC faster by pulling revenue forward.",
      },
      {
        question: "How does payback period relate to LTV/CAC?",
        answer:
          "They measure different aspects of the same economics. LTV/CAC tells you total return on acquisition. Payback tells you how quickly you get that return. A 5:1 LTV/CAC with 24-month payback is capital-intensive despite good lifetime economics. Both matter.",
      },
    ],
    relatedSlugs: ["cac", "ltv", "ltv-cac-ratio", "arpu", "gross-margin"],
    keyword: "CAC payback period",
    speakable:
      "CAC Payback Period is the number of months to recover customer acquisition cost through gross profit. For SaaS, under 12 months is strong. Top-quartile companies achieve under 6 months. Calculate it as CAC divided by monthly ARPU times gross margin percentage.",
  },
  {
    slug: "gross-margin",
    name: "Gross Margin",
    shortName: "Gross Margin",
    category: "unit-economics",
    description:
      "Gross Margin is the percentage of revenue remaining after subtracting the direct costs of delivering your product or service (COGS). It measures how efficiently you turn revenue into profit before operating expenses.",
    whyItMatters:
      "Gross margin sets the ceiling on your business model's profitability. A business with 80% gross margins (typical SaaS) has $0.80 of every revenue dollar available for sales, marketing, R&D, and profit. A business with 30% margins (typical e-commerce with physical goods) has only $0.30. This fundamental difference determines pricing power, scalability, and valuation multiples — high-margin businesses command 10-20x revenue multiples while low-margin businesses trade at 1-3x.",
    howToCalculate:
      "Subtract COGS from revenue, then divide by revenue and multiply by 100. For SaaS, COGS includes hosting, third-party API costs, and customer support. For e-commerce, COGS includes product cost, shipping, and packaging.",
    formula: "Gross Margin = ((Revenue − COGS) ÷ Revenue) × 100%",
    formulaLabel: "Gross Margin Formula",
    calculatorFields: [
      { name: "revenue", label: "Revenue", defaultValue: 100000, min: 0, prefix: "$", step: 5000 },
      { name: "cogs", label: "Cost of Goods Sold", defaultValue: 25000, min: 0, prefix: "$", step: 1000 },
    ],
    calculatorResult: { label: "Gross Margin", suffix: "%" },
    calculatorFormula: "((revenue - cogs) / revenue) * 100",
    benchmarks: [
      { segment: "SaaS", good: ">80%", average: "70–80%", poor: "<70%" },
      { segment: "E-Commerce (digital)", good: ">70%", average: "50–70%", poor: "<50%" },
      { segment: "E-Commerce (physical)", good: ">50%", average: "30–50%", poor: "<30%" },
      { segment: "Marketplace", good: ">60%", average: "40–60%", poor: "<40%" },
    ],
    models: ["subscription", "ecommerce", "saas", "marketplace", "foodtech", "traveltech", "gametech", "fintech", "healthtech", "edtech", "proptech", "ai-ml"],
    expertTips: [
      "SaaS businesses should target 75%+ gross margins. If yours is below 70%, audit hosting costs, third-party APIs, and customer support allocation.",
      "For e-commerce, include shipping, packaging, payment processing, and returns in COGS. Many businesses understate COGS by excluding fulfillment costs.",
      "Gross margin should improve with scale for SaaS (fixed hosting costs spread over more customers) but may decline for e-commerce (shipping costs scale linearly).",
      "Investors use gross margin to categorize businesses: 70%+ is 'software economics', 40-70% is 'services economics', below 40% is 'product economics'. Each has different valuation expectations.",
    ],
    faq: [
      {
        question: "What is gross margin?",
        answer:
          "Gross margin is the percentage of revenue remaining after subtracting direct costs (COGS). A 75% gross margin means you keep $0.75 of every dollar of revenue after covering the cost of delivering your product.",
      },
      {
        question: "What is a good gross margin for SaaS?",
        answer:
          "SaaS businesses should target 75-85% gross margins. Best-in-class achieve 85%+. Below 70% warrants investigation into hosting costs, third-party services, or customer support allocation.",
      },
      {
        question: "What counts as COGS for software companies?",
        answer:
          "SaaS COGS typically includes hosting and infrastructure costs, third-party API fees, customer support team costs, payment processing fees, and any directly attributable delivery costs. It excludes sales, marketing, R&D, and G&A.",
      },
      {
        question: "How can I improve gross margin?",
        answer:
          "Optimize infrastructure costs (better hosting, caching, CDN), renegotiate vendor contracts, automate customer support, reduce payment processing fees, and increase prices. Price increases improve margin percentage without changing costs.",
      },
    ],
    relatedSlugs: ["ltv", "cac-payback", "rule-of-40", "burn-rate"],
    keyword: "gross margin formula",
    speakable:
      "Gross Margin equals revenue minus COGS divided by revenue, expressed as a percentage. SaaS companies should target 75 to 85% gross margins. E-commerce with physical products typically achieves 30 to 50%. Gross margin determines how much of every revenue dollar is available for growth and profit.",
  },

  // ════════════════════════════════════════════════════════════
  // GROWTH & EFFICIENCY
  // ════════════════════════════════════════════════════════════
  {
    slug: "quick-ratio",
    name: "SaaS Quick Ratio",
    shortName: "Quick Ratio",
    category: "growth",
    description:
      "The SaaS Quick Ratio measures growth efficiency by dividing revenue inflows (new + expansion MRR) by revenue outflows (contraction + churned MRR). It tells you how much revenue you add for every dollar you lose.",
    whyItMatters:
      "Quick Ratio reveals the quality of your growth. A company adding $100K in new MRR while losing $80K has a Quick Ratio of 1.25 — it's growing, but barely. The same new MRR with only $20K in losses gives a Quick Ratio of 5.0 — much healthier growth. Mamoon Hussain at Kleiner Perkins popularized the 4.0 benchmark: for every $1 of MRR lost, you should add $4. Below 1.0 means your MRR is shrinking.",
    howToCalculate:
      "Add New MRR and Expansion MRR. Divide by the sum of Contraction MRR and Churned MRR.",
    formula: "Quick Ratio = (New MRR + Expansion MRR) ÷ (Contraction MRR + Churned MRR)",
    formulaLabel: "Quick Ratio Formula",
    calculatorFields: [
      { name: "newMrr", label: "New MRR", defaultValue: 30000, min: 0, prefix: "$", step: 1000 },
      { name: "expansion", label: "Expansion MRR", defaultValue: 10000, min: 0, prefix: "$", step: 1000 },
      { name: "contraction", label: "Contraction MRR", defaultValue: 3000, min: 0, prefix: "$", step: 500 },
      { name: "churned", label: "Churned MRR", defaultValue: 7000, min: 0, prefix: "$", step: 500 },
    ],
    calculatorResult: { label: "Quick Ratio", suffix: "x" },
    calculatorFormula: "(newMrr + expansion) / (contraction + churned)",
    benchmarks: [
      { segment: "High-growth SaaS", good: ">4x", average: "2x–4x", poor: "<2x" },
      { segment: "Mature SaaS", good: ">2x", average: "1.5x–2x", poor: "<1.5x" },
      { segment: "Consumer Subscription", good: ">3x", average: "1.5x–3x", poor: "<1.5x" },
      { segment: "Any stage", good: ">4x", average: "1x–4x", poor: "<1x (shrinking)" },
    ],
    models: ["saas", "subscription"],
    expertTips: [
      "A Quick Ratio below 1.0 means you're losing revenue faster than you're adding it. This is an emergency that requires immediate focus on retention.",
      "The 4.0 benchmark is aspirational — most growth-stage companies operate between 2.0 and 4.0. Context matters: a 2.0 ratio at $50M ARR is very different from 2.0 at $1M ARR.",
      "Quick Ratio naturally declines as you scale because the denominator (churn) grows with your customer base. A declining ratio isn't always alarming — compare against stage-appropriate benchmarks.",
      "Use Quick Ratio alongside absolute Net New MRR. A 10x ratio on tiny numbers is less meaningful than a 3x ratio on $500K of net new MRR.",
    ],
    faq: [
      {
        question: "What is the SaaS Quick Ratio?",
        answer:
          "The SaaS Quick Ratio measures growth efficiency by dividing new + expansion MRR by contraction + churned MRR. A ratio of 4x means you add $4 of MRR for every $1 lost. It's different from the accounting Quick Ratio (current assets / current liabilities).",
      },
      {
        question: "What is a good SaaS Quick Ratio?",
        answer:
          "4x or higher is the benchmark for healthy growth-stage SaaS. Between 2-4x is acceptable. Below 2x signals that churn is consuming too much of your growth. Below 1x means your MRR base is shrinking.",
      },
      {
        question: "How does Quick Ratio relate to NRR?",
        answer:
          "They measure different things. NRR measures existing customer revenue retention (expansion vs. churn). Quick Ratio adds new customer revenue to the equation. You can have a low NRR (high churn) but a high Quick Ratio if new sales are strong — though this isn't sustainable.",
      },
      {
        question: "Why does Quick Ratio decline as I scale?",
        answer:
          "As your customer base grows, the absolute amount of churn grows too (even at the same churn rate). You need increasingly large new MRR additions to maintain the same ratio. This is normal — focus on maintaining above 2x at scale.",
      },
    ],
    relatedSlugs: ["nrr", "net-new-mrr", "churn-rate", "mrr"],
    keyword: "SaaS quick ratio",
    speakable:
      "The SaaS Quick Ratio measures growth efficiency. It equals new MRR plus expansion MRR divided by contraction MRR plus churned MRR. A ratio of 4x or higher is healthy — meaning you add $4 of revenue for every $1 lost. Below 1x means your MRR base is shrinking.",
  },
  {
    slug: "rule-of-40",
    name: "Rule of 40",
    shortName: "Rule of 40",
    category: "growth",
    description:
      "The Rule of 40 states that a healthy SaaS company's revenue growth rate plus profit margin should exceed 40%. It balances the tradeoff between growth and profitability — you can grow fast with thin margins or grow slowly with fat margins, as long as the sum exceeds 40.",
    whyItMatters:
      "The Rule of 40 is the most widely used benchmark for evaluating the growth-profitability tradeoff in SaaS. A company growing 60% with -20% margins scores 40 — the same as one growing 10% with 30% margins. Both are considered healthy. The metric matters because investors and boards use it to determine capital allocation strategy: companies above 40 are rewarded with higher valuation multiples, while those below face pressure to either accelerate growth or improve profitability.",
    howToCalculate:
      "Add your year-over-year revenue growth rate (as a percentage) to your EBITDA margin (or free cash flow margin). The sum should be 40 or above.",
    formula: "Rule of 40 Score = Revenue Growth Rate (%) + EBITDA Margin (%)",
    formulaLabel: "Rule of 40 Formula",
    calculatorFields: [
      { name: "growth", label: "YoY Revenue Growth Rate", defaultValue: 50, min: -100, max: 500, suffix: "%", step: 5 },
      { name: "margin", label: "EBITDA Margin", defaultValue: -5, min: -100, max: 100, suffix: "%", step: 5 },
    ],
    calculatorResult: { label: "Rule of 40 Score", suffix: "%" },
    calculatorFormula: "growth + margin",
    benchmarks: [
      { segment: "Top-quartile SaaS", good: ">60%", average: "40–60%", poor: "<40%" },
      { segment: "Median public SaaS", good: ">40%", average: "20–40%", poor: "<20%" },
      { segment: "Private growth SaaS", good: ">40%", average: "25–40%", poor: "<25%" },
      { segment: "Late-stage SaaS", good: ">40%", average: "30–40%", poor: "<30%" },
    ],
    models: ["saas", "fintech", "healthtech", "edtech", "ai-ml"],
    expertTips: [
      "At early stages (<$5M ARR), growth should dominate the equation — it's fine to be -30% margin if you're growing 100%+. The profitability component becomes more important past $20M ARR.",
      "Use free cash flow margin instead of EBITDA margin for a more conservative and accurate score. EBITDA can mask capex-heavy spending.",
      "The Rule of 40 is most useful as a board-level strategic metric. It helps settle the 'should we grow faster or become profitable?' debate with a single framework.",
      "Companies consistently above 40 trade at 2-3x the revenue multiple of those below 40. It directly impacts valuation.",
    ],
    faq: [
      {
        question: "What is the Rule of 40?",
        answer:
          "The Rule of 40 states that a SaaS company's growth rate plus profit margin should exceed 40%. It balances the tradeoff between growth and profitability — fast growth can offset losses, and high margins can offset slow growth.",
      },
      {
        question: "How is the Rule of 40 calculated?",
        answer:
          "Add your year-over-year revenue growth rate to your EBITDA margin (or free cash flow margin). For example: 50% growth + (-10%) margin = 40. Both metrics are expressed as percentages.",
      },
      {
        question: "What is a good Rule of 40 score?",
        answer:
          "Above 40% is the benchmark for a healthy SaaS company. Top-quartile public SaaS companies score 60%+. Companies consistently above 40 receive premium valuation multiples from investors.",
      },
      {
        question: "Does the Rule of 40 apply to early-stage startups?",
        answer:
          "It's less relevant pre-$5M ARR because early-stage companies should prioritize growth over profitability. It becomes important as companies approach scale ($10M+ ARR) and need to demonstrate a path to balanced economics.",
      },
    ],
    relatedSlugs: ["arr", "gross-margin", "burn-rate", "magic-number"],
    keyword: "rule of 40 SaaS",
    speakable:
      "The Rule of 40 states that a SaaS company's revenue growth rate plus EBITDA margin should exceed 40%. A company growing 50% with minus 5% margins scores 45 — above the benchmark. Top-quartile SaaS companies score above 60%. The Rule of 40 directly impacts valuation multiples.",
  },
  {
    slug: "magic-number",
    name: "SaaS Magic Number",
    shortName: "Magic Number",
    category: "growth",
    description:
      "The Magic Number measures go-to-market efficiency by dividing the incremental ARR generated in a quarter by the sales and marketing spend in the prior quarter. It tells you how efficiently your S&M spend converts into new recurring revenue.",
    whyItMatters:
      "Magic Number answers a specific question: for every dollar spent on sales and marketing, how much new ARR did you generate? A Magic Number above 1.0 means each S&M dollar produces more than $1 of new ARR — you should step on the gas. Between 0.5 and 1.0 means you need to optimize. Below 0.5 means your go-to-market motion has fundamental efficiency problems. It's particularly useful for deciding when to increase or decrease marketing spend.",
    howToCalculate:
      "Subtract last quarter's ARR from this quarter's ARR to get net new ARR. Divide by last quarter's total sales and marketing spend.",
    formula: "Magic Number = (Current Quarter ARR − Prior Quarter ARR) ÷ Prior Quarter S&M Spend",
    formulaLabel: "Magic Number Formula",
    calculatorFields: [
      { name: "currentArr", label: "Current Quarter ARR", defaultValue: 5500000, min: 0, prefix: "$", step: 100000 },
      { name: "priorArr", label: "Prior Quarter ARR", defaultValue: 4800000, min: 0, prefix: "$", step: 100000 },
      { name: "smSpend", label: "Prior Quarter S&M Spend", defaultValue: 600000, min: 1, prefix: "$", step: 50000 },
    ],
    calculatorResult: { label: "Magic Number", suffix: "x" },
    calculatorFormula: "(currentArr - priorArr) / smSpend",
    benchmarks: [
      { segment: "Efficient SaaS", good: ">1.0x", average: "0.5x–1.0x", poor: "<0.5x" },
      { segment: "Enterprise SaaS", good: ">0.8x", average: "0.5x–0.8x", poor: "<0.5x" },
      { segment: "PLG SaaS", good: ">1.5x", average: "0.8x–1.5x", poor: "<0.8x" },
      { segment: "Growth-stage", good: ">0.75x", average: "0.5x–0.75x", poor: "<0.5x" },
    ],
    models: ["saas"],
    expertTips: [
      "Magic Number above 1.0 = step on the gas. Between 0.5-1.0 = optimize. Below 0.5 = fix fundamentals before spending more.",
      "The one-quarter lag between spend and ARR generation accounts for the typical SaaS sales cycle. For enterprise with longer cycles, consider a two-quarter lag.",
      "PLG (product-led growth) companies often have Magic Numbers above 1.5x because the product itself drives conversion, making S&M spend more efficient.",
      "A declining Magic Number over consecutive quarters signals that your S&M efficiency is deteriorating — often due to market saturation or CAC inflation.",
    ],
    faq: [
      {
        question: "What is the SaaS Magic Number?",
        answer:
          "The Magic Number measures go-to-market efficiency. It equals net new ARR generated this quarter divided by last quarter's sales and marketing spend. Above 1.0x means your S&M spend is efficiently generating recurring revenue.",
      },
      {
        question: "What is a good Magic Number?",
        answer:
          "Above 1.0 is strong — each S&M dollar produces more than $1 of new ARR. Between 0.5-1.0 is acceptable but needs optimization. Below 0.5 indicates fundamental go-to-market inefficiency.",
      },
      {
        question: "Why use a one-quarter lag?",
        answer:
          "S&M spend today generates pipeline that closes next quarter. The lag accounts for the typical SaaS sales cycle. For enterprise SaaS with longer cycles (6+ months), some analysts use a two-quarter lag.",
      },
      {
        question: "How does Magic Number differ from CAC payback?",
        answer:
          "Magic Number measures total S&M efficiency across the business. CAC payback measures per-customer return on acquisition. They're complementary — Magic Number tells you if your overall motion is efficient; CAC payback tells you if individual customers are profitable.",
      },
    ],
    relatedSlugs: ["arr", "cac", "cac-payback", "rule-of-40"],
    keyword: "SaaS magic number",
    speakable:
      "The SaaS Magic Number measures go-to-market efficiency. It equals net new ARR divided by prior quarter sales and marketing spend. Above 1.0 means you should accelerate spending. Between 0.5 and 1.0 means optimize. Below 0.5 means fix fundamentals before spending more.",
  },

  // ════════════════════════════════════════════════════════════
  // FINANCIAL HEALTH
  // ════════════════════════════════════════════════════════════
  {
    slug: "burn-rate",
    name: "Burn Rate",
    shortName: "Burn Rate",
    category: "financial",
    description:
      "Burn rate is the net amount of cash a company consumes each month. It measures how quickly a startup is spending its capital reserves — and directly determines how many months of runway remain before the company needs additional funding or must reach profitability.",
    whyItMatters:
      "Burn rate is a survival metric. A startup with $1M in the bank and $100K monthly burn has 10 months of runway. Start fundraising at 6 months of runway remaining, and you have 4 months to close — which is tight. Understanding burn rate lets you make proactive decisions about spending, hiring, and fundraising timing. It also reveals operational efficiency: two companies with the same revenue but different burn rates have fundamentally different risk profiles.",
    howToCalculate:
      "Subtract total monthly revenue from total monthly expenses. Alternatively, measure the decrease in cash balance month over month. Gross burn is total expenses; net burn is expenses minus revenue.",
    formula: "Net Burn Rate = Total Monthly Expenses − Total Monthly Revenue",
    formulaLabel: "Burn Rate Formula",
    calculatorFields: [
      { name: "expenses", label: "Total Monthly Expenses", defaultValue: 120000, min: 0, prefix: "$", step: 5000 },
      { name: "revenue", label: "Total Monthly Revenue", defaultValue: 45000, min: 0, prefix: "$", step: 5000 },
    ],
    calculatorResult: { label: "Monthly Net Burn", prefix: "$" },
    calculatorFormula: "expenses - revenue",
    benchmarks: [
      { segment: "Pre-revenue startup", good: "<$50K/mo", average: "$50K–$150K/mo", poor: ">$150K/mo" },
      { segment: "Seed-stage", good: "<$80K/mo", average: "$80K–$200K/mo", poor: ">$200K/mo" },
      { segment: "Series A", good: "<$200K/mo", average: "$200K–$500K/mo", poor: ">$500K/mo" },
      { segment: "Series B+", good: "<$500K/mo", average: "$500K–$1.5M/mo", poor: ">$1.5M/mo" },
    ],
    models: ["subscription", "ecommerce", "saas", "marketplace", "foodtech", "traveltech", "gametech", "fintech", "healthtech", "edtech", "proptech", "ai-ml"],
    expertTips: [
      "Always track net burn (expenses minus revenue), not gross burn (total expenses). Net burn tells you the real cash consumption rate.",
      "Plan fundraising when you have 9-12 months of runway remaining. Fundraising typically takes 3-6 months, and you don't want to negotiate from a position of desperation.",
      "Break burn rate into fixed costs (rent, salaries) and variable costs (marketing, hosting). You can quickly reduce variable costs but fixed costs take longer to adjust.",
      "A good rule of thumb: your annual burn should not exceed the amount you last raised. Burning $3M/year on a $2M raise means you'll be fundraising again in 8 months.",
    ],
    faq: [
      {
        question: "What is burn rate?",
        answer:
          "Burn rate is the net cash a company spends per month — total expenses minus total revenue. A $100K monthly burn rate means the company's cash reserves decrease by $100K each month. It's the primary survival metric for startups.",
      },
      {
        question: "What is the difference between gross and net burn?",
        answer:
          "Gross burn is total monthly expenses regardless of revenue. Net burn subtracts revenue from expenses. A company with $200K expenses and $80K revenue has $200K gross burn and $120K net burn. Net burn is the more useful metric.",
      },
      {
        question: "How do I calculate runway from burn rate?",
        answer:
          "Divide your current cash balance by monthly net burn rate. With $500K in the bank and $50K monthly burn, you have 10 months of runway. Account for revenue growth — if burn is decreasing monthly, runway is longer than the simple division suggests.",
      },
      {
        question: "What is a healthy burn rate for a startup?",
        answer:
          "It depends on stage and funding. A general guideline: don't burn more annually than you last raised. For seed-stage, under $80K/month is typical. For Series A, under $200K/month. The key metric is runway — ensure you have 12+ months at all times.",
      },
    ],
    relatedSlugs: ["runway", "gross-margin", "rule-of-40", "cac"],
    keyword: "startup burn rate",
    speakable:
      "Burn rate is the net cash a company consumes each month, calculated as total expenses minus total revenue. Divide your cash balance by monthly burn rate to get runway in months. Start fundraising with at least 9 to 12 months of runway remaining.",
  },
  {
    slug: "runway",
    name: "Runway (Months)",
    shortName: "Runway",
    category: "financial",
    description:
      "Runway is the number of months a company can continue operating at its current burn rate before running out of cash. It is the most fundamental survival metric for startups — if runway reaches zero before profitability or new funding, the company dies.",
    whyItMatters:
      "Runway determines every strategic decision a startup makes: when to fundraise, when to hire, when to cut costs, and how aggressively to invest in growth. Companies with 18+ months of runway can take calculated risks. Companies with 6 months of runway are in survival mode. The difference between these two situations is often the difference between building a great company and a fire sale. Running out of cash is the number-one reason startups fail.",
    howToCalculate:
      "Divide current cash balance by monthly net burn rate (expenses minus revenue). For a more sophisticated estimate, account for revenue growth trends that reduce burn over time.",
    formula: "Runway (Months) = Cash Balance ÷ Monthly Net Burn Rate",
    formulaLabel: "Runway Formula",
    calculatorFields: [
      { name: "cash", label: "Current Cash Balance", defaultValue: 750000, min: 0, prefix: "$", step: 50000 },
      { name: "burn", label: "Monthly Net Burn Rate", defaultValue: 60000, min: 1, prefix: "$", step: 5000 },
    ],
    calculatorResult: { label: "Runway", suffix: " months" },
    calculatorFormula: "cash / burn",
    benchmarks: [
      { segment: "Comfortable", good: ">18 months", average: "12–18 months", poor: "<12 months" },
      { segment: "Fundraising trigger", good: ">12 months", average: "6–12 months", poor: "<6 months" },
      { segment: "Danger zone", good: ">6 months", average: "3–6 months", poor: "<3 months" },
      { segment: "Post-funding target", good: ">24 months", average: "18–24 months", poor: "<18 months" },
    ],
    models: ["subscription", "ecommerce", "saas", "marketplace", "foodtech", "traveltech", "gametech", "fintech", "healthtech", "edtech", "proptech", "ai-ml"],
    expertTips: [
      "After a funding round, aim for 18-24 months of runway. This gives you 12-18 months to execute before you need to start the next fundraise.",
      "Recalculate runway monthly. Revenue growth, new hires, and unexpected costs all change the number. Set alerts at 12, 9, and 6 months remaining.",
      "If runway drops below 6 months, immediately reduce burn: freeze hiring, cut non-essential spend, renegotiate contracts. Every month of extended runway matters.",
      "Static runway calculation assumes constant burn. If you're growing revenue, your effective runway is longer. Model both scenarios.",
    ],
    faq: [
      {
        question: "What is startup runway?",
        answer:
          "Runway is the number of months a company can operate before running out of cash, calculated as cash balance divided by monthly net burn rate. A company with $500K and $50K/month burn has 10 months of runway.",
      },
      {
        question: "How much runway should a startup have?",
        answer:
          "After a funding round, target 18-24 months. Start fundraising at 9-12 months remaining. Below 6 months is the danger zone — cut costs immediately and accelerate fundraising or revenue efforts.",
      },
      {
        question: "When should I start fundraising based on runway?",
        answer:
          "Begin when you have 9-12 months of runway. Fundraising takes 3-6 months on average, and you want to close while you still have 6+ months remaining to negotiate from a position of strength.",
      },
      {
        question: "How do I extend runway without fundraising?",
        answer:
          "Reduce burn rate (freeze hiring, cut marketing, renegotiate contracts), accelerate revenue (shorter sales cycles, price increases), or secure non-dilutive funding (revenue-based financing, grants, government programs).",
      },
    ],
    relatedSlugs: ["burn-rate", "gross-margin", "mrr", "arr"],
    keyword: "startup runway calculation",
    speakable:
      "Startup runway is cash balance divided by monthly net burn rate. It tells you how many months until you run out of money. Target 18 to 24 months after funding. Start fundraising at 9 to 12 months remaining. Below 6 months is the danger zone.",
  },

  // ════════════════════════════════════════════════════════════
  // OPERATIONAL METRICS
  // ════════════════════════════════════════════════════════════
  {
    slug: "trial-conversion",
    name: "Trial-to-Paid Conversion Rate",
    shortName: "Trial Conversion",
    category: "operational",
    description:
      "Trial-to-paid conversion rate measures the percentage of free trial users who convert to paying customers. It is the critical funnel metric for product-led growth businesses — the moment where interest turns into revenue.",
    whyItMatters:
      "Trial conversion directly multiplies into your revenue engine. If you generate 1,000 trial signups per month and convert 5%, you get 50 paying customers. Improving to 8% yields 80 customers — a 60% increase with zero additional acquisition spend. Trial conversion also reveals product-market fit: if users try your product and don't pay, either the product doesn't deliver enough value or the pricing doesn't match perceived value. It's one of the most actionable levers in the entire funnel.",
    howToCalculate:
      "Divide the number of trial users who converted to paid by the total number of trial starts in the same cohort. Use cohort-based tracking with a consistent time window (7-day, 14-day, or 30-day trials).",
    formula: "Trial Conversion Rate = Paid Conversions ÷ Trial Starts × 100%",
    formulaLabel: "Trial Conversion Formula",
    calculatorFields: [
      { name: "conversions", label: "Paid Conversions", defaultValue: 75, min: 0, step: 5 },
      { name: "trials", label: "Trial Starts", defaultValue: 1000, min: 1, step: 50 },
    ],
    calculatorResult: { label: "Trial-to-Paid Rate", suffix: "%" },
    calculatorFormula: "(conversions / trials) * 100",
    benchmarks: [
      { segment: "Opt-in free trial (no CC)", good: ">8%", average: "3–8%", poor: "<3%" },
      { segment: "Opt-in free trial (CC required)", good: ">40%", average: "25–40%", poor: "<25%" },
      { segment: "Freemium", good: ">5%", average: "2–5%", poor: "<2%" },
      { segment: "Reverse trial", good: ">20%", average: "10–20%", poor: "<10%" },
    ],
    models: ["subscription", "saas", "edtech", "healthtech", "ai-ml"],
    expertTips: [
      "Credit card upfront trials convert 3-5x higher than no-CC trials, but attract fewer signups. Test both and optimize for total paying customers, not conversion rate alone.",
      "The first 3 days of a trial determine conversion probability. Users who don't reach the 'aha moment' by day 3 rarely convert. Front-load onboarding value.",
      "Segment conversion by signup source. Product Hunt trials convert differently than Google Ads trials — use segment-specific nurture sequences.",
      "Consider a reverse trial (full access that downgrades to free) instead of a traditional free trial. Reverse trials often convert 2-3x better because users experience the premium product first.",
    ],
    faq: [
      {
        question: "What is trial-to-paid conversion rate?",
        answer:
          "It's the percentage of users who start a free trial and convert to a paid subscription. A 5% conversion rate means 5 out of every 100 trial users become paying customers.",
      },
      {
        question: "What is a good trial conversion rate?",
        answer:
          "For no-credit-card trials: 3-8% is average, above 8% is strong. For credit-card-required trials: 25-40% is average, above 40% is strong. Freemium conversion is typically 2-5%. The model heavily influences the benchmark.",
      },
      {
        question: "How do I improve trial conversion?",
        answer:
          "Speed up time-to-value (help users reach the 'aha moment' faster), send targeted onboarding emails, use in-app guidance, offer a conversion incentive near trial end, and consider requiring a credit card upfront.",
      },
      {
        question: "Should I require a credit card for free trials?",
        answer:
          "CC-required trials have much higher conversion rates (25-40% vs 3-8%) but lower signup volume. The right choice depends on your market — test both and optimize for total revenue, not conversion rate alone.",
      },
    ],
    relatedSlugs: ["cac", "arpu", "churn-rate", "ltv"],
    keyword: "trial to paid conversion rate",
    speakable:
      "Trial-to-paid conversion rate is the percentage of free trial users who become paying customers. No-credit-card trials typically convert at 3 to 8%. Credit-card-required trials convert at 25 to 40%. Improving trial conversion is one of the highest-leverage growth tactics because it increases revenue without additional acquisition spend.",
  },
];

/* ─── Helper functions ─── */

export function getMetricBySlug(slug: string): MetricDefinition | undefined {
  return METRICS.find((m) => m.slug === slug);
}

export function getMetricsByCategory(category: MetricCategory): MetricDefinition[] {
  return METRICS.filter((m) => m.category === category);
}

export function getMetricsByModel(model: ProductType): MetricDefinition[] {
  return METRICS.filter((m) => m.models.includes(model));
}

export function getAllMetricSlugs(): string[] {
  return METRICS.map((m) => m.slug);
}

export function getRelatedMetrics(slug: string): MetricDefinition[] {
  const metric = getMetricBySlug(slug);
  if (!metric) return [];
  return metric.relatedSlugs
    .map((s) => getMetricBySlug(s))
    .filter((m): m is MetricDefinition => m !== undefined);
}
