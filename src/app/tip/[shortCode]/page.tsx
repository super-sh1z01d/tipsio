"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslations } from "@/i18n/client";

import { Loader2, User, Users, Heart, ChevronRight } from "lucide-react";

interface Staff {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
}

interface QrData {
  id: string;
  type: "PERSONAL" | "TABLE" | "VENUE";
  label: string | null;
  venue: {
    id: string;
    name: string;
    logoUrl: string | null;
    distributionMode: "PERSONAL" | "POOLED";
    allowStaffChoice: boolean;
  };
  staff: Staff | null;
  availableStaff: Staff[];
}

const AMOUNT_PRESETS = [10000, 20000, 50000, 100000];
const PLATFORM_FEE_PERCENT = 5;

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatShortAmount(amount: number): string {
  if (amount >= 1000) {
    return `${amount / 1000}k`;
  }
  return amount.toString();
}

export default function TipPage() {
  const params = useParams();
  const shortCode = params.shortCode as string;
  const t = useTranslations("guest.tip");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrData, setQrData] = useState<QrData | null>(null);

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [coverFee, setCoverFee] = useState(false);
  const [tipTarget, setTipTarget] = useState<"pool" | "staff">("pool");
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchQrData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tip/${shortCode}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("This QR code is not valid or has been deactivated.");
        } else {
          setError("Something went wrong. Please try again.");
        }
        return;
      }
      const data = await res.json();
      setQrData(data);

      if (data.type === "PERSONAL" && data.staff) {
        setTipTarget("staff");
        setSelectedStaffId(data.staff.id);
      }
    } catch {
      setError("Failed to load. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [shortCode]); // Add shortCode to useCallback dependencies

  useEffect(() => {
    fetchQrData();
  }, [fetchQrData]);

  const finalAmount =
    selectedAmount || (customAmount ? parseInt(customAmount) : 0);
  const platformFee = Math.ceil(finalAmount * (PLATFORM_FEE_PERCENT / 100));
  const totalAmount = coverFee ? finalAmount + platformFee : finalAmount;

  const isPersonalQr = qrData?.type === "PERSONAL";
  const isPersonalDistribution = qrData?.venue.distributionMode === "PERSONAL";
  // Show staff selection for non-personal QR codes when distribution is PERSONAL or allowStaffChoice is enabled
  const showStaffChoice =
    !isPersonalQr &&
    (isPersonalDistribution || qrData?.venue.allowStaffChoice) &&
    qrData?.availableStaff &&
    qrData.availableStaff.length > 0;
  // In PERSONAL distribution mode, pool option is not available - must select a staff member
  const allowPoolOption = !isPersonalDistribution && qrData?.venue.allowStaffChoice;
  const targetStaff = isPersonalQr
    ? qrData?.staff
    : tipTarget === "staff"
      ? qrData?.availableStaff.find((s) => s.id === selectedStaffId)
      : null;

  // For PERSONAL distribution, auto-set tipTarget to "staff"
  useEffect(() => {
    if (isPersonalDistribution && !isPersonalQr) {
      setTipTarget("staff");
    }
  }, [isPersonalDistribution, isPersonalQr]);

  async function handleSubmit() {
    if (!finalAmount || finalAmount < 1000) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCodeId: qrData?.id,
          amount: finalAmount,
          guestPaidFee: coverFee,
          staffId: tipTarget === "staff" ? selectedStaffId : null,
          type: tipTarget === "pool" ? "POOL" : "PERSONAL",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create payment");
      }

      const { snapToken, redirectUrl } = await res.json();

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else if (snapToken && window.snap) {
        window.snap.pay(snapToken);
      }
    } catch {
      setError("Failed to process payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (error || !qrData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-white/5 backdrop-blur border-white/10 p-6 text-center max-w-sm">
          <h1 className="text-xl font-semibold mb-2 text-white">Oops!</h1>
          <p className="text-slate-400">{error || "QR code not found"}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Compact Header */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          {qrData.venue.logoUrl ? (
            <Image
              src={qrData.venue.logoUrl}
              alt={qrData.venue.name}
              width={32}
              height={32}
              className="rounded-lg"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <span className="text-cyan-400 font-bold text-sm">
                {qrData.venue.name.charAt(0)}
              </span>
            </div>
          )}
          <span className="font-medium text-sm text-slate-200">
            {qrData.venue.name}
          </span>
        </div>
        <LanguageSwitcher />
      </header>

      {/* Main Content */}
      <main className="px-4 pt-6 pb-32">
        {/* Hero - Compact */}
        <div className="text-center mb-6">
          {isPersonalQr && qrData.staff ? (
            <>
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center ring-2 ring-cyan-500/20 overflow-hidden">
                {qrData.staff.avatarUrl ? (
                  <Image
                    src={qrData.staff.avatarUrl}
                    alt={qrData.staff.displayName}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-cyan-400" />
                )}
              </div>
              <h1 className="text-xl font-bold mb-1">
                {t("title", { name: qrData.staff.displayName })}
              </h1>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center ring-2 ring-cyan-500/20">
                <Heart className="w-8 h-8 text-cyan-400" />
              </div>
              <h1 className="text-xl font-bold mb-1">
                {t("titleTeam", { venue: qrData.venue.name })}
              </h1>
            </>
          )}
          <p className="text-sm text-slate-400">
            {isPersonalQr ? t("subtitle") : t("subtitleTeam")}
          </p>
        </div>

        {/* Staff Selection */}
        {showStaffChoice && (
          <div className="mb-5">
            <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
              {t("whoServed")}
            </p>
            
            {/* Pool/Staff toggle - only show if pool option is allowed */}
            {allowPoolOption && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => {
                    setTipTarget("pool");
                    setSelectedStaffId(null);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    tipTarget === "pool"
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <Users className="w-5 h-5 mb-1 text-cyan-400" />
                  <div className="font-medium text-sm">{t("wholeTeam")}</div>
                </button>
                <button
                  onClick={() => setTipTarget("staff")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    tipTarget === "staff"
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <User className="w-5 h-5 mb-1 text-cyan-400" />
                  <div className="font-medium text-sm">{t("specificStaff")}</div>
                </button>
              </div>
            )}
            
            {/* Staff cards - show when tipTarget is staff OR when pool option is not allowed */}
            {(tipTarget === "staff" || !allowPoolOption) && (
              <div className="grid grid-cols-2 gap-2">
                {qrData.availableStaff.map((staff) => (
                  <button
                    key={staff.id}
                    onClick={() => {
                      setSelectedStaffId(staff.id);
                      setTipTarget("staff");
                    }}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedStaffId === staff.id
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-white/10 bg-white/5 hover:border-cyan-500/50"
                    }`}
                  >
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center overflow-hidden">
                      {staff.avatarUrl ? (
                        <Image
                          src={staff.avatarUrl}
                          alt={staff.displayName}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <User className="w-6 h-6 text-cyan-400" />
                      )}
                    </div>
                    <div className="font-medium text-sm truncate">{staff.displayName}</div>
                    <div className="text-xs text-slate-400 capitalize">{staff.role.toLowerCase()}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Amount Selection */}
        <div className="mb-5">
          <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
            {t("selectAmount")}
          </p>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {AMOUNT_PRESETS.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setSelectedAmount(amount);
                  setCustomAmount("");
                }}
                className={`h-12 rounded-xl border font-bold transition-all ${
                  selectedAmount === amount
                    ? "border-cyan-500 bg-cyan-500/20 text-cyan-400"
                    : "border-white/10 bg-white/5 text-white hover:border-cyan-500/50"
                }`}
              >
                {formatShortAmount(amount)}
              </button>
            ))}
          </div>
          <Input
            type="number"
            placeholder={t("otherAmount")}
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setSelectedAmount(null);
            }}
            className="bg-white/5 border-white/10 h-11 text-white placeholder:text-slate-500"
          />
        </div>

        {/* Cover Fee */}
        {finalAmount > 0 && (
          <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer mb-5">
            <Checkbox
              checked={coverFee}
              onCheckedChange={(checked) => setCoverFee(checked as boolean)}
            />
            <div className="flex-1">
              <div className="text-sm font-medium">{t("coverFee")}</div>
              <div className="text-xs text-slate-400">
                +{formatCurrency(platformFee)} →{" "}
                {targetStaff?.displayName || t("wholeTeam").split(" ")[0]} {t("gets100")}
              </div>
            </div>
          </label>
        )}

        {/* Summary */}
        {finalAmount > 0 && (
          <div className="rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 text-sm">{t("tipLabel")}</span>
              <span className="font-medium">{formatCurrency(finalAmount)}</span>
            </div>
            {coverFee && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 text-sm">{t("feeCovered")}</span>
                <span className="font-medium text-cyan-400">
                  +{formatCurrency(platformFee)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <span className="font-semibold">{t("totalLabel")}</span>
              <span className="text-xl font-bold text-cyan-400">
                {formatCurrency(totalAmount)}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-2 text-center">
              → {targetStaff?.displayName || t("wholeTeam").split(" ")[0]}
            </div>
          </div>
        )}
      </main>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/95 backdrop-blur border-t border-white/5">
        <Button
          onClick={handleSubmit}
          disabled={
            !finalAmount ||
            finalAmount < 1000 ||
            submitting ||
            (showStaffChoice && tipTarget === "staff" && !selectedStaffId) ||
            (showStaffChoice && !allowPoolOption && !selectedStaffId)
          }
          className="w-full h-12 text-base font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 rounded-xl"
        >
          {submitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              {t("sendTip")} {finalAmount > 0 && `• ${formatCurrency(totalAmount)}`}
              <ChevronRight className="ml-1 h-5 w-5" />
            </>
          )}
        </Button>
        <p className="text-[10px] text-center text-slate-500 mt-2">
          {t("securePayment")}
        </p>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    snap?: {
      pay: (token: string) => void;
    };
  }
}
