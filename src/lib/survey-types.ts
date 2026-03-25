export interface SurveyData {
  projectType: "subscription" | "ecommerce" | "saas" | "marketplace" | "foodtech" | "traveltech" | "gametech" | "fintech" | "healthtech" | "edtech" | "proptech" | "ai-ml" | null;
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

export const TOTAL_STEPS = 12;

/* Indices of motivational interstitial screens (not question steps) */
export const INTERSTITIAL_STEPS = new Set([3, 8, 11]);

/* ─── Step 2: Industry options per business type ─── */

export const INDUSTRY_OPTIONS: Record<string, string[]> = {
  subscription: [
    "Fitness & Wellness",
    "Entertainment & Media",
    "Productivity",
    "Dating & Social",
    "Education",
    "Finance & Budget",
  ],
  ecommerce: [
    "Fashion & Apparel",
    "Beauty & Wellness",
    "Food & Beverage",
    "Home & Living",
    "Sports & Fitness",
    "Digital products",
  ],
  saas: [
    "Marketing & Sales tools",
    "Productivity / Workflow",
    "Finance & Accounting",
    "Developer tools",
    "HR & People",
    "Healthcare / MedTech",
  ],
  marketplace: [
    "Services",
    "Rentals",
    "Freelance",
    "Handmade / Crafts",
    "Local delivery",
    "B2B wholesale",
  ],
  foodtech: [
    "Restaurant delivery",
    "Grocery",
    "Meal kits",
    "Cloud kitchen",
    "Food marketplace",
    "Catering",
  ],
  traveltech: [
    "Accommodation",
    "Flights",
    "Tours & Experiences",
    "Car rental",
    "Business travel",
    "Travel planning",
  ],
  gametech: [
    "Mobile games",
    "PC / Console",
    "Casual / Hyper-casual",
    "Esports",
    "Game tools",
    "VR / AR",
  ],
  fintech: [
    "Payments",
    "Lending",
    "Insurance",
    "Investment",
    "Neobanking",
    "Crypto / DeFi",
  ],
  healthtech: [
    "Telemedicine",
    "Mental health",
    "Fitness tracking",
    "Clinical trials",
    "EHR / EMR",
    "Wellness",
  ],
  edtech: [
    "K-12",
    "Higher education",
    "Corporate training",
    "Language learning",
    "Test prep",
    "Skills / Bootcamp",
  ],
  proptech: [
    "Listings & search",
    "Property management",
    "Construction tech",
    "Mortgage / Lending",
    "Smart home",
    "Co-working",
  ],
  "ai-ml": [
    "API / Platform",
    "Enterprise AI",
    "Computer vision",
    "NLP / LLM",
    "Data analytics",
    "AI agents",
  ],
};

/* ─── Step 4: Monetization options ─── */

export const MONETIZATION_OPTIONS = [
  "Weekly subscription",
  "Monthly subscription",
  "Annual subscription",
  "One-time purchase",
  "Freemium → paid upgrade",
  "Tiered pricing (multiple plans)",
  "Usage-based / Pay-per-use",
  "Per-seat / Per-user licensing",
  "Commission / Revenue share",
  "Advertising / Sponsorship",
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
