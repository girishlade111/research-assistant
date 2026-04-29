import { jsPDF } from "jspdf";
import "jspdf-autotable";
import type { FinalReport } from "../engine/types";

// Extends jsPDF type for the autoTable plugin
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: {
      head?: string[][];
      body: unknown[];
      startY: number;
      margin: { left: number; right: number };
      styles: { fontSize?: number; cellPadding?: number; font?: string };
      headStyles?: { fillColor: number[]; textColor: number[]; fontStyle?: string };
      alternateRowStyles?: { fillColor: number[] };
      didDrawPage?: (data: { cursor: { y: number } }) => void;
    }) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

class PDFExporter {
  private doc: jsPDF;
  private currentY: number = 0;
  private readonly pageHeight: number;
  private readonly pageWidth: number;
  private readonly marginBottom: number = 25;
  private readonly marginTop: number = 20;
  private readonly marginLeft: number = 20;
  private readonly marginRight: number = 20;
  private readonly contentWidth: number;
  private isCoverPage: boolean = true;
  private readonly report: FinalReport;

  constructor(report: FinalReport) {
    this.report = report;
    this.doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.contentWidth = this.pageWidth - this.marginLeft - this.marginRight;
  }

  private get remainingSpace(): number {
    return this.pageHeight - this.marginBottom - this.currentY;
  }

  private ensureSpace(requiredHeight: number): void {
    if (this.remainingSpace < requiredHeight) {
      this.doc.addPage();
      this.currentY = this.marginTop;
      this.drawHeader();
    }
  }

