"use client";

import { useState } from "react";
import Link from "next/link";
import { Crown, CreditCard, ArrowRight, AlertTriangle, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface SubscriptionInfo {
  plan: string;
  status: string;
  currentPeriodEnd: Date | null;
}

const PLAN_LABELS: Record<string, string> = {
  FREE: "Үнэгүй",
  STUDENT: "Оюутан",
  PREMIUM: "Premium",
  PRO: "Pro",
  INSTRUCTOR: "Багш",
  ORGANIZATION: "Байгууллага",
  ENTERPRISE: "Enterprise",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Идэвхтэй", color: "text-emerald-600" },
  CANCELLED: { label: "Цуцлагдсан", color: "text-red-500" },
  EXPIRED: { label: "Хугацаа дууссан", color: "text-amber-600" },
  PAST_DUE: { label: "Төлбөр хоцорсон", color: "text-red-500" },
  TRIALING: { label: "Туршилтын хугацаа", color: "text-violet-600" },
};

export function SubscriptionSection({ subscription }: { subscription: SubscriptionInfo | null }) {
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = subscription?.plan ?? "FREE";
  const status = subscription?.status ?? "ACTIVE";
  const isFree = plan === "FREE";
  const isCancelled = status === "CANCELLED" || cancelled;
  const planLabel = PLAN_LABELS[plan] ?? plan;
  const statusInfo = STATUS_LABELS[status] ?? { label: status, color: "text-muted-foreground" };

  async function handleCancel() {
    if (!confirm("Захиалгаа цуцлахдаа итгэлтэй байна уу? Хугацаа дуустал хандах боломжтой хэвээр байна.")) return;

    setCancelling(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/payments/cancel", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error ?? "Алдаа гарлаа");
      } else {
        setCancelled(true);
      }
    } catch {
      setError("Сүлжээний алдаа гарлаа");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[#E9DFFF] bg-white p-6" style={{ boxShadow: "var(--shadow-1)" }}>
      <div className="flex items-center justify-between gap-2.5 mb-5 pb-4 border-b border-[#E9DFFF]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
            <CreditCard size={16} className="text-amber-600" />
          </div>
          <div>
            <h2 className="font-black text-[#111827]">Захиалга</h2>
            <p className="text-[11px] text-[#6B7280]">Одоогийн тарифийн мэдээлэл</p>
          </div>
        </div>
        {!isFree && !isCancelled && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 text-[11px] font-bold">
            <Crown size={11} />
            {planLabel}
          </span>
        )}
      </div>

      <div className="rounded-xl border border-[#E9DFFF] bg-[#F7F4FF] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#6B7280]">Тарифийн төлөвлөгөө</span>
          <span className="text-[13px] font-bold text-[#111827]">{planLabel}</span>
        </div>
        {!isFree && (
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[#6B7280]">Төлөв</span>
            <span className={`text-[13px] font-bold flex items-center gap-1 ${statusInfo.color}`}>
              {isCancelled ? (
                <><XCircle size={13} /> Цуцлагдсан</>
              ) : status === "ACTIVE" ? (
                <><CheckCircle2 size={13} /> Идэвхтэй</>
              ) : (
                statusInfo.label
              )}
            </span>
          </div>
        )}
        {subscription?.currentPeriodEnd && !isFree && (
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[#6B7280]">{isCancelled ? "Хандах хугацаа дуусах" : "Дараагийн төлбөр"}</span>
            <span className="text-[13px] font-bold text-[#111827]">
              {subscription.currentPeriodEnd.toLocaleDateString("mn-MN")}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-[12px] text-red-600">
          <AlertTriangle size={13} />
          {error}
        </div>
      )}

      {isCancelled && !isFree && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-2.5 text-[12px] text-amber-700">
          <AlertTriangle size={13} />
          Захиалга цуцлагдлаа. Хугацаа дуустал хандах боломжтой.
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {isFree ? (
          <Link
            href="/student/upgrade"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-[12px] font-bold rounded-xl transition-colors"
          >
            <Crown size={13} /> Upgrade хийх <ArrowRight size={12} />
          </Link>
        ) : (
          <>
            {!isCancelled && (
              <>
                <Link
                  href="/student/upgrade"
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 text-[12px] font-bold rounded-xl transition-colors"
                >
                  <Crown size={13} /> Тарифаа дээшлүүлэх
                </Link>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-[12px] font-bold rounded-xl transition-colors disabled:opacity-60"
                >
                  {cancelling ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                  {cancelling ? "Цуцалж байна..." : "Захиалга цуцлах"}
                </button>
              </>
            )}
            {isCancelled && (
              <Link
                href="/student/upgrade"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-[12px] font-bold rounded-xl transition-colors"
              >
                <Crown size={13} /> Дахин захиалах <ArrowRight size={12} />
              </Link>
            )}
          </>
        )}
      </div>
    </section>
  );
}
