import { LegalLayout, Section } from "@/components/legal-layout"

export const metadata = {
  title: "Cookie Policy — SoloSuccess Content Factory",
  description: "How SoloSuccess Content Factory uses cookies and similar tracking technologies.",
}

export default function CookiePolicy() {
  return (
    <LegalLayout
      title="Cookie Policy"
      subtitle="How we use cookies and similar technologies on our platform."
      lastUpdated="March 18, 2026"
    >
      <Section title="1. What Are Cookies?">
        <p>Cookies are small text files stored on your device when you visit a website. They help the site remember information about your visit, such as your login session, so you don't have to log in again every time you return.</p>
        <p>We may also use similar technologies such as local storage and session storage for equivalent purposes.</p>
      </Section>

      <Section title="2. Cookies We Use">
        <p>We use only the minimum cookies necessary to operate the Service. Here is a breakdown:</p>

        <div className="border-2 border-black rounded-xl overflow-hidden mt-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#FFD700] border-b-2 border-black">
                <th className="text-left px-4 py-3 font-black">Name</th>
                <th className="text-left px-4 py-3 font-black">Type</th>
                <th className="text-left px-4 py-3 font-black">Purpose</th>
                <th className="text-left px-4 py-3 font-black">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black">
              <tr className="bg-card">
                <td className="px-4 py-3 font-mono text-xs">sb-access-token</td>
                <td className="px-4 py-3">Essential</td>
                <td className="px-4 py-3">Maintains your authenticated session</td>
                <td className="px-4 py-3">1 hour</td>
              </tr>
              <tr className="bg-secondary">
                <td className="px-4 py-3 font-mono text-xs">sb-refresh-token</td>
                <td className="px-4 py-3">Essential</td>
                <td className="px-4 py-3">Refreshes your session without requiring re-login</td>
                <td className="px-4 py-3">60 days</td>
              </tr>
              <tr className="bg-card">
                <td className="px-4 py-3 font-mono text-xs">_vercel_analytics</td>
                <td className="px-4 py-3">Analytics</td>
                <td className="px-4 py-3">Anonymised usage data to improve the product</td>
                <td className="px-4 py-3">Session</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="3. Essential Cookies">
        <p>Essential cookies are required for the Service to function. Without them, you cannot log in or maintain a session. You cannot opt out of essential cookies while using the Service.</p>
        <p>These cookies contain no personally identifiable information beyond a secure, encrypted session token.</p>
      </Section>

      <Section title="4. Analytics Cookies">
        <p>We use Vercel Analytics to understand how visitors interact with the Service. This data is fully anonymised — we cannot identify individual users from analytics data.</p>
        <p>We do <strong>not</strong> use advertising cookies, remarketing cookies, or any third-party tracking tools (such as Google Analytics, Facebook Pixel, or similar) that track you across other websites.</p>
      </Section>

      <Section title="5. Local Storage">
        <p>In some cases, we may use your browser's local storage (not cookies) to temporarily store UI state such as draft content before it is synced to the server. This data never leaves your device unless you are logged in and the sync process is triggered.</p>
      </Section>

      <Section title="6. How to Control Cookies">
        <p>You can control or delete cookies at any time through your browser settings. Here are links to instructions for the most common browsers:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies</li>
          <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies</li>
          <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
          <li><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies</li>
        </ul>
        <p>Note: Deleting or blocking essential cookies will log you out and prevent you from accessing the authenticated areas of the Service.</p>
      </Section>

      <Section title="7. Do Not Track">
        <p>Some browsers have a "Do Not Track" (DNT) feature that signals websites not to track user behaviour. Because we do not use third-party tracking or advertising cookies, our Service is already aligned with the intent of DNT signals.</p>
      </Section>

      <Section title="8. Changes to This Policy">
        <p>We may update this Cookie Policy when we change how we use cookies. Any changes will be reflected by updating the "Last updated" date at the top of this page.</p>
      </Section>

      <Section title="9. Contact Us">
        <p>If you have questions about how we use cookies, contact us at: <strong>privacy@solosuccesscontentfactory.com</strong></p>
      </Section>
    </LegalLayout>
  )
}
