"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Brain,
  MessageSquare,
  RefreshCw,
  Scale,
  Send,
  Sparkles,
  Swords,
  Target,
  WandSparkles,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { generateAI } from "@/lib/ai-client";
import { StudentProfile } from "@/lib/student-profile";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Mode = "STANDARD" | "DEBATE" | "BIAS" | "FUTURE";

interface StructuredDecision {
  problemUnderstanding: string;
  hiddenConcerns: string[];
  contextAwareness: string[];
  options: string[];
  prosCons: Array<{ option: string; pros: string[]; cons: string[] }>;
  recommendation: string;
  confidence: number;
  confidenceLabel: "Low" | "Medium" | "High";
  biasChecks: string[];
  futureSimulation: Array<{ day: string; outlook: string }>;
  suggestedActions: string[];
  clarityScore: number;
  riskLevel: "Low" | "Medium" | "High";
  debate: Array<{ role: string; content: string }>;
}

interface ChatEntry {
  id: string;
  prompt: string;
  mode: Mode;
  createdAt: number;
  clarification?: string[];
  response?: StructuredDecision;
}

interface DecisionsPanelProps {
  studentProfile: StudentProfile;
}

const LOADING_STEPS = [
  "Understanding your situation...",
  "Analyzing possible paths...",
  "Structuring your options...",
];

const MODE_META: Record<Mode, { label: string; icon: React.ReactNode }> = {
  STANDARD: { label: "Mentor", icon: <Brain size={14} /> },
  DEBATE: { label: "Debate Mode", icon: <Swords size={14} /> },
  BIAS: { label: "Bias Check", icon: <Target size={14} /> },
  FUTURE: { label: "Future Simulation", icon: <WandSparkles size={14} /> },
};

function normalizeConfidence(value: number) {
  if (value >= 75) return "High" as const;
  if (value >= 45) return "Medium" as const;
  return "Low" as const;
}

function detectRisk(confidence: number, prosCons: Array<{ cons: string[] }>) {
  const averageCons =
    prosCons.length > 0
      ? prosCons.reduce((sum, item) => sum + item.cons.length, 0) / prosCons.length
      : 1;
  if (confidence >= 75 && averageCons <= 1.2) return "Low" as const;
  if (confidence < 45 || averageCons >= 2.4) return "High" as const;
  return "Medium" as const;
}

function isVaguePrompt(input: string) {
  const trimmed = input.trim().toLowerCase();
  if (trimmed.length < 18) return true;
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length < 4) return true;
  const hasDecisionSignal = /(should|choose|vs|or|switch|career|path|decision|move|start)/.test(trimmed);
  return !hasDecisionSignal;
}

function getClarifyingQuestions(input: string) {
  return [
    `When you ask "${input}", what outcome matters most to you in the next 6 months?`,
    "What is your biggest constraint right now: time, money, skills, or family expectations?",
  ];
}

function buildModePrompt(mode: Mode, prompt: string) {
  switch (mode) {
    case "DEBATE":
      return `${prompt}\n\nAlso emphasize a direct Optimist vs Skeptic debate before final recommendation.`;
    case "BIAS":
      return `${prompt}\n\nAlso detect possible decision biases and mention how to correct them.`;
    case "FUTURE":
      return `${prompt}\n\nAlso include 30/60/90 day outcome simulation guidance.`;
    default:
      return prompt;
  }
}

