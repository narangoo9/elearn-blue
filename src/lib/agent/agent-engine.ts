import type { AgentContext, AgentResponse } from "./agent-types";
import { generateRuleBasedAgentResponse } from "./agent-rules";
import { callAiProvider } from "./ai-provider";

interface RunAgentOptions {
  message: string;
  context: AgentContext;
  /** Set to false to skip AI provider even when the key is available */
  useAi?: boolean;
}

/**
 * Main agent entry point.
 *
 * Priority:
 *   1. AI provider (if ANTHROPIC_API_KEY is set and useAi !== false)
 *      → on success: replace message text with AI reply, keep rule-based
 *        actions/suggestions so navigation still works
 *   2. Rule-based engine (always available, zero dependencies)
 *   3. Safe fallback (if rule-based itself somehow throws)
 */
export async function runAgent({
  message,
  context,
  useAi = true,
}: RunAgentOptions): Promise<AgentResponse> {
  // ── Rule-based response (always computed — used for actions/suggestions) ──
  let ruleResponse: AgentResponse;
  try {
    ruleResponse = generateRuleBasedAgentResponse(message, context);
  } catch {
    ruleResponse = {
      message:
        "Уучлаарай, хариу гаргахад алдаа гарлаа. Дахин оролдоно уу.",
      intent: "GENERAL_HELP",
      actions: [],
      suggestions: ["Би юу үзэх вэ?", "Миний progress хэд вэ?"],
      mode: "fallback",
    };
  }

  // ── Optional AI layer ──────────────────────────────────────────────────────
  if (useAi && process.env.ANTHROPIC_API_KEY) {
    const aiText = await callAiProvider({ message, context });
    if (aiText) {
      return {
        ...ruleResponse,
        message: aiText,
        mode: "ai",
      };
    }
  }

  return ruleResponse;
}
