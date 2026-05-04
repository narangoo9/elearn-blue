import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/cache";
import { unauthorized } from "@/shared/utils/api-response";
import { getFallbackResponse } from "@/lib/ai/fallbackMentor";

const SYSTEM_PROMPT = `Та бол EduNity дотор ажилладаг найрсаг AI сургалтын туслах "Robo Mentor" юм.

EduNity бол онлайн сургалтын платформ бөгөөд хэрэглэгчид компани болон багш нарын байршуулсан курс судалдаг. Хэрэглэгчид хичээл үзэх, материал унших, даалгавар гүйцэтгэх, курсийн чатад оролцох, peer review авах, сертификат цуглуулах, XP цуглуулах, streak хадгалах, leaderboard дээр өрсөлдөх боломжтой.

Таны ажил бол хэрэглэгчид алхам алхмаар чиглүүлэх явдал. Та зүгээр л chatbot биш — та бол сургалтын mentor.

Монгол хэлээр хариулна уу. Хэрэглэгч өөр хэл асуувал тэр хэлээр хариулж болно.

Хариултаа богино, ойлгомжтой, найрсаг байлга. Яаравчлахгүйгээр практик дараагийн алхам өг.
Хэрэглэгчийн EduNity дахь progress, XP, streak, зорилго, түвшинг ашигла.
Бодит дуусаагүй үйлдлийг хийсэн мэт дүр эсгэхгүй.
Peer review оноо өгөхгүй — peer review нь платформын хэрэглэгчдийн хийдэг үйл явц.
Хичээл, task дуусаагүй байхад сертификат амлахгүй.
Курс санал болгохдоо яагаад тохирч байгааг тайлбарла.
Төлөвлөгөө гаргахдаа бодитой болго.
Хэрэглэгч идэвхгүй эсвэл андуурсан байвал зөөлнөөр урам зориг өг.

Өнгө аяс: Найрсаг, туслагч, энгийн, бага зэрэг эрч хүчтэй — хайрхалтай робот mentor шиг.`;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return unauthorized();

    const { success } = await rateLimit(`ai-mentor:${session.user.id}`, 30, 3600, "fail-open");
    if (!success) {
      return NextResponse.json(
        { reply: "AI хүсэлтийн лимит хэтэрлээ. 1 цагийн дараа дахин оролдоно уу." },
        { status: 429 },
      );
    }

    const body = await req.json();
    const {
      message,
      pageContext,
      quickAction,
      history = [],
      userContext,
    }: {
      message: string;
      pageContext?: string;
      quickAction?: string;
      history?: { role: string; content: string }[];
      userContext?: { name?: string; level?: number; xp?: number; streak?: number };
    } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ reply: "Хоосон мессеж илгээх боломжгүй." }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json({ reply: "Мессеж хэт урт байна." }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      const fallback = getFallbackResponse(message, pageContext);
      return NextResponse.json({ reply: fallback });
    }

    // Build context string appended to system prompt
    const contextLines: string[] = [];
    if (userContext?.name) contextLines.push(`Хэрэглэгчийн нэр: ${userContext.name}`);
    if (userContext?.level) contextLines.push(`Хэрэглэгчийн түвшин: ${userContext.level}`);
    if (userContext?.xp) contextLines.push(`Нийт XP: ${userContext.xp}`);
    if (userContext?.streak) contextLines.push(`Streak: ${userContext.streak} өдөр`);
    if (pageContext) contextLines.push(`Одоогийн хуудас: ${pageContext}`);
    if (quickAction) contextLines.push(`Сонгосон үйлдэл: ${quickAction}`);

    const systemWithContext =
      contextLines.length > 0
        ? `${SYSTEM_PROMPT}\n\nОдоогийн хэрэглэгчийн мэдээлэл:\n${contextLines.join("\n")}`
        : SYSTEM_PROMPT;

    // Trim history to last 10 turns to stay within token budget
    const safeHistory = (Array.isArray(history) ? history : [])
      .slice(-10)
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role as "user" | "assistant", content: String(m.content) }));

    const messages = [...safeHistory, { role: "user" as const, content: message }];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 800,
        system: systemWithContext,
        messages,
      }),
    });

    if (!response.ok) {
      console.error("Anthropic API error:", await response.text());
      return NextResponse.json({ reply: getFallbackResponse(message, pageContext) });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text ?? getFallbackResponse(message, pageContext);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("AI mentor error:", error);
    return NextResponse.json(
      {
        reply: "Уучлаарай, AI Mentor түр ажиллахгүй байна. Гэхдээ чи өнөөдөр нэг хичээлээ үргэлжлүүлээд streak-ээ хадгалаарай 🔥",
      },
      { status: 500 },
    );
  }
}
