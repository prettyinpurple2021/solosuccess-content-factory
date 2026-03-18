import { LegalLayout, Section } from "@/components/legal-layout"

export const metadata = {
  title: "Privacy Policy — SoloSuccess Content Factory",
  description: "How SoloSuccess Content Factory collects, uses, and protects your personal information.",
}

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your personal information."
      lastUpdated="March 18, 2026"
    >
      <Section title="1. Who We Are">
        <p>SoloSuccess Content Factory ("we", "our", or "us") is a content creation platform built for solo founders and solo business owners. Our service is accessible at solosuccesscontentfactory.com.</p>
        <p>For questions about this Privacy Policy, contact us at: <strong>privacy@solosuccesscontentfactory.com</strong></p>
      </Section>

      <Section title="2. Information We Collect">
        <p><strong>Account information:</strong> When you create an account, we collect your email address and a hashed version of your password. We never store your password in plain text.</p>
        <p><strong>Profile information:</strong> Optional details you choose to add to your profile, such as your name or business name.</p>
        <p><strong>Content data:</strong> Drafts, ideas, scheduled posts, blog posts, surveys, and any other content you create inside the app. This data belongs to you.</p>
        <p><strong>Usage data:</strong> Information about how you interact with the app, such as features used, pages visited, and actions taken. This is used to improve the product.</p>
        <p><strong>Device and technical data:</strong> IP address, browser type, operating system, and referring URLs, collected automatically when you use the service.</p>
      </Section>

      <Section title="3. How We Use Your Information">
        <p>We use the information we collect to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Provide, operate, and maintain the SoloSuccess Content Factory service</li>
          <li>Authenticate your identity and manage your account</li>
          <li>Save and sync your content, drafts, and preferences across sessions</li>
          <li>Send essential service emails (account confirmation, password reset, security alerts)</li>
          <li>Improve our product through anonymised usage analytics</li>
          <li>Comply with applicable laws and legal obligations</li>
        </ul>
        <p>We do <strong>not</strong> sell your personal data to third parties. We do not use your content to train AI models.</p>
      </Section>

      <Section title="4. Data Storage and Security">
        <p>Your data is stored in a Supabase-managed PostgreSQL database hosted on secure cloud infrastructure. All data is encrypted in transit using TLS and at rest using AES-256 encryption.</p>
        <p>Row Level Security (RLS) is enforced at the database level, meaning your data is only accessible to your authenticated session — no other user can access your content.</p>
        <p>We take reasonable technical and organisational measures to protect your information. However, no method of transmission over the internet is 100% secure.</p>
      </Section>

      <Section title="5. Data Retention">
        <p>We retain your account and content data for as long as your account is active. If you delete your account, all associated data is permanently deleted within 30 days.</p>
        <p>You may request deletion of your data at any time by contacting us at <strong>privacy@solosuccesscontentfactory.com</strong>.</p>
      </Section>

      <Section title="6. Cookies">
        <p>We use essential cookies to maintain your login session. We do not use advertising or third-party tracking cookies without your consent. For full details, see our <a href="/legal/cookies" className="font-bold underline underline-offset-4">Cookie Policy</a>.</p>
      </Section>

      <Section title="7. Third-Party Services">
        <p>We use the following third-party services to operate the platform:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Supabase</strong> — database, authentication, and storage</li>
          <li><strong>Vercel</strong> — hosting and edge delivery</li>
          <li><strong>Vercel Analytics</strong> — anonymised usage analytics</li>
        </ul>
        <p>Each of these services has its own privacy policy. We only share the minimum data necessary for them to provide their service.</p>
      </Section>

      <Section title="8. Your Rights">
        <p>Depending on your location, you may have the right to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Access the personal data we hold about you</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data ("right to be forgotten")</li>
          <li>Object to or restrict certain processing</li>
          <li>Data portability — receive your data in a structured, machine-readable format</li>
        </ul>
        <p>To exercise any of these rights, email us at <strong>privacy@solosuccesscontentfactory.com</strong>. We will respond within 30 days.</p>
      </Section>

      <Section title="9. Children's Privacy">
        <p>SoloSuccess Content Factory is not intended for use by anyone under the age of 16. We do not knowingly collect personal information from children. If you believe a child has provided us with their information, please contact us immediately.</p>
      </Section>

      <Section title="10. Changes to This Policy">
        <p>We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of this page and, where appropriate, notify you by email. Continued use of the service after changes constitutes acceptance of the updated policy.</p>
      </Section>
    </LegalLayout>
  )
}
