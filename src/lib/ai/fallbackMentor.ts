export function getFallbackResponse(message: string, pageContext?: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("certificate") || lower.includes("сертификат") || lower.includes("гэрчилгээ")) {
    return "Certificate авахын тулд course-ийн бүх lesson-уудаа дуусгаад final task илгээнэ үү. Дараа нь peer review авсны дараа certificate авах эрх нээгдэнэ. 🎓\n\nАлхмууд:\n1. Бүх хичээл дуусгах\n2. Final task илгээх\n3. Peer review авах\n4. Certificate татаж авах";
  }

  if (lower.includes("streak") || lower.includes("стрик")) {
    return "Streak хадгалахын тулд өдөр бүр дор хаяж 1 хичээл үзэх хэрэгтэй 🔥\n\n10–15 минутын богино хичээлээс эхэлж болно. Тогтмол суралцах нь хамгийн чухал зүйл!";
  }

  if (
    lower.includes("7 хоног") ||
    lower.includes("план") ||
    lower.includes("plan") ||
    lower.includes("төлөвлөгөө") ||
    lower.includes("schedule")
  ) {
    return "7 хоногийн сурах төлөвлөгөө:\n\n📅 1-р өдөр: Шинэ хичээл эхлэх (30 мин)\n📅 2-р өдөр: Үргэлжлүүлэх + дадлага\n📅 3-р өдөр: Quiz бэлдэх + давтах\n📅 4-р өдөр: Тэмдэглэл + хоёрдах давтах\n📅 5-р өдөр: Final task эхлүүлэх\n📅 6-р өдөр: Peer review илгээх\n📅 7-р өдөр: Амрах + дараагийн хичээл сонгох";
  }

  if (
    lower.includes("course") ||
    lower.includes("хичээл санал") ||
    lower.includes("юу сурах") ||
    lower.includes("сурмаар байна")
  ) {
    return "EduNity дээр Python, JavaScript, Figma, Node.js, UI/UX Design болон бусад олон хичээл байна.\n\nSanал:\n🐍 Beginner → Python Full Course\n🎨 Design → Figma for Beginners\n💻 Frontend → JavaScript Essentials\n\nCatalog хэсэгт орж өөрийн сонирхолд тохирсонг хайж болно!";
  }

  if (lower.includes("peer review") || lower.includes("пир")) {
    return "Peer Review бол чиний final task-ийг бусад суралцагчид үнэлдэг систем.\n\nАлхам:\n1. Final task-аа дуусгах\n2. Platform-д илгээх\n3. Хэдэн хоногийн дотор санал хүсэлт ирнэ\n4. Амжилттай бол certificate нээгдэнэ 🎓";
  }

  if (lower.includes("xp") || lower.includes("level") || lower.includes("түвшин") || lower.includes("оноо")) {
    return "XP цуглуулах хурдан арга:\n⚡ Хичээл үзэх → +50 XP\n⚡ Quiz хийх → +30 XP\n⚡ Task дуусгах → +100 XP\n⚡ Certificate авах → +200 XP\n\nИлүү XP цуглуулах тусам level нэмэгдэж, leaderboard дээр дээшилнэ! 🏆";
  }

  if (lower.includes("task") || lower.includes("project") || lower.includes("даалгавар") || lower.includes("туслаач")) {
    return "Final task хийх алхам:\n\n✅ 1. Хичээлийн материалаа давтах\n✅ 2. Шаардлагыг анхааралтай унших\n✅ 3. Алхам алхмаар хийх\n✅ 4. Өөрийн ажлыг шалгах\n✅ 5. Peer review-д илгээх\n\nЧадна! 💪 Асуулт байвал надаас асуугаарай.";
  }

  if (lower.includes("өнөөдөр") || lower.includes("today") || lower.includes("юу хийх")) {
    return "Өнөөдрийн зөвлөгөө:\n\n🎯 1. Эхлүүлсэн хичээлээ үргэлжлүүл\n🎯 2. 1 хичээл дуусгаад streak хадгал\n🎯 3. Хэрэв хичээл дуусгасан бол quiz хий\n🎯 4. Тэмдэглэл авч progress нэмэгдүүл\n\nОдоо эхэлцгээе! 🚀";
  }

  if (lower.includes("progress") || lower.includes("явц") || lower.includes("дуусгасан")) {
    return "Progress нэмэгдүүлэх зөвлөгөө:\n\n📈 Өдөр бүр тогтмол суралц\n📈 Богино хугацаанд дуусгах боломжтой хичээлийг сонго\n📈 Quiz болон task-ийг заавал хий\n📈 Streak хадгалах нь motivation өгнө\n\nЧиний progress 1 хичээл тутамд нэмэгдэнэ!";
  }

  if (pageContext === "peer-review") {
    return "Peer Review хэсэгт байна уу! Final task-аа илгээгээд хариу хүлээнэ үү. Баталгаажсаны дараа certificate авах боломжтой. Асуулт байвал надаас асуугаарай!";
  }

  if (pageContext === "catalog") {
    return "Catalog хэсэгт байна уу! Хичээлүүдийг чиглэл, түвшин, үнэлгээгээр нь шүүж болно. Ямар чиглэлд сурмаар байна вэ?";
  }

  if (pageContext === "notes") {
    return "Notes хэсэгт байна уу! Хичээлийн явцад чухал зүйлсийг тэмдэглэж аваарай. Task list гарган өдрийн зорилгоо тодорхойлоорой!";
  }

  if (pageContext === "leaderboard") {
    return "Leaderboard дээр харагдахын тулд илүү их XP цуглуул! Хичээл, quiz, task дуусгах бүрт XP нэмэгддэг. Тогтмол суралцаарай! 🏆";
  }

  return "Уучлаарай, AI Mentor түр ажиллахгүй байна. Гэхдээ чи өнөөдөр нэг хичээлээ үргэлжлүүлээд streak-ээ хадгалаарай 🔥";
}
