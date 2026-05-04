import type { AgentContext } from "./agent-types";

// ── Provider interface ────────────────────────────────────────────────────────

interface AiProvider {
  generate(input: { message: string; context: AgentContext }): Promise<string>;
}

// ── Context serializer ────────────────────────────────────────────────────────

function serializeContext(ctx: AgentContext): string {
  const lines: string[] = [];
  if (ctx.userName) lines.push(`Хэрэглэгч: ${ctx.userName}`);
  lines.push(`Түвшин: ${ctx.level} | XP: ${ctx.xp} | Streak: ${ctx.streak} өдөр`);

  if (ctx.enrolledCourses.length > 0) {
    lines.push("Бүртгэлтэй хичээлүүд:");
    ctx.enrolledCourses.slice(0, 4).forEach((c) => {
      lines.push(`  - ${c.title}: ${c.completedLessons}/${c.totalLessons} (${c.progress}%)`);
    });
    lines.push(`Нийт явц: ${ctx.overallProgress}%`);
  } else {
    lines.push("Хичээлд бүртгэлтэй биш.");
  }

  if (ctx.certificates.length > 0) {
    lines.push(`Certificate: ${ctx.certificates.length} ширхэг авсан`);
  }

  if (ctx.pageContext) lines.push(`Одоогийн хуудас: ${ctx.pageContext}`);

  return lines.join("\n");
}

const SYSTEM_PROMPT = `Та бол EduNity платформын AI сургалтын туслах "Robo Mentor" юм.

Монгол хэлээр богино, ойлгомжтой, найрсаг хариулт өгнө үү.
Практик дараагийн алхам өгнө үү.
Бодитой байж хичээл дуусаагүй байхад certificate амлахгүй.
Хэрэглэгч эрч хүчтэй байхад урам зориг нэм.
Хариулт 3-4 өгүүлбэрт багтааж хураангуйлж болно.`;

// ── Anthropic provider ────────────────────────────────────────────────────────

const AnthropicProvider: AiProvider = {
  async generate({ message, context }) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

    const systemWithContext = `${SYSTEM_PROMPT}\n\nХэрэглэгчийн мэдээлэл:\n${serializeContext(context)}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
        system: systemWithContext,
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = (await response.json()) as {
      content?: { type: string; text: string }[];
    };
    const text = data.content?.find((b) => b.type === "text")?.text ?? "";
    if (!text) throw new Error("Empty AI response");
    return text;
  },
};

// ── Public adapter ────────────────────────────────────────────────────────────

/**
 * Calls the configured AI provider.
 * Returns null (instead of throwing) so callers can safely fall back to
 * rule-based mode without try-catching everywhere.
 *
 * To add a new provider (OpenAI, Ollama, etc.), implement AiProvider above
 * and swap it in below. Use environment variables to select the provider:
 *   AI_PROVIDER=openai | anthropic | ollama
 */
export async function callAiProvider(input: {
  message: string;
  context: AgentContext;
}): Promise<string | null> {
  // TODO: read process.env.AI_PROVIDER to select different providers
  try {
    return await AnthropicProvider.generate(input);
  } catch (err) {
    console.warn("[ai-provider] AI call failed, falling back to rule-based:", err);
    return null;
  }
}
