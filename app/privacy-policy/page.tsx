import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8">
        <div className="flex items-center gap-4 border-b border-border pb-6">
          <Link href="/" className="p-2 rounded-full hover:bg-accent transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-heading font-bold tracking-tight">Privacy Policy</h1>
        </div>
        
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-lg">Last updated: April 2026</p>
          
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
            <p>Welcome to ResAgent. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">2. Information We Collect</h2>
            <p>We collect personal information that you voluntarily provide to us when expressing an interest in obtaining information about us or our products and services, when participating in activities on the Website or otherwise contacting us.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Personal Information Provided by You:</strong> We collect names; email addresses; and other similar information.</li>
              <li><strong>Search Queries:</strong> We temporarily process search queries to provide the AI research capabilities, but we do not store these in a personally identifiable way beyond your local history.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
            <p>We use personal information collected via our Website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">4. Will Your Information Be Shared With Anyone?</h2>
            <p>We only share and disclose your information in the following situations:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Compliance with Laws:</strong> We may disclose your information where we are legally required to do so.</li>
              <li><strong>Vital Interests and Legal Rights:</strong> We may disclose your information where we believe it is necessary to investigate, prevent, or take action regarding potential violations of our policies, suspected fraud, situations involving potential threats to the safety of any person and illegal activities.</li>
              <li><strong>Third-Party Service Providers:</strong> We use third-party APIs to process your research queries. Your queries are sent to these services in accordance with their respective privacy policies.</li>
            </ul>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">5. How Long Do We Keep Your Information?</h2>
            <p>We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy policy, unless a longer retention period is required or permitted by law.</p>
          </section>
        </div>
      </div>
    </div>
  );
}