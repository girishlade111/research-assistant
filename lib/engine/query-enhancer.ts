import type { IntentType, SearchMode, EnhancedQuery } from "./types";

// ── Intent Detection ───────────────────────────────────────────

const INTENT_PATTERNS: { intent: IntentType; patterns: RegExp[] }[] = [
  {
    intent: "coding",
    patterns: [
      /\b(code|implement|function|bug|debug|error|syntax|api|sdk|library|framework|react|python|javascript|typescript|algorithm|data structure|regex)\b/i,
      /\b(how to (write|build|create|fix|debug)|write a|build a)\b/i,
    ],
  },
  {
    intent: "comparison",
    patterns: [
      /\b(vs\.?|versus|compare|comparison|difference|better|worse|pros and cons|tradeoff|trade-off|advantages|disadvantages)\b/i,
      /\b(which (is|should|would)|between .+ and)\b/i,
    ],
  },
  {
    intent: "research",
    patterns: [
      /\b(research|study|paper|journal|survey|review|literature|findings|evidence|hypothesis|methodology|analysis|dataset|experiment)\b/i,
      /\b(state of the art|sota|benchmark|recent (advances|progress|work))\b/i,
    ],
  },
  {
    intent: "explanation",
    patterns: [
      /\b(explain|what is|what are|how does|how do|why (does|do|is|are)|define|meaning|concept|overview|introduction|basics)\b/i,
    ],
  },
  {
    intent: "factual",
    patterns: [
      /\b(when (did|was|is)|where (did|was|is)|who (is|was|are|were)|how (many|much|long|old|far))\b/i,
      /\b(list|enumerate|name|give me|tell me)\b/i,
    ],
  },
];

export function detectIntent(query: string): IntentType {
  for (const { intent, patterns } of INTENT_PATTERNS) {
    if (patterns.some((p) => p.test(query))) {
      return intent;
    }
  }
  return "general";
}

// ── Query Expansion ────────────────────────────────────────────

function expandQuery(query: string, mode: SearchMode, intent: IntentType): string {
  const trimmed = query.trim();

  const modePrefix: Record<SearchMode, string> = {
    pro: "Provide a comprehensive, well-structured analysis of:",
    deep: "Conduct an in-depth academic research review on:",
    corpus: "Search across scientific literature and provide evidence-based findings on:",
  };

  const intentSuffix: Partial<Record<IntentType, string>> = {
    coding:
      "Include code examples, best practices, and common pitfalls.",
    comparison:
      "Structure as a comparison with clear criteria, pros/cons, and a recommendation.",
    research:
      "Cite relevant papers, highlight key findings, and note areas of consensus and debate.",
    explanation:
      "Explain clearly from first principles with examples.",
  };

  const parts = [modePrefix[mode], `"${trimmed}"`];
  const suffix = intentSuffix[intent];
  if (suffix) parts.push(suffix);

  return parts.join(" ");
}

// ── Subtopic Generation ────────────────────────────────────────

function generateSubtopics(query: string, intent: IntentType): string[] {
  const base = query.toLowerCase().trim();
  const subtopics: string[] = [];

  if (intent === "comparison") {
    subtopics.push(
      `${base} - key differences`,
      `${base} - performance benchmarks`,
      `${base} - use case recommendations`
    );
  } else if (intent === "research") {
    subtopics.push(
      `${base} - recent papers and findings`,
      `${base} - methodology overview`,
      `${base} - open problems and future directions`
    );
  } else if (intent === "coding") {
    subtopics.push(
      `${base} - implementation guide`,
      `${base} - common errors and solutions`,
      `${base} - best practices`
    );
  } else if (intent === "explanation") {
    subtopics.push(
      `${base} - core concepts`,
      `${base} - practical examples`,
      `${base} - common misconceptions`
    );
  } else {
    subtopics.push(
      `${base} - overview`,
      `${base} - key aspects`,
      `${base} - practical implications`
    );
  }

  return subtopics;
}

// ── Public API ─────────────────────────────────────────────────

export function enhanceQuery(
  query: string,
  mode: SearchMode
): EnhancedQuery {
  const intent = detectIntent(query);
  const enhanced = expandQuery(query, mode, intent);
  const subtopics = generateSubtopics(query, intent);

  return { original: query, enhanced, intent, subtopics };
}
