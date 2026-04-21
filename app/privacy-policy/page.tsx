import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, Server, UserCheck, Globe, Database, Cpu, FileWarning, RefreshCcw, Activity } from "lucide-react";

export default function PrivacyPolicy() {
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
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-heading font-extrabold tracking-tight">Enterprise Privacy Policy</h1>
              <p className="text-muted-foreground mt-2 text-lg">Comprehensive Data Governance and Security Framework</p>
            </div>
          </div>
        </div>
        
        <div className="prose prose-invert max-w-none space-y-12 text-muted-foreground pb-12">
          
          {/* Executive Summary */}
          <div className="bg-gradient-to-r from-accent/20 to-transparent border-l-4 border-primary rounded-r-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm m-0 font-bold text-foreground uppercase tracking-wider">Document Status: <span className="text-primary ml-2">Active</span></p>
              <p className="text-sm m-0 font-medium text-muted-foreground">Last Revised: <strong className="text-foreground">April 2026</strong></p>
            </div>
            <p className="text-base leading-relaxed text-foreground">
              At <strong className="text-primary">ResAgent</strong> ("we", "our", or "us"), we operate on a fundamental principle of zero-trust data minimization. We are unequivocally committed to protecting your privacy and ensuring the highest standards of cryptographic data security. This Enterprise Privacy Policy exhaustively delineates how we securely collect, transiently process, rigorously manage, and completely sanitize your personal and organizational data when interacting with our AI orchestration infrastructure.
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-5">
            <div className="flex items-center gap-3 pb-2 border-b border-border/40">
              <Database className="w-7 h-7 text-primary" />
              <h2 className="text-2xl font-bold text-foreground m-0">1. Data Collection Architecture & Minimization</h2>
            </div>
            <p className="text-lg">We deploy a precise, minimal-collection strategy engineered to gather only the exact byte-level data strictly necessary for delivering our advanced generative services. We categorize collected data as follows:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-background border border-border rounded-xl p-5 hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <UserCheck className="w-5 h-5 text-primary" />
                  <strong className="text-foreground text-lg">Voluntary Account Data</strong>
                </div>
                <ul className="text-sm space-y-2 list-none pl-0">
                  <li className="flex gap-2"><span className="text-primary">•</span> <span>Enterprise identifiers and tenant IDs.</span></li>
                  <li className="flex gap-2"><span className="text-primary">•</span> <span>Administrative contact names and corporate email addresses.</span></li>
                  <li className="flex gap-2"><span className="text-primary">•</span> <span>Secure OAuth payloads and hashed authentication credentials (bcrypt/Argon2).</span></li>
                </ul>
              </div>

              <div className="bg-background border border-border rounded-xl p-5 hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-5 h-5 text-primary" />
                  <strong className="text-foreground text-lg">Telemetry & Diagnostic Data</strong>
                </div>
                <ul className="text-sm space-y-2 list-none pl-0">
                  <li className="flex gap-2"><span className="text-primary">•</span> <span>Obfuscated IP addresses and localized geographic regions.</span></li>
                  <li className="flex gap-2"><span className="text-primary">•</span> <span>Browser user-agents and machine-level telemetry limits.</span></li>
                  <li className="flex gap-2"><span className="text-primary">•</span> <span>API routing pathways, latency metrics, and error stack traces.</span></li>
                </ul>
              </div>
            </div>

            <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-5 mt-4">
              <strong className="text-secondary flex items-center gap-2 text-lg mb-2"><FileWarning className="w-5 h-5"/> Crucial Note on Query Processing:</strong>
              <p className="text-sm text-secondary leading-relaxed m-0">
                The explicit textual queries, prompt configurations, and semantic parameters you submit to our AI engines are processed <strong>transiently</strong>. ResAgent does not permanently associate your distinct enterprise identity with specific semantic search trees unless explicit organizational history retention is toggled 'ON' by your administrator.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-5">
            <div className="flex items-center gap-3 pb-2 border-b border-border/40">
              <Cpu className="w-7 h-7 text-primary" />
              <h2 className="text-2xl font-bold text-foreground m-0">2. Data Utilization & Processing Directives</h2>
            </div>
            <p className="text-lg">Your data is weaponized solely for your benefit. We categorically and unconditionally <strong>do not sell, rent, lease, or monetize</strong> your personal or organizational data to third-party data brokers or advertising networks.</p>
            
            <div className="space-y-3 pl-4 border-l-2 border-primary/30 mt-4">
              <div className="mb-4">
                <strong className="text-foreground text-base">A. Core Orchestration Execution</strong>
                <p className="text-sm mt-1">To parse, route, and execute complex research queries using our orchestrated multi-agent architecture across parallel processing nodes.</p>
              </div>
              <div className="mb-4">
                <strong className="text-foreground text-base">B. Algorithmic Quality Assurance (Opt-Out Available)</strong>
                <p className="text-sm mt-1">To monitor system hallucinations, latency degradation, and routing failures. We utilize anonymized metric data to deploy continuous integration improvements.</p>
              </div>
              <div className="mb-4">
                <strong className="text-foreground text-base">C. Enterprise Security Operations (SecOps)</strong>
                <p className="text-sm mt-1">To proactively detect, isolate, and neutralize anomalous activity, adversarial prompt injections, DDoS attempts, and unauthorized perimeter access.</p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-5">
            <div className="flex items-center gap-3 pb-2 border-b border-border/40">
              <Globe className="w-7 h-7 text-primary" />
              <h2 className="text-2xl font-bold text-foreground m-0">3. Third-Party Ecosystem & Sub-Processors</h2>
            </div>
            <p className="text-lg">To provide state-of-the-art research synthesis, ResAgent integrates via secure, encrypted channels (TLS 1.3) with elite third-party sub-processors. We enforce strict Data Processing Agreements (DPAs) with all vendors.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="border border-border bg-accent/5 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg"><Server className="w-5 h-5 text-primary"/></div>
                  <strong className="text-foreground text-lg">Inference Providers</strong>
                </div>
                <p className="text-sm leading-relaxed mb-4">We route anonymized query payloads to foundational model providers (e.g., OpenAI, Anthropic, OpenRouter).</p>
                <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
                  <strong className="text-primary text-xs uppercase tracking-wider block mb-1">Zero-Retention Guarantee</strong>
                  <span className="text-xs">These providers are contractually bound to zero-retention policies for API payloads. <strong>Your data is never used to train their foundational models.</strong></span>
                </div>
              </div>
              
              <div className="border border-border bg-accent/5 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg"><Database className="w-5 h-5 text-primary"/></div>
                  <strong className="text-foreground text-lg">Vector Infrastructure</strong>
                </div>
                <p className="text-sm leading-relaxed mb-4">High-dimensional embeddings generated from your active sessions are temporarily stored in isolated, tenant-specific vector databases.</p>
                <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
                  <strong className="text-primary text-xs uppercase tracking-wider block mb-1">Ephemeral Caching</strong>
                  <span className="text-xs">Vectors are utilized strictly for context-retrieval during a session and are scrubbed via automated cron jobs upon session termination.</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-5">
            <div className="flex items-center gap-3 pb-2 border-b border-border/40">
              <Lock className="w-7 h-7 text-primary" />
              <h2 className="text-2xl font-bold text-foreground m-0">4. Enterprise Security Posture</h2>
            </div>
            <p className="text-lg">We employ military-grade, defense-in-depth methodologies to ensure absolute data sovereignty and cryptographic integrity:</p>
            
            <ul className="list-none space-y-4 pl-0 mt-4">
              <li className="flex gap-4 items-start p-4 rounded-xl border border-border/50 bg-background">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">✓</div>
                <div>
                  <strong className="text-foreground text-base">Encryption at Rest & in Transit</strong>
                  <p className="text-sm mt-1 mb-0 text-muted-foreground">AES-256 encryption secures all persistent block volumes and databases. TLS 1.3 encryption is strictly enforced for all inbound and outbound data in motion over public and private networks.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start p-4 rounded-xl border border-border/50 bg-background">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">✓</div>
                <div>
                  <strong className="text-foreground text-base">Strict Zero-Trust Architecture</strong>
                  <p className="text-sm mt-1 mb-0 text-muted-foreground">We implement rigorous Role-Based Access Control (RBAC). No ResAgent engineer, administrator, or service account has default or unauthorized access to your query history, vector embeddings, or generated reports.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start p-4 rounded-xl border border-border/50 bg-background">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">✓</div>
                <div>
                  <strong className="text-foreground text-base">Ephemeral Memory Processing</strong>
                  <p className="text-sm mt-1 mb-0 text-muted-foreground">Whenever architecturally possible, data processing is conducted entirely in volatile memory (RAM). Payloads are stripped of personally identifiable metadata (PII) before being dispatched to external processing nodes.</p>
                </div>
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-5">
            <div className="flex items-center gap-3 pb-2 border-b border-border/40">
              <RefreshCcw className="w-7 h-7 text-primary" />
              <h2 className="text-2xl font-bold text-foreground m-0">5. User Sovereign Rights & Global Compliance</h2>
            </div>
            <p className="text-lg">We natively recognize and proactively enforce your sovereign data rights globally, adhering to the strictest interpretations of the <strong>GDPR (Europe), CCPA/CPRA (California), and SOC 2 Type II compliance frameworks</strong>.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-accent/10 border-t-4 border-t-primary rounded-b-xl p-5 shadow-sm">
                <strong className="text-foreground block mb-2 text-lg">Right to Access</strong>
                <p className="text-sm mb-0">You may request a complete, cryptographic export (JSON/CSV) of all telemetry and configuration data associated with your enterprise identity within 72 hours.</p>
              </div>
              <div className="bg-accent/10 border-t-4 border-t-secondary rounded-b-xl p-5 shadow-sm">
                <strong className="text-foreground block mb-2 text-lg">Right to Erasure</strong>
                <p className="text-sm mb-0">Often termed the "Right to be Forgotten." Demand the immediate, cascading, and mathematically irreversible destruction of your account and all associated telemetry.</p>
              </div>
              <div className="bg-accent/10 border-t-4 border-t-secondary rounded-b-xl p-5 shadow-sm">
                <strong className="text-foreground block mb-2 text-lg">Right to Restriction</strong>
                <p className="text-sm mb-0">You hold the capability to temporarily halt our processing of your organizational data during an active legal dispute or audit investigation.</p>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="mt-16 pt-8 border-t border-border flex flex-col items-center text-center">
            <div className="p-4 bg-primary/5 rounded-full mb-4">
              <Eye className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Contact Our Privacy Office</h2>
            <p className="max-w-2xl text-center mb-6">
              For complex legal inquiries, formal Data Subject Access Requests (DSARs), compliance audits, or to directly contact our Data Protection Officer (DPO), please initiate communication through our secure administrative channel.
            </p>
            <a 
              href="mailto:privacy@ladestack.in" 
              className="inline-flex items-center justify-center px-8 py-4 font-semibold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25"
            >
              privacy@ladestack.in
            </a>
          </section>

        </div>
      </div>
    </div>
  );
}