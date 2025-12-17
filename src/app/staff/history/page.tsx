"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuroraBackground } from "@/components/layout/aurora-background";
import { useTranslations } from "@/i18n/client";
import { Loader2, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

interface TipsByDay {
  date: string;
  tipsCount: number;
  amount: number;
}

interface Period {
  id: string;
  periodStart: string;
  periodEnd: string;
  totalAmount: number;
  status: "PENDING" | "PAID";
  paidAt: string | null;
  tipsByDay: TipsByDay[];
}

interface HistoryData {
  periods: Period[];
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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { 
    weekday: "short",
    day: "numeric", 
    month: "short" 
  });
}

export default function StaffHistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<HistoryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [periodFilter, setPeriodFilter] = useState("3months");
  const [expandedPeriod, setExpandedPeriod] = useState<string | null>(null);
  const t = useTranslations('staff.history');
  const tc = useTranslations('common');

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/staff/history?period=${periodFilter}`);
      if (res.status === 401) {
        router.push("/staff/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to load history");
      const data = await res.json();
      setData(data);
    } catch {
      setError("Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [periodFilter, router]); // Add periodFilter and router to useCallback dependencies

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AuroraBackground />
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <AuroraBackground />
      
      {/* Header */}
      <header className="p-4 pt-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/staff/dashboard")}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('back')}
        </Button>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </header>

      <main className="px-4 space-y-4">
        {/* Filter */}
        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="w-full bg-white/5 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">{t('lastMonth')}</SelectItem>
            <SelectItem value="3months">{t('last3Months')}</SelectItem>
            <SelectItem value="6months">{t('last6Months')}</SelectItem>
          </SelectContent>
        </Select>

        {error ? (
          <Card className="glass p-6 text-center">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => fetchHistory()} className="mt-4">
              {tc('retry')}
            </Button>
          </Card>
        ) : data?.periods.length === 0 ? (
          <Card className="glass p-6 text-center">
            <p className="text-muted-foreground">{t('noHistory')}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {data?.periods.map((period) => (
              <Card key={period.id} className="glass overflow-hidden">
                <button
                  onClick={() => setExpandedPeriod(
                    expandedPeriod === period.id ? null : period.id
                  )}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div>
                    <div className="font-medium">
                      {formatDateRange(period.periodStart, period.periodEnd)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total tips: {formatCurrency(period.totalAmount)}
                    </div>
                    <div className={`text-xs mt-1 ${
                      period.status === "PAID" 
                        ? "text-green-400" 
                        : "text-yellow-400"
                    }`}>
                      {period.status === "PAID" 
                        ? `Paid on ${new Date(period.paidAt!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                        : "Pending payout"
                      }
                    </div>
                  </div>
                  {expandedPeriod === period.id ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>

                {expandedPeriod === period.id && (
                  <div className="border-t border-white/10 p-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-muted-foreground">
                          <th className="text-left pb-2">Date</th>
                          <th className="text-center pb-2">Tips</th>
                          <th className="text-right pb-2">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {period.tipsByDay.map((day) => (
                          <tr key={day.date} className="border-t border-white/5">
                            <td className="py-2">{formatDate(day.date)}</td>
                            <td className="py-2 text-center">{day.tipsCount}</td>
                            <td className="py-2 text-right">{formatCurrency(day.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
