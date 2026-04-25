import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Meet the team behind ResAgent. Learn about our mission to build the definitive standard for autonomous AI research orchestration with enterprise-grade multi-agent architectures.",
  keywords: ["about ResAgent", "Girish Lade", "AI research team", "Lade Stack", "multi-agent research"],
  openGraph: {
    title: "About ResAgent — The Team & Mission",
    description:
      "Discover the mission, architecture, and people behind ResAgent — the next-generation multi-agent AI research engine.",
    url: "/about-us",
  },
};

import { ArrowLeft, Users, Mail, Globe, ExternalLink, Code2, BrainCircuit, Rocket, Target, Zap, ShieldCheck, Network, Cpu, Database } from "lucide-react";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

const socialLinks = [
  {
    name: "Website",
    url: "https://ladestack.in",
    icon: Globe,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    name: "GitHub",
    url: "https://github.com/girishlade111",
    icon: GithubIcon,
    color: "text-foreground",
    bg: "bg-foreground/10",
    border: "border-foreground/20",
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/girish-lade-075bba201/",
    icon: LinkedinIcon,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/girish_lade_/",
    icon: InstagramIcon,
    color: "text-secondary",
    bg: "bg-secondary/10",
    border: "border-secondary/20",
  },
  {
    name: "CodePen",
    url: "https://codepen.io/Girish-Lade-the-looper",
    icon: Code2,
    color: "text-foreground",
    bg: "bg-foreground/10",
    border: "border-foreground/20",
  },
  {
    name: "Email",
    url: "mailto:admin@ladestack.in",
    icon: Mail,
    color: "text-secondary",
    bg: "bg-secondary/10",
    border: "border-secondary/20",
  },
];

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full space-y-16">

        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-6 pb-12 border-b border-border relative">
          <Link href="/" className="absolute left-0 top-0 p-2 rounded-full hover:bg-accent transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
            <BrainCircuit className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-heading font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/90">
            The ResAgent Initiative
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
            We are engineering the definitive standard for autonomous research orchestration. ResAgent bridges the gap between raw data chaos and synthesized, actionable intelligence through enterprise-grade multi-agent architectures.
          </p>
        </div>

        {/* Core Pillars of Innovation */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold text-foreground m-0">Core Pillars of Innovation</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-accent/20 to-background border border-border/50 rounded-xl p-8 space-y-4 hover:border-primary/50 transition-colors">
              <div className="p-3 bg-primary/10 w-fit rounded-lg">
                <Network className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Distributed Intelligence</h3>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span><strong>Parallel Processing:</strong> Deploys simultaneous worker agents to analyze diverse data streams concurrently.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span><strong>Semantic Routing:</strong> Intelligently routes queries to specialized sub-agents based on domain complexity.</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-accent/20 to-background border border-border/50 rounded-xl p-8 space-y-4 hover:border-primary/50 transition-colors">
              <div className="p-3 bg-primary/10 w-fit rounded-lg">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Hyper-Optimized Velocity</h3>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span><strong>Edge-Cached Vectors:</strong> Retrieves deeply nested contextual embeddings in milliseconds.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span><strong>Zero-Friction UX:</strong> Streamlined streaming architecture ensures instant token delivery directly to the client.</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-accent/20 to-background border border-border/50 rounded-xl p-8 space-y-4 hover:border-primary/50 transition-colors">
              <div className="p-3 bg-secondary/10 w-fit rounded-lg">
                <ShieldCheck className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Verifiable Accuracy</h3>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span><strong>Rigorous Fact-Checking:</strong> Every claim is cross-referenced against authoritative web sources automatically.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span><strong>Transparent Citations:</strong> Immutable source linking ensures absolute auditability of generated reports.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technical Architecture */}
        <div className="space-y-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-3">
                <Cpu className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-bold text-foreground m-0">Enterprise-Grade Architecture</h2>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                ResAgent abstracts the complexity of large language model orchestration behind a seamless interface. Our platform is not a mere API wrapper; it is a <strong>self-correcting cognitive loop</strong> built for scale.
              </p>

              <div className="space-y-4 mt-6">
                <div className="flex gap-4 p-5 rounded-xl border border-border/50 bg-accent/5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold border border-primary/20 text-lg">1</div>
                  <div>
                    <strong className="text-foreground text-xl block mb-2">Intent Parsing & Parameter Expansion</strong>
                    <p className="text-sm text-muted-foreground leading-relaxed">The <span className="text-primary font-medium">Query Intelligence Router</span> dissects user input, generating multi-dimensional search parameters. It predicts missing context and expands the search vectors to cover blind spots.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-5 rounded-xl border border-border/50 bg-accent/5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold border border-primary/20 text-lg">2</div>
                  <div>
                    <strong className="text-foreground text-xl block mb-2">Asynchronous Web Extraction</strong>
                    <p className="text-sm text-muted-foreground leading-relaxed">A fleet of <span className="text-primary font-medium">Parallel Web Extractors</span> simultaneously scrape, parse, and clean data from scholarly articles, technical documentation, and real-time news APIs, bypassing superficial SEO content.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-5 rounded-xl border border-border/50 bg-accent/5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold border border-primary/20 text-lg">3</div>
                  <div>
                    <strong className="text-foreground text-xl block mb-2">Synthesis & Conflict Resolution</strong>
                    <p className="text-sm text-muted-foreground leading-relaxed">The <span className="text-primary font-medium">Synthesis Agents</span> ingest the unstructured data, normalize it into vector space, and resolve contradictory information. The final output is formatted, cited, and streamed to the user interface.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/3 bg-accent/10 border border-border rounded-2xl p-6 hidden md:block">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Database className="w-5 h-5" /> Stack Specifications</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Frontend Framework</span>
                  <span className="font-mono font-medium">Next.js 15 (App Router)</span>
                </li>
                <li className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">UI Architecture</span>
                  <span className="font-mono font-medium">TailwindCSS + Radix UI</span>
                </li>
                <li className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Model Routing</span>
                  <span className="font-mono font-medium">OpenRouter Integration</span>
                </li>
                <li className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">State Management</span>
                  <span className="font-mono font-medium">React Server Components</span>
                </li>
                <li className="flex justify-between pb-2">
                  <span className="text-muted-foreground">Deployment Topology</span>
                  <span className="font-mono font-medium">Vercel Edge Network</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Leadership & Development Section */}
        <section className="space-y-8 pt-12 border-t border-border">
          <div className="flex items-center gap-3 mb-8">
            <Users className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold text-foreground m-0">Leadership & Development</h2>
          </div>

          <div className="bg-gradient-to-br from-accent/10 via-background to-accent/5 rounded-3xl p-8 sm:p-12 border border-border/60 shadow-2xl relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>

            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 relative z-10">
              <div className="flex flex-col items-center space-y-5">
                <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-primary/20 to-primary/5 border-4 border-primary/30 shadow-[0_0_40px_rgba(255,255,255,0.05)]">
                  <span className="text-6xl font-heading font-extrabold text-primary drop-shadow-md">GL</span>
                </div>
                <div className="text-center lg:hidden">
                  <h3 className="text-3xl font-extrabold text-foreground tracking-tight">Girish Lade</h3>
                  <div className="inline-block mt-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase">
                    Creator & Lead Architect
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-6 text-center lg:text-left">
                <div className="hidden lg:block">
                  <h3 className="text-4xl font-extrabold text-foreground tracking-tight">Girish Lade</h3>
                  <div className="inline-block mt-3 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase">
                    Creator & Lead Architect
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed text-lg">
                  As a Full Stack Developer specializing in AI integrations and scalable web architectures, Girish built ResAgent to bridge the gap between raw, unstructured data and actionable, verifiable insight.
                </p>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  His engineering philosophy centers on <strong className="text-foreground font-semibold">abstracting complexity</strong>. By optimizing LLM orchestration loops, minimizing token latency, and building intuitive, high-performance user interfaces, Girish ensures that ResAgent remains at the bleeding edge of AI research technology.
                </p>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 lg:grid-cols-3 gap-5 pt-12 mt-8 border-t border-border/40 relative z-10">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center sm:justify-start gap-4 rounded-xl border p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg ${link.border} bg-background/50 backdrop-blur-sm hover:${link.bg} group`}
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-background shadow-sm border border-border/50 ${link.color} group-hover:scale-110 transition-transform duration-300`}>
                    <link.icon className="h-6 w-6" />
                  </div>
                  <div className="hidden sm:block flex-1">
                    <p className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{link.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Connect via {link.name}</p>
                  </div>
                  <ExternalLink className="hidden sm:block h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}