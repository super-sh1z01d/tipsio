"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Download, ExternalLink, QrCode } from "lucide-react";
import { useTranslations } from "@/i18n/client";
import { QrGenerator } from "@/components/venue/qr-codes/QrGenerator";

type QrCodeType = {
  id: string;
  type: "PERSONAL" | "TABLE" | "VENUE";
  label: string | null;
  shortCode: string;
  status: string;
};

export default function QrCodesPage() {
  const [venueQr, setVenueQr] = useState<QrCodeType | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [venueName, setVenueName] = useState<string>("");
  const t = useTranslations("venue.qr");

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const fetchData = useCallback(async () => {
    try {
      const dashRes = await fetch("/api/venues/dashboard?period=week");
      if (!dashRes.ok) throw new Error("Failed to load venue");
      const dashData = await dashRes.json();

      if (dashData.venue?.id) {
        setVenueName(dashData.venue.name || "");

        const qrRes = await fetch(`/api/qr?venueId=${dashData.venue.id}`);
        if (qrRes.ok) {
          const qrData = await qrRes.json();
          const codes = qrData.qrCodes || [];
          const venueCode =
            codes.find((qr: QrCodeType) => qr.type === "VENUE") ||
            codes.find((qr: QrCodeType) => qr.type === "TABLE") ||
            codes[0];
          setVenueQr(venueCode || null);
        }
      }
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(t("failedToLoad"));
    } finally {
      setIsPageLoading(false);
    }
  }, [t, setVenueQr, setVenueName, setError, setIsPageLoading]); // Add all dependencies

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDownload = async (qrId: string, format: "png" | "svg") => {
    try {
      const response = await fetch(`/api/qr/${qrId}/download?format=${format}`);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-${venueName.replace(/\s+/g, "-").toLowerCase() || "venue"}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download failed:", err);
      setError(t("failedToDownload"));
    }
  };

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* QR Code Card */}
      {venueQr ? (
        <Card className="glass">
          <CardHeader className="pb-4">
            <CardTitle className="font-heading">{t("yourQr")}</CardTitle>
            <CardDescription>{t("yourQrDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* QR Preview */}
              <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-xl p-3 shadow-sm flex-shrink-0">
                <Image
                  src={`/api/qr/${venueQr.id}/download?format=svg`}
                  alt="QR Code"
                  width={160} 
                  height={160}
                  className="w-full h-full"
                />
              </div>

              {/* Info & Actions */}
              <div className="flex-1 text-center md:text-left space-y-3">
                <div>
                  <div className="text-lg font-heading font-semibold">
                    {venueName || t("venueQr")}
                  </div>
                  <div className="text-sm text-muted-foreground font-mono break-all">
                    {baseUrl}/tip/{venueQr.shortCode}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(`${baseUrl}/tip/${venueQr.shortCode}`, "_blank")
                    }
                  >
                    <ExternalLink className="h-4 w-4 mr-1.5" />
                    {t("open")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(venueQr.id, "png")}
                  >
                    <Download className="h-4 w-4 mr-1.5" />
                    PNG
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(venueQr.id, "svg")}
                  >
                    <Download className="h-4 w-4 mr-1.5" />
                    SVG
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass">
          <CardContent className="py-12 text-center">
            <QrCode className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">{t("qrWillBeCreated")}</p>
          </CardContent>
        </Card>
      )}

      {/* Materials Constructor */}
      {venueQr && (
        <Card className="glass">
          <CardHeader className="pb-4">
            <CardTitle className="font-heading">{t("printMaterials")}</CardTitle>
            <CardDescription>{t("printMaterialsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="p-0 md:p-6">
            <QrGenerator shortCode={venueQr.shortCode} venueName={venueName} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
