import {
  Smartphone,
  ShoppingCart,
  Cloud,
  Store,
  UtensilsCrossed,
  Plane,
  Gamepad2,
  Landmark,
  HeartPulse,
  GraduationCap,
  Building2,
  Brain,
} from "lucide-react";
import type { ComponentType } from "react";

/* ─── Product type literals ─── */

export const PRODUCT_TYPES = [
  "subscription",
  "ecommerce",
  "saas",
  "marketplace",
  "foodtech",
  "traveltech",
  "gametech",
  "fintech",
  "healthtech",
  "edtech",
  "proptech",
  "ai-ml",
] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number];

/* ─── Base engine — determines API endpoint + config type ─── */

export type BaseEngine = "subscription" | "ecommerce" | "saas";

/* ─── Model definition ─── */

export interface ModelDefinition {
  key: ProductType;
  label: string;
  shortLabel: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
  baseEngine: BaseEngine;
  surveyDescription: string;
  headline: string;
  question: string;
}

/* ─── Registry ─── */

export const MODEL_REGISTRY: Record<ProductType, ModelDefinition> = {
  subscription: {
    key: "subscription",
    label: "Mobile App",
    shortLabel: "Mobile App",
    description:
      "Model MRR, ARR, trial conversions, churn, and cohort retention for mobile subscription apps across 3 growth phases.",
    icon: Smartphone,
    color: "#5E81F4",
    baseEngine: "subscription",
    surveyDescription: "Mobile app with in-app subscriptions",
    headline: "Find your break-even. Predict churn before it kills growth.",
    question: "Will my mobile app subscription be profitable?",
  },
  ecommerce: {
    key: "ecommerce",
    label: "E-Commerce",
    shortLabel: "E-Commerce",
    description:
      "Model AOV, CAC, COGS, ad spend, and repeat purchases. See if each customer actually makes you money.",
    icon: ShoppingCart,
    color: "#F59E0B",
    baseEngine: "ecommerce",
    surveyDescription: "Online store selling physical or digital products",
    headline: "Know your true unit economics — not just revenue.",
    question: "Am I spending too much to acquire customers?",
  },
  saas: {
    key: "saas",
    label: "SaaS B2B",
    shortLabel: "SaaS",
    description:
      "ARR, NRR, Quick Ratio, Rule of 40, Magic Number — all calculated, benchmarked, and investor-ready.",
    icon: Cloud,
    color: "#8B5CF6",
    baseEngine: "saas",
    surveyDescription: "B2B software-as-a-service platform",
    headline: "Metrics that investors actually look at.",
    question: "Am I growing efficiently enough?",
  },
  marketplace: {
    key: "marketplace",
    label: "Marketplace",
    shortLabel: "Marketplace",
    description:
      "Model GMV, take rates, supply/demand balance, and network effects. Understand your path to liquidity.",
    icon: Store,
    color: "#0EA5E9",
    baseEngine: "ecommerce",
    surveyDescription: "Two-sided marketplace connecting buyers and sellers",
    headline: "Validate your take rate and path to liquidity.",
    question: "Can my marketplace reach critical mass?",
  },
  foodtech: {
    key: "foodtech",
    label: "FoodTech",
    shortLabel: "FoodTech",
    description:
      "Model delivery unit economics, kitchen utilization, order frequency, and customer lifetime value for food businesses.",
    icon: UtensilsCrossed,
    color: "#EF4444",
    baseEngine: "ecommerce",
    surveyDescription: "Food delivery, cloud kitchen, or food-tech platform",
    headline: "Unit economics that survive the delivery fee squeeze.",
    question: "Is my food business actually profitable per order?",
  },
  traveltech: {
    key: "traveltech",
    label: "TravelTech",
    shortLabel: "TravelTech",
    description:
      "Model booking volumes, commission rates, seasonal demand, and customer acquisition for travel platforms.",
    icon: Plane,
    color: "#06B6D4",
    baseEngine: "ecommerce",
    surveyDescription: "Travel booking, hospitality, or tourism platform",
    headline: "Navigate seasonality and commission economics.",
    question: "Will my travel platform be sustainable year-round?",
  },
  gametech: {
    key: "gametech",
    label: "GameTech",
    shortLabel: "GameTech",
    description:
      "Model in-app purchases, subscription tiers, player retention, and ARPDAU for gaming businesses.",
    icon: Gamepad2,
    color: "#A855F7",
    baseEngine: "subscription",
    surveyDescription: "Mobile game, gaming platform, or game studio",
    headline: "Predict player LTV before you spend on UA.",
    question: "Will players stick around long enough to pay back UA costs?",
  },
  fintech: {
    key: "fintech",
    label: "FinTech",
    shortLabel: "FinTech",
    description:
      "Model transaction volumes, interchange revenue, compliance costs, and user growth for financial products.",
    icon: Landmark,
    color: "#10B981",
    baseEngine: "saas",
    surveyDescription: "Payments, banking, lending, or insurance platform",
    headline: "Model compliance costs alongside transaction revenue.",
    question: "Can my fintech product scale profitably?",
  },
  healthtech: {
    key: "healthtech",
    label: "HealthTech",
    shortLabel: "HealthTech",
    description:
      "Model patient acquisition, provider contracts, regulatory costs, and recurring engagement for health platforms.",
    icon: HeartPulse,
    color: "#EC4899",
    baseEngine: "saas",
    surveyDescription: "Digital health, telemedicine, or wellness platform",
    headline: "Patient economics meets SaaS metrics.",
    question: "Can my health platform scale with regulatory overhead?",
  },
  edtech: {
    key: "edtech",
    label: "EdTech",
    shortLabel: "EdTech",
    description:
      "Model student acquisition, course completion rates, B2B/B2C pricing, and content costs for education platforms.",
    icon: GraduationCap,
    color: "#F97316",
    baseEngine: "saas",
    surveyDescription: "Online learning, courses, or education platform",
    headline: "Completion rates drive retention. Model both.",
    question: "Will students stay long enough to make my platform viable?",
  },
  proptech: {
    key: "proptech",
    label: "PropTech",
    shortLabel: "PropTech",
    description:
      "Model listing volumes, transaction fees, lead-to-deal conversion, and property management economics.",
    icon: Building2,
    color: "#6366F1",
    baseEngine: "ecommerce",
    surveyDescription: "Real estate, property management, or construction platform",
    headline: "From listings to transactions — model the full funnel.",
    question: "Can my property platform generate positive unit economics?",
  },
  "ai-ml": {
    key: "ai-ml",
    label: "AI / ML",
    shortLabel: "AI/ML",
    description:
      "Model API usage, compute costs, enterprise contracts, and usage-based pricing for AI/ML products.",
    icon: Brain,
    color: "#14B8A6",
    baseEngine: "saas",
    surveyDescription: "AI/ML product, API, or platform",
    headline: "Balance compute costs against usage-based revenue.",
    question: "Can my AI product scale without burning through compute?",
  },
};

/* ─── Helpers ─── */

export function getModelDef(type: string): ModelDefinition {
  return MODEL_REGISTRY[type as ProductType] ?? MODEL_REGISTRY.subscription;
}

export function getBaseEngine(type: string): BaseEngine {
  return getModelDef(type).baseEngine;
}

export function isValidProductType(type: string): type is ProductType {
  return type in MODEL_REGISTRY;
}

/** Get all model definitions as an array, ordered by registry order */
export function getAllModels(): ModelDefinition[] {
  return PRODUCT_TYPES.map((key) => MODEL_REGISTRY[key]);
}
