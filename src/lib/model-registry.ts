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
  /** Periodic table element symbol (2 letters) */
  elementSymbol: string;
  /** Pastel background for element card */
  elementBg: string;
  /** Saturated text color for element card */
  elementText: string;
  /** Element number (position 1-12) */
  elementNumber: number;
}

/* ─── Registry ─── */

export const MODEL_REGISTRY: Record<ProductType, ModelDefinition> = {
  subscription: {
    key: "subscription",
    label: "Mobile App",
    shortLabel: "Mobile App",
    description:
      "Instant financial projections for subscription apps — built on real benchmarks from thousands of mobile businesses.",
    icon: Smartphone,
    color: "#5E81F4",
    baseEngine: "subscription",
    surveyDescription: "Mobile app with in-app subscriptions",
    headline: "See if your app idea is profitable — in under 5 minutes.",
    question: "Will my mobile app subscription be profitable?",
    elementSymbol: "Ma",
    elementBg: "#e4eefd",
    elementText: "#2163e7",
    elementNumber: 1,
  },
  ecommerce: {
    key: "ecommerce",
    label: "E-Commerce",
    shortLabel: "E-Commerce",
    description:
      "Real unit economics for online stores. Know your true profit per customer — not just revenue.",
    icon: ShoppingCart,
    color: "#F59E0B",
    baseEngine: "ecommerce",
    surveyDescription: "Online store selling physical or digital products",
    headline: "Get real numbers on every order — in minutes, not months.",
    question: "Am I spending too much to acquire customers?",
    elementSymbol: "Ec",
    elementBg: "#fdf7e2",
    elementText: "#8c591d",
    elementNumber: 2,
  },
  saas: {
    key: "saas",
    label: "SaaS B2B",
    shortLabel: "SaaS",
    description:
      "Every key metric investors care about — calculated instantly using benchmarks from real SaaS companies.",
    icon: Cloud,
    color: "#8B5CF6",
    baseEngine: "saas",
    surveyDescription: "B2B software-as-a-service platform",
    headline: "The numbers investors actually ask for — ready in minutes.",
    question: "Am I growing efficiently enough?",
    elementSymbol: "Sa",
    elementBg: "#f1e8fb",
    elementText: "#5a3ee3",
    elementNumber: 3,
  },
  marketplace: {
    key: "marketplace",
    label: "Marketplace",
    shortLabel: "Marketplace",
    description:
      "Model both sides of your marketplace with real benchmarks from funded platforms.",
    icon: Store,
    color: "#0EA5E9",
    baseEngine: "ecommerce",
    surveyDescription: "Two-sided marketplace connecting buyers and sellers",
    headline: "Know if your marketplace can reach critical mass — before you build it.",
    question: "Can my marketplace reach critical mass?",
    elementSymbol: "Mp",
    elementBg: "#def7fe",
    elementText: "#317389",
    elementNumber: 4,
  },
  foodtech: {
    key: "foodtech",
    label: "FoodTech",
    shortLabel: "FoodTech",
    description:
      "Per-order profitability modeled on real delivery economics. Built with data from actual food-tech businesses.",
    icon: UtensilsCrossed,
    color: "#EF4444",
    baseEngine: "ecommerce",
    surveyDescription: "Food delivery, cloud kitchen, or food-tech platform",
    headline: "Find out if each order makes money — before you deliver the first one.",
    question: "Is my food business actually profitable per order?",
    elementSymbol: "Ft",
    elementBg: "#fbe8e7",
    elementText: "#c4292e",
    elementNumber: 5,
  },
  traveltech: {
    key: "traveltech",
    label: "TravelTech",
    shortLabel: "TravelTech",
    description:
      "Financial model with built-in seasonality and commission benchmarks from real travel platforms.",
    icon: Plane,
    color: "#06B6D4",
    baseEngine: "ecommerce",
    surveyDescription: "Travel booking, hospitality, or tourism platform",
    headline: "Model your travel business across peak and off-peak — instantly.",
    question: "Will my travel platform be sustainable year-round?",
    elementSymbol: "Tt",
    elementBg: "#e3f2fe",
    elementText: "#113352",
    elementNumber: 6,
  },
  gametech: {
    key: "gametech",
    label: "GameTech",
    shortLabel: "GameTech",
    description:
      "Player value, retention, and monetization — modeled on real data from gaming companies.",
    icon: Gamepad2,
    color: "#A855F7",
    baseEngine: "subscription",
    surveyDescription: "Mobile game, gaming platform, or game studio",
    headline: "Know your player value before spending a dollar on ads.",
    question: "Will players stick around long enough to pay back UA costs?",
    elementSymbol: "Gt",
    elementBg: "#fbe8eb",
    elementText: "#bc335f",
    elementNumber: 7,
  },
  fintech: {
    key: "fintech",
    label: "FinTech",
    shortLabel: "FinTech",
    description:
      "Transaction revenue, compliance costs, and growth — modeled with benchmarks from funded fintech startups.",
    icon: Landmark,
    color: "#10B981",
    baseEngine: "saas",
    surveyDescription: "Payments, banking, lending, or insurance platform",
    headline: "See if your fintech scales past compliance costs — in minutes.",
    question: "Can my fintech product scale profitably?",
    elementSymbol: "Fn",
    elementBg: "#ddf8e9",
    elementText: "#0e6b06",
    elementNumber: 8,
  },
  healthtech: {
    key: "healthtech",
    label: "HealthTech",
    shortLabel: "HealthTech",
    description:
      "Patient economics and SaaS metrics combined. Benchmarked against real digital health companies.",
    icon: HeartPulse,
    color: "#EC4899",
    baseEngine: "saas",
    surveyDescription: "Digital health, telemedicine, or wellness platform",
    headline: "Model patient acquisition and retention — with real health-tech data.",
    question: "Can my health platform scale with regulatory overhead?",
    elementSymbol: "Ht",
    elementBg: "#fbe7d6",
    elementText: "#b83e1d",
    elementNumber: 9,
  },
  edtech: {
    key: "edtech",
    label: "EdTech",
    shortLabel: "EdTech",
    description:
      "Student acquisition, completion rates, and revenue — built on benchmarks from real education platforms.",
    icon: GraduationCap,
    color: "#F97316",
    baseEngine: "saas",
    surveyDescription: "Online learning, courses, or education platform",
    headline: "See if your education platform is viable — before creating content.",
    question: "Will students stay long enough to make my platform viable?",
    elementSymbol: "Et",
    elementBg: "#fdf7e2",
    elementText: "#8c591d",
    elementNumber: 10,
  },
  proptech: {
    key: "proptech",
    label: "PropTech",
    shortLabel: "PropTech",
    description:
      "From listings to deals — full-funnel economics modeled on real property platform data.",
    icon: Building2,
    color: "#6366F1",
    baseEngine: "ecommerce",
    surveyDescription: "Real estate, property management, or construction platform",
    headline: "Know your cost per deal and margin — before you list anything.",
    question: "Can my property platform generate positive unit economics?",
    elementSymbol: "Pt",
    elementBg: "#e7e7ea",
    elementText: "#3e374d",
    elementNumber: 11,
  },
  "ai-ml": {
    key: "ai-ml",
    label: "AI / ML",
    shortLabel: "AI/ML",
    description:
      "Compute costs vs. revenue — modeled with real benchmarks from AI companies at every stage.",
    icon: Brain,
    color: "#14B8A6",
    baseEngine: "saas",
    surveyDescription: "AI/ML product, API, or platform",
    headline: "Find out if your AI product can scale without burning cash.",
    question: "Can my AI product scale without burning through compute?",
    elementSymbol: "Ai",
    elementBg: "#f1e8fb",
    elementText: "#5a3ee3",
    elementNumber: 12,
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
