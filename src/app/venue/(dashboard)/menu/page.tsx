"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Plus, Eye, Utensils, RotateCcw } from "lucide-react";

interface VenueMenuApiResponse {
  shortCode: string | null;
  job: {
    id: string;
    status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    isPublished: boolean;
    createdAt: Date;
    errorMessage: string | null;
  } | null;
  stats: {
    categoryCount: number;
    itemCount: number;
  };
}

export default function MenuOverviewPage() {
  const t = useTranslations('venue.menu');
  const commonT = useTranslations('common');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [menuData, setMenuData] = useState<VenueMenuApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMenu() {
      try {
        setError(null);
        const response = await fetch('/api/venue/menu');
        if (response.status === 401) {
          router.push('/venue/login');
          return;
        }
        if (response.ok) {
          const data = await response.json();
          setMenuData(data);
        } else {
          const data = await response.json().catch(() => null);
          setError(data?.message || commonT('error'));
        }
      } catch (error) {
        console.error("Failed to fetch menu:", error);
        setError(commonT('error'));
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, [commonT, router]);

  if (loading) {
    return <div className="p-8 text-center">{commonT('loading')}</div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="glass p-6 text-center space-y-4 max-w-md">
          <div className="text-muted-foreground">{error}</div>
          <Button onClick={() => window.location.reload()}>{commonT('retry')}</Button>
        </Card>
      </div>
    );
  }

  // If no job exists or job is null
  if (!menuData || !menuData.job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Utensils className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{t('empty.title')}</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          {t('empty.desc')}
        </p>
        <Button size="lg" onClick={() => router.push('/venue/menu/upload')}>
          <Plus className="w-4 h-4 mr-2" />
          {t('empty.cta')}
        </Button>
      </div>
    );
  }

  const { job, stats, shortCode } = menuData;
  const isProcessing = job.status === 'PROCESSING' || job.status === 'QUEUED';
  const isFailed = job.status === 'FAILED';

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        {shortCode && (
           <Button variant="outline" onClick={() => window.open(`/v/${shortCode}`, '_blank')}>
            <Eye className="w-4 h-4 mr-2" />
            {t('actions.viewPublic')}
          </Button>
        )}
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Current Menu</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                job.isPublished
                  ? "bg-green-500/10 text-green-500"
                  : isFailed
                    ? "bg-red-500/10 text-red-500"
                    : isProcessing
                      ? "bg-blue-500/10 text-blue-500"
                      : "bg-yellow-500/10 text-yellow-500"
              }`}>
                {job.isPublished
                  ? t('status.published')
                  : isFailed
                    ? t('status.failed')
                    : isProcessing
                      ? t('status.processing')
                      : t('status.draft')}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('stats.lastUpdated')}: {new Date(job.createdAt).toLocaleDateString()}
            </p>
            {job.errorMessage && (
              <p className="text-sm text-red-500">{job.errorMessage}</p>
            )}
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" className="flex-1 md:flex-none" onClick={() => router.push('/venue/menu/upload')}>
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('actions.rescan')}
            </Button>
            <Button
              className="flex-1 md:flex-none"
              disabled={isProcessing || isFailed}
              onClick={() => router.push('/venue/menu/editor')}
            >
              <FileText className="w-4 h-4 mr-2" />
              {t('actions.edit')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">{stats.categoryCount}</div>
            <div className="text-sm text-muted-foreground">{t('stats.categories')}</div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">{stats.itemCount}</div>
            <div className="text-sm text-muted-foreground">{t('stats.items')}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
