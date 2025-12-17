"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslations } from "@/i18n/client";
import {
  LayoutDashboard,
  Users,
  QrCode,
  Wallet,
  Settings,
  LogOut,
  Menu,
  X,
  UtensilsCrossed,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type DistributionMode = "POOLED" | "PERSONAL";

interface VenueData {
  distributionMode: DistributionMode;
}

export default function VenueLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [venueData, setVenueData] = useState<VenueData | null>(null);
  const t = useTranslations('venue.nav');

  // Fetch venue data to get distribution mode
  useEffect(() => {
    async function fetchVenueData() {
      try {
        const response = await fetch("/api/venues/dashboard");
        if (response.ok) {
          const data = await response.json();
          setVenueData({ distributionMode: data.venue?.distributionMode || "PERSONAL" });
        }
      } catch (error) {
        console.error("Failed to fetch venue data:", error);
      }
    }
    fetchVenueData();
  }, []);

  const allNavItems = [
    { href: "/venue/dashboard", label: t('dashboard'), icon: LayoutDashboard, showFor: ["POOLED", "PERSONAL"] },
    { href: "/venue/menu", label: t('menu'), icon: UtensilsCrossed, showFor: ["POOLED", "PERSONAL"] },
    { href: "/venue/staff", label: t('staff'), icon: Users, showFor: ["PERSONAL"] },
    { href: "/venue/qr-codes", label: t('qrCodes'), icon: QrCode, showFor: ["POOLED", "PERSONAL"] },
    { href: "/venue/payouts", label: t('payouts'), icon: Wallet, showFor: ["PERSONAL"] },
    { href: "/venue/settings", label: t('settings'), icon: Settings, showFor: ["POOLED", "PERSONAL"] },
  ];

  // Filter nav items based on distribution mode
  const navItems = allNavItems.filter(item => 
    item.showFor.includes(venueData?.distributionMode || "PERSONAL")
  );

  return (
    <div className="min-h-screen relative">
      {/* Aurora Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col glass border-r border-white/5 z-40">
        <div className="p-6 flex items-center justify-between">
          <Link href="/venue/dashboard" className="text-2xl font-heading font-bold text-gradient">
            Tipsio
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-5 w-5" />
            {t('signOut')}
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 glass border-b border-white/5 z-40 flex items-center justify-between px-4">
        <Link href="/venue/dashboard" className="text-xl font-heading font-bold text-gradient">
          Tipsio
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 pt-16">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <nav className="relative glass border-b border-white/5 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive mt-4"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-5 w-5" />
              {t('signOut')}
            </Button>
          </nav>
        </div>
      )}

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/5 z-40">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
