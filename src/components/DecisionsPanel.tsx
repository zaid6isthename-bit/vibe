"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  Brain,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Plus,
  RefreshCw,
  Send,
  Swords,
  Target,
  Trash2,
  WandSparkles,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { generateAI } from "@/lib/ai-client";
import { StudentProfile } from "@/lib/student-profile";
import { useLocalStorage } from "@/lib/useLocalStorage";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Mode = "NORMAL" | "MENTOR" | "DEBATE" | "BIAS" | "FUTURE";

interface DecisionsPanelProps {
  studentProfile: StudentProfile;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  mode: Mode;
  createdAt: number;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  saved: boolean;
  messages: Message[];
}

const MODE_META: Record<Mode, { label: string; icon: React.ReactNode; instruction: string }> = {
  NORMAL: {
    label: "Normal",
    icon: <Brain size={14} />,
    instruction:
      "Act as a normal high-quality assistant. Give direct, useful, context-aware answers.",
  },
  MENTOR: {
    label: "Mentor",
    icon: <Brain size={14} />,
    instruction:
      "Act as a student mentor: practical, motivating, and academically grounded.",
  },
  DEBATE: {
    label: "Debate Mode",
    icon: <Swords size={14} />,
    instruction:
      "Debate with Optimist and Skeptic viewpoints, then provide a Judge verdict.",
  },
  BIAS: {
    label: "Bias Check",
    icon: <Target size={14} />,
    instruction:
      "Identify thinking biases in the user's framing and provide fixes.",
  },
  FUTURE: {
    label: "Future Simulation",
    icon: <WandSparkles size={14} />,
    instruction:
      "Simulate likely 30/60/90-day outcomes and suggest a concrete next move.",
  },
};

