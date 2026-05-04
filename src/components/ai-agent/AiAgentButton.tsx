"use client";

import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface Props {
  open: boolean;
  onClick: () => void;
}

export function AiAgentButton({ open, onClick }: Props) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.button
      onClick={onClick}
      whileHover={shouldReduce ? {} : { scale: 1.1 }}
      whileTap={shouldReduce ? {} : { scale: 0.92 }}
      aria-label={open ? "AI Mentor хаах" : "AI Mentor нээх"}
      aria-expanded={open}
      title="AI Mentor"
      className="fixed bottom-5 right-5 z-[9999] flex h-16 w-16 cursor-pointer items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
    >
      {/* Outer glow */}
      <span
        className="absolute -inset-2 rounded-full opacity-95 blur-2xl"
        style={{
          background:
            "radial-gradient(circle, rgba(192,132,252,1) 0%, rgba(168,85,247,0.88) 34%, rgba(124,58,237,0.72) 58%, transparent 82%)",
        }}
        aria-hidden="true"
      />
      {/* Inner glow */}
      <span
        className="absolute inset-0 rounded-full opacity-80 blur-md"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.85) 0%, rgba(109,40,217,0.55) 55%, transparent 78%)",
        }}
        aria-hidden="true"
      />
      {/* Robot image */}
      <Image
        src="/brand/ai_agent_icon.png"
        alt="Robo Mentor"
        width={64}
        height={64}
        className="relative z-10 object-contain"
        style={{
          filter:
            "drop-shadow(0 0 16px rgba(192,132,252,1)) drop-shadow(0 0 30px rgba(139,92,246,0.85)) drop-shadow(0 8px 28px rgba(76,29,149,0.72))",
        }}
        priority
      />
      {/* Notification dot */}
      <AnimatePresence>
        {!open && (
          <motion.span
            key="dot"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute right-1 top-1 z-20 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-red-500 dark:border-[#09090b]"
            aria-label="Шинэ санал байна"
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}