  private drawHeader(): void {
    if (this.isCoverPage) return;
    
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text(this.report.title, this.marginLeft, 12);
    
    const pageStr = `Page ${this.doc.getNumberOfPages()}`;
    const pageStrWidth = this.doc.getTextWidth(pageStr);
    this.doc.text(pageStr, this.pageWidth - this.marginRight - pageStrWidth, 12);
    
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.2);
    this.doc.line(this.marginLeft, 14, this.pageWidth - this.marginRight, 14);
  }

  public generate(): void {
    this.drawCoverPage();
    this.isCoverPage = false;
    
    // Executive Summary
    this.doc.addPage();
    this.currentY = this.marginTop;
    this.drawHeader();
    this.parseMarkdown(this.report.sections.executiveSummary);

    // Dynamic Sections
    this.report.sections.dynamic.forEach(section => {
      // Start major section on new page if < 30% space
      if (this.remainingSpace < (this.pageHeight * 0.3)) {
        this.doc.addPage();
        this.currentY = this.marginTop;
        this.drawHeader();
      } else {
        this.currentY += 10;
      }
      this.parseMarkdown(`## ${section.title}\n\n${section.content}`);
    });

    // Cross-Section Analysis
    if (this.report.sections.crossSectionAnalysis) {
      this.currentY += 10;
      this.parseMarkdown(this.report.sections.crossSectionAnalysis);
    }

    // Key Findings
    if (this.report.sections.keyFindings && this.report.sections.keyFindings.length > 0) {
      this.currentY += 10;
      this.addSection("Key Findings Summary", "");
      this.addBulletList(this.report.sections.keyFindings);
    }

    // Conclusions
    if (this.report.sections.conclusions) {
      this.currentY += 10;
      this.parseMarkdown(this.report.sections.conclusions);
    }

    // Confidence Assessment
    if (this.report.sections.confidenceAssessment) {
      this.currentY += 10;
      this.parseMarkdown(this.report.sections.confidenceAssessment);
    }

    // References
    this.doc.addPage();
    this.currentY = this.marginTop;
    this.drawHeader();
    this.addSection("References & Sources", "");
    const sources = this.report.sources.map((s, i) => `[${i + 1}] ${s.title} - ${s.url}`);
    this.addBulletList(sources);

    this.drawFooters();
    this.doc.save(`Research_Report_${Date.now()}.pdf`);
  }

  private drawCoverPage(): void {
    this.doc.setFillColor(15, 23, 42); // slate-900
    this.doc.rect(0, 0, this.pageWidth, this.pageHeight, "F");

    this.doc.setTextColor(255, 255, 255);
    
    // Title
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(28);
    const titleLines = this.doc.splitTextToSize(this.report.title, this.contentWidth);
    this.doc.text(titleLines, this.pageWidth / 2, 80, { align: "center" });

    // Subtitle & Date
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(14);
    this.doc.setTextColor(200, 200, 200);
    this.doc.text(this.report.subtitle, this.pageWidth / 2, 80 + (titleLines.length * 12), { align: "center" });
    
    const dateStr = new Date(this.report.generatedAt).toLocaleDateString();
    this.doc.text(`Date: ${dateStr}`, this.pageWidth / 2, 80 + (titleLines.length * 12) + 10, { align: "center" });

    // Query Box
    this.doc.setFillColor(30, 41, 59); // slate-800
    this.doc.roundedRect(this.marginLeft, 130, this.contentWidth, 30, 3, 3, "F");
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(148, 163, 184); // slate-400
    this.doc.text("ORIGINAL RESEARCH QUERY", this.marginLeft + 10, 140);
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFont("helvetica", "italic");
    const queryLines = this.doc.splitTextToSize(`"${this.report.originalQuery}"`, this.contentWidth - 20);
    this.doc.text(queryLines, this.marginLeft + 10, 148);

    // Stats
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(10);
    this.doc.setTextColor(255, 255, 255);
    const statsY = 180;
    
    const stats = [
      { label: "PAGES", value: this.report.totalPages.toString() },
      { label: "SOURCES", value: this.report.metadata.totalSourcesAnalyzed.toString() },
      { label: "READ TIME", value: this.report.estimatedReadTime },
      { label: "AGENTS", value: this.report.metadata.totalAgentsUsed.toString() }
    ];

    const statWidth = this.contentWidth / 4;
    stats.forEach((stat, index) => {
      const x = this.marginLeft + (index * statWidth) + (statWidth / 2);
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(14);
      this.doc.text(stat.value, x, statsY, { align: "center" });
      
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(8);
      this.doc.setTextColor(148, 163, 184);
      this.doc.text(stat.label, x, statsY + 6, { align: "center" });
      this.doc.setTextColor(255, 255, 255);
    });

    // Branding
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("LadeStack Research", this.pageWidth / 2, this.pageHeight - 30, { align: "center" });
  }

  private drawFooters(): void {
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 2; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setDrawColor(200, 200, 200);
      this.doc.setLineWidth(0.2);
      this.doc.line(this.marginLeft, this.pageHeight - 20, this.pageWidth - this.marginRight, this.pageHeight - 20);
      
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(8);
      this.doc.setTextColor(150, 150, 150);
      
      const dateStr = new Date(this.report.generatedAt).toLocaleDateString();
      this.doc.text("Generated by LadeStack Research", this.marginLeft, this.pageHeight - 15);
      
      const rightText = `Date: ${dateStr}`;
      const rightTextWidth = this.doc.getTextWidth(rightText);
      this.doc.text(rightText, this.pageWidth - this.marginRight - rightTextWidth, this.pageHeight - 15);
    }
  }

  private addSection(title: string, content: string): void {
    const titleHeight = 12;
    const minContentHeight = content ? 30 : 0;
    
    this.ensureSpace(titleHeight + minContentHeight);
    
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(15, 23, 42);
    
    const lines = this.doc.splitTextToSize(title, this.contentWidth);
    this.doc.text(lines, this.marginLeft, this.currentY);
    this.currentY += (lines.length * 7) + 5;
    
    if (content) {
      this.addParagraphs(content);
    }
  }

  private addSubSection(title: string): void {
    const titleHeight = 10;
    this.ensureSpace(titleHeight + 20); // Title + some content
    
    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(30, 41, 59);
    
    const lines = this.doc.splitTextToSize(title, this.contentWidth);
    this.doc.text(lines, this.marginLeft, this.currentY);
    this.currentY += (lines.length * 6) + 4;
  }

  private addParagraphs(text: string): void {
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(51, 65, 85);
    
    // Process simple bold text **bold**
    const paragraphs = text.split(/\n\n+/);
    
    paragraphs.forEach(p => {
      const pText = p.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").trim();
      if (!pText) return;
      
      const lines = this.doc.splitTextToSize(pText, this.contentWidth);
      const blockHeight = lines.length * 6;
      
      this.ensureSpace(blockHeight + 4);
      this.doc.text(lines, this.marginLeft, this.currentY);
      this.currentY += blockHeight + 4;
    });
  }

  private addBlockquote(text: string): void {
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "italic");
    this.doc.setTextColor(71, 85, 105);
    
    const cleanText = text.replace(/^>\s*/gm, "").trim();
    const lines = this.doc.splitTextToSize(cleanText, this.contentWidth - 10);
    const blockHeight = lines.length * 6;
    
    this.ensureSpace(blockHeight + 8);
    
    // Draw left border
    this.doc.setDrawColor(203, 213, 225); // slate-300
    this.doc.setLineWidth(1);
    this.doc.line(this.marginLeft + 2, this.currentY - 4, this.marginLeft + 2, this.currentY + blockHeight - 2);
    
    this.doc.text(lines, this.marginLeft + 8, this.currentY);
    this.currentY += blockHeight + 6;
  }

  private addBulletList(bullets: string[]): void {
    const lineHeight = 6;
    const totalHeight = bullets.length * lineHeight + 4;
    
    this.ensureSpace(totalHeight);
    
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(51, 65, 85);
    
    bullets.forEach(bullet => {
      const cleanBullet = bullet.replace(/^- /, "").replace(/^\* /, "").replace(/\*\*(.*?)\*\*/g, "$1").trim();
      const lines = this.doc.splitTextToSize(cleanBullet, this.contentWidth - 8);
      
      this.ensureSpace(lines.length * lineHeight);
      this.doc.text("•", this.marginLeft + 4, this.currentY);
      this.doc.text(lines, this.marginLeft + 10, this.currentY);
      this.currentY += lines.length * lineHeight + 2;
    });
    this.currentY += 4;
  }

  private addTable(headers: string[], rows: string[][]): void {
    const rowHeight = 8;
    const headerHeight = 10;
    const totalHeight = headerHeight + (rows.length * rowHeight) + 10;
    
    this.ensureSpace(totalHeight);
    
    this.doc.autoTable({
      head: [headers],
      body: rows,
      startY: this.currentY,
      margin: { left: this.marginLeft, right: this.marginRight },
      styles: { fontSize: 9, cellPadding: 3, font: "helvetica" },
      headStyles: { fillColor: [15, 23, 42], textColor: [248, 250, 252], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      didDrawPage: (data: { cursor: { y: number } }) => { 
        this.currentY = data.cursor.y + 8; 
      }
    });
  }

  private parseMarkdown(md: string): void {
    const lines = md.split('\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim();

      if (!line) {
        i++;
        continue;
      }

      // ## Section
      if (line.startsWith("## ")) {
        const title = line.substring(3).trim();
        this.addSection(title, "");
        i++;
      }
      // ### SubSection
      else if (line.startsWith("### ")) {
        const title = line.substring(4).trim();
        this.addSubSection(title);
        i++;
      }
      // > Blockquote
      else if (line.startsWith(">")) {
        const quoteLines = [];
        while (i < lines.length && lines[i].trim().startsWith(">")) {
          quoteLines.push(lines[i]);
          i++;
        }
        this.addBlockquote(quoteLines.join("\n"));
      }
      // - Bullet list or * Bullet list
      else if (line.startsWith("- ") || line.startsWith("* ")) {
        const bullets = [];
        while (i < lines.length && (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* "))) {
          bullets.push(lines[i].trim());
          i++;
        }
        this.addBulletList(bullets);
      }
      // | Table
      else if (line.startsWith("|")) {
        const tableLines = [];
        while (i < lines.length && lines[i].trim().startsWith("|")) {
          tableLines.push(lines[i].trim());
          i++;
        }
        if (tableLines.length >= 3) { // Header, divider, row
          const headers = tableLines[0].split("|").map(h => h.trim()).filter(h => h);
          const rows = tableLines.slice(2).map(r => r.split("|").map(c => c.trim()).filter(c => c));
          this.addTable(headers, rows);
        }
      }
      // Paragraph
      else {
        const pLines = [];
        while (
          i < lines.length &&
          lines[i].trim() !== "" &&
          !lines[i].trim().startsWith("#") &&
          !lines[i].trim().startsWith(">") &&
          !lines[i].trim().startsWith("- ") &&
          !lines[i].trim().startsWith("* ") &&
          !lines[i].trim().startsWith("|")
        ) {
          pLines.push(lines[i].trim());
          i++;
        }
        this.addParagraphs(pLines.join(" "));
      }
    }
  }
}

export const exportToPDF = (report: FinalReport): void => {
  const exporter = new PDFExporter(report);
  exporter.generate();
};

export const exportToMarkdown = (report: FinalReport): string => {
  let md = `# ${report.title}\n`;
  md += `## ${report.subtitle}\n`;
  md += `Generated at: ${new Date(report.generatedAt).toLocaleString()}\n`;
  md += `Original Query: ${report.originalQuery}\n\n`;

  md += `${report.sections.executiveSummary}\n\n`;

  report.sections.dynamic.sort((a, b) => a.order - b.order).forEach(section => {
    md += `## ${section.title}\n\n${section.content}\n\n`;
  });

  md += `${report.sections.crossSectionAnalysis}\n\n`;

  if (report.sections.keyFindings && report.sections.keyFindings.length > 0) {
    md += `## Key Findings Summary\n\n`;
    report.sections.keyFindings.forEach(f => {
      md += `- ${f}\n`;
    });
    md += `\n`;
  }

  md += `${report.sections.conclusions}\n\n`;
  md += `${report.sections.confidenceAssessment}\n\n`;

  md += `## References & Sources\n\n`;
  report.sources.forEach((s, i) => {
    md += `${i + 1}. [${s.title}](${s.url})\n`;
  });

  return md;
};

export const exportToTxt = (report: FinalReport): string => {
  const md = exportToMarkdown(report);
  return md.replace(/#/g, "").replace(/\*\*/g, "").trim();
};
