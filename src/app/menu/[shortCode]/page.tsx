"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Flame, Star, ChevronDown, ChevronUp } from "lucide-react";

import { LanguageSwitcher } from "@/components/ui/language-switcher";
import {
  getLocalizedName,
  getLocalizedDescription,
  formatPrice,
} from "@/lib/menu-localization";
import { Button } from "@/components/ui/button";
import type { PublicMenuCategory, PublicMenuItem } from "@/types/menu";

interface PublicMenuResponse {
  venue: {
    id: string;
    name: string;
    logoUrl: string | null;
    type: string; // Or specific enum if available
  };
  categories: PublicMenuCategory[];
  publishedAt: string | null;
  tipQrShortCode: string | null;
}

export default function PublicMenuPage() {
  const t = useTranslations('guest.menu');
  const commonT = useTranslations('common');
  const hubT = useTranslations('guest.hub');
  const params = useParams();
  const locale = useLocale();
  const shortCode = params.shortCode as string;

  const [loading, setLoading] = useState(true);
  const [menuData, setMenuData] = useState<PublicMenuResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!shortCode) {
      setError("Short code is missing.");
      setLoading(false);
      return;
    }

    async function fetchMenuData() {
      try {
        const response = await fetch(`/api/menu/${shortCode}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to fetch menu.");
          return;
        }
        setMenuData(data);
        // Expand all categories by default
        const initialExpanded: Record<string, boolean> = {};
        data.categories?.forEach((c: PublicMenuCategory) => initialExpanded[c.id] = true); // Use PublicMenuCategory
        setExpandedCategories(initialExpanded);
      } catch (err: unknown) {
        console.error("Error fetching menu:", err);
        setError("Failed to connect to server.");
      } finally {
        setLoading(false);
      }
    }
    fetchMenuData();
  }, [shortCode]);

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-lg">{commonT('loading')}</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center p-4">
        <h1 className="text-2xl font-bold mb-4">{commonT('error')}</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!menuData || !menuData.venue || !menuData.categories || menuData.categories.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center p-4">
        <h1 className="text-2xl font-bold mb-4">{t('noMenuFound')}</h1>
        <p className="text-muted-foreground">{t('pageNotFound')}</p>
      </div>
    );
  }

  const { venue, categories, tipQrShortCode } = menuData;
  const currentLocale: 'en' | 'ru' = locale === 'ru' ? 'ru' : 'en';

  return (
    <div className="min-h-screen pb-20"> {/* pb-20 for fixed bottom button */}
      {/* Sticky Header */}
      <header className="fixed top-0 left-0 right-0 glass border-b border-white/5 z-40 flex items-center justify-between p-4">
        <Link href={`/v/${shortCode}`} className="text-xl font-heading font-bold text-gray-900 dark:text-gray-100">
          {venue.name}
        </Link>
        <LanguageSwitcher />
      </header>

      {/* Menu Content */}
      <main className="container mx-auto p-4 pt-20"> {/* pt-20 to clear fixed header */}
        {categories.map((category: PublicMenuCategory) => (
          <div key={category.id} className="mb-6">
            <div 
              className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
              onClick={() => toggleCategory(category.id)}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {getLocalizedName(category, currentLocale)}
              </h2>
              {expandedCategories[category.id] ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
            </div>
            
            {expandedCategories[category.id] && (
              <div className="space-y-4 mt-4">
                {category.items.map((item: PublicMenuItem) => (
                  <div key={item.id} className="flex justify-between items-start border-b pb-4 last:border-b-0">
                    <div className="flex-1 pr-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {getLocalizedName(item, currentLocale)}
                      </h3>
                      {item.originalName && item.originalName !== getLocalizedName(item, currentLocale) && (
                         <p className="text-sm text-muted-foreground italic">{item.originalName}</p>
                      )}
                      {getLocalizedDescription(item, currentLocale) && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {getLocalizedDescription(item, currentLocale)}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        {item.isSpicy && <Flame className="w-4 h-4 text-red-500" />}
                        {item.isLocalSpecial && <Star className="w-4 h-4 text-amber-500" />}
                        {item.approxCalories !== null && item.approxCalories !== undefined && (
                          <span className="bg-muted px-2 py-0.5 rounded-full text-xs">
                            {t('calories', { value: item.approxCalories })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {formatPrice(item.priceValue, item.priceCurrency)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Disclaimer Footer */}
        <p className="text-xs text-muted-foreground text-center mt-8 p-4 bg-muted/50 rounded-lg">
          {t('disclaimer')}
        </p>
      </main>

      {/* Fixed Bottom CTA */}
      {tipQrShortCode && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 border-t border-white/5 z-40">
          <Link href={`/tip/${tipQrShortCode}`}>
            <Button size="lg" className="w-full h-12 text-lg">
              {hubT('leaveTip')}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