function buildStructuredDecision(raw: any, prompt: string, mode: Mode, profile: StudentProfile): StructuredDecision {
  const options: string[] = Array.isArray(raw?.breakdown?.options) ? raw.breakdown.options.slice(0, 5) : [];
  const prosConsSource = Array.isArray(raw?.prosCons) ? raw.prosCons : [];
  const prosCons = prosConsSource.slice(0, 5).map((item: any, index: number) => ({
    option: item?.opt || options[index] || `Option ${index + 1}`,
    pros: Array.isArray(item?.pros) ? item.pros.slice(0, 3) : ["Potential upside exists if executed well."],
    cons: Array.isArray(item?.cons) ? item.cons.slice(0, 3) : ["Has uncertainty and execution risk."],
  }));
  const confidence = Number(raw?.confidence || 62);
  const confidenceLabel = normalizeConfidence(confidence);
  const riskLevel = detectRisk(confidence, prosCons);
  const debate = Array.isArray(raw?.debate) ? raw.debate.slice(0, 3) : [];
  const hiddenConcerns = [
    "Fear of regret after committing",
    "Pressure to choose quickly without enough evidence",
    "Balancing long-term growth with short-term academic stability",
  ];
  const contextAwareness = [
    `Skills context: you are a ${profile.standard} student, so options should fit your current skill runway.`,
    `Time context: decisions should preserve study consistency and revision momentum.`,
    "Finance context: assume moderate budget constraints unless explicitly stated otherwise.",
  ];
  const futureSimulation = [
    { day: "30 days", outlook: `You gain initial clarity if you run a small test instead of overcommitting on "${prompt}".` },
    { day: "60 days", outlook: "Progress compounds when you track outcomes weekly and adjust based on evidence." },
    { day: "90 days", outlook: "You see clearer signal on fit, effort cost, and long-term sustainability." },
  ];
  const biasChecks = [
    "Binary thinking: framing only two paths when hybrid paths might exist.",
    "Social pressure bias: over-weighting what others expect over your own constraints.",
    "Recency bias: over-valuing the latest event instead of longer-term data.",
  ];

  return {
    problemUnderstanding:
      raw?.breakdown?.goal ||
      `You want to make a high-stakes decision about "${prompt}" without hurting your academic progress.`,
    hiddenConcerns,
    contextAwareness,
    options: options.length > 0 ? options : ["Option A", "Option B", "Option C"],
    prosCons: prosCons.length > 0 ? prosCons : [{
      option: "Option A",
      pros: ["Simple to execute."],
      cons: ["May not maximize long-term upside."],
    }],
    recommendation:
      raw?.recommendation ||
      "Start with a small reversible experiment, then commit based on evidence.",
    confidence,
    confidenceLabel,
    biasChecks: mode === "BIAS" ? biasChecks : biasChecks.slice(0, 1),
    futureSimulation: mode === "FUTURE" ? futureSimulation : futureSimulation.slice(0, 1),
    suggestedActions: [
      "Define one success metric before choosing.",
      "Set a review checkpoint date.",
      "Choose the option that protects study consistency this month.",
    ],
    clarityScore: Number(raw?.breakdown?.clarity || 70),
    riskLevel,
    debate,
  };
}

