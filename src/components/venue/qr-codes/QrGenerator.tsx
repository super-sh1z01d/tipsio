"use client";

import React, { useState, useEffect } from "react";
import {
  QrDesignState,
  MaterialType,
  MATERIAL_TYPES,
  DEFAULT_CTA_TEXTS,
} from "@/lib/qr-materials";
import { MaterialPreview } from "./MaterialPreview";
import { QrPdfDocument } from "./PdfTemplates";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import QRCode from "qrcode";
import { Download, Upload } from "lucide-react";

interface QrGeneratorProps {
  shortCode: string;
  venueName: string;
}

const PRESET_COLORS = [
  { name: "Белый", base: "#FFFFFF", accent: "#000000" },
  { name: "Тёмный", base: "#1F2937", accent: "#FFFFFF" },
  { name: "Зелёный", base: "#059669", accent: "#FFFFFF" },
  { name: "Синий", base: "#0EA5E9", accent: "#FFFFFF" },
  { name: "Оранжевый", base: "#F97316", accent: "#FFFFFF" },
  { name: "Красный", base: "#DC2626", accent: "#FFFFFF" },
];

export function QrGenerator({ shortCode, venueName }: QrGeneratorProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [design, setDesign] = useState<QrDesignState>({
    materialType: "table-tent",
    baseColor: "#FFFFFF",
    accentColor: "#000000",
    ctaText: "Оставьте чаевые",
    showLogo: false,
    logoUrl: undefined,
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const generateQr = async () => {
      try {
        const url = `${window.location.origin}/tip/${shortCode}`;
        const dataUrl = await QRCode.toDataURL(url, {
          width: 512,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#FFFFFF00",
          },
        });
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error("QR Generation failed", err);
      }
    };
    generateQr();
  }, [shortCode]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDesign((prev) => ({
          ...prev,
          logoUrl: reader.result as string,
          showLogo: true,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isClient) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-0">
      {/* Left: Preview */}
      <div className="lg:w-1/2">
        <div className="bg-muted/30 rounded-xl p-6 flex items-center justify-center min-h-[300px] lg:min-h-[400px] lg:sticky lg:top-6">
          <div className="w-full max-w-[220px] shadow-xl rounded-lg overflow-hidden">
            <MaterialPreview
              design={design}
              qrDataUrl={qrDataUrl}
              venueName={venueName}
            />
          </div>
        </div>
      </div>

      {/* Right: Settings */}
      <div className="lg:w-1/2 space-y-6">
        {/* Format Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-heading font-semibold">Формат материала</Label>
          <div className="grid grid-cols-2 gap-2">
            {MATERIAL_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() =>
                  setDesign((d) => ({
                    ...d,
                    materialType: type.id as MaterialType,
                  }))
                }
                className={`p-3 rounded-xl border text-left transition-all ${
                  design.materialType === type.id
                    ? "border-primary bg-primary/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="font-medium text-sm">{type.label.ru}</div>
                <div className="text-xs text-muted-foreground">
                  {type.description.ru}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Text Settings */}
        <div className="space-y-3">
          <Label className="text-sm font-heading font-semibold">Текст призыва</Label>
          <Select
            value={design.ctaText}
            onValueChange={(v) => setDesign((d) => ({ ...d, ctaText: v }))}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Выберите текст" />
            </SelectTrigger>
            <SelectContent>
              {DEFAULT_CTA_TEXTS.map((text) => (
                <SelectItem key={text} value={text}>
                  {text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Или введите свой вариант..."
            value={design.ctaText}
            onChange={(e) => setDesign((d) => ({ ...d, ctaText: e.target.value }))}
            className="h-12"
          />
        </div>

        {/* Logo Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="logo-switch" className="text-sm font-heading font-semibold cursor-pointer">
              Логотип заведения
            </Label>
            <Switch
              id="logo-switch"
              checked={design.showLogo}
              onCheckedChange={(c) => setDesign((d) => ({ ...d, showLogo: c }))}
            />
          </div>
          {design.showLogo && (
            <Button variant="outline" className="w-full h-12 relative overflow-hidden">
              <Upload className="w-4 h-4 mr-2" />
              {design.logoUrl ? "Изменить логотип" : "Загрузить логотип"}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleLogoUpload}
              />
            </Button>
          )}
        </div>

        {/* Color Settings */}
        <div className="space-y-3">
          <Label className="text-sm font-heading font-semibold">Цвет фона</Label>
          <div className="flex flex-wrap gap-3">
            {PRESET_COLORS.map((c, i) => (
              <button
                key={i}
                className={`w-11 h-11 rounded-xl border-2 transition-all ${
                  design.baseColor === c.base
                    ? "border-primary ring-2 ring-primary/30 scale-110"
                    : "border-white/20 hover:scale-105"
                }`}
                style={{ backgroundColor: c.base }}
                onClick={() =>
                  setDesign((d) => ({
                    ...d,
                    baseColor: c.base,
                    accentColor: c.accent,
                  }))
                }
                title={c.name}
              />
            ))}
            <div className="relative w-11 h-11">
              <input
                type="color"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                value={design.baseColor}
                onChange={(e) =>
                  setDesign((d) => ({ ...d, baseColor: e.target.value }))
                }
              />
              <div className="w-full h-full rounded-xl border-2 border-white/20 bg-gradient-to-br from-red-500 via-green-500 to-blue-500" />
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="pt-4">
          {isClient && qrDataUrl ? (
            <PDFDownloadLink
              document={
                <QrPdfDocument
                  design={design}
                  qrDataUrl={qrDataUrl}
                  venueName={venueName}
                />
              }
              fileName={`tipsio-${design.materialType}.pdf`}
              className="block"
            >
              {({ loading }) => (
                <Button
                  className="w-full h-14 text-lg font-heading font-bold bg-gradient-to-r from-cyan-500 to-blue-600"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    "Генерация..."
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Скачать PDF
                    </>
                  )}
                </Button>
              )}
            </PDFDownloadLink>
          ) : (
            <Button className="w-full h-14" size="lg" disabled>
              Загрузка...
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
