"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuroraBackground } from "@/components/layout/aurora-background";
import { Loader2, DollarSign, Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface VenueCommission {
  venueId: string;
  venueName: string;
  totalTips: number;
  platformFee: number;
  transactionCount: number;
}

interface CommissionReport {
  period: string;
  totalTips: number;
  totalPlatformFee: number;
  totalTransactions: number;
  venues: VenueCommission[];
}

const PLATFORM_FEE_PERCENT = 5;

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Generate available periods (last 12 weeks)
function getAvailablePeriods() {
  const periods = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const end = new Date(now);
    end.setDate(end.getDate() - i * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);

    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];

    periods.push({
      value: `${startStr}_${endStr}`,
      label: `${start.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      })} – ${end.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      })}`,
    });
  }

  return periods;
}

export default function AdminCommissionsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CommissionReport | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(
    getAvailablePeriods()[0].value
  );

  const availablePeriods = getAvailablePeriods();

  const fetchCommissions = useCallback(async () => {
    setLoading(true);
    try {
      const [start, end] = selectedPeriod.split("_");
      const res = await fetch(
        `/api/admin/commissions?start=${start}&end=${end}`
      );
      if (res.ok) {
        const result = await res.json();
        setData(result);
      } else {
        // Mock data for development
        setData(generateMockData(selectedPeriod));
      }
    } catch {
      setData(generateMockData(selectedPeriod));
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]); // Add selectedPeriod to useCallback dependencies

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]); // Add fetchCommissions to useEffect dependencies

  function generateMockData(period: string): CommissionReport {
    const venues: VenueCommission[] = [
      {
        venueId: "v1",
        venueName: "Cafe Organic Canggu",
        totalTips: 12500000,
        platformFee: 625000,
        transactionCount: 342,
      },
      {
        venueId: "v2",
        venueName: "Beach Club Seminyak",
        totalTips: 8750000,
        platformFee: 437500,
        transactionCount: 215,
      },
      {
        venueId: "v3",
        venueName: "Warung Ubud",
        totalTips: 4200000,
        platformFee: 210000,
        transactionCount: 156,
      },
    ];

    return {
      period,
      totalTips: venues.reduce((sum, v) => sum + v.totalTips, 0),
      totalPlatformFee: venues.reduce((sum, v) => sum + v.platformFee, 0),
      totalTransactions: venues.reduce((sum, v) => sum + v.transactionCount, 0),
      venues,
    };
  }

  return (
    <AuroraBackground>
      <div className="min-h-screen p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              href="/admin"
              className="inline-flex items-center text-muted-foreground hover:text-white mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-heading font-bold text-white mb-2">
              Platform Commissions
            </h1>
            <p className="text-muted-foreground">
              Revenue report by venue ({PLATFORM_FEE_PERCENT}% platform fee)
            </p>
          </motion.div>

          {/* Period Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-64 glass">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availablePeriods.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : data ? (
            <>
              {/* Summary Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
              >
                <Card className="glass p-6">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm">Total Tips Volume</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(data.totalTips)}
                  </div>
                </Card>

                <Card className="glass p-6 border-primary/30">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-sm">Platform Revenue (5%)</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(data.totalPlatformFee)}
                  </div>
                </Card>

                <Card className="glass p-6">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Building2 className="h-4 w-4" />
                    <span className="text-sm">Total Transactions</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {data.totalTransactions.toLocaleString()}
                  </div>
                </Card>
              </motion.div>

              {/* Venues Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="glass overflow-hidden">
                  <div className="p-4 border-b border-white/10">
                    <h2 className="font-heading font-semibold">
                      Commission by Venue
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10 text-left text-sm text-muted-foreground">
                          <th className="p-4">Venue</th>
                          <th className="p-4 text-right">Transactions</th>
                          <th className="p-4 text-right">Tips Volume</th>
                          <th className="p-4 text-right">Platform Fee (5%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.venues.map((venue) => (
                          <tr
                            key={venue.venueId}
                            className="border-b border-white/5 hover:bg-white/5"
                          >
                            <td className="p-4 font-medium">{venue.venueName}</td>
                            <td className="p-4 text-right text-muted-foreground">
                              {venue.transactionCount}
                            </td>
                            <td className="p-4 text-right">
                              {formatCurrency(venue.totalTips)}
                            </td>
                            <td className="p-4 text-right text-primary font-semibold">
                              {formatCurrency(venue.platformFee)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-white/5 font-semibold">
                          <td className="p-4">Total</td>
                          <td className="p-4 text-right">
                            {data.totalTransactions}
                          </td>
                          <td className="p-4 text-right">
                            {formatCurrency(data.totalTips)}
                          </td>
                          <td className="p-4 text-right text-primary">
                            {formatCurrency(data.totalPlatformFee)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </Card>
              </motion.div>

              {/* Note */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-muted-foreground mt-6 text-center"
              >
                Platform fee is calculated per period and billed separately to
                each venue.
              </motion.p>
            </>
          ) : null}
        </div>
      </div>
    </AuroraBackground>
  );
}
