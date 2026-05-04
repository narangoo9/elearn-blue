import type { AgentIntent } from "./agent-types";

// Each intent maps to a list of regex patterns or literal substrings.
// Patterns are tested against the lowercased message.
const INTENT_PATTERNS: Record<Exclude<AgentIntent, "GENERAL_HELP">, (RegExp | string)[]> = {
  CONTINUE_LEARNING: [
    /юу үзэх/,
    /үргэлжлүүлэх/,
    /үргэлжлүүл/,
    /continue/,
    /дараагийн хичээл/,
    /next lesson/,
    /resume/,
    /дуусаагүй/,
    /хаана зогссон/,
    /дараа нь юу/,
    "what's next",
    /эхлэх юм/,
    /хичээлд орох/,
    /хичээл нээх/,
  ],
  RECOMMEND_COURSE: [
    /course санал/,
    /recommend/,
    /сургалт санал/,
    /ямар course/,
    /хичээл санал/,
    /сурмаар байна/,
    /юу сурах вэ/,
    /suggest/,
    /надад тохирох/,
    /шинэ course/,
    /ямар хичээл/,
  ],
  EXPLAIN_PROGRESS: [
    /progress/,
    /явц/,
    /хэдэн хувь/,
    /хэр ахисан/,
    /percent/,
    /хэдэн хичээл/,
    /статистик/,
    /stats/,
    /хэр сурсан/,
    /дуусгасан/,
    /completion/,
    /хэр болсон/,
    /харуул/,
  ],
  CERTIFICATE_STATUS: [
    /certificate/,
    /сертификат/,
    /гэрчилгээ/,
    /cert/,
    /диплом/,
    /авахад юу дутуу/,
    /хэзээ авах/,
    /дутуу байна/,
    /гэрчилгээ авах/,
  ],
  CREATE_STUDY_PLAN: [
    /study plan/,
    /төлөвлөгөө/,
    /7 хоног/,
    /plan гарга/,
    /schedule/,
    /хуваарь/,
    /долоо хоног/,
    /weekly/,
    /daily plan/,
    /өдрийн план/,
    /план гарга/,
  ],
  FIND_COURSE: [
    /react course/,
    /python course/,
    /javascript course/,
    /js course/,
    /figma course/,
    /node\.?js/,
    /flutter/,
    /хайх/,
    /find course/,
    /catalog/,
    /каталог/,
    /search course/,
  ],
  TASK_HELP: [
    /final task/,
    /даалгавар/,
    /assignment/,
    /peer review/,
    /task хийх/,
    /task дуусгах/,
    /дуусгах туслаач/,
    /хэрхэн хийх/,
    /project хийх/,
  ],
  LESSON_HELP: [
    /хичээл тайлбарла/,
    /ойлгохгүй байна/,
    /explain/,
    /help with lesson/,
    /хичээлийн агуулга/,
    /quiz туслаач/,
    /шалгалт туслаач/,
    /асуудал байна/,
  ],
};

export function detectAgentIntent(message: string): AgentIntent {
  const lower = message.toLowerCase();

  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS) as [
    Exclude<AgentIntent, "GENERAL_HELP">,
    (RegExp | string)[],
  ][]) {
    for (const pattern of patterns) {
      if (pattern instanceof RegExp) {
        if (pattern.test(lower)) return intent;
      } else {
        if (lower.includes(pattern)) return intent;
      }
    }
  }

  return "GENERAL_HELP";
}
