"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Send, Sparkles, RotateCcw, User } from "lucide-react";
import { MascotImage } from "@/components/brand/MascotImage";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  firstName: string;
  level: number;
  xp: number;
  streak: number;
}

const QUICK_ACTIONS = [
  { label: "Өнөөдрийн зөвлөгөө", value: "Өнөөдөр юу хийх вэ?" },
  { label: "7 хоногийн төлөвлөгөө", value: "Надад 7 хоногийн сурах төлөвлөгөө гарга" },
  { label: "XP хэрхэн нэмэх", value: "XP хэрхэн хурдан нэмэх вэ?" },
  { label: "Streak яах вэ", value: "Streak хадгалах арга юу вэ?" },
  { label: "Курс санал", value: "Надад ямар курс санал болгох вэ?" },
];

const STORAGE_KEY = "ai-mentor-page-history";

export function AIMentorChatClient({ firstName, level, xp, streak }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setMessages(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30))); } catch { /* ignore */ }
    }
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isPending) return;

    const newUserMsg: Message = { role: "user", content: trimmed };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    startTransition(async () => {
      try {
        const res = await fetch("/api/ai/mentor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            pageContext: "ai-mentor",
            history: updatedMessages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
            userContext: { name: firstName, level, xp, streak },
          }),
        });
        const data = await res.json();
        setIsTyping(false);
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply ?? "Хариулт авах боломжгүй байна." }]);
      } catch {
        setIsTyping(false);
        setMessages((prev) => [...prev, { role: "assistant", content: "Алдаа гарлаа. Дахин оролдоно уу." }]);
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-sm" style={{ height: "600px" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/15 dark:to-purple-900/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
              <Sparkles size={14} className="text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card bg-green-500" />
          </div>
          <div>
            <p className="text-[13px] font-black text-foreground">Robo Mentor</p>
            <p className="text-[10px] text-muted-foreground">AI сургалтын туслах</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            title="Түүхийг цэвэрлэх"
          >
            <RotateCcw size={11} />
            Цэвэрлэх
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <MascotImage variant="thinking" size={72} className="animate-float" />
            <div>
              <p className="text-[14px] font-bold text-foreground mb-1">Сайн уу, {firstName}! 👋</p>
              <p className="text-[12px] text-muted-foreground max-w-[280px]">
                Сурах замаарт туслахад бэлэн байна. Юу мэдэхийг хүсэж байна вэ?
              </p>
            </div>
            {/* Quick actions */}
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => sendMessage(action.value)}
                  disabled={isPending}
                  className="px-3 py-1.5 text-[11px] font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-700/40 rounded-full hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-colors disabled:opacity-50"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn("flex gap-2.5", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Sparkles size={12} className="text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap",
                    msg.role === "user"
                      ? "bg-violet-600 text-white rounded-tr-sm"
                      : "bg-muted dark:bg-white/5 text-foreground rounded-tl-sm border border-border",
                  )}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User size={13} className="text-slate-600 dark:text-slate-300" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Sparkles size={12} className="text-white" />
                </div>
                <div className="bg-muted dark:bg-white/5 rounded-2xl rounded-tl-sm border border-border px-4 py-3">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            {/* Quick suggestions after a reply */}
            {!isTyping && messages[messages.length - 1]?.role === "assistant" && (
              <div className="flex flex-wrap gap-1.5 pl-9">
                {QUICK_ACTIONS.slice(0, 3).map((action) => (
                  <button
                    key={action.label}
                    onClick={() => sendMessage(action.value)}
                    disabled={isPending}
                    className="px-2.5 py-1 text-[10px] font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-700/40 rounded-full hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-colors disabled:opacity-50"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-border p-3 shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Асуулт асуух..."
            rows={1}
            disabled={isPending}
            className="flex-1 resize-none rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:bg-white dark:focus:bg-violet-900/10 transition-colors min-h-[40px] max-h-[120px] leading-relaxed disabled:opacity-50"
            style={{ height: "40px" }}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = "40px";
              t.style.height = Math.min(t.scrollHeight, 120) + "px";
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isPending}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shadow-sm"
            aria-label="Илгээх"
          >
            <Send size={15} />
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground text-center">
          Enter — илгээх · Shift+Enter — мөр шилжих
        </p>
      </form>
    </div>
  );
}
