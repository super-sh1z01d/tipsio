"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Utensils, QrCode } from "lucide-react";

interface PublicVenueHubResponse {
  venue: {
    id: string;
    name: string;
    logoUrl: string | null;
    type: string;
  };
  hasPublishedMenu: boolean;
  tipQrShortCode: string | null;
}

export default function VenueHubPage() {
  const t = useTranslations('guest.hub');
  const params = useParams();
  const shortCode = params.shortCode as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [venueInfo, setVenueInfo] = useState<PublicVenueHubResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shortCode) {
      setError("Short code is missing.");
      setLoading(false);
      return;
    }

    async function fetchVenueInfo() {
      try {
        const response = await fetch(`/api/v/${shortCode}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to fetch venue information.");
          return;
        }
        setVenueInfo(data);
      } catch (err: unknown) {
        console.error("Error fetching venue info:", err);
        setError("Failed to connect to server.");
      } finally {
        setLoading(false);
      }
    }
    fetchVenueInfo();
  }, [shortCode]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-lg">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center p-4">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!venueInfo || !venueInfo.venue) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center p-4">
        <h1 className="text-2xl font-bold mb-4">Venue not found</h1>
        <p className="text-muted-foreground">The venue you are looking for could not be found.</p>
      </div>
    );
  }

  const { venue, hasPublishedMenu, tipQrShortCode } = venueInfo;

  return (
    <div className="flex flex-col min-h-screen items-center p-4 pt-16 md:pt-4">
      <div className="flex flex-col items-center text-center space-y-4 mb-8">
        {venue.logoUrl && (
          <Image 
            src={venue.logoUrl} 
            alt={`${venue.name} logo`} 
            width={128} 
            height={128} 
            className="rounded-full object-cover shadow-lg"
          />
        )}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">{venue.name}</h1>
      </div>

      <div className="flex flex-col w-full max-w-sm space-y-4">
        <Button 
          size="lg" 
          className="h-14 text-lg w-full" 
          disabled={!hasPublishedMenu}
          onClick={() => router.push(`/menu/${shortCode}`)}
        >
          <Utensils className="w-6 h-6 mr-2" />
          {t('viewMenu')}
        </Button>
        {!hasPublishedMenu && (
          <p className="text-center text-sm text-muted-foreground">
            {t('menuNotAvailable')}
          </p>
        )}

        {tipQrShortCode && (
          <Button 
            size="lg" 
            variant="outline" 
            className="h-14 text-lg w-full"
            onClick={() => router.push(`/tip/${tipQrShortCode}`)}
          >
            <QrCode className="w-6 h-6 mr-2" />
            {t('leaveTip')}
          </Button>
        )}
      </div>

      <p className="mt-auto text-sm text-muted-foreground py-4">
        {t('poweredBy')}
      </p>
    </div>
  );
}