const LOADING_STEPS = [
  "Understanding your situation...",
  "Analyzing possible paths...",
  "Structuring your options...",
];

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function newChatTitle() {
  const now = new Date();
  return `New Chat ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function createSession(): ChatSession {
  const now = Date.now();
  return {
    id: makeId("chat"),
    title: newChatTitle(),
    createdAt: now,
    updatedAt: now,
    saved: false,
    messages: [
      {
        id: makeId("msg"),
        role: "assistant",
        mode: "NORMAL",
        createdAt: now,
        text:
          "I am your Decisions AI. Ask me any life, career, or academic decision and I will help you think clearly.",
      },
    ],
  };
}

function getAssistantText(raw: unknown): string {
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (!raw || typeof raw !== "object") {
    return "I could not generate a response right now. Please try again.";
  }

  const data = raw as Record<string, unknown>;
  const direct = [data.answer, data.output, data.text, data.response, data.recommendation].find(
    (v): v is string => typeof v === "string" && v.trim().length > 0,
  );
  if (direct) return direct;

  const breakdown = data.breakdown as Record<string, unknown> | undefined;
  const goal = typeof breakdown?.goal === "string" ? breakdown.goal : "";
  const options = Array.isArray(breakdown?.options)
    ? (breakdown.options as unknown[]).filter((o): o is string => typeof o === "string")
    : [];
  const recommendation = typeof data.recommendation === "string" ? data.recommendation : "";

  const parts: string[] = [];
  if (goal) parts.push(`Understanding\n${goal}`);
  if (options.length > 0) parts.push(`Options\n- ${options.slice(0, 5).join("\n- ")}`);
  if (recommendation) parts.push(`Recommendation\n${recommendation}`);
  return parts.length > 0 ? parts.join("\n\n") : "I generated an empty answer. Please ask again.";
}

function firstUserLine(messages: Message[]) {
  const user = messages.find((m) => m.role === "user");
  if (!user) return null;
  return user.text.slice(0, 52).trim();
}

export const DecisionsPanel: React.FC<DecisionsPanelProps> = ({ studentProfile }) => {
  const [mode, setMode] = useState<Mode>("NORMAL");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sessions, setSessions] = useLocalStorage<ChatSession[]>("neuroos_decisions_chats_v2", [createSession()]);
  const [activeSessionId, setActiveSessionId] = useState<string>(sessions[0]?.id || "");

  useEffect(() => {
    if (!loading) return;
    const timer = window.setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 900);
    return () => window.clearInterval(timer);
  }, [loading]);

  useEffect(() => {
    if (sessions.length === 0) {
      const fresh = createSession();
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
      return;
    }
    if (!sessions.some((session) => session.id === activeSessionId)) {
      setActiveSessionId(sessions[0].id);
    }
  }, [activeSessionId, sessions, setSessions]);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) || sessions[0],
    [activeSessionId, sessions],
  );

  const updateActiveSession = (updater: (session: ChatSession) => ChatSession) => {
    if (!activeSession) return;
    setSessions((prev) =>
      prev.map((session) => (session.id === activeSession.id ? updater(session) : session)),
    );
  };

  const createNewChat = () => {
    const fresh = createSession();
    setSessions((prev) => [fresh, ...prev]);
    setActiveSessionId(fresh.id);
    setMode("NORMAL");
    setInput("");
  };

  const deleteChat = (id: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((session) => session.id !== id);
      return filtered.length > 0 ? filtered : [createSession()];
    });
    if (activeSessionId === id) {
      const next = sessions.find((s) => s.id !== id);
      setActiveSessionId(next?.id || "");
    }
  };

  const saveChat = () => {
    if (!activeSession) return;
    updateActiveSession((session) => {
      const titleFromPrompt = firstUserLine(session.messages);
      return {
        ...session,
        saved: true,
        title: titleFromPrompt || session.title,
        updatedAt: Date.now(),
      };
    });
  };

  const copyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1200);
    } catch {
      setCopiedId(null);
    }
  };

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || !activeSession || loading) return;

    const userMessage: Message = {
      id: makeId("msg"),
      role: "user",
      mode,
      text: question,
      createdAt: Date.now(),
    };

    updateActiveSession((session) => {
      const nextMessages = [...session.messages, userMessage];
      return {
        ...session,
        messages: nextMessages,
        title: firstUserLine(nextMessages) || session.title,
        updatedAt: Date.now(),
      };
    });

    setInput("");
    setLoading(true);
    setLoadingStep(0);

    try {
      const history = [...(activeSession.messages || []), userMessage]
        .slice(-8)
        .map((m) => ({ role: m.role, text: m.text }));

      const raw = await generateAI(
        "DECISION_DEBATE",
        {
          question,
          mode,
          history,
          personalityInstruction: MODE_META[mode].instruction,
        },
        studentProfile,
      );

      const assistantMessage: Message = {
        id: makeId("msg"),
        role: "assistant",
        mode,
        text: getAssistantText(raw),
        createdAt: Date.now(),
      };

      updateActiveSession((session) => ({
        ...session,
        messages: [...session.messages, assistantMessage],
        updatedAt: Date.now(),
      }));
    } catch (error) {
      console.error("Decisions generation failed:", error);
      const fallbackMessage: Message = {
        id: makeId("msg"),
        role: "assistant",
        mode,
        text: "I hit a temporary issue generating this answer. Please ask once again.",
        createdAt: Date.now(),
      };
      updateActiveSession((session) => ({
        ...session,
        messages: [...session.messages, fallbackMessage],
        updatedAt: Date.now(),
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-1 overflow-y-auto p-8">
      <div className="mx-auto flex w-full max-w-[1450px] gap-4">
        <aside
          className={cn(
            "rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl transition-all duration-300",
            sidebarCollapsed ? "w-14 p-2" : "w-[320px] p-4",
          )}
        >
          <div className={cn("flex items-center", sidebarCollapsed ? "justify-center" : "justify-between")}>
            {!sidebarCollapsed && (
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">
                Previous Chats
              </p>
            )}
            <button
              onClick={() => setSidebarCollapsed((v) => !v)}
              className="rounded-lg border border-white/15 bg-white/[0.04] p-2 text-white/75"
            >
              {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {!sidebarCollapsed && (
            <>
              <button
                onClick={createNewChat}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-blue/35 bg-blue/15 px-3 py-2 text-xs font-black uppercase tracking-widest text-blue"
              >
                <Plus size={14} />
                New Chat
              </button>

              <div className="mt-4 max-h-[64vh] space-y-2 overflow-y-auto pr-1">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      "rounded-xl border p-3 transition-all",
                      activeSession?.id === session.id
                        ? "border-blue/35 bg-blue/10"
                        : "border-white/10 bg-white/[0.02] hover:border-white/25",
                    )}
                  >
                    <button onClick={() => setActiveSessionId(session.id)} className="w-full text-left">
                      <p className="line-clamp-2 text-sm font-semibold text-white/85">{session.title}</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-white/35">
                        {new Date(session.updatedAt).toLocaleString()}
                      </p>
                    </button>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/45">
                        {session.saved ? "Saved" : "Draft"}
                      </span>
                      <button
                        onClick={() => deleteChat(session.id)}
                        className="rounded-md border border-red-400/30 bg-red-500/10 p-1.5 text-red-300"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </aside>

        <main className="flex min-h-[72vh] flex-1 flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-2xl">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setMode("NORMAL")}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-black uppercase tracking-widest transition-all",
                mode === "NORMAL"
                  ? "border-blue/35 bg-blue/15 text-blue"
                  : "border-white/10 text-white/60 hover:text-white/85",
              )}
            >
              Normal
            </button>
            {(["MENTOR", "DEBATE", "BIAS", "FUTURE"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode((prev) => (prev === m ? "NORMAL" : m))}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-widest transition-all",
                  mode === m
                    ? "border-blue/35 bg-blue/15 text-blue"
                    : "border-white/10 text-white/60 hover:text-white/85",
                )}
              >
                {MODE_META[m].icon}
                {MODE_META[m].label}
              </button>
            ))}

            <button
              onClick={saveChat}
              disabled={!activeSession}
              className="ml-auto flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-500/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-emerald-200 disabled:opacity-40"
            >
              <Bookmark size={12} />
              Save Chat
            </button>
            <button
              onClick={createNewChat}
              className="flex items-center gap-2 rounded-full border border-blue/35 bg-blue/15 px-4 py-2 text-xs font-black uppercase tracking-widest text-blue"
            >
              <Plus size={12} />
              New Chat
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-black/25 p-4">
            {activeSession?.messages.map((message) => (
              <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "group max-w-[86%] rounded-2xl border px-4 py-3",
                    message.role === "user"
                      ? "border-blue/30 bg-blue/10 text-white/90"
                      : "border-white/12 bg-white/[0.03] text-white/85",
                  )}
                >
                  {message.role === "assistant" && (
                    <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-blue/80">
                      {MODE_META[message.mode].label}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap text-sm">{message.text}</p>
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => copyText(message.id, message.text)}
                      className="flex items-center gap-1 rounded-md border border-white/15 bg-white/[0.03] px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white/60"
                    >
                      {copiedId === message.id ? <Check size={10} /> : <Copy size={10} />}
                      {copiedId === message.id ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-blue/20 bg-blue/10 px-4 py-3 text-sm font-semibold text-blue">
                  {LOADING_STEPS[loadingStep]}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-blue/40"
              placeholder="Ask your decision question..."
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="rounded-xl bg-blue px-4 py-3 text-background transition-all disabled:opacity-40"
            >
              {loading ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

