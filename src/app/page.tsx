import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllPosts } from "@/lib/blog";
import { BlogCard } from "@/components/blog/BlogCard";

const features = [
  {
    title: "Subscription Modeling",
    description: "MRR, churn, cohort analysis, 67+ configurable parameters with 3-phase business lifecycle.",
  },
  {
    title: "E-commerce Modeling",
    description: "AOV, CPC, unit economics, repeat purchases, COGS tracking with full P&L projections.",
  },
  {
    title: "Monte Carlo Simulation",
    description: "Run hundreds of simulations to understand your risk profile and confidence intervals.",
  },
  {
    title: "Scenario Analysis",
    description: "Base, optimistic, and pessimistic scenarios with adjustable sensitivity parameters.",
  },
  {
    title: "Investor-Ready Reports",
    description: "P&L, Cash Flow, Balance Sheet, and key metrics formatted for investor presentations.",
  },
  {
    title: "Team Collaboration",
    description: "Share projects with team members as viewers or editors. Role-based access control.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    features: ["1 project", "3 scenarios per project", "All charts & reports", "CSV export"],
  },
  {
    name: "Pro",
    price: "$29/mo",
    features: ["Unlimited projects", "Unlimited scenarios", "Monte Carlo simulation", "Public dashboards", "Priority support"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: ["Everything in Pro", "Team workspace", "Custom branding", "API access", "Dedicated support"],
  },
];

export default function LandingPage() {
  const featuredPosts = getAllPosts().slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Financial Modeling
            <br />
            <span className="text-primary">for Modern Businesses</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Build investor-ready financial models for subscription and e-commerce businesses.
            Monte Carlo simulations, scenario analysis, and beautiful dashboards.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg">Start Free</Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg">View Pricing</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <Card key={plan.name} className={plan.highlighted ? "border-primary shadow-lg scale-105" : ""}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">{plan.price}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center text-sm">
                        <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/register" className="block mt-6">
                    <Button className="w-full" variant={plan.highlighted ? "default" : "outline"}>
                      {plan.name === "Enterprise" ? "Contact Us" : "Get Started"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* From the Blog */}
      {featuredPosts.length > 0 && (
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold">From the Blog</h2>
              <Link href="/blog">
                <Button variant="outline">View All Articles</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Mega App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
