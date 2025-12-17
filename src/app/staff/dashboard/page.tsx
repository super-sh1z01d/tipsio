"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/layout/aurora-background";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslations } from "@/i18n/client";
import { 
  Loader2, 
  Calendar, 
  ChevronRight,
  Wallet,
  Clock
} from "lucide-react";

interface DashboardData {
  staff: {
    id: string;
    displayName: string;
  };
  currentPeriod: {
    amount: number;
    tipsCount: number;
    startDate: string;
  };
  today: {
    amount: number;
    tipsCount: number;
  };
  recentPayouts: Array<{
    id: string;
    periodStart: string;
    periodEnd: string;
    amount: number;
    status: "PENDING" | "PAID";
    paidAt: string | null;
  }>;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return `${startDate.toLocaleDateString("en-US", options)} – ${endDate.toLocaleDateString("en-US", options)}`;
}

export default function StaffDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('staff.dashboard');
  const tc = useTranslations('common');

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/staff/dashboard");
      if (res.status === 401) {
        router.push("/staff/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to load dashboard");
      const data = await res.json();
      setData(data);
    } catch {
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [router]); // router is a stable reference, but for completeness add it.

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AuroraBackground />
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <AuroraBackground />
        <Card className="glass p-6 text-center">
          <p className="text-muted-foreground">{error || tc('error')}</p>
          <Button onClick={() => fetchDashboard()} className="mt-4">
            {tc('retry')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <AuroraBackground />
      
      {/* Language Switcher */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      
      {/* Header */}
      <header className="p-4 pt-8">
        <h1 className="text-2xl font-bold">{t('greeting', { name: data.staff.displayName })}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </header>

      <main className="px-4 space-y-6">
        {/* Balance Card */}
        <Card className="glass p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Wallet className="h-4 w-4" />
            <span className="text-sm">{t('currentPeriod')}</span>
          </div>
          <div className="text-4xl font-bold text-primary mb-2">
            {formatCurrency(data.currentPeriod.amount)}
          </div>
          <p className="text-sm text-muted-foreground">
            {t('tipsSince', { 
              count: data.currentPeriod.tipsCount, 
              date: new Date(data.currentPeriod.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) 
            })}
          </p>
        </Card>

        {/* Today's Activity */}
        <Card className="glass p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">{t('todayPerformance')}</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{data.today.tipsCount}</div>
              <div className="text-sm text-muted-foreground">{t('tipsReceived')}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{formatCurrency(data.today.amount)}</div>
              <div className="text-sm text-muted-foreground">{t('total')}</div>
            </div>
          </div>
        </Card>

        {/* Recent Payouts */}
        <Card className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">{t('lastPayouts')}</h2>
            </div>
          </div>
          
          {data.recentPayouts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('noPayoutsYet')}
            </p>
          ) : (
            <div className="space-y-3">
              {data.recentPayouts.map((payout) => (
                <div
                  key={payout.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
                >
                  <div>
                    <div className="font-medium">
                      {formatDateRange(payout.periodStart, payout.periodEnd)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(payout.amount)}
                    </div>
                  </div>
                  <div className={`text-sm px-2 py-1 rounded-full ${
                    payout.status === "PAID" 
                      ? "bg-green-500/20 text-green-400" 
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {payout.status === "PAID" ? `${t('paid')} ✅` : `${t('pending')} ⏳`}
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={() => router.push("/staff/history")}
          >
            {t('seeFullHistory')}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Card>
      </main>
    </div>
  );
}
