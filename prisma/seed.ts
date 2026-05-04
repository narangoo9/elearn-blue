import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  "Бат", "Энх", "Дорж", "Болд", "Ганбат", "Туяа", "Оюун", "Сарнай",
  "Мөнх", "Анх", "Наран", "Үүлэн", "Долгор", "Пүрэв", "Соёлмаа", "Хулан",
  "Мөнхбат", "Эрдэнэ", "Ариун", "Цэцэг", "Батмөнх", "Дэлгэр",
];

const LAST_NAMES = [
  "Батбаяр", "Эрдэнэ", "Болд", "Лхагва", "Сухбат", "Цэрэн", "Хандсүрэн",
  "Өлзийхутаг", "Баяр", "Баатар", "Гэрэлт", "Түвшин", "Оргил", "Гантулга",
  "Нэргүй", "Мөнхтөгс", "Алтангэрэл", "Жаргал", "Ганзориг",
];

const COURSE_DATA = [
  {
    title: "Python программчлалын хэл — Эхлэгчдэд",
    slug: "python-beginners",
    desc: "Python-ийг эхнээс нь заах курс. Syntax, data types, control flow, functions, OOP бүх үндсэн ойлголт.",
    level: "BEGINNER", category: "programming", price: 29000,
    tags: ["python", "programming", "beginner"],
    outcomes: ["Python syntax тойм", "OOP ойлголт", "Data structures", "Жижиг төсөл"],
    duration: 1800,
  },
  {
    title: "React.js — Орчин үеийн вэб хөгжүүлэлт",
    slug: "react-modern",
    desc: "React 19, Hooks, Context API, performance optimization, testing бүх орчин үеийн хэрэгсэл.",
    level: "INTERMEDIATE", category: "programming", price: 59000,
    tags: ["react", "javascript", "web"],
    outcomes: ["Component architecture", "State management", "Hooks гүнзгий", "Production app"],
    duration: 2400,
  },
  {
    title: "UI/UX Дизайнтай танилцах",
    slug: "ui-ux-intro",
    desc: "Figma ашиглан хэрэглэгчийн туршлага, интерфейсийн дизайныг суралцъя.",
    level: "BEGINNER", category: "design", price: 39000,
    tags: ["figma", "design", "ux"],
    outcomes: ["Figma эзэмших", "User research", "Wireframing", "Design system"],
    duration: 1500,
  },
  {
    title: "Digital Marketing бүрэн заавар",
    slug: "digital-marketing",
    desc: "SEO, SMM, Email marketing, Google Ads, Analytics нэг курсэд.",
    level: "ALL_LEVELS", category: "business", price: 49000,
    tags: ["marketing", "seo", "smm"],
    outcomes: ["SEO стратеги", "Facebook Ads", "Email funnel", "Analytics"],
    duration: 1200,
  },
  {
    title: "Data Science with Python",
    slug: "data-science-python",
    desc: "NumPy, Pandas, Matplotlib, Scikit-learn ашиглан анализ, ML model бүтээх.",
    level: "ADVANCED", category: "data-science", price: 79000,
    tags: ["python", "ml", "data"],
    outcomes: ["Pandas эзэмшил", "ML моделлинг", "Data viz", "Real project"],
    duration: 3000,
  },
  {
    title: "SQL ба Database дизайн",
    slug: "sql-database",
    desc: "Relational DB үндэс, SQL query, normalization, indexing, performance tuning.",
    level: "INTERMEDIATE", category: "programming", price: 35000,
    tags: ["sql", "database", "postgresql"],
    outcomes: ["Complex query", "DB design", "Index optimization", "Transaction"],
    duration: 1440,
  },
  {
    title: "Бизнесийн үндэс — Стартап эхлүүлэх",
    slug: "startup-basics",
    desc: "Бизнес санаанаас MVP хүртэл, Lean Canvas, validation, fundraising.",
    level: "BEGINNER", category: "business", price: 45000,
    tags: ["startup", "business", "mvp"],
    outcomes: ["Идэя шалгах", "Lean Canvas", "MVP launch", "Customer discovery"],
    duration: 960,
  },
  {
    title: "Next.js 15 иж бүрэн сургалт",
    slug: "nextjs-15",
    desc: "App Router, Server Components, Server Actions, Prisma ашиглан fullstack app.",
    level: "INTERMEDIATE", category: "programming", price: 65000,
    tags: ["nextjs", "react", "typescript"],
    outcomes: ["App Router", "Server Actions", "Database", "Deploy"],
    duration: 2700,
  },
];

// Real YouTube video URLs per course (used for VIDEO-type lessons)
const COURSE_VIDEO_URLS: Record<string, string[]> = {
  "python-beginners": [
    "https://www.youtube.com/watch?v=rfscVS0vtbw",
    "https://www.youtube.com/watch?v=kqtD5dpn9C8",
    "https://www.youtube.com/watch?v=9Os0o3wzS_I",
    "https://www.youtube.com/watch?v=Ej_02ICOIgs",
  ],
  "react-modern": [
    "https://www.youtube.com/watch?v=bMknfKXIFA8",
    "https://www.youtube.com/watch?v=TNhaISOUy6Q",
    "https://www.youtube.com/watch?v=O6P86uwfdR0",
  ],
  "ui-ux-intro": [
    "https://www.youtube.com/watch?v=FTFaQWZBqQ8",
    "https://www.youtube.com/watch?v=dU7T-QBHQqY",
    "https://www.youtube.com/watch?v=WIljVBYpHIQ",
  ],
  "digital-marketing": [
    "https://www.youtube.com/watch?v=nU-IIXBWlS4",
    "https://www.youtube.com/watch?v=oBGWHSuAIFU",
    "https://www.youtube.com/watch?v=1Zj2AQgMYQQ",
  ],
  "data-science-python": [
    "https://www.youtube.com/watch?v=ua-CiDNNj30",
    "https://www.youtube.com/watch?v=GPVsHOlRBBI",
    "https://www.youtube.com/watch?v=vmEHCJofslg",
  ],
  "sql-database": [
    "https://www.youtube.com/watch?v=HXV3zeQKqGY",
    "https://www.youtube.com/watch?v=p3qvj9hO_Bo",
    "https://www.youtube.com/watch?v=27axs9dO7AE",
  ],
  "startup-basics": [
    "https://www.youtube.com/watch?v=PkZNo7MFNFg",
    "https://www.youtube.com/watch?v=MzI2-V1K2y8",
    "https://www.youtube.com/watch?v=v2gD_VXHPQM",
  ],
  "nextjs-15": [
    "https://www.youtube.com/watch?v=ZVnjOPwW4ZA",
    "https://www.youtube.com/watch?v=__mSgDEOyv8",
    "https://www.youtube.com/watch?v=RadgkoaGe6E",
  ],
};

// Rich markdown body templates for TEXT-type lessons
function makeTextBody(title: string, idx: number): string {
  if (idx % 3 === 0) {
    return [
      "## " + title,
      "",
      "Энэ хичээлд суурь ойлголт болон практик хэрэглээг тайлбарлана.",
      "",
      "### Гол ойлголтууд",
      "",
      "- **Нэгдүгээр зарчим**: Бүх зүйл жижиг алхмуудаас эхэлдэг",
      "- **Хоёрдугаар зарчим**: Практик давтах тусам чадвар нэмэгдэнэ",
      "- **Гуравдугаар зарчим**: Алдаа бол суралцах хамгийн сайн арга",
      "",
      "### Дасгал",
      "",
      "1. Доорх жишээг туршиж үзнэ үү",
      "2. Мессежийг өөрчлөөд дахиад ажиллуулна уу",
      "3. Параметр нэмж туршина уу",
      "",
      "> Зөвлөмж: Кодыг зөвхөн унших биш, гараар бичиж туршиж үзэх нь хамгийн үр дүнтэй арга юм.",
    ].join("\n");
  }
  if (idx % 3 === 1) {
    return [
      "## " + title,
      "",
      "Энэ хэсэгт бид онолын мэдлэгийг практик дасгалуудтай хослуулан судална.",
      "",
      "### Юуг сурах вэ?",
      "",
      "| Сэдэв | Зорилго | Хугацаа |",
      "|-------|---------|---------|",
      "| Онол | Ойлголт нэмэгдүүлэх | 10 мин |",
      "| Код | Практик туршлага | 20 мин |",
      "| Дасгал | Бататгах | 10 мин |",
      "",
      "### Нэмэлт материал",
      "",
      "- Баримт бичиг үзэх",
      "- Дараагийн хичээлд видео жишээ",
      "- GitHub дээрх жишээ кодууд",
      "",
      "Дараагийн хичээлд уулзая!",
    ].join("\n");
  }
  return [
    "## " + title + " — Гуравдугаар хэсэг",
    "",
    "Бид энэ хичээлд дэвшилтэт ойлголтуудыг хамрах болно.",
    "",
    "### Яагаад чухал вэ?",
    "",
    "Энэ ойлголт нь практик ажилд байнга тулгардаг бөгөөд мэргэжлийн хөгжүүлэгч болоход зайлшгүй шаардлагатай.",
    "",
    "### Алхам алхмаар дасгал",
    "",
    "**Алхам 1**: Орчин бэлдэх — хэрэгслийг суулгана",
    "**Алхам 2**: Үндсэн код бичих",
    "**Алхам 3**: Туршиж үзэх — хүссэн үр дүн гарч байгааг шалгана",
    "",
    "### Ерөнхий дүгнэлт",
    "",
    "Энэ хичээлд сурсан зүйлсийг дараагийн бүлэгт өргөтгөнө. Асуулт байвал comment хэсэгт бичнэ үү!",
  ].join("\n");
}

