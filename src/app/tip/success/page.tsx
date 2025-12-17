"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslations } from "@/i18n/client";
import { CheckCircle2, Loader2, Heart } from "lucide-react";

interface TipDetails {
  amount: number;
  staffName: string | null;
  venueName: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function TipSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const t = useTranslations("guest.success");

  const [loading, setLoading] = useState(true);
  const [tipDetails, setTipDetails] = useState<TipDetails | null>(null);

  const fetchTipDetails = useCallback(async () => {
    try {
      const res = await fetch(`/api/tips/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setTipDetails(data);
      }
    } catch (error) {
      console.error("Failed to fetch tip details:", error);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchTipDetails();
    } else {
      setLoading(false);
    }
  }, [orderId, fetchTipDetails]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="px-4 py-3 flex justify-end">
        <LanguageSwitcher />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        {/* Success Animation */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center ring-4 ring-green-500/20">
            <CheckCircle2 className="w-14 h-14 text-green-400" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
        </div>

        {/* Content */}
        <h1 className="text-2xl font-bold mb-2 text-center">{t("title")}</h1>
        <p className="text-slate-400 text-center mb-6 max-w-xs">
          {t("subtitle")}
        </p>

        {/* Details Card */}
        {tipDetails && (
          <div className="w-full max-w-xs rounded-xl bg-white/5 border border-white/10 p-4 mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-400 text-sm">{t("amount")}</span>
              <span className="text-xl font-bold text-cyan-400">
                {formatCurrency(tipDetails.amount)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-white/10">
              <span className="text-slate-400 text-sm">{t("to")}</span>
              <span className="font-medium">
                {tipDetails.staffName || t("theTeam")}
              </span>
            </div>
          </div>
        )}

        <p className="text-sm text-slate-500 text-center max-w-xs mb-8">
          {t("message")}
        </p>

        {/* Close Button */}
        <Button
          variant="outline"
          className="w-full max-w-xs border-white/10 bg-white/5 hover:bg-white/10"
          onClick={() => window.close()}
        >
          {t("close")}
        </Button>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center">
        <p className="text-[10px] text-slate-600">Powered by Tipsio</p>
      </footer>
    </div>
  );
}
