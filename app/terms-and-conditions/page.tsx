import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8">
        <div className="flex items-center gap-4 border-b border-border pb-6">
          <Link href="/" className="p-2 rounded-full hover:bg-accent transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <FileText className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-heading font-bold tracking-tight">Terms and Conditions</h1>
        </div>
        
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-lg">Last updated: April 2026</p>
          
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">1. Agreement to Terms</h2>
            <p>By viewing or using this Website, which can be accessed at ResAgent, you are agreeing to be bound by these Website Terms and Conditions of Use and agree that you are responsible for the agreement with any applicable local laws.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">2. Use License</h2>
            <p>Permission is granted to temporarily download one copy of the materials on ResAgent's Website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>modify or copy the materials;</li>
              <li>use the materials for any commercial purpose or for any public display;</li>
              <li>attempt to reverse engineer any software contained on ResAgent's Website;</li>
              <li>remove any copyright or other proprietary notations from the materials; or</li>
              <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">3. Disclaimer</h2>
            <p>All the materials on ResAgent's Website are provided "as is". ResAgent makes no warranties, may it be expressed or implied, therefore negates all other warranties. Furthermore, ResAgent does not make any representations concerning the accuracy or reliability of the use of the materials on its Website or otherwise relating to such materials or any sites linked to this Website.</p>
            <p>The AI-generated research outputs should be fact-checked and verified independently. We are not responsible for any inaccuracies in the AI-generated reports.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">4. Limitations</h2>
            <p>ResAgent or its suppliers will not be hold accountable for any damages that will arise with the use or inability to use the materials on ResAgent's Website, even if ResAgent or an authorize representative of this Website has been notified, orally or written, of the possibility of such damage.</p>
          </section>
        </div>
      </div>
    </div>
  );
}