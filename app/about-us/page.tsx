import Link from "next/link";
import { ArrowLeft, Users, Mail, Globe, ExternalLink, Code2, BrainCircuit, Rocket, Target, Zap } from "lucide-react";

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
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
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
    color: "text-blue-600",
    bg: "bg-blue-600/10",
    border: "border-blue-600/20",
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/girish_lade_/",
    icon: InstagramIcon,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
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
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
];

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-12">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-4 pb-8 border-b border-border relative">
          <Link href="/" className="absolute left-0 top-0 p-2 rounded-full hover:bg-accent transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <BrainCircuit className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight">The ResAgent Initiative</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Pioneering the next generation of autonomous research orchestration. We build intelligent systems that accelerate human discovery.
          </p>
        </div>
        
        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-accent/10 border border-border rounded-xl p-6 space-y-3">
            <Target className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">Mission</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To democratize access to profound analytical capabilities by abstracting away the tedious mechanics of data gathering, source verification, and comprehensive synthesis.
            </p>
          </div>
          <div className="bg-accent/10 border border-border rounded-xl p-6 space-y-3">
            <Rocket className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">Innovation</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Utilizing a state-of-the-art multi-agent architecture, our platform breaks down complex queries into parallelized analytical streams, delivering enterprise-grade reports in seconds.
            </p>
          </div>
          <div className="bg-accent/10 border border-border rounded-xl p-6 space-y-3">
            <Zap className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">Performance</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Engineered for absolute speed and accuracy. By implementing intelligent edge-caching and optimized vector retrieval, we ensure zero friction between curiosity and knowledge.
            </p>
          </div>
        </div>

        {/* The Architecture */}
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground pt-8 border-t border-border">
          <h2 className="text-3xl font-semibold text-foreground">Enterprise-Grade Architecture</h2>
          <p className="text-lg">
            ResAgent is not just a chatbot; it is a distributed intelligence engine. Our platform employs a specialized cohort of AI agents, each trained for distinct cognitive operations:
          </p>
          <ul className="list-none space-y-4 pl-0 mt-6">
            <li className="flex gap-4 p-4 rounded-lg border border-border/50 bg-background">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 font-bold border border-blue-500/20">1</div>
              <div>
                <strong className="text-foreground text-lg">Query Intelligence Router</strong>
                <p className="text-sm mt-1 mb-0">Analyzes user intent, expands semantic search parameters, and formulates a multi-dimensional attack plan for research extraction.</p>
              </div>
            </li>
            <li className="flex gap-4 p-4 rounded-lg border border-border/50 bg-background">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">2</div>
              <div>
                <strong className="text-foreground text-lg">Parallel Web Extractors</strong>
                <p className="text-sm mt-1 mb-0">High-concurrency scrapers that bypass superficial SEO content to retrieve peer-reviewed journals, technical documentation, and authoritative data.</p>
              </div>
            </li>
            <li className="flex gap-4 p-4 rounded-lg border border-border/50 bg-background">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">3</div>
              <div>
                <strong className="text-foreground text-lg">Fact-Check & Synthesis Agents</strong>
                <p className="text-sm mt-1 mb-0">Rigorous cross-referencing agents that identify contradictions across sources, ultimately compiling a coherent, heavily cited final report.</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Developer Section */}
        <section className="space-y-6 pt-12 border-t border-border">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-semibold text-foreground m-0">Leadership & Development</h2>
          </div>
          
          <div className="bg-gradient-to-br from-accent/30 to-background rounded-2xl p-8 border border-border shadow-lg">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-primary/10 border-4 border-primary/20 shadow-inner">
                  <span className="text-5xl font-heading font-bold text-primary">GL</span>
                </div>
                <div className="text-center md:hidden">
                  <h3 className="text-2xl font-bold text-foreground">Girish Lade</h3>
                  <p className="text-sm text-primary font-medium tracking-wide uppercase mt-1">Creator & Lead Architect</p>
                </div>
              </div>
              
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div className="hidden md:block">
                  <h3 className="text-3xl font-bold text-foreground">Girish Lade</h3>
                  <p className="text-sm text-primary font-medium tracking-wide uppercase mt-1">Creator & Lead Architect</p>
                </div>
                <p className="text-muted-foreground leading-relaxed text-base">
                  As a Full Stack Developer specializing in AI integrations and scalable web architectures, Girish built ResAgent to bridge the gap between raw data and actionable insight. His work focuses on optimizing LLM orchestration loops and creating intuitive, high-performance user interfaces.
                </p>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-4 pt-10">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center sm:justify-start gap-3 rounded-xl border p-3.5 transition-all duration-200 hover:-translate-y-1 ${link.border} bg-background hover:${link.bg} group`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${link.bg} ${link.color} group-hover:scale-110 transition-transform`}>
                    <link.icon className="h-5 w-5" />
                  </div>
                  <div className="hidden sm:block flex-1">
                    <p className="text-sm font-semibold text-foreground">{link.name}</p>
                  </div>
                  <ExternalLink className="hidden sm:block h-4 w-4 text-muted-foreground/30 group-hover:text-foreground/70 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}