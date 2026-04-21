import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, Server, UserCheck, Globe, Database, Cpu } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="flex items-center gap-4 border-b border-border pb-6">
          <Link href="/" className="p-2 rounded-full hover:bg-accent transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight">Enterprise Privacy Policy</h1>
        </div>
        
        <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground pb-12">
          <div className="bg-accent/20 border border-border rounded-xl p-6 mb-8">
            <p className="text-sm m-0 font-medium text-foreground">Last Updated and Effective Date: <span className="text-primary">April 2026</span></p>
            <p className="text-sm m-0 mt-2">
              At <strong>ResAgent</strong> ("we", "our", or "us"), we are fundamentally committed to protecting your privacy and ensuring the highest standards of data security. This Enterprise Privacy Policy comprehensively outlines how we collect, process, manage, and safeguard your personal and organizational data when you interact with our AI-powered research platform.
            </p>
          </div>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground m-0">1. Data Collection Architecture</h2>
            </div>
            <p>We deploy a precise, minimal-collection strategy designed to gather only the data strictly necessary for delivering our advanced AI services. The categories of information we collect include:</p>
            <ul className="list-none space-y-3 pl-0">
              <li className="flex gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <div>
                  <strong className="text-foreground">Voluntary Account Data:</strong> 
                  <span className="block text-sm mt-1">Information provided during onboarding, including enterprise identifiers, administrative contact names, corporate email addresses, and secure authentication credentials.</span>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <div>
                  <strong className="text-foreground">System Interaction & Query Data:</strong> 
                  <span className="block text-sm mt-1">The explicit textual queries, prompt parameters, and analytical parameters you submit to our AI engines. <span className="text-amber-500/80 font-medium">Note: We process this data transiently to generate responses and do not permanently associate your distinct enterprise identity with specific semantic search trees unless explicit history retention is enabled.</span></span>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <div>
                  <strong className="text-foreground">Telemetry & Diagnostic Information:</strong> 
                  <span className="block text-sm mt-1">Automated collection of IP addresses, browser agents, machine-level identifiers, timestamps, and routing pathways used strictly for security auditing, rate-limiting, and infrastructure optimization.</span>
                </div>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Cpu className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground m-0">2. Data Utilization & Processing Directives</h2>
            </div>
            <p>Your data is weaponized solely for your benefit. We categorically <strong>do not sell, rent, or lease</strong> your personal or organizational data to third-party data brokers. Our processing directives are strictly bound to the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2 marker:text-primary">
              <li><strong>Core Service Execution:</strong> To parse, route, and execute complex research queries using our orchestrated multi-agent AI architecture.</li>
              <li><strong>Algorithmic Quality Assurance:</strong> To monitor system hallucinations, latency, and routing failures, allowing us to deploy continuous integration improvements to our orchestration layers.</li>
              <li><strong>Enterprise Security Operations:</strong> To proactively detect, isolate, and neutralize anomalous activity, DDoS attempts, and unauthorized perimeter access.</li>
              <li><strong>Regulatory Compliance:</strong> To generate audit trails compliant with international data sovereignty laws and financial reporting mandates.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground m-0">3. Third-Party Ecosystem & Sub-Processors</h2>
            </div>
            <p>To provide cutting-edge research synthesis, ResAgent integrates with elite third-party sub-processors. All external data transit is encrypted via TLS 1.3.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="border border-border/50 bg-accent/10 rounded-lg p-4">
                <strong className="text-foreground flex items-center gap-2"><Server className="w-4 h-4 text-primary"/> Inference Providers</strong>
                <p className="text-sm mt-2 mb-0">We route anonymized query payloads to foundational model providers (e.g., OpenAI, Anthropic, OpenRouter). These providers are contractually bound to zero-retention policies for API payloads; your data is <strong>never</strong> used to train their foundational models.</p>
              </div>
              <div className="border border-border/50 bg-accent/10 rounded-lg p-4">
                <strong className="text-foreground flex items-center gap-2"><Database className="w-4 h-4 text-primary"/> Vector Infrastructure</strong>
                <p className="text-sm mt-2 mb-0">High-dimensional embeddings generated from your sessions may be temporarily stored in isolated, tenant-specific vector databases for caching and context-retrieval, scrubbed periodically based on your organization's retention policy.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground m-0">4. Enterprise Security Posture</h2>
            </div>
            <p>We deploy defense-in-depth methodologies to ensure absolute data integrity:</p>
            <ul className="list-disc pl-6 space-y-2 marker:text-primary">
              <li><strong>Encryption at Rest & in Transit:</strong> AES-256 encryption for all persistent volumes and TLS 1.3 for all data in motion.</li>
              <li><strong>Zero-Trust Architecture:</strong> Strict role-based access control (RBAC) internally; no ResAgent engineer has default access to your query history or generated reports.</li>
              <li><strong>Ephemeral Processing:</strong> Queries routed to external APIs are stripped of identifiable metadata where possible and are processed entirely in memory.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <UserCheck className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground m-0">5. User Sovereign Rights (GDPR & CCPA Compliance)</h2>
            </div>
            <p>We recognize and enforce your sovereign data rights globally. You possess the definitive right to:</p>
            <ul className="space-y-2 list-none pl-0">
              <li className="bg-accent/5 rounded-md p-3 border-l-2 border-primary">
                <strong className="text-foreground">Right to Access:</strong> Request a cryptographic export of all data associated with your enterprise identity.
              </li>
              <li className="bg-accent/5 rounded-md p-3 border-l-2 border-primary">
                <strong className="text-foreground">Right to Erasure ("Right to be Forgotten"):</strong> Demand the immediate, irreversible destruction of your account and all associated telemetry and historical query data.
              </li>
              <li className="bg-accent/5 rounded-md p-3 border-l-2 border-primary">
                <strong className="text-foreground">Right to Restriction:</strong> Temporarily halt our processing of your data during a formal dispute.
              </li>
            </ul>
          </section>

          <section className="space-y-4 pt-6 border-t border-border">
            <h2 className="text-xl font-semibold text-foreground">Contact Our Privacy Office</h2>
            <p>
              For legal inquiries, data subject access requests (DSARs), or to contact our Data Protection Officer (DPO), please direct your communications to our secure administrative channel:
              <br /><br />
              <a href="mailto:privacy@ladestack.in" className="text-primary hover:underline font-medium">privacy@ladestack.in</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}