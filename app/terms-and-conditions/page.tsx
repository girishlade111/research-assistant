import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "ResAgent's Enterprise Terms of Service and Master Service Agreement (MSA). Read our licensing terms, acceptable use policy, and liability provisions.",
  keywords: ["terms of service", "terms and conditions", "MSA", "licensing", "AI terms", "ResAgent legal"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Terms of Service — ResAgent",
    description:
      "Master Service Agreement (MSA) & Licensing Terms for ResAgent users.",
    url: "/terms-and-conditions",
  },
};

import { ArrowLeft, FileText, Scale, AlertTriangle, Copyright, Bot, ShieldAlert, Zap, BookOpen, Terminal, CheckCircle2 } from "lucide-react";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full space-y-12">

        {/* Header Section */}
        <div className="flex flex-col gap-4 border-b border-border pb-8">
          <Link href="/" className="w-fit p-2 -ml-2 rounded-full hover:bg-accent transition-colors flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Return to Platform</span>
          </Link>
          <div className="flex items-center gap-4 mt-4">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <Scale className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-heading font-extrabold tracking-tight">Enterprise Terms of Service</h1>
              <p className="text-muted-foreground mt-2 text-lg">Master Service Agreement (MSA) & Licensing Terms</p>
            </div>
          </div>
        </div>

        <div className="prose prose-invert max-w-none space-y-12 text-muted-foreground pb-12">

          {/* Executive Summary */}
          <div className="bg-accent/10 border border-border rounded-xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <strong className="text-foreground text-lg">Legal Execution Notice</strong>
              </div>
              <p className="text-sm m-0 font-medium bg-background px-3 py-1 rounded-full border border-border">Effective: <strong className="text-primary">April 2026</strong></p>
            </div>
            <p className="text-base leading-relaxed text-foreground m-0">
              These Enterprise Terms of Service (&quot;Terms&quot;) constitute a legally binding Master Service Agreement between you (whether individually or representing an incorporated entity) and <strong className="text-foreground">ResAgent</strong>. By deploying, accessing, querying, or programmatically interacting with our AI research orchestration APIs and web interfaces, you explicitly acknowledge that you have read, understood, and agreed to be bound by these exhaustive terms without modification.
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-5">
            <div className="flex items-center gap-3 pb-2 border-b border-border/40">
              <Terminal className="w-7 h-7 text-primary" />
              <h2 className="text-2xl font-bold text-foreground m-0">1. Platform Licensing & Access Modalities</h2>
            </div>
            <p className="text-lg">Subject to your continuous, uninterrupted compliance with these Terms and the payment of applicable tier fees, ResAgent grants you a revocable, non-exclusive, non-transferable, limited worldwide license to access and utilize the orchestration platform.</p>

            <div className="bg-destructive/5 border border-destructive/30 rounded-xl p-6 mt-6">
              <strong className="text-destructive flex items-center gap-2 text-xl mb-4 pb-2 border-b border-destructive/20">
                <AlertTriangle className="w-6 h-6" /> Strict Prohibitions & Acceptable Use Policy (AUP)
              </strong>
              <p className="text-sm text-foreground mb-4">Any violation of the following directives will result in immediate API key revocation and potential legal action:</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none pl-0 m-0">
                <li className="flex items-start gap-3 bg-background border border-destructive/10 p-3 rounded-lg">
                  <div className="mt-0.5 text-destructive">•</div>
                  <span className="text-sm"><strong>Reverse Engineering:</strong> Decompiling, disassembling, or extracting the proprietary multi-agent orchestration algorithms or routing logic.</span>
                </li>
                <li className="flex items-start gap-3 bg-background border border-destructive/10 p-3 rounded-lg">
                  <div className="mt-0.5 text-destructive">•</div>
                  <span className="text-sm"><strong>Model Stripping:</strong> Utilizing platform outputs to train, fine-tune, or calibrate competing foundational models or proprietary AI agents.</span>
                </li>
                <li className="flex items-start gap-3 bg-background border border-destructive/10 p-3 rounded-lg">
                  <div className="mt-0.5 text-destructive">•</div>
                  <span className="text-sm"><strong>Adversarial Attacks:</strong> Executing automated denial-of-service (DDoS), load-testing, or adversarial prompt-injection attacks (e.g., DAN exploits) against our endpoints.</span>
                </li>
                <li className="flex items-start gap-3 bg-background border border-destructive/10 p-3 rounded-lg">
                  <div className="mt-0.5 text-destructive">•</div>
                  <span className="text-sm"><strong>Unauthorized Resale:</strong> Leasing, sublicensing, or commercially reselling direct API access to the ResAgent orchestrator without executing a formalized Reseller Agreement.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-5">
            <div className="flex items-center gap-3 pb-2 border-b border-border/40">
              <Bot className="w-7 h-7 text-primary" />
              <h2 className="text-2xl font-bold text-foreground m-0">2. Artificial Intelligence Output Disclaimers</h2>
            </div>
            <p className="text-lg">ResAgent operates via complex, non-deterministic large language models (LLMs) integrated with real-time web retrieval vector systems. Due to the statistical nature of generative AI, you expressly understand and formally agree that:</p>

            <div className="space-y-4 mt-6">
              <div className="flex gap-4 p-5 rounded-xl border border-border bg-accent/5 hover:bg-accent/10 transition-colors">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary font-bold border border-secondary/20 text-xl">A</div>
                <div>
                  <strong className="text-foreground text-xl block mb-2">Inherent Probability of Hallucination</strong>
                  <p className="text-sm text-muted-foreground leading-relaxed m-0">AI-generated content may periodically contain factual inaccuracies, logical inconsistencies, synthesized references, or &quot;hallucinations.&quot; The platform is strictly designed to <strong>augment</strong> human intelligence, not to act as an infallible source of absolute truth. All citations must be manually verified.</p>
                </div>
              </div>

              <div className="flex gap-4 p-5 rounded-xl border border-border bg-accent/5 hover:bg-accent/10 transition-colors">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold border border-primary/20 text-xl">B</div>
                <div>
                  <strong className="text-foreground text-xl block mb-2">Absence of Certified Professional Advice</strong>
                  <p className="text-sm text-muted-foreground leading-relaxed m-0">No output generated by ResAgent should ever be construed as definitive medical diagnoses, legal counsel, financial investment strategies, or licensed engineering advice. You are mandated to consult certified human professionals before acting on critical AI-synthesized research.</p>
                </div>
              </div>

              <div className="flex gap-4 p-5 rounded-xl border border-border bg-accent/5 hover:bg-accent/10 transition-colors">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold border border-primary/20 text-xl">C</div>
                <div>
                  <strong className="text-foreground text-xl block mb-2">Mandatory Human-in-the-Loop (HITL)</strong>
                  <p className="text-sm text-muted-foreground leading-relaxed m-0">You hold absolute and sole liability for reviewing, fact-checking, and validating all synthesized reports, code snippets, and data aggregations before internal application or external publication. ResAgent acts as a processor, you remain the publisher.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-5">
            <div className="flex items-center gap-3 pb-2 border-b border-border/40">
              <Copyright className="w-7 h-7 text-primary" />
              <h2 className="text-2xl font-bold text-foreground m-0">3. Intellectual Property Rights & Data Ownership</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="p-6 rounded-xl border border-border bg-background shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-primary">
                  <ShieldAlert className="w-5 h-5" />
                  <strong className="text-foreground text-lg">ResAgent IP Retained</strong>
                </div>
                <p className="text-sm leading-relaxed mb-0">The ResAgent application, encompassing its UI/UX, multi-agent orchestration logic, API schemas, compiled source code, and underlying cloud architecture, remains the exclusive, copyrighted property of ResAgent and its creator. No transfer of corporate intellectual property is implied by your use of the service.</p>
              </div>

              <div className="p-6 rounded-xl border border-primary/30 bg-primary/5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-primary">
                  <CheckCircle2 className="w-5 h-5" />
                  <strong className="text-foreground text-lg">User Content & Output Ownership</strong>
                </div>
                <p className="text-sm leading-relaxed mb-0">You retain 100% ownership of the original prompts and proprietary data you submit. Crucially, <strong>ResAgent claims no copyright over the generated AI output</strong> provided to you. You are free to utilize, publish, monetize, and distribute the research outputs as you see fit, provided the usage adheres to our Acceptable Use Policy.</p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-5">
            <div className="flex items-center gap-3 pb-2 border-b border-border/40">
              <ShieldAlert className="w-7 h-7 text-primary" />
              <h2 className="text-2xl font-bold text-foreground m-0">4. Limitation of Liability & Full Indemnification</h2>
            </div>

            <div className="bg-accent/10 border border-border p-6 rounded-xl space-y-4">
              <p className="text-sm font-mono uppercase tracking-wide text-muted-foreground mb-2">Legal Disclaimer</p>
              <p className="text-base font-medium text-foreground uppercase leading-relaxed text-justify">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE INTERNATIONAL LAW, IN NO EVENT SHALL RESAGENT, ITS FOUNDERS, ENGINEERS, OR ITS INFRASTRUCTURE SUPPLIERS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES. THIS INCLUDES, WITHOUT LIMITATION, DAMAGES FOR LOSS OF ENTERPRISE PROFITS, GOODWILL, SYSTEM USABILITY, DATA CORRUPTION, OR OTHER INTANGIBLE BUSINESS LOSSES, ARISING OUT OF OR RELATING TO THE USE OF, OR INABILITY TO USE, THIS AI SERVICE.
              </p>
              <div className="h-px w-full bg-border/50 my-4"></div>
              <p className="text-sm leading-relaxed">
                <strong className="text-foreground">Indemnification Clause:</strong> You explicitly agree to defend, fully indemnify, and hold harmless ResAgent and its affiliates from and against any third-party claims, liabilities, civil damages, judgments, legal awards, losses, costs, expenses, or fees (including reasonable and necessary attorneys&apos; fees) arising out of or directly relating to your violation of these Terms, your misuse of the Platform outputs, or your infringement of third-party intellectual property via prompts submitted to the service.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-5">
            <div className="flex items-center gap-3 pb-2 border-b border-border/40">
              <Zap className="w-7 h-7 text-primary" />
              <h2 className="text-2xl font-bold text-foreground m-0">5. Termination, Suspension, & SLA Metrics</h2>
            </div>
            <p className="text-lg">We reserve the unilateral right to immediately suspend, throttle, or permanently terminate your programmatic or web access to ResAgent without prior notice or financial liability under the following conditions:</p>
            <ul className="list-disc pl-6 space-y-2 marker:text-primary mt-4">
              <li>Material breach of the Acceptable Use Policy (AUP) outlined in Section 1.</li>
              <li>Detection of fraudulent API usage, credential sharing, or illegal activities originating from your tenant.</li>
              <li>Execution of queries that structurally degrade the system&apos;s performance, latency, or availability for other enterprise tenants (Noisy Neighbor isolation).</li>
              <li>Non-payment of subscription dues exceeding a 15-day grace period.</li>
            </ul>
          </section>

          {/* Contact Section */}
          <section className="mt-16 pt-8 border-t border-border flex flex-col items-center text-center">
            <div className="p-4 bg-primary/5 rounded-full mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Legal Correspondence & Notices</h2>
            <p className="max-w-2xl text-center mb-6">
              For formal legal notices, breach reporting, DMCA takedown requests, or bespoke Enterprise SLA negotiations regarding these Terms, please contact our legal counsel directly:
            </p>
            <a
              href="mailto:admin@ladestack.in"
              className="inline-flex items-center justify-center px-8 py-4 font-semibold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25"
            >
              admin@ladestack.in
            </a>
          </section>

        </div>
      </div>
    </div>
  );
}