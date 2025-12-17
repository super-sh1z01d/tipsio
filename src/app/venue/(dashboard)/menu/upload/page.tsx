"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UploadCloud, X, AlertCircle } from "lucide-react";
import Image from "next/image";

// Validation constants (should match backend)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const MAX_FILES = 10;

export default function MenuUploadPage() {
  const t = useTranslations('venue.menu.upload');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const addFiles = (selectedFiles: File[]) => {
    setError(null);

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of selectedFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(t('validation.invalidType', { name: file.name }));
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(t('validation.tooLarge', { name: file.name }));
        return;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    if (files.length + validFiles.length > MAX_FILES) {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
      setError(t('validation.tooMany', { max: MAX_FILES }));
      return;
    }

    setFiles((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    addFiles(Array.from(e.target.files));
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const clearAll = () => {
    previews.forEach((url) => URL.revokeObjectURL(url));
    setFiles([]);
    setPreviews([]);
    setError(null);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/venue/menu/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.status === 401) {
        router.push('/venue/login');
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t('error'));
      }

      // Success - redirect to editor
      router.push('/venue/menu/editor');
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <Card className="p-8">
        <div 
          className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-10 text-center hover:bg-muted/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addFiles(Array.from(e.dataTransfer.files));
          }}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            multiple 
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleFileSelect}
          />
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <UploadCloud className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t('dropzone')}</h3>
          <p className="text-sm text-muted-foreground">{t('hint')}</p>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 text-red-500 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {files.length > 0 && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">
                {t('filesSelected', { count: files.length })}
              </h4>
              <Button onClick={clearAll} variant="ghost" size="sm" className="text-destructive">
                {t('clearAll')}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {previews.map((src, index) => (
                <div key={index} className="relative group aspect-[3/4] rounded-lg overflow-hidden border bg-muted">
                  <Image 
                    src={src} 
                    alt={`Preview ${index}`} 
                    fill 
                    className="object-cover"
                  />
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                    className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-red-500 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <Button size="lg" onClick={handleUpload} disabled={loading} className="w-full md:w-auto">
                {loading ? t('generating') : t('generate')}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
