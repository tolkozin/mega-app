import type { Metadata } from "next";
import Link from "next/link";
import { LandingNavbar } from "@/components/layout/LandingNavbar";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://revenuemap.app";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Revenue Map is committed to protecting your privacy. Learn how we collect, use, and safeguard your information.",
  alternates: { canonical: `${SITE_URL}/privacy` },
  openGraph: {
    title: "Privacy Policy — Revenue Map",
    description:
      "Revenue Map is committed to protecting your privacy. Learn how we collect, use, and safeguard your information.",
    url: `${SITE_URL}/privacy`,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <LandingNavbar />
      <div className="min-h-screen bg-[#f8f9fc]">
        <div className="mx-auto max-w-3xl px-4 py-20">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-heading font-extrabold text-[#1a1a2e] mb-3">
              Privacy Policy
            </h1>
            <p className="text-sm text-[#6b7280]">
              Effective Date: March 10, 2026 &middot; Last Updated: March 10, 2026
            </p>
          </div>

          {/* Body */}
          <div className="space-y-8 text-[#1a1a2e] text-[15px] leading-relaxed">
            <p>
              Revenue Map (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit revenuemap.app and use our financial modeling platform (the &ldquo;Service&rdquo;). Please read this policy carefully. If you disagree with its terms, please discontinue use of the Service.
            </p>

            <Section title="1. Information We Collect">
              <p>We collect information in the following ways:</p>

              <h4 className="text-[#1a1a2e] font-bold mt-6 mb-2">1.1 Information You Provide Directly</h4>
              <BulletList items={[
                "Account registration data: name, email address, password",
                "Billing information: processed securely via Lemon Squeezy; we do not store full credit card numbers",
                "Business data you enter into the platform: financial projections, revenue figures, cost assumptions, and other modeling inputs",
                "Files you upload for AI analysis (CSV, spreadsheet data)",
                "Communications with our support team",
              ]} />

              <h4 className="text-[#1a1a2e] font-bold mt-6 mb-2">1.2 Information Collected Automatically</h4>
              <BulletList items={[
                "Log data: IP address, browser type, pages visited, time and date of visits, referring URLs",
                "Device information: hardware model, operating system, unique device identifiers",
                "Usage data: features used, models created, actions taken within the platform",
                "Cookies and similar tracking technologies (see Section 6)",
              ]} />

              <h4 className="text-[#1a1a2e] font-bold mt-6 mb-2">1.3 Information from Third Parties</h4>
              <BulletList items={[
                "Authentication providers (if you sign in via Google or another OAuth provider)",
                "Payment processors (Lemon Squeezy) — transaction confirmations and billing status only",
              ]} />
            </Section>

            <Section title="2. How We Use Your Information">
              <p>We use the information we collect to:</p>
              <BulletList items={[
                "Provide, operate, and maintain the Service",
                "Process transactions and send related information including purchase confirmations and invoices",
                "Improve, personalize, and expand the Service",
                "Understand and analyze how you use the Service to improve user experience",
                "Develop new features, products, and functionality",
                "Communicate with you — including for customer service, updates, and marketing (where permitted)",
                "Send you emails and notifications you have opted into",
                "Find and prevent fraud and abuse",
                "Comply with legal obligations",
              ]} />
              <p className="font-medium text-[#1a1a2e]">
                We do not use your business financial data to train AI models or share it with third parties for advertising purposes.
              </p>
            </Section>

            <Section title="3. Legal Basis for Processing (GDPR)">
              <p>If you are located in the European Economic Area (EEA), we process your personal data under the following legal bases:</p>
              <BulletList items={[
                "Contract performance: processing necessary to provide the Service you have signed up for",
                "Legitimate interests: improving the Service, preventing fraud, analytics",
                "Consent: marketing communications (you may withdraw consent at any time)",
                "Legal obligation: compliance with applicable laws",
              ]} />
            </Section>

            <Section title="4. How We Share Your Information">
              <p>We do not sell your personal information. We may share your information with:</p>

              <h4 className="text-[#1a1a2e] font-bold mt-6 mb-2">4.1 Service Providers</h4>
              <p>We share data with trusted third-party vendors who assist in operating the Service, subject to confidentiality agreements:</p>
              <BulletList items={[
                "Lemon Squeezy — payment processing",
                "Vercel — hosting and infrastructure",
                "Anthropic / OpenAI / Google — AI features (data is processed per their enterprise privacy policies; we do not permit training on your data)",
                "PostHog or equivalent — analytics",
                "Resend or equivalent — transactional email",
              ]} />

              <h4 className="text-[#1a1a2e] font-bold mt-6 mb-2">4.2 Business Transfers</h4>
              <p>If Revenue Map is acquired, merged, or undergoes a change of control, your information may be transferred as part of that transaction. We will notify you before your information is subject to a different privacy policy.</p>

              <h4 className="text-[#1a1a2e] font-bold mt-6 mb-2">4.3 Legal Requirements</h4>
              <p>We may disclose your information if required to do so by law or in response to valid legal requests (subpoenas, court orders, etc.).</p>

              <h4 className="text-[#1a1a2e] font-bold mt-6 mb-2">4.4 With Your Consent</h4>
              <p>We may share your information for other purposes with your explicit consent.</p>
            </Section>

            <Section title="5. Data Retention">
              <p>We retain your personal data for as long as your account is active or as needed to provide the Service. Specifically:</p>
              <BulletList items={[
                "Account data: retained while your account is active and for 90 days after deletion",
                "Financial modeling data: retained while your account is active; deleted within 30 days of account deletion upon request",
                "Billing records: retained for 7 years as required by applicable tax and accounting laws",
                "Log data: retained for 90 days",
              ]} />
              <p>You may request deletion of your data at any time by contacting us at <EmailLink email="privacy@revenuemap.app" />.</p>
            </Section>

            <Section title="6. Cookies and Tracking Technologies">
              <p>We use cookies and similar technologies to:</p>
              <BulletList items={[
                "Keep you logged in (session cookies)",
                "Remember your preferences",
                "Analyze Service usage and performance",
                "Prevent fraud",
              ]} />
              <p>Types of cookies we use:</p>
              <BulletList items={[
                "Essential cookies: required for the Service to function; cannot be disabled",
                "Analytics cookies: help us understand how users interact with the Service (e.g., PostHog)",
                "Preference cookies: remember your settings and choices",
              ]} />
              <p>You can control cookies through your browser settings. Disabling essential cookies may affect Service functionality. We do not use advertising or third-party tracking cookies.</p>
            </Section>

            <Section title="7. Your Rights and Choices">
              <p>Depending on your location, you may have the following rights:</p>
              <BulletList items={[
                "Access: request a copy of the personal data we hold about you",
                "Correction: request correction of inaccurate or incomplete data",
                "Deletion: request deletion of your personal data (\"right to be forgotten\")",
                "Portability: receive your data in a structured, machine-readable format",
                "Objection: object to processing based on legitimate interests",
                "Restriction: request restriction of processing in certain circumstances",
                "Withdraw consent: for consent-based processing, withdraw at any time",
              ]} />
              <p>
                To exercise any of these rights, contact us at <EmailLink email="privacy@revenuemap.app" />. We will respond within 30 days. We may need to verify your identity before processing requests.
              </p>
              <p>
                <span className="font-medium text-[#1a1a2e]">California residents:</span> Under the CCPA, you have additional rights including the right to know about and opt out of the &ldquo;sale&rdquo; of personal information. We do not sell personal information.
              </p>
            </Section>

            <Section title="8. Data Security">
              <p>We implement appropriate technical and organizational security measures to protect your information, including:</p>
              <BulletList items={[
                "Encryption in transit (TLS/HTTPS) and at rest",
                "Access controls limiting who can access your data",
                "Regular security reviews and vulnerability assessments",
                "Secure payment processing via Lemon Squeezy (PCI DSS compliant)",
              ]} />
              <p>No method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security. In the event of a data breach affecting your rights, we will notify you as required by applicable law.</p>
            </Section>

            <Section title="9. International Data Transfers">
              <p>Revenue Map is operated from the European Union / Serbia. If you access the Service from outside this region, your data may be transferred to and processed in countries with different data protection laws.</p>
              <p>For transfers from the EEA to third countries, we rely on appropriate safeguards including Standard Contractual Clauses (SCCs) approved by the European Commission where applicable.</p>
            </Section>

            <Section title="10. Children's Privacy">
              <p>The Service is not directed to children under the age of 16. We do not knowingly collect personal information from children under 16. If you believe we have inadvertently collected such information, please contact us immediately at <EmailLink email="privacy@revenuemap.app" /> and we will delete it promptly.</p>
            </Section>

            <Section title="11. Third-Party Links">
              <p>The Service may contain links to third-party websites or services. We are not responsible for the privacy practices of those third parties. We encourage you to read the privacy policies of every website you visit.</p>
            </Section>

            <Section title="12. Changes to This Privacy Policy">
              <p>We may update this Privacy Policy from time to time. We will notify you of material changes by:</p>
              <BulletList items={[
                "Posting the new policy on this page with an updated effective date",
                "Sending an email notification to the address associated with your account",
                "Displaying a notice within the Service",
              ]} />
              <p>Your continued use of the Service after changes become effective constitutes your acceptance of the revised policy.</p>
            </Section>

            <Section title="13. Contact Us">
              <p>If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
              <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 mt-4">
                <p className="font-bold text-[#1a1a2e] mb-1">Revenue Map</p>
                <p>Email: <EmailLink email="privacy@revenuemap.app" /></p>
                <p>Website: <Link href="/" className="text-[#2163e7] hover:underline">revenuemap.app</Link></p>
              </div>
              <p className="mt-4">For GDPR-related inquiries, our Data Protection contact is reachable at the email above. We aim to respond to all privacy inquiries within 30 days.</p>
            </Section>

            <div className="border-t border-[#e5e7eb] pt-6 mt-10 text-sm text-[#6b7280] text-center">
              This Privacy Policy was last reviewed and updated on March 10, 2026.
              <br />
              Revenue Map — revenuemap.app — &copy; 2026 All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Reusable sub-components ─── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[#1a1a2e] mb-4">{title}</h2>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 my-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#2163e7] shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function EmailLink({ email }: { email: string }) {
  return (
    <a href={`mailto:${email}`} className="text-[#2163e7] hover:underline">
      {email}
    </a>
  );
}
