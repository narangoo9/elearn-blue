import { existsSync, readFileSync } from "node:fs";
import process from "node:process";

const env = { ...process.env };

for (const file of [".env", ".env.production.local"]) {
  if (!existsSync(file)) continue;
  const contents = readFileSync(file, "utf8");
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    const value = rawValue.replace(/\s+#.*$/, "").replace(/^["']|["']$/g, "");
    if (env[key] === undefined) env[key] = value;
  }
}

function value(key) {
  return env[key]?.trim() ?? "";
}

function present(key) {
  const v = value(key);
  return Boolean(v) && !["changeme", "your_", "TODO", "undefined", "null"].some((bad) => v.includes(bad));
}

const failures = [];
const warnings = [];

function requireOne(label, keys) {
  if (!keys.some(present)) failures.push(`${label}: missing one of ${keys.join(", ")}`);
}

function requireKey(key, label = key) {
  if (!present(key)) failures.push(`${label}: ${key} is missing or empty`);
}

requireKey("DATABASE_URL", "Database");
requireOne("Auth secret", ["AUTH_SECRET", "NEXTAUTH_SECRET"]);
requireOne("Auth URL", ["AUTH_URL", "NEXTAUTH_URL"]);
requireKey("NEXT_PUBLIC_APP_URL", "Public app URL");
requireKey("REDIS_URL", "Redis/cache and rate limit");
requireKey("STRIPE_SECRET_KEY", "Stripe secret key");
requireKey("STRIPE_WEBHOOK_SECRET", "Stripe webhook secret");
requireOne("Stripe publishable key", ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "STRIPE_PUBLISHABLE_KEY"]);
requireOne("Stripe Premium monthly price", ["STRIPE_PREMIUM_MONTHLY_PRICE_ID", "STRIPE_STUDENT_MONTHLY_PRICE_ID"]);
requireOne("Stripe Premium yearly price", ["STRIPE_PREMIUM_YEARLY_PRICE_ID", "STRIPE_STUDENT_YEARLY_PRICE_ID"]);
requireOne("Stripe Pro monthly price", ["STRIPE_PRO_MONTHLY_PRICE_ID", "STRIPE_INSTRUCTOR_MONTHLY_PRICE_ID"]);
requireOne("Stripe Pro yearly price", ["STRIPE_PRO_YEARLY_PRICE_ID", "STRIPE_INSTRUCTOR_YEARLY_PRICE_ID"]);
requireKey("CLOUDINARY_CLOUD_NAME", "Cloudinary cloud name");
requireKey("CLOUDINARY_API_KEY", "Cloudinary API key");
requireKey("CLOUDINARY_API_SECRET", "Cloudinary API secret");
requireOne("Email provider", ["RESEND_API_KEY", "SMTP_HOST"]);
requireKey("ANTHROPIC_API_KEY", "Real AI assistant");

for (const urlKey of ["AUTH_URL", "NEXTAUTH_URL", "NEXT_PUBLIC_APP_URL"]) {
  const v = value(urlKey);
  if (v.includes("localhost") || v.includes("127.0.0.1")) {
    warnings.push(`${urlKey} points to localhost; set it to the production domain before deploy.`);
  }
}

if (present("SMTP_HOST") && (!present("SMTP_USER") || !present("SMTP_PASSWORD"))) {
  warnings.push("SMTP_HOST is set but SMTP_USER/SMTP_PASSWORD is incomplete. Email may fail unless RESEND_API_KEY is used.");
}

if (failures.length > 0) {
  console.error("Production validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  if (warnings.length > 0) {
    console.error("\nWarnings:");
    for (const warning of warnings) console.error(`- ${warning}`);
  }
  process.exit(1);
}

console.log("Production validation passed.");
if (warnings.length > 0) {
  console.warn("Warnings:");
  for (const warning of warnings) console.warn(`- ${warning}`);
}