const COURSE_COVERS: Record<string, string> = {
  "python-beginners": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
  "react-modern": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80",
  "ui-ux-intro": "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80",
  "digital-marketing": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  "data-science-python": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  "sql-database": "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80",
  "startup-basics": "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80",
  "nextjs-15": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
};

const INSTRUCTOR_AVATARS = [
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/46.jpg",
];

const STUDENT_AVATARS = [
  "https://randomuser.me/api/portraits/women/65.jpg",
  "https://randomuser.me/api/portraits/men/67.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/men/71.jpg",
  "https://randomuser.me/api/portraits/women/72.jpg",
  "https://randomuser.me/api/portraits/men/75.jpg",
  "https://randomuser.me/api/portraits/women/77.jpg",
  "https://randomuser.me/api/portraits/men/80.jpg",
];

const REVIEW_COMMENTS = [
  "Маш сайн курс байна. Багш ойлгомжтой тайлбарладаг.",
  "Практик жишээнүүд нь үнэхээр хэрэгтэй байсан.",
  "Үнэ цэнэтэй мэдлэг олж авлаа. Санал болгож байна!",
  "Агуулга гүнзгий бөгөөд бүтэцтэй. Тун таалагдсан.",
  "Багш туршлагатай, хичээлүүд нь ойлгомжтой. 5 од!",
  "Энэ курс миний карьерт маш их тусласан. Баярлалаа!",
  "Хамгийн сайн курс. Дахиад авах хүсэлтэй байна.",
  "Видео чанар сайн, тайлбар дэлгэрэнгүй. Маш сэтгэл ханамжтай.",
];

const LESSON_TITLES = [
  ["Танилцуулга ба суулгалт", "Анхны програм бичих", "Суурь синтакс"],
  ["Хувьсагч ба өгөгдлийн төрөл", "Оператор ба илэрхийлэл", "Шийдвэрлэх бүтэц", "Давтамж"],
  ["Функц ба параметр", "Модуль ба пакэж", "Жишээ төсөл хийх", "Дүгнэлт"],
];

// Module 4 lesson titles per course (4 lessons each = 32 new lessons total)
const MODULE4_TITLES: Record<string, string[]> = {
  "python-beginners": ["Объект хандлагат програмчлал (OOP)", "Файлтай ажиллах", "Алдааг зохицуулах (Exception)", "Жишээ бүрэн төсөл"],
  "react-modern": ["Custom Hooks гүнзгий", "Context API ба state архитектур", "React Query ашиглах", "Production deploy хийх"],
  "ui-ux-intro": ["Хэрэглэгчийн судалгаа (User Research)", "Wireframe ба прототип", "Design System бүтээх", "Кейс судалгаа"],
  "digital-marketing": ["Google Analytics 4 ашиглах", "Email маркетингийн автомат", "A/B тест хийх", "Кампанийн дүн шинжилгээ"],
  "data-science-python": ["Feature Engineering", "Машин сургалтын загвар", "Model validation ба tuning", "Дата шинжлэлийн тайлан"],
  "sql-database": ["Stored Procedure ба Function", "Индекс оновчлол", "Transaction ба ACID", "Жишээ дата сан төсөл"],
  "startup-basics": ["Бизнес загвар нотлох", "Pitch Deck бэлдэх", "Хөрөнгө оруулагчтай уулзалт", "MVP-г зах зээлд гаргах"],
  "nextjs-15": ["Middleware ба Edge Runtime", "ISR ба Streaming", "Auth.js интеграц", "Vercel дээр deploy"],
};

// Additional YouTube URLs for 4th module lessons (VIDEO type)
const MODULE4_VIDEO_URLS: Record<string, [string, string]> = {
  "python-beginners": ["https://www.youtube.com/watch?v=8ndsDXohLMQ", "https://www.youtube.com/watch?v=ZDa-Z5JzLYM"],
  "react-modern": ["https://www.youtube.com/watch?v=4UZrsTqkcW4", "https://www.youtube.com/watch?v=w7ejDZ8SWv8"],
  "ui-ux-intro": ["https://www.youtube.com/watch?v=5IanQIwhA2E", "https://www.youtube.com/watch?v=c9Wg6Cb_YlU"],
  "digital-marketing": ["https://www.youtube.com/watch?v=MlgfYW3WeSM", "https://www.youtube.com/watch?v=svfOTQoSKDw"],
  "data-science-python": ["https://www.youtube.com/watch?v=aircAruvnKk", "https://www.youtube.com/watch?v=i_LwzRVP7bg"],
  "sql-database": ["https://www.youtube.com/watch?v=RqjHVS7DPGA", "https://www.youtube.com/watch?v=4cWkVbC2bNE"],
  "startup-basics": ["https://www.youtube.com/watch?v=PkZNo7MFNFg", "https://www.youtube.com/watch?v=9amBMIOHSuM"],
  "nextjs-15": ["https://www.youtube.com/watch?v=T63nY70eZF0", "https://www.youtube.com/watch?v=6aP9nyTcd44"],
};

function rnd<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rndInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 3600 * 1000);
}

