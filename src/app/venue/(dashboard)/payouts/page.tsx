"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/i18n/client";
import { 
  Loader2, 
  Check,
  Banknote,
  Users,
  AlertTriangle
} from "lucide-react";

interface StaffBalance {
  id: string;
  displayName: string;
  role: string;
  avatarUrl?: string;
  balance: number;
  tipsCount: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Staff Avatar Component
function StaffAvatar({ staff }: { staff: StaffBalance }) {
  if (staff.avatarUrl) {
    return (
      <Image 
        src={staff.avatarUrl} 
        alt={staff.displayName}
        width={40} 
        height={40}
        className="w-10 h-10 rounded-full object-cover"
      />
    );
  }
  
  const initials = staff.displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
    
  return (
    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
      <span className="text-primary font-semibold text-sm">{initials}</span>
    </div>
  );
}

export default function VenuePayoutsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState<StaffBalance[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [payingStaff, setPayingStaff] = useState<string | null>(null);
  const [payingAll, setPayingAll] = useState(false);
  const t = useTranslations('venue.payouts');

  const fetchStaffBalances = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/payouts");
      if (res.status === 401) {
        router.push("/venue/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to load staff balances");
      const data = await res.json();
      setStaffList(data.staff || []);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [router]); // Add router to useCallback dependencies

  useEffect(() => {
    fetchStaffBalances();
  }, [fetchStaffBalances]);

  async function handlePayout(staffId: string) {
    try {
      setPayingStaff(staffId);
      const res = await fetch(`/api/staff/${staffId}/payout`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to process payout");
      
      // Update local state - set balance to 0
      setStaffList(prev => prev.map(s => 
        s.id === staffId ? { ...s, balance: 0 } : s
      ));
    } catch {
      setError("Failed to process payout");
    } finally {
      setPayingStaff(null);
    }
  }

  async function handlePayoutAll() {
    try {
      setPayingAll(true);
      const res = await fetch("/api/staff/payout-all", {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to process payouts");
      
      // Update local state - set all balances to 0
      setStaffList(prev => prev.map(s => ({ ...s, balance: 0 })));
    } catch {
      setError("Failed to process payouts");
    } finally {
      setPayingAll(false);
    }
  }

  const totalBalance = staffList.reduce((sum, s) => sum + s.balance, 0);
  const staffWithBalance = staffList.filter(s => s.balance > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      {error && (
        <Card className="glass p-4 border-destructive/30 bg-destructive/10">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Banknote className="h-4 w-4" />
              <span className="text-xs">{t('toPay')}</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(totalBalance)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">{t('staffWithBalance')}</span>
            </div>
            <div className="text-2xl font-bold">
              {staffWithBalance.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning */}
      <Card className="glass p-4 border-yellow-500/30 bg-yellow-500/5">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-500">
              {t('warning')}
            </p>
            <p className="text-muted-foreground mt-1">
              {t('warningDesc')}
            </p>
          </div>
        </div>
      </Card>

      {/* Staff List */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('accumulatedTips')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {staffList.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {t('noStaff')}
            </p>
          ) : (
            staffList.map((staff) => (
              <div 
                key={staff.id} 
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <StaffAvatar staff={staff} />
                  <div>
                    <div className="font-medium">{staff.displayName}</div>
                    <div className="text-sm text-muted-foreground">
                      {staff.role} · {staff.tipsCount} tips
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`font-semibold ${staff.balance > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {formatCurrency(staff.balance)}
                    </div>
                  </div>
                  
                  {staff.balance > 0 ? (
                    <Button
                      size="sm"
                      onClick={() => handlePayout(staff.id)}
                      disabled={payingStaff === staff.id}
                    >
                      {payingStaff === staff.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        t('paid')
                      )}
                    </Button>
                  ) : (
                    <span className="text-sm text-green-400 flex items-center gap-1">
                      <Check className="h-4 w-4" /> {t('paid')}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Pay All Button */}
      {staffWithBalance.length > 0 && (
        <Button
          className="w-full h-14 text-lg font-heading font-bold bg-gradient-to-r from-cyan-500 to-blue-600"
          onClick={handlePayoutAll}
          disabled={payingAll}
        >
          {payingAll ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <Check className="h-5 w-5 mr-2" />
          )}
          {t('payAll')} ({formatCurrency(totalBalance)})
        </Button>
      )}
    </div>
  );
}