export const DecisionsPanel: React.FC<DecisionsPanelProps> = ({ studentProfile }) => {
  const [mode, setMode] = useState<Mode>("STANDARD");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) return;
    const timer = window.setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 900);
    return () => window.clearInterval(timer);
  }, [loading]);

  const activeEntry = useMemo(
    () => entries.find((entry) => entry.id === activeId) || entries[entries.length - 1] || null,
    [activeId, entries],
  );

  const submitPrompt = async (forcedPrompt?: string) => {
    const prompt = (forcedPrompt ?? input).trim();
    if (!prompt) return;

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    if (isVaguePrompt(prompt)) {
      const clarification = getClarifyingQuestions(prompt);
      const newEntry: ChatEntry = {
        id,
        prompt,
        mode,
        createdAt: Date.now(),
        clarification,
      };
      setEntries((prev) => [...prev, newEntry]);
      setActiveId(id);
      setInput("");
      return;
    }

    const pendingEntry: ChatEntry = {
      id,
      prompt,
      mode,
      createdAt: Date.now(),
    };
    setEntries((prev) => [...prev, pendingEntry]);
    setActiveId(id);
    setInput("");
    setLoading(true);
    setLoadingStep(0);

    try {
      const raw = await generateAI("DECISION_DEBATE", { topic: buildModePrompt(mode, prompt) }, studentProfile);
      const structured = buildStructuredDecision(raw, prompt, mode, studentProfile);
      setEntries((prev) =>
        prev.map((entry) => (entry.id === id ? { ...entry, response: structured } : entry)),
      );
    } catch (error) {
      const fallback = buildStructuredDecision(null, prompt, mode, studentProfile);
      setEntries((prev) =>
        prev.map((entry) => (entry.id === id ? { ...entry, response: fallback } : entry)),
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const followUps = [
    "Refine this decision",
    "Compare 2 options",
    "Simulate future outcome",
  ];

  const applyFollowUp = (type: string) => {
    if (!activeEntry?.prompt) return;
    if (type === "Refine this decision") {
      submitPrompt(`Refine this decision with tighter criteria: ${activeEntry.prompt}`);
      return;
    }
    if (type === "Compare 2 options") {
      const first = activeEntry.response?.options?.[0] || "Option A";
      const second = activeEntry.response?.options?.[1] || "Option B";
      submitPrompt(`Compare these two options for me: ${first} vs ${second}. My original decision: ${activeEntry.prompt}`);
      return;
    }
    submitPrompt(`Simulate likely 30/60/90-day outcomes for this decision: ${activeEntry.prompt}`);
  };

  return (
    <div className="w-full flex-1 overflow-y-auto p-8">
      <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-2xl">
          <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
            <MessageSquare size={14} /> Chat History
          </div>
          <div className="space-y-3">
            {entries.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 p-4 text-xs text-white/40">
                Your mentor conversations will appear here.
              </div>
            )}
            {entries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => setActiveId(entry.id)}
                className={cn(
                  "w-full rounded-2xl border p-3 text-left transition-all",
                  activeEntry?.id === entry.id
                    ? "border-blue/35 bg-blue/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20",
                )}
              >
                <p className="line-clamp-2 text-sm font-semibold text-white/80">{entry.prompt}</p>
                <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                  {MODE_META[entry.mode].label}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            {(Object.keys(MODE_META) as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition-all",
                  mode === m
                    ? "border-blue/40 bg-blue/15 text-blue"
                    : "border-white/10 bg-white/[0.02] text-white/55 hover:text-white/80",
                )}
              >
                {MODE_META[m].icon} {MODE_META[m].label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="max-h-[560px] space-y-4 overflow-y-auto pr-1">
              {entries.map((entry) => (
                <div key={`bubble-${entry.id}`} className="space-y-3">
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl border border-blue/30 bg-blue/10 px-4 py-3 text-sm font-medium text-white/90">
                      {entry.prompt}
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="w-full max-w-[88%] rounded-2xl border border-white/12 bg-black/30 p-4">
                      {entry.clarification ? (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-white/90">
                            I need two quick clarifications before giving a high-confidence recommendation:
                          </p>
                          {entry.clarification.map((q) => (
                            <p key={q} className="text-sm text-white/70">
                              - {q}
                            </p>
                          ))}
                        </div>
                      ) : entry.response ? (
                        <div className="space-y-4">
                          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue">1. Problem Understanding</p>
                            <p className="mt-2 text-sm text-white/85">{entry.response.problemUnderstanding}</p>
                            <div className="mt-2 space-y-1">
                              {entry.response.hiddenConcerns.slice(0, 2).map((concern) => (
                                <p key={concern} className="text-xs text-white/60">- {concern}</p>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue">2. Context Awareness</p>
                            {entry.response.contextAwareness.map((line) => (
                              <p key={line} className="mt-1 text-xs text-white/70">- {line}</p>
                            ))}
                          </div>

                          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue">3. Options</p>
                            <div className="mt-2 grid grid-cols-1 gap-2">
                              {entry.response.options.map((option, index) => (
                                <p key={option} className="text-sm text-white/80">{index + 1}. {option}</p>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue">4. Pros & Cons</p>
                            <div className="mt-2 space-y-3">
                              {entry.response.prosCons.slice(0, 3).map((item) => (
                                <div key={item.option} className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
                                  <p className="text-xs font-black uppercase tracking-widest text-white/65">{item.option}</p>
                                  <p className="text-xs text-emerald-300 mt-1">+ {item.pros.join(" | ")}</p>
                                  <p className="text-xs text-red-300 mt-1">- {item.cons.join(" | ")}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {entry.mode === "DEBATE" && entry.response.debate.length > 0 && (
                            <div className="rounded-xl border border-purple-400/25 bg-purple-500/10 p-3">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">Debate Mode</p>
                              {entry.response.debate.map((d) => (
                                <p key={`${d.role}-${d.content.slice(0, 12)}`} className="mt-2 text-xs text-white/75">
                                  <span className="font-black text-white/90">{d.role}:</span> {d.content}
                                </p>
                              ))}
                            </div>
                          )}

                          {entry.mode === "BIAS" && (
                            <div className="rounded-xl border border-amber-300/25 bg-amber-400/10 p-3">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">Bias Check</p>
                              {entry.response.biasChecks.map((b) => (
                                <p key={b} className="mt-1 text-xs text-white/75">- {b}</p>
                              ))}
                            </div>
                          )}

                          {entry.mode === "FUTURE" && (
                            <div className="rounded-xl border border-cyan-300/25 bg-cyan-500/10 p-3">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">Future Simulation</p>
                              {entry.response.futureSimulation.map((f) => (
                                <p key={f.day} className="mt-1 text-xs text-white/75">
                                  <span className="font-black text-white/90">{f.day}:</span> {f.outlook}
                                </p>
                              ))}
                            </div>
                          )}

                          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue">5. Recommendation</p>
                            <p className="mt-2 text-sm font-semibold text-white/90">{entry.response.recommendation}</p>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue">6. Confidence Level</p>
                            <p className="mt-2 text-sm text-white/85">
                              {entry.response.confidenceLabel} ({entry.response.confidence}%)
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-white/55">Thinking...</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl border border-blue/20 bg-blue/10 px-4 py-3 text-sm font-semibold text-blue"
                >
                  {LOADING_STEPS[loadingStep]}
                </motion.div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="mb-3 flex flex-wrap gap-2">
                {followUps.map((item) => (
                  <button
                    key={item}
                    onClick={() => applyFollowUp(item)}
                    disabled={loading || !activeEntry}
                    className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/65 hover:text-white disabled:opacity-40"
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitPrompt();
                  }}
                  className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-blue/40"
                  placeholder="Ask your decision question..."
                />
                <button
                  onClick={() => submitPrompt()}
                  disabled={loading || !input.trim()}
                  className="rounded-xl bg-blue px-4 py-3 text-background transition-all disabled:opacity-40"
                >
                  {loading ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-2xl">
          <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
            <Sparkles size={14} /> Insights Panel
          </div>

          {activeEntry?.response ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-blue/20 bg-blue/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue/80">Clarity Score</p>
                <p className="mt-2 text-3xl font-black text-white">{activeEntry.response.clarityScore}%</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/45">Risk Level</p>
                <p
                  className={cn(
                    "mt-2 text-xl font-black",
                    activeEntry.response.riskLevel === "Low" && "text-emerald-300",
                    activeEntry.response.riskLevel === "Medium" && "text-amber-300",
                    activeEntry.response.riskLevel === "High" && "text-red-300",
                  )}
                >
                  {activeEntry.response.riskLevel}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/45">Suggested Actions</p>
                <div className="mt-2 space-y-2">
                  {activeEntry.response.suggestedActions.map((action) => (
                    <p key={action} className="text-xs text-white/75">- {action}</p>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-4 text-xs text-white/45">
              Ask a decision question to unlock clarity, risk, and action insights.
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-purple-400/20 bg-purple-500/10 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5 text-purple-300" />
              <p className="text-xs text-white/70">
                This mentor is optimized for student decisions across academics, career direction,
                and life trade-offs with practical, structured reasoning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
