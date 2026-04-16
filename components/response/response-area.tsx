"use client";

import { motion } from "framer-motion";
import type { ResponseSection } from "@/lib/engine/types";

interface ResponseAreaProps {
  sections: ResponseSection[];
  isStreaming: boolean;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.4, ease: "easeOut" as const },
  }),
};

// Section headings that get special visual treatment
const ACCENT_HEADINGS = new Set(["Expert Insights", "References"]);

export function ResponseArea({ sections, isStreaming }: ResponseAreaProps) {
  if (sections.length === 0) return null;

  // Track which heading we're under for styling child elements
  let lastHeading = "";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-strong mt-6 rounded-2xl p-6"
    >
      <div className="space-y-4">
        {sections.map((section, i) => {
          if (section.type === "heading") lastHeading = section.content;
          const isAccentSection = ACCENT_HEADINGS.has(lastHeading) && section.type !== "heading";
          const isReferences = lastHeading === "References";

          return (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
            >
              {section.type === "heading" && (
                <h3
                  className={`text-lg font-semibold ${
                    ACCENT_HEADINGS.has(section.content)
                      ? "text-gradient"
                      : "text-foreground"
                  }`}
                >
                  {section.content}
                </h3>
              )}

              {section.type === "paragraph" && (
                <p className="leading-relaxed text-muted-foreground">
                  {section.content}
                </p>
              )}

              {section.type === "bullets" && section.items && (
                <ul className={`space-y-2 ${isReferences ? "pl-2" : "pl-4"}`}>
                  {section.items.map((item, j) => (
                    <motion.li
                      key={j}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: i * 0.15 + j * 0.08,
                        duration: 0.3,
                      }}
                      className={`flex items-start gap-2 text-sm ${
                        isReferences
                          ? "font-mono text-xs text-muted-foreground/80"
                          : isAccentSection
                            ? "text-foreground/90"
                            : "text-muted-foreground"
                      }`}
                    >
                      {!isReferences && (
                        <span
                          className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                            isAccentSection ? "bg-chart-2" : "bg-primary"
                          }`}
                        />
                      )}
                      {isReferences ? (
                        <span className="break-all">{item}</span>
                      ) : (
                        item
                      )}
                    </motion.li>
                  ))}
                </ul>
              )}
            </motion.div>
          );
        })}
      </div>

      {isStreaming && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 flex items-center gap-1.5"
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