type SeedStudent = { id: string };
type SeedCourse = { id: string; slug: string; title: string; organizationId: string | null; price: Prisma.Decimal };

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seed эхэлж байна...\n");

  // ── 1. CATEGORIES ─────────────────────────────────────────────────────────
  const cats = await Promise.all(
    [
      { name: "Программчлал", slug: "programming" },
      { name: "Дизайн", slug: "design" },
      { name: "Бизнес", slug: "business" },
      { name: "Дата шинжлэл", slug: "data-science" },
      { name: "Маркетинг", slug: "marketing" },
      { name: "Гадаад хэл", slug: "language" },
      { name: "Хувийн хөгжил", slug: "personal-development" },
    ].map((c) => prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c }))
  );
  console.log(`✅ ${cats.length} категори`);

  // ── 2. PASSWORDS ──────────────────────────────────────────────────────────
  const adminPw = await bcrypt.hash("Admin@1234", 12);
  const userPw = await bcrypt.hash("Student@1234", 12);

  // ── 3. SUPER ADMIN ────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@elearn.mn" },
    update: {},
    create: {
      name: "Систем Админ", email: "admin@elearn.mn", passwordHash: adminPw,
      role: "SUPER_ADMIN", status: "ACTIVE", emailVerified: new Date(),
      xp: 9999, level: 10, streak: 30, coins: 500,
      avatarUrl: "https://randomuser.me/api/portraits/men/1.jpg",
    },
  });

  // ── 4. ORG 1 — Tech Academy ────────────────────────────────────────────────
  const orgOwner = await prisma.user.upsert({
    where: { email: "ceo@techacademy.mn" },
    update: {},
    create: {
      name: "Энхбат Баяр", email: "ceo@techacademy.mn", passwordHash: userPw,
      role: "ORG_ADMIN", status: "ACTIVE", emailVerified: new Date(),
      xp: 3200, level: 4, streak: 12,
      avatarUrl: "https://randomuser.me/api/portraits/men/22.jpg",
    },
  });

  const org = await prisma.organization.upsert({
    where: { slug: "tech-academy" },
    update: {},
    create: {
      name: "Tech Academy Mongolia", slug: "tech-academy",
      description: "Технологийн боловсролын тэргүүлэгч академи. Монголын шилдэг программчлалын сургалтын төв.",
      logoUrl: "https://ui-avatars.com/api/?name=Tech+Academy&background=7c3aed&color=fff&size=128&bold=true",
      website: "https://techacademy.mn",
      ownerId: orgOwner.id, plan: "ORGANIZATION", isActive: true,
    },
  });
  await prisma.user.update({ where: { id: orgOwner.id }, data: { organizationId: org.id } });
  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: orgOwner.id } },
    update: {},
    create: { organizationId: org.id, userId: orgOwner.id, role: "OWNER", status: "ACTIVE" },
  });

  // ── 5. ORG 2 — Design Studio ──────────────────────────────────────────────
  const org2Owner = await prisma.user.upsert({
    where: { email: "ceo@designstudio.mn" },
    update: {},
    create: {
      name: "Сарнай Дизайн", email: "ceo@designstudio.mn", passwordHash: userPw,
      role: "ORG_ADMIN", status: "ACTIVE", emailVerified: new Date(),
      xp: 1800, level: 2, streak: 5,
      avatarUrl: "https://randomuser.me/api/portraits/women/28.jpg",
    },
  });
  const org2 = await prisma.organization.upsert({
    where: { slug: "design-studio" },
    update: {},
    create: {
      name: "Design Studio MN", slug: "design-studio",
      description: "Дизайны мэргэжлийн сургалтын төв. Figma, Adobe, UI/UX чиглэлийн курсүүд.",
      logoUrl: "https://ui-avatars.com/api/?name=Design+Studio&background=ec4899&color=fff&size=128&bold=true",
      ownerId: org2Owner.id, plan: "STANDARD", isActive: true,
    },
  });
  await prisma.user.update({ where: { id: org2Owner.id }, data: { organizationId: org2.id } });
  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: org2.id, userId: org2Owner.id } },
    update: {},
    create: { organizationId: org2.id, userId: org2Owner.id, role: "OWNER", status: "ACTIVE" },
  });
  console.log(`✅ Байгууллага: ${org.name}, ${org2.name}`);

  // ── 6. INSTRUCTORS ────────────────────────────────────────────────────────
  const instructorData = [
    { email: "batbayar@elearn.mn", name: "Батбаяр Эрдэнэ", bio: "10+ жилийн туршлагатай программчлалын багш. Google-д ажиллаж байсан.", xp: 8500, level: 9, streak: 25 },
    { email: "oyun@elearn.mn", name: "Оюун-Эрдэнэ Туяа", bio: "UI/UX дизайнер, олон улсын төслүүдэд оролцсон. Figma Community creator.", xp: 6200, level: 7, streak: 18 },
    { email: "temuulen@elearn.mn", name: "Тэмүүлэн Болд", bio: "Data Scientist, MIT төгсөгч. Машин сургалтын чиглэлийн судлаач.", xp: 9100, level: 10, streak: 30 },
  ];

  const instructors = await Promise.all(instructorData.map((i, idx) =>
    prisma.user.upsert({
      where: { email: i.email },
      update: { name: i.name, bio: i.bio, avatarUrl: INSTRUCTOR_AVATARS[idx] },
      create: {
        name: i.name, email: i.email, passwordHash: userPw,
        role: "INSTRUCTOR", status: "ACTIVE", emailVerified: new Date(),
        bio: i.bio, organizationId: org.id,
        avatarUrl: INSTRUCTOR_AVATARS[idx],
        xp: i.xp, level: i.level, streak: i.streak, coins: rndInt(100, 500),
      },
    })
  ));

  for (const inst of instructors) {
    await prisma.organizationMember.upsert({
      where: { organizationId_userId: { organizationId: org.id, userId: inst.id } },
      update: {},
      create: { organizationId: org.id, userId: inst.id, role: "INSTRUCTOR", status: "ACTIVE", invitedBy: orgOwner.id },
    });
  }
  console.log(`✅ ${instructors.length} багш`);

  // ── 7. STUDENTS (25 + 1 demo) ────────────────────────────────────────────
  const students: SeedStudent[] = [];
  for (let i = 0; i < 25; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[i % LAST_NAMES.length];
    const xp = rndInt(200, 8000);
    const s = await prisma.user.upsert({
      where: { email: `student${i + 1}@elearn.mn` },
      update: { avatarUrl: STUDENT_AVATARS[i % STUDENT_AVATARS.length] },
      create: {
        name: `${last} ${first}`,
        email: `student${i + 1}@elearn.mn`,
        passwordHash: userPw,
        role: "STUDENT", status: "ACTIVE", emailVerified: new Date(),
        avatarUrl: STUDENT_AVATARS[i % STUDENT_AVATARS.length],
        xp, level: Math.max(1, Math.floor(xp / 1000)),
        streak: rndInt(0, 20), coins: rndInt(0, 300),
        lastStreakAt: i % 3 === 0 ? new Date() : daysAgo(rndInt(1, 5)),
      },
    });
    students.push(s);
  }

  // Demo student — main account for testing
  const demoStudent = await prisma.user.upsert({
    where: { email: "student@elearn.mn" },
    update: {
      name: "Энхбаяр Оюутан",
      avatarUrl: STUDENT_AVATARS[0],
      xp: 4750, level: 5, streak: 7, coins: 120,
      lastStreakAt: new Date(),
    },
    create: {
      name: "Энхбаяр Оюутан", email: "student@elearn.mn", passwordHash: userPw,
      role: "STUDENT", status: "ACTIVE", emailVerified: new Date(),
      avatarUrl: STUDENT_AVATARS[0],
      xp: 4750, level: 5, streak: 7, coins: 120,
      lastStreakAt: new Date(),
    },
  });
  students.push(demoStudent);
  console.log(`✅ ${students.length} оюутан`);

  // ── 8. SUBSCRIPTIONS ──────────────────────────────────────────────────────
  await prisma.subscription.upsert({
    where: { userId: demoStudent.id },
    update: {},
    create: {
      userId: demoStudent.id, plan: "STUDENT", status: "ACTIVE",
      currentPeriodStart: daysAgo(15),
      currentPeriodEnd: new Date(Date.now() + 15 * 24 * 3600 * 1000),
    },
  });
  for (let i = 0; i < 5; i++) {
    const s = students[i];
    await prisma.subscription.upsert({
      where: { userId: s.id },
      update: {},
      create: {
        userId: s.id, plan: i % 2 === 0 ? "STUDENT" : "FREE", status: "ACTIVE",
        currentPeriodStart: daysAgo(rndInt(1, 60)),
        currentPeriodEnd: new Date(Date.now() + rndInt(1, 30) * 24 * 3600 * 1000),
      },
    });
  }
  await prisma.subscription.upsert({
    where: { userId: org.ownerId },
    update: {},
    create: {
      userId: org.ownerId, plan: "ORGANIZATION", status: "ACTIVE",
      currentPeriodStart: daysAgo(30),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    },
  });
  console.log("✅ Subscription-ууд");

  // ── 9. COURSES ────────────────────────────────────────────────────────────
  const courses: SeedCourse[] = [];
  const allLessons: { id: string; courseId: string }[] = [];

  for (let i = 0; i < COURSE_DATA.length; i++) {
    const cd = COURSE_DATA[i];
    const category = cats.find((c) => c.slug === cd.category);
    const instructor = instructors[i % instructors.length];

    const course = await prisma.course.upsert({
      where: { slug: cd.slug },
      update: {
        title: cd.title, description: cd.desc,
        shortDescription: cd.desc.slice(0, 140) + "…",
        level: cd.level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS",
        price: cd.price, tags: cd.tags, learningOutcomes: cd.outcomes,
        thumbnailUrl: COURSE_COVERS[cd.slug], isFeatured: i < 3,
        duration: cd.duration, averageRating: 4.2 + Math.random() * 0.7,
        reviewCount: rndInt(15, 80),
      },
      create: {
        instructorId: instructor.id, organizationId: org.id,
        categoryId: category?.id,
        title: cd.title, slug: cd.slug, description: cd.desc,
        shortDescription: cd.desc.slice(0, 140) + "…",
        level: cd.level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS",
        language: "mn", price: cd.price, currency: "MNT",
        status: "PUBLISHED", duration: cd.duration,
        thumbnailUrl: COURSE_COVERS[cd.slug],
        publishedAt: daysAgo(rndInt(10, 120)),
        tags: cd.tags, learningOutcomes: cd.outcomes,
        prerequisites: ["Компьютерын суурь мэдлэг"],
        isFeatured: i < 3,
        averageRating: 4.2 + Math.random() * 0.7,
        reviewCount: rndInt(15, 80),
      },
    });

    // Modules + Lessons
    for (let m = 0; m < 3; m++) {
      const modTitles = [`${m + 1}-р хэсэг: Танилцуулга`, `${m + 1}-р хэсэг: Үндсэн ойлголт`, `${m + 1}-р хэсэг: Дадлага`];
      const mod = await prisma.courseModule.upsert({
        where: { id: `${course.id}-mod-${m}` },
        update: {},
        create: { id: `${course.id}-mod-${m}`, courseId: course.id, title: modTitles[m] ?? modTitles[0], orderIndex: m },
      });

      const lessonTitles = LESSON_TITLES[m] ?? LESSON_TITLES[0];
      const courseVideos = COURSE_VIDEO_URLS[cd.slug] ?? ["https://www.youtube.com/watch?v=rfscVS0vtbw"];
      for (let l = 0; l < lessonTitles.length; l++) {
        const isQuiz = l === lessonTitles.length - 1 && m === 2;
        const isPdf = !isQuiz && m === 1 && l === 1; // one PDF per course in module 2
        const isText = !isQuiz && !isPdf && l % 4 === 3;
        const lessonType = isQuiz ? "QUIZ" : isPdf ? "PDF" : isText ? "TEXT" : "VIDEO";
        const lessonId = `${mod.id}-lesson-${l}`;
        const videoUrl = lessonType === "VIDEO"
          ? courseVideos[(m * lessonTitles.length + l) % courseVideos.length]
          : null;
        const pdfUrl = lessonType === "PDF"
          ? "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1.pdf"
          : null;
        const textBody = isText
          ? makeTextBody(lessonTitles[l], m + l)
          : null;
        await prisma.lesson.upsert({
          where: { id: lessonId },
          update: { type: lessonType, contentUrl: videoUrl ?? pdfUrl, contentBody: textBody },
          create: {
            id: lessonId, moduleId: mod.id,
            title: `${m + 1}.${l + 1} — ${lessonTitles[l]}`,
            type: lessonType,
            duration: isQuiz ? null : isPdf ? rndInt(600, 1200) : rndInt(300, 1500),
            orderIndex: l, isFree: m === 0 && l === 0,
            contentUrl: videoUrl ?? pdfUrl,
            contentBody: textBody,
          },
        });
        allLessons.push({ id: lessonId, courseId: course.id });

        // Lesson resources: PDF download for first lesson of each module
        if (l === 0) {
          await prisma.lessonResource.upsert({
            where: { id: `${lessonId}-res` },
            update: {},
            create: {
              id: `${lessonId}-res`,
              lessonId, name: "Хичээлийн гарын авлага.pdf",
              url: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1.pdf",
              type: "application/pdf", size: rndInt(100000, 2000000),
            },
          });
        }
        // Additional slide resource for video lessons
        if (lessonType === "VIDEO" && l === 1) {
          await prisma.lessonResource.upsert({
            where: { id: `${lessonId}-slides` },
            update: {},
            create: {
              id: `${lessonId}-slides`,
              lessonId, name: "Слайд материал.pdf",
              url: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF2.pdf",
              type: "application/pdf", size: rndInt(50000, 800000),
            },
          });
        }
      }
    }
    // ── Module 4: Advanced topics (4 new lessons per course) ──────────────────
    const mod4Titles = MODULE4_TITLES[cd.slug] ?? ["Дэвшилтэт сэдэв 1", "Дэвшилтэт сэдэв 2", "Дэвшилтэт сэдэв 3", "Дүгнэлт ба дараагийн алхам"];
    const mod4Videos = MODULE4_VIDEO_URLS[cd.slug] ?? ["https://www.youtube.com/watch?v=rfscVS0vtbw", "https://www.youtube.com/watch?v=rfscVS0vtbw"];
    const mod4 = await prisma.courseModule.upsert({
      where: { id: `${course.id}-mod-3` },
      update: {},
      create: { id: `${course.id}-mod-3`, courseId: course.id, title: "4-р хэсэг: Дэвшилтэт сэдвүүд", orderIndex: 3 },
    });
    // Lesson types for 4 lessons: VIDEO, TEXT, PDF, VIDEO
    const mod4Types = ["VIDEO", "TEXT", "PDF", "VIDEO"] as const;
    for (let l = 0; l < mod4Titles.length; l++) {
      const lessonType = mod4Types[l % mod4Types.length];
      const lessonId = `${mod4.id}-lesson-${l}`;
      const videoUrl = lessonType === "VIDEO" ? mod4Videos[l % mod4Videos.length] : null;
      const pdfUrl = lessonType === "PDF" ? "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1.pdf" : null;
      const textBody = lessonType === "TEXT" ? makeTextBody(mod4Titles[l], l) : null;
      await prisma.lesson.upsert({
        where: { id: lessonId },
        update: { type: lessonType, contentUrl: videoUrl ?? pdfUrl, contentBody: textBody },
        create: {
          id: lessonId, moduleId: mod4.id,
          title: `4.${l + 1} — ${mod4Titles[l]}`,
          type: lessonType,
          duration: lessonType === "PDF" ? rndInt(600, 1200) : rndInt(400, 1600),
          orderIndex: l, isFree: false,
          contentUrl: videoUrl ?? pdfUrl,
          contentBody: textBody,
        },
      });
      allLessons.push({ id: lessonId, courseId: course.id });
    }

    courses.push(course);
  }
  console.log(`✅ ${courses.length} курс (модуль, хичээл, YouTube видео, PDF, текст материал)`);

  // ── 10. QUIZZES ───────────────────────────────────────────────────────────
  const quizCourse = courses[0];
  const quiz = await prisma.quiz.upsert({
    where: { id: "seed-quiz-python-001" },
    update: {},
    create: {
      id: "seed-quiz-python-001",
      courseId: quizCourse.id, title: "Python үндэс шалгалт",
      description: "Python-ийн үндсэн ойлголтуудыг шалгах тест",
      timeLimit: 20, passingScore: 70, maxAttempts: 3, randomOrder: false,
    },
  });

  const questionData = [
    { text: "Python-д list үүсгэх зөв синтакс аль нь вэ?", opts: ["list()", "[]", "{}", "()"], correct: 1 },
    { text: "print() функцийн зориулалт юу вэ?", opts: ["Оролт авах", "Гаралт хэвлэх", "Файл нээх", "Хувьсагч тодорхойлох"], correct: 1 },
    { text: "for loop-г ямар тохиолдолд ашигладаг вэ?", opts: ["Нэг удаа биелэх", "Давталт хийх", "Нөхцөл шалгах", "Функц дуудах"], correct: 1 },
    { text: "Python-д коммент бичих тэмдэгт аль нь вэ?", opts: ["//", "#", "/*", "--"], correct: 1 },
    { text: "len() функц юу буцаадаг вэ?", opts: ["Хамгийн том утга", "Дундаж утга", "Элементийн тоо", "Нийлбэр"], correct: 2 },
  ];

  const questions = [];
  for (let qi = 0; qi < questionData.length; qi++) {
    const qd = questionData[qi];
    const q = await prisma.question.upsert({
      where: { id: `seed-q-${qi}` },
      update: {},
      create: {
        id: `seed-q-${qi}`, quizId: quiz.id,
        type: "SINGLE_CHOICE", text: qd.text,
        points: 20, orderIndex: qi,
        explanation: `Зөв хариулт: ${qd.opts[qd.correct]}`,
      },
    });
    for (let oi = 0; oi < qd.opts.length; oi++) {
      await prisma.questionOption.upsert({
        where: { id: `seed-opt-${qi}-${oi}` },
        update: {},
        create: {
          id: `seed-opt-${qi}-${oi}`,
          questionId: q.id, text: qd.opts[oi],
          isCorrect: oi === qd.correct, orderIndex: oi,
        },
      });
    }
    questions.push({ ...q, correctOptId: `seed-opt-${qi}-${qd.correct}` });
  }
  console.log(`✅ 1 тест, ${questions.length} асуулт`);

  // Quiz attempts for demo student
  const attempt = await prisma.quizAttempt.upsert({
    where: { id: "seed-attempt-demo-001" },
    update: {},
    create: {
      id: "seed-attempt-demo-001",
      quizId: quiz.id, studentId: demoStudent.id,
      score: 80, maxScore: 100, status: "GRADED",
      startedAt: daysAgo(3),
      submittedAt: new Date(daysAgo(3).getTime() + 12 * 60 * 1000),
      timeTaken: 720,
    },
  });
  for (let qi = 0; qi < questions.length; qi++) {
    const isCorrect = qi < 4; // 4/5 correct = 80%
    await prisma.quizAnswer.upsert({
      where: { id: `seed-ans-${qi}` },
      update: {},
      create: {
        id: `seed-ans-${qi}`, attemptId: attempt.id, questionId: questions[qi].id,
        selectedIds: [isCorrect ? questions[qi].correctOptId : `seed-opt-${qi}-0`],
        isCorrect, pointsEarned: isCorrect ? 20 : 0,
      },
    });
  }

  // ── 11. ENROLLMENTS + PROGRESS ────────────────────────────────────────────
  let enrollCount = 0;

  // Demo student — enrolled in first 3 courses with progress
  for (let ci = 0; ci < 3; ci++) {
    const course = courses[ci];
    const isCompleted = ci === 0;
    await prisma.enrollment.upsert({
      where: { studentId_courseId: { studentId: demoStudent.id, courseId: course.id } },
      update: {},
      create: {
        studentId: demoStudent.id, courseId: course.id,
        status: isCompleted ? "COMPLETED" : "ACTIVE",
        enrolledAt: daysAgo(rndInt(15, 45)),
        completedAt: isCompleted ? daysAgo(rndInt(1, 10)) : null,
        source: "direct",
      },
    });
    enrollCount++;

    // Progress: completed first course fully, partial for others
    const courseLessons = allLessons.filter((l) => l.courseId === course.id);
    for (let li = 0; li < courseLessons.length; li++) {
      const shouldComplete = isCompleted || li < Math.floor(courseLessons.length * 0.4);
      if (shouldComplete || li === 0) {
        await prisma.progress.upsert({
          where: { studentId_lessonId: { studentId: demoStudent.id, lessonId: courseLessons[li].id } },
          update: {},
          create: {
            studentId: demoStudent.id, courseId: course.id,
            lessonId: courseLessons[li].id,
            isCompleted: shouldComplete,
            watchedSeconds: shouldComplete ? rndInt(280, 900) : rndInt(30, 120),
            completedAt: shouldComplete ? daysAgo(rndInt(1, 20)) : null,
          },
        });
      }
    }

    // Certificate for completed course
    if (isCompleted) {
      const code = `DEMO${Date.now().toString(36).toUpperCase()}`;
      const existing = await prisma.certificate.findFirst({
        where: { studentId: demoStudent.id, courseId: course.id },
      });
      if (!existing) {
        await prisma.certificate.create({
          data: {
            studentId: demoStudent.id, courseId: course.id,
            organizationId: org.id,
            certificateNo: `CERT-DEMO-${code.slice(0, 8)}`,
            verificationCode: code,
            issuedAt: daysAgo(rndInt(1, 10)),
          },
        });
      }
    }
  }

  // Other students
  for (const student of students.slice(0, 25)) {
    const target = rndInt(2, 4);
    const picked = new Set<string>();
    while (picked.size < target) picked.add(courses[rndInt(0, courses.length - 1)].id);

    for (const courseId of picked) {
      const isCompleted = Math.random() < 0.3;
      await prisma.enrollment.upsert({
        where: { studentId_courseId: { studentId: student.id, courseId } },
        update: {},
        create: {
          studentId: student.id, courseId, status: isCompleted ? "COMPLETED" : "ACTIVE",
          enrolledAt: daysAgo(rndInt(5, 90)),
          completedAt: isCompleted ? daysAgo(rndInt(1, 30)) : null,
          source: "direct",
        },
      });
      enrollCount++;

      // Progress for a few lessons
      const courseLessons = allLessons.filter((l) => l.courseId === courseId);
      const completedLessonCount = isCompleted
        ? courseLessons.length
        : rndInt(1, Math.max(1, Math.floor(courseLessons.length * 0.6)));
      for (let li = 0; li < completedLessonCount && li < courseLessons.length; li++) {
        await prisma.progress.upsert({
          where: { studentId_lessonId: { studentId: student.id, lessonId: courseLessons[li].id } },
          update: {},
          create: {
            studentId: student.id, courseId,
            lessonId: courseLessons[li].id,
            isCompleted: li < completedLessonCount - 1,
            watchedSeconds: rndInt(120, 900),
            completedAt: li < completedLessonCount - 1 ? daysAgo(rndInt(1, 40)) : null,
          },
        });
      }

      // Certificates for completed
      if (isCompleted) {
        const code = Math.random().toString(36).slice(2, 14).toUpperCase();
        const existing = await prisma.certificate.findFirst({ where: { studentId: student.id, courseId } });
        if (!existing) {
          await prisma.certificate.create({
            data: {
              studentId: student.id, courseId, organizationId: org.id,
              certificateNo: `CERT-${Date.now()}-${code.slice(0, 6)}`,
              verificationCode: code,
              issuedAt: daysAgo(rndInt(1, 30)),
            },
          });
        }
      }
    }
  }
  console.log(`✅ ${enrollCount} бүртгэл, progress, certificate`);

  // ── 12. REVIEWS ───────────────────────────────────────────────────────────
  let reviewCount = 0;
  for (let i = 0; i < 40; i++) {
    const student = rnd(students);
    const course = rnd(courses);
    try {
      await prisma.review.upsert({
        where: { studentId_courseId: { studentId: student.id, courseId: course.id } },
        update: {},
        create: {
          studentId: student.id, courseId: course.id,
          rating: rndInt(3, 5),
          comment: rnd(REVIEW_COMMENTS),
          isApproved: true, isFeatured: Math.random() < 0.15,
          createdAt: daysAgo(rndInt(1, 60)),
        },
      });
      reviewCount++;
    } catch { /* dup */ }
  }
  // Demo student review
  try {
    await prisma.review.upsert({
      where: { studentId_courseId: { studentId: demoStudent.id, courseId: courses[0].id } },
      update: {},
      create: {
        studentId: demoStudent.id, courseId: courses[0].id,
        rating: 5, comment: "Маш сайн курс! Хэлний синтакс, OOP, бүх зүйлийг дэлгэрэнгүй тайлбарласан. 100% санал болгоно.",
        isApproved: true, isFeatured: true,
      },
    });
    reviewCount++;
  } catch { /* dup */ }
  console.log(`✅ ${reviewCount} үнэлгээ`);

  // ── 13. PROGRAMS ─────────────────────────────────────────────────────────
  const webDevProgram = await prisma.program.upsert({
    where: { slug: "web-developer-track" },
    update: { thumbnailUrl: COURSE_COVERS["nextjs-15"] },
    create: {
      organizationId: org.id, title: "Веб хөгжүүлэгч болох зам",
      slug: "web-developer-track",
      description: "Python-с эхлэн React хүртэл бүрэн веб хөгжүүлэгч болох иж бүрэн программ.",
      status: "PUBLISHED", thumbnailUrl: COURSE_COVERS["nextjs-15"],
      publishedAt: daysAgo(30), isOrdered: true,
      certificateTitle: "Бүрэн Стэк Веб Хөгжүүлэгч",
      certificateDescription: "Энэхүү сертификат нь веб хөгжүүлэлтийн иж бүрэн программыг амжилттай дуусгасан болохыг гэрчилнэ.",
    },
  });

  const dataProgram = await prisma.program.upsert({
    where: { slug: "data-science-track" },
    update: { thumbnailUrl: COURSE_COVERS["data-science-python"] },
    create: {
      organizationId: org.id, title: "Дата шинжээч болох зам",
      slug: "data-science-track",
      description: "SQL, Python, Data Science ашиглан дата шинжээч болох бүрэн программ.",
      status: "PUBLISHED", thumbnailUrl: COURSE_COVERS["data-science-python"],
      publishedAt: daysAgo(20), isOrdered: false,
      certificateTitle: "Мэргэшсэн Дата Шинжээч",
      certificateDescription: "Дата шинжлэлийн програмыг амжилттай дуусгасан болохыг гэрчилнэ.",
    },
  });

  const webCourseIds = courses.filter((c) => ["python-beginners", "react-modern", "nextjs-15"].includes(c.slug)).map((c) => c.id);
  for (let i = 0; i < webCourseIds.length; i++) {
    await prisma.programCourse.upsert({
      where: { programId_courseId: { programId: webDevProgram.id, courseId: webCourseIds[i] } },
      update: {},
      create: { programId: webDevProgram.id, courseId: webCourseIds[i], orderIndex: i, isRequired: true },
    });
  }
  const dataCourseIds = courses.filter((c) => ["sql-database", "data-science-python"].includes(c.slug)).map((c) => c.id);
  for (let i = 0; i < dataCourseIds.length; i++) {
    await prisma.programCourse.upsert({
      where: { programId_courseId: { programId: dataProgram.id, courseId: dataCourseIds[i] } },
      update: {},
      create: { programId: dataProgram.id, courseId: dataCourseIds[i], orderIndex: i, isRequired: true },
    });
  }

  // Program enrollments
  let progEnrollCount = 0;
  for (const student of students.slice(0, 8)) {
    try {
      await prisma.programEnrollment.upsert({
        where: { studentId_programId: { studentId: student.id, programId: webDevProgram.id } },
        update: {},
        create: { studentId: student.id, programId: webDevProgram.id, source: "direct" },
      });
      progEnrollCount++;
    } catch { /* skip */ }
  }
  for (const student of students.slice(4, 12)) {
    try {
      await prisma.programEnrollment.upsert({
        where: { studentId_programId: { studentId: student.id, programId: dataProgram.id } },
        update: {},
        create: { studentId: student.id, programId: dataProgram.id, source: "direct" },
      });
      progEnrollCount++;
    } catch { /* skip */ }
  }
  console.log(`✅ 2 программ, ${progEnrollCount} программын бүртгэл`);

  // ── 14. XP LOGS + LEADERBOARD ────────────────────────────────────────────
  const xpActions = ["LESSON_COMPLETE", "QUIZ_PASS", "COURSE_COMPLETE", "STREAK_BONUS", "DAILY_CHALLENGE"] as const;
  for (const student of students) {
    const gain = rndInt(300, 7000);
    await prisma.user.update({ where: { id: student.id }, data: { xp: { increment: gain }, level: { set: Math.max(1, Math.floor(gain / 1000)) } } });
    await prisma.xpLog.createMany({
      data: xpActions.slice(0, rndInt(2, 5)).map((action) => ({
        userId: student.id, action,
        amount: action === "COURSE_COMPLETE" ? 500 : action === "QUIZ_PASS" ? 100 : 50,
        entityId: rnd(courses).id,
        createdAt: daysAgo(rndInt(0, 30)),
      })),
      skipDuplicates: true,
    });
    await prisma.leaderboardEntry.upsert({
      where: { userId: student.id },
      update: { weeklyXp: gain, monthlyXp: gain * 3, totalXp: { increment: gain } },
      create: { userId: student.id, weeklyXp: gain, monthlyXp: gain * 3, totalXp: gain, rank: 0, weeklyRank: 0 },
    });
  }
  // Demo student leaderboard
  await prisma.leaderboardEntry.upsert({
    where: { userId: demoStudent.id },
    update: { weeklyXp: 1250, monthlyXp: 4750, totalXp: 4750 },
    create: { userId: demoStudent.id, weeklyXp: 1250, monthlyXp: 4750, totalXp: 4750, rank: 0 },
  });
  const entries = await prisma.leaderboardEntry.findMany({ orderBy: { totalXp: "desc" } });
  for (let i = 0; i < entries.length; i++) {
    await prisma.leaderboardEntry.update({ where: { id: entries[i].id }, data: { rank: i + 1, weeklyRank: i + 1 } });
  }
  console.log("✅ XP лог + леадербоард (эрэмбэтэй)");

  // ── 15. BADGES ────────────────────────────────────────────────────────────
  const allBadges = ["FIRST_LESSON", "FIRST_COURSE", "STREAK_7", "QUIZ_MASTER", "PERFECT_SCORE"] as const;
  for (const student of students.slice(0, 12)) {
    const count = rndInt(1, 3);
    for (let bi = 0; bi < count; bi++) {
      try {
        await prisma.userBadge.create({ data: { userId: student.id, badge: allBadges[bi] } });
      } catch { /* dup */ }
    }
  }
  // Demo student full badges
  for (const badge of ["FIRST_LESSON", "FIRST_COURSE", "STREAK_7"] as const) {
    try { await prisma.userBadge.create({ data: { userId: demoStudent.id, badge } }); } catch { /* dup */ }
  }
  console.log("✅ Badge-ууд");

  // ── 16. NOTIFICATIONS ────────────────────────────────────────────────────
  const notifTypes = ["ENROLLMENT_SUCCESS", "QUIZ_RESULT", "CERTIFICATE_READY", "COURSE_REMINDER", "PAYMENT_SUCCESS"] as const;
  for (const student of students.slice(0, 18)) {
    await prisma.notification.createMany({
      data: [
        { userId: student.id, type: "ENROLLMENT_SUCCESS", title: "Курст амжилттай бүртгүүллээ!", body: `${rnd(courses).title} курс танд нэмэгдлээ.`, isRead: Math.random() > 0.5, sentAt: daysAgo(rndInt(1, 10)) },
        { userId: student.id, type: "COURSE_REMINDER", title: "Сургалтаа үргэлжлүүлээрэй 📚", body: "7 хоног хичээл үзээгүй байна. Дахиад эхлэх цаг болсон!", isRead: false, sentAt: daysAgo(rndInt(0, 3)) },
      ],
    });
  }
  // Demo student rich notifications
  await prisma.notification.createMany({
    data: [
      { userId: demoStudent.id, type: "CERTIFICATE_READY", title: "Сертификат бэлэн боллоо! 🎉", body: "Python курсийн сертификат руу орж татаж авна уу.", isRead: false, sentAt: daysAgo(2) },
      { userId: demoStudent.id, type: "QUIZ_RESULT", title: "Тестийн дүн: 80%", body: "Python үндэс шалгалтаас 80 оноо авлаа. Амжилттай!", isRead: true, sentAt: daysAgo(3) },
      { userId: demoStudent.id, type: "PAYMENT_SUCCESS", title: "Төлбөр амжилттай", body: "React.js курсийн төлбөр амжилттай хийгдлээ.", isRead: true, sentAt: daysAgo(10) },
      { userId: demoStudent.id, type: "COURSE_REMINDER", title: "Streak-оо хадгалаарай 🔥", body: "Өнөөдөр хичээл үзэж streak-оо тасалдуулахгүй байгаарай!", isRead: false, sentAt: new Date() },
    ],
  });
  console.log("✅ Мэдэгдэл (notification)");

  // ── 17. PAYMENTS ──────────────────────────────────────────────────────────
  for (let i = 0; i < 25; i++) {
    const student = rnd(students);
    const course = rnd(courses);
    await prisma.payment.create({
      data: {
        userId: student.id, amount: course.price, currency: "MNT",
        status: Math.random() < 0.88 ? "COMPLETED" : "FAILED",
        description: `Курс: ${course.title}`,
        createdAt: daysAgo(rndInt(1, 180)),
      },
    });
  }
  // Demo student payments
  await prisma.payment.create({
    data: {
      userId: demoStudent.id, amount: courses[1].price, currency: "MNT",
      status: "COMPLETED", description: `Курс: ${courses[1].title}`,
      createdAt: daysAgo(10),
    },
  });
  console.log("✅ 26 төлбөр");

  // ── 18. ORG PAYOUT ────────────────────────────────────────────────────────
  const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
  const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0);
  await prisma.orgPayout.upsert({
    where: { id: "seed-payout-001" },
    update: {},
    create: {
      id: "seed-payout-001", organizationId: org.id,
      amount: 840000, currency: "MNT", status: "PAID",
      periodStart: lastMonth, periodEnd: lastMonthEnd,
      paidAt: new Date(new Date().getFullYear(), new Date().getMonth(), 5),
      notes: "Сарын тооцоо — өмнөх сар",
    },
  });

  // ── 19. WALLET CREDITS / XP CONVERSIONS ──────────────────────────────────
  for (let i = 0; i < 6; i++) {
    const student = students[i];
    await prisma.user.update({ where: { id: student.id }, data: { xp: { increment: 5000 } } });
    const conv = await prisma.xpConversion.create({ data: { userId: student.id, xpAmount: 2000, creditAmount: 2 } });
    await prisma.walletCredit.create({
      data: {
        userId: student.id, amount: 2, balanceAfter: 2,
        source: "xp_conversion", description: "2000 XP → $2.00 кредит",
        xpConversionId: conv.id,
      },
    });
    await prisma.user.update({ where: { id: student.id }, data: { walletBalance: 2, xpCreditsEarned: 2, xp: { decrement: 2000 } } });
  }
  console.log("✅ Wallet credits / XP conversion");

  // ── 20. COMMENTS ─────────────────────────────────────────────────────────
  const commentTexts = [
    "Энэ хичээл маш ойлгомжтой байлаа. Баярлалаа!",
    "Нэг асуулт байна: next step юу вэ?",
    "Жишээнүүд нь практик, туршиж үзэхэд хялбар байсан.",
    "Энд нэмэлт материал байна уу?",
    "Маш сайн тайлбар! 5 одоор үнэлнэ.",
    "Давтан үзэхэд ч ойлгомжтой байна, гайхалтай!",
    "Энэ concept-ийг хаанаас практик хийж болох вэ?",
  ];

  let commentCount = 0;
  for (const course of courses.slice(0, 5)) {
    const courseLessons = allLessons.filter((l) => l.courseId === course.id);
    for (const lesson of courseLessons.slice(0, 2)) {
      // Root comment
      const rootComment = await prisma.comment.create({
        data: {
          contentType: "LESSON", contentId: lesson.id,
          authorId: rnd(students).id,
          body: rnd(commentTexts),
          createdAt: daysAgo(rndInt(1, 30)),
        },
      });
      commentCount++;

      // Reply
      await prisma.comment.create({
        data: {
          contentType: "LESSON", contentId: lesson.id,
          authorId: rnd(instructors).id,
          body: "Сайн асуулт байна! Дараагийн хичээлд дэлгэрэнгүй тайлбарлана.",
          parentId: rootComment.id,
          createdAt: daysAgo(rndInt(0, 5)),
        },
      });
      commentCount++;
    }
    // Course-level comment
    await prisma.comment.create({
      data: {
        contentType: "COURSE", contentId: course.id,
        authorId: rnd(students).id,
        body: rnd(commentTexts),
        createdAt: daysAgo(rndInt(2, 20)),
      },
    });
    commentCount++;
  }
  console.log(`✅ ${commentCount} сэтгэгдэл (comment)`);

  // ── 21. DIRECT MESSAGES ───────────────────────────────────────────────────
  const msgPairs = [
    [demoStudent.id, instructors[0].id],
    [demoStudent.id, students[0].id],
    [students[1].id, instructors[1].id],
    [students[2].id, demoStudent.id],
  ];
  const msgTexts = [
    "Сайн байна уу? Нэг асуулт байна.",
    "Python-ий for loop-г яаж ашигладаг вэ?",
    "Маш сайн тайлбарласан байна, баярлалаа!",
    "Дараагийн хичээл хэдийд гарах вэ?",
    "Ойлголоо, туршиж үзнэ ✅",
    "Асуудал байвал дахиад асуугаарай.",
    "Сургалт хэр явж байна? 😊",
    "React hooks-ийн жишээ байна уу?",
  ];

  let msgCount = 0;
  for (const [senderId, recipientId] of msgPairs) {
    const count = rndInt(3, 6);
    for (let i = 0; i < count; i++) {
      const isReply = i % 2 !== 0;
      await prisma.directMessage.create({
        data: {
          senderId: isReply ? recipientId : senderId,
          recipientId: isReply ? senderId : recipientId,
          body: rnd(msgTexts),
          isRead: i < count - 1,
          createdAt: daysAgo(rndInt(0, 7)),
        },
      });
      msgCount++;
    }
  }
  console.log(`✅ ${msgCount} шууд мессеж`);

  // ── 22. AI SESSIONS ───────────────────────────────────────────────────────
  const aiSession = await prisma.aiSession.upsert({
    where: { id: "seed-ai-session-demo" },
    update: {},
    create: {
      id: "seed-ai-session-demo", userId: demoStudent.id,
      title: "Python сурах зөвлөгөө",
      courseId: courses[0].id, model: "claude-sonnet-4-6",
    },
  });
  await prisma.aiMessage.createMany({
    data: [
      { sessionId: aiSession.id, role: "USER", content: "Python сурахад хамгийн чухал ойлголт аль нь вэ?", inputTokens: 15, outputTokens: 0, createdAt: daysAgo(5) },
      { sessionId: aiSession.id, role: "ASSISTANT", content: "Python сурахад хамгийн чухал 5 ойлголт:\n\n1. **Хувьсагч ба өгөгдлийн төрөл** — int, str, list, dict\n2. **Control flow** — if/else, for, while\n3. **Функц** — def, return, arguments\n4. **OOP** — class, object, inheritance\n5. **Error handling** — try/except\n\nЭдгээр ойлголтыг эзэмшвэл Python-д бэлэн болсон гэж үзэж болно!", inputTokens: 0, outputTokens: 85, createdAt: daysAgo(5) },
      { sessionId: aiSession.id, role: "USER", content: "OOP-ийн class үүсгэх жишээ үзүүлнэ үү?", inputTokens: 12, outputTokens: 0, createdAt: daysAgo(4) },
      { sessionId: aiSession.id, role: "ASSISTANT", content: "```python\nclass Student:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n    \n    def greet(self):\n        return f'Сайн уу, би {self.name}!'\n\n# Ашиглах жишээ\ns = Student('Батбаяр', 20)\nprint(s.greet())\n```\n\nClass нь template, object нь instance. `__init__` нь constructor функц.", inputTokens: 0, outputTokens: 95, createdAt: daysAgo(4) },
    ],
    skipDuplicates: true,
  });

  // Second AI session for another student
  const aiSession2 = await prisma.aiSession.upsert({
    where: { id: "seed-ai-session-002" },
    update: {},
    create: {
      id: "seed-ai-session-002", userId: students[0].id,
      title: "React Hooks тайлбар", courseId: courses[1].id, model: "claude-sonnet-4-6",
    },
  });
  await prisma.aiMessage.createMany({
    data: [
      { sessionId: aiSession2.id, role: "USER", content: "useState болон useEffect хоёрын ялгаа юу вэ?", inputTokens: 16, outputTokens: 0, createdAt: daysAgo(2) },
      { sessionId: aiSession2.id, role: "ASSISTANT", content: "**useState** — компонентийн state (өгөгдөл) хадгалах\n**useEffect** — side effect (fetch, timer) удирдах\n\nЭнгийн дүрэм: тооцоологдсон зүйл → useState, гадны үйлдэл → useEffect.", inputTokens: 0, outputTokens: 60, createdAt: daysAgo(2) },
    ],
    skipDuplicates: true,
  });
  console.log("✅ AI session + message");

  // ── 23. CAPSTONES ─────────────────────────────────────────────────────────
  const capstone = await prisma.capstone.upsert({
    where: { id: "seed-capstone-demo-001" },
    update: {},
    create: {
      id: "seed-capstone-demo-001",
      courseId: courses[0].id, studentId: demoStudent.id,
      title: "Миний анхны Python төсөл — Тооцоолуур",
      description: "Python ашиглан командын мөрт тооцоолуур хөгжүүлсэн. OOP зарчим хэрэгжүүлсэн.",
      submissionUrl: "https://github.com/demo/python-calculator",
      fileUrls: [],
      status: "GRADED", score: 88,
      feedback: "Маш сайн бүтэц! OOP-ийг зөв хэрэгжүүлсэн байна. Error handling нэмж болох байсан.",
      submittedAt: daysAgo(8), gradedAt: daysAgo(5),
    },
  });

  await prisma.capstone.upsert({
    where: { id: "seed-capstone-002" },
    update: {},
    create: {
      id: "seed-capstone-002",
      courseId: courses[1].id, studentId: students[0].id,
      title: "React Todo App + Firebase",
      description: "React Hooks, Firebase Realtime DB ашиглан Todo апп хийсэн.",
      submissionUrl: "https://github.com/demo/react-todo",
      fileUrls: [],
      status: "SUBMITTED",
      submittedAt: daysAgo(3),
    },
  });

  // Capstone review
  await prisma.capstoneReview.upsert({
    where: { capstoneId_reviewerId: { capstoneId: capstone.id, reviewerId: instructors[0].id } },
    update: {},
    create: {
      capstoneId: capstone.id, reviewerId: instructors[0].id,
      score: 88, feedback: "Сайн хийсэн. Code structure тодорхой, readability өндөр.",
      rubricScores: { structure: 90, functionality: 85, documentation: 88 },
      isCompleted: true, completedAt: daysAgo(5),
    },
  });
  console.log("✅ 2 capstone + 1 peer review");

  // ── 24. TODOS (admin) ─────────────────────────────────────────────────────
  await prisma.todoItem.createMany({
    data: [
      { userId: admin.id, title: "Шинэ курсүүдийг review хийх", priority: "HIGH", isCompleted: false, dueDate: new Date(Date.now() + 2 * 24 * 3600000), orderIndex: 0 },
      { userId: admin.id, title: "Q3 аналитик тайлан бэлдэх", priority: "MEDIUM", isCompleted: false, dueDate: new Date(Date.now() + 7 * 24 * 3600000), orderIndex: 1 },
      { userId: admin.id, title: "Tech Academy-тай уулзалт", priority: "HIGH", isCompleted: true, completedAt: daysAgo(1), orderIndex: 2 },
      { userId: admin.id, title: "Шинэ instructor-уудыг verified болгох", priority: "MEDIUM", isCompleted: false, orderIndex: 3 },
      { userId: admin.id, title: "Платформын performance шалгах", priority: "LOW", isCompleted: false, orderIndex: 4 },
    ],
  });
  console.log("✅ 5 Todo item");

  // ── 25. DAILY CHALLENGES (7 хоnog) ────────────────────────────────────────
  const challengeQs = [
    { q: "HTTP болон HTTPS хоёрын ялгаа юу вэ?", opts: ["Хурд", "Аюулгүй байдал", "Хаяг", "Дэлгэц"], correct: 1 },
    { q: "SQL-д SELECT хийхдээ ашигладаг keyword?", opts: ["GET", "FETCH", "SELECT", "READ"], correct: 2 },
    { q: "React-д state өөрчлөхдөө юу ашигладаг вэ?", opts: ["setState", "useState", "updateState", "changeState"], correct: 1 },
    { q: "Python-д 'list' нь ямар өгөгдлийн бүтэц вэ?", opts: ["Ordered, mutable", "Ordered, immutable", "Unordered, mutable", "Unordered, immutable"], correct: 0 },
    { q: "Git-д өөрчлөлт хадгалах команд аль нь вэ?", opts: ["git save", "git push", "git commit", "git store"], correct: 2 },
    { q: "CSS-д flex container-ийн default direction?", opts: ["column", "row", "row-reverse", "column-reverse"], correct: 1 },
    { q: "JSON-д array нь ямар тэмдэгтэд ороосон байдаг?", opts: ["{}", "[]", "()", "<>"], correct: 1 },
  ];

  for (let d = 0; d < challengeQs.length; d++) {
    const date = new Date(); date.setDate(date.getDate() - d); date.setHours(0, 0, 0, 0);
    const cq = challengeQs[d];
    try {
      await prisma.dailyChallenge.upsert({
        where: { date },
        update: {},
        create: {
          question: cq.q, options: cq.opts,
          correctIdx: cq.correct, xpReward: 25 + d * 5, date,
        },
      });
    } catch { /* dup */ }
  }

  // Demo student completed today's challenge
  const todayChallenge = await prisma.dailyChallenge.findFirst({ where: { date: (() => { const d = new Date(); d.setHours(0,0,0,0); return d; })() } });
  if (todayChallenge) {
    await prisma.dailyChallengeCompletion.upsert({
      where: { userId_challengeId: { userId: demoStudent.id, challengeId: todayChallenge.id } },
      update: {},
      create: { userId: demoStudent.id, challengeId: todayChallenge.id, isCorrect: true },
    });
  }
  console.log("✅ 7 өдрийн daily challenge");

  // ── 26. AUDIT LOGS ────────────────────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      { userId: admin.id, action: "USER_CREATED", entity: "User", entityId: demoStudent.id, newData: { email: demoStudent.email }, createdAt: daysAgo(20) },
      { userId: admin.id, action: "COURSE_PUBLISHED", entity: "Course", entityId: courses[0].id, newData: { status: "PUBLISHED" }, createdAt: daysAgo(15) },
      { userId: admin.id, action: "ORG_CREATED", entity: "Organization", entityId: org.id, newData: { name: org.name }, createdAt: daysAgo(60) },
      { userId: orgOwner.id, action: "COURSE_CREATED", entity: "Course", entityId: courses[3].id, newData: { title: courses[3].title }, createdAt: daysAgo(30) },
      { userId: demoStudent.id, action: "ENROLLMENT_CREATED", entity: "Enrollment", entityId: courses[0].id, createdAt: daysAgo(12) },
    ],
  });
  console.log("✅ Audit log");

  // ── 27. REACTIONS ─────────────────────────────────────────────────────────
  const comments = await prisma.comment.findMany({ take: 10 });
  for (const comment of comments.slice(0, 6)) {
    for (const student of students.slice(0, 3)) {
      try {
        await prisma.reaction.create({
          data: {
            contentType: "COMMENT", contentId: comment.id,
            userId: student.id, emoji: rnd(["👍", "❤️", "🔥", "💡"]),
          },
        });
      } catch { /* dup */ }
    }
  }
  console.log("✅ Reaction");

  // ── 28. COUPON ────────────────────────────────────────────────────────────
  await prisma.coupon.upsert({
    where: { code: "EDUNITY2025" },
    update: {},
    create: {
      code: "EDUNITY2025", discountType: "percentage", discountValue: 20,
      maxUses: 100, validFrom: daysAgo(30),
      validUntil: new Date(Date.now() + 60 * 24 * 3600000), isActive: true,
    },
  });
  await prisma.coupon.upsert({
    where: { code: "WELCOME50" },
    update: {},
    create: {
      code: "WELCOME50", discountType: "percentage", discountValue: 50,
      maxUses: 50, validFrom: daysAgo(10),
      validUntil: new Date(Date.now() + 20 * 24 * 3600000), isActive: true,
    },
  });
  console.log("✅ 2 купон");

  // ─── SUMMARY ─────────────────────────────────────────────────────────────
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 Seed бүрэн амжилттай дууссан!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📧 Нэвтрэх мэдээлэл:");
  console.log("   Super Admin:  admin@elearn.mn          / Admin@1234");
  console.log("   Org Admin 1:  ceo@techacademy.mn       / Student@1234");
  console.log("   Org Admin 2:  ceo@designstudio.mn      / Student@1234");
  console.log("   Instructor 1: batbayar@elearn.mn       / Student@1234");
  console.log("   Instructor 2: oyun@elearn.mn           / Student@1234");
  console.log("   Instructor 3: temuulen@elearn.mn       / Student@1234");
  console.log("   Demo Student: student@elearn.mn        / Student@1234");
  console.log("   Student N:    student1@elearn.mn …     / Student@1234");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 Нийт seed data:");
  console.log("   7 категори | 8 курс | 3 багш | 26 оюутан");
  console.log("   2 байгууллага | 2 программ | 5 quiz question");
  console.log("   Comments, Messages, AI sessions, Capstones");
  console.log("   Todos, Notifications, Badges, Leaderboard");
  console.log("   Daily Challenges, Reactions, Coupons, Audit logs");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
