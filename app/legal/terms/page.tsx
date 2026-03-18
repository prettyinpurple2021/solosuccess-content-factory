import { LegalLayout, Section } from "@/components/legal-layout"

export const metadata = {
  title: "Terms of Service — SoloSuccess Content Factory",
  description: "The terms and conditions governing your use of SoloSuccess Content Factory.",
}

export default function TermsOfService() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="The rules of the road for using SoloSuccess Content Factory."
      lastUpdated="March 18, 2026"
    >
      <Section title="1. Acceptance of Terms">
        <p>By creating an account or using SoloSuccess Content Factory ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Service.</p>
        <p>We reserve the right to update these Terms at any time. Continued use of the Service after changes constitutes your acceptance of the new Terms.</p>
      </Section>

      <Section title="2. Description of Service">
        <p>SoloSuccess Content Factory is an all-in-one content creation platform designed for solo founders and solo business owners. The Service allows you to create, schedule, repurpose, and manage digital content across multiple channels.</p>
      </Section>

      <Section title="3. Eligibility">
        <p>You must be at least 16 years of age to use this Service. By using the Service, you represent and warrant that you meet this requirement.</p>
        <p>If you are using the Service on behalf of a business, you represent that you have the authority to bind that business to these Terms.</p>
      </Section>

      <Section title="4. Your Account">
        <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately at <strong>support@solosuccesscontentfactory.com</strong> if you suspect any unauthorised access to your account.</p>
        <p>You are responsible for all activity that occurs under your account. We are not liable for any loss or damage arising from your failure to maintain account security.</p>
        <p>You may not create accounts by automated means or under false pretences.</p>
      </Section>

      <Section title="5. Your Content">
        <p><strong>Ownership:</strong> You retain full ownership of all content you create using the Service. We do not claim any intellectual property rights over your content.</p>
        <p><strong>Licence to us:</strong> By using the Service, you grant us a limited, non-exclusive, royalty-free licence to store, process, and display your content solely for the purpose of providing the Service to you.</p>
        <p><strong>Responsibility:</strong> You are solely responsible for the content you create and publish. You warrant that your content does not violate any applicable laws or third-party rights.</p>
      </Section>

      <Section title="6. Prohibited Uses">
        <p>You agree not to use the Service to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Publish, distribute, or transmit content that is unlawful, harassing, defamatory, obscene, or fraudulent</li>
          <li>Infringe on the intellectual property rights of others</li>
          <li>Transmit spam, unsolicited messages, or malware</li>
          <li>Attempt to gain unauthorised access to the Service or its infrastructure</li>
          <li>Scrape, crawl, or extract data from the Service by automated means</li>
          <li>Resell or sublicense the Service without our written permission</li>
          <li>Use the Service in any way that could damage, disable, or impair it</li>
        </ul>
        <p>Violation of these prohibitions may result in immediate account termination.</p>
      </Section>

      <Section title="7. Intellectual Property">
        <p>The SoloSuccess Content Factory platform, including its design, code, trademarks, and branding, is owned by us and protected by applicable intellectual property laws. You may not copy, modify, or distribute any part of the platform without our express written consent.</p>
      </Section>

      <Section title="8. Third-Party Integrations">
        <p>The Service may allow you to connect third-party social media platforms (such as Instagram, Twitter/X, LinkedIn, and YouTube). Your use of those platforms is governed by their respective terms of service. We are not responsible for any actions taken by or on those platforms.</p>
      </Section>

      <Section title="9. Disclaimers">
        <p>The Service is provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>
        <p>We do not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components.</p>
      </Section>

      <Section title="10. Limitation of Liability">
        <p>To the maximum extent permitted by applicable law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, revenue, or business, arising out of or related to your use of the Service.</p>
        <p>Our total liability to you for any claims arising under these Terms shall not exceed the amount you paid to us in the 12 months preceding the claim, or $100 USD, whichever is greater.</p>
      </Section>

      <Section title="11. Termination">
        <p>You may delete your account at any time. Upon deletion, your data will be permanently removed within 30 days.</p>
        <p>We may suspend or terminate your account at any time, with or without notice, if we believe you have violated these Terms or for any other reason at our discretion.</p>
      </Section>

      <Section title="12. Governing Law">
        <p>These Terms are governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law principles. Any disputes shall be resolved in the courts located in Delaware.</p>
      </Section>

      <Section title="13. Contact Us">
        <p>For questions about these Terms, contact us at: <strong>legal@solosuccesscontentfactory.com</strong></p>
      </Section>
    </LegalLayout>
  )
}
