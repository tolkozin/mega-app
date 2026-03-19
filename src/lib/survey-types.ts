export interface SurveyData {
  projectType: "saas" | "ecommerce" | "subscription" | null;
  industry: string;
  industryCustom: string;
  stage: "idea" | "building" | "launched" | "growing" | null;
  monetization: string[];
  customerType: string;
  pricePoint: string;
  pricePointCustom: string;
  acquisitionChannels: string[];
  budget: string;
  budgetCustom: string;
  goal: string;
  goalCustom: string;
}

export const INITIAL_SURVEY: SurveyData = {
  projectType: null,
  industry: "",
  industryCustom: "",
  stage: null,
  monetization: [],
  customerType: "",
  pricePoint: "",
  pricePointCustom: "",
  acquisitionChannels: [],
  budget: "",
  budgetCustom: "",
  goal: "",
  goalCustom: "",
};

export const TOTAL_STEPS = 9;

/* ─── Step 2: Industry options per business type ─── */

export const INDUSTRY_OPTIONS: Record<string, string[]> = {
  saas: [
    "Marketing & Sales tools",
    "Productivity / Workflow",
    "Finance & Accounting",
    "Developer tools",
    "HR & People",
    "Healthcare / MedTech",
    "Education",
  ],
  ecommerce: [
    "Fashion & Apparel",
    "Beauty & Wellness",
    "Food & Beverage",
    "Home & Living",
    "Sports & Fitness",
    "Digital products",
  ],
  subscription: [
    "Beauty & Grooming",
    "Food & Snacks",
    "Hobby & Lifestyle",
    "Fitness & Wellness",
    "Books & Education",
  ],
};

/* ─── Step 4: Monetization options ─── */

export const MONETIZATION_OPTIONS = [
  "Monthly subscription",
  "Annual subscription",
  "One-time purchase",
  "Freemium → paid upgrade",
  "Usage-based / Pay-per-use",
  "Commission / Revenue share",
  "I'm not sure yet",
];

/* ─── Step 7: Acquisition channels ─── */

export const ACQUISITION_OPTIONS = [
  { label: "Social media (Instagram, TikTok, X)", icon: "📱" },
  { label: "Content / SEO / Blog", icon: "✍️" },
  { label: "Paid ads (Google, Meta)", icon: "📣" },
  { label: "Word of mouth / Referrals", icon: "💬" },
  { label: "Cold outreach / Sales", icon: "📧" },
  { label: "App stores", icon: "🏪" },
  { label: "Communities / Reddit / Forums", icon: "👥" },
  { label: "Partnerships", icon: "🤝" },
  { label: "Not sure yet", icon: "" },
];
