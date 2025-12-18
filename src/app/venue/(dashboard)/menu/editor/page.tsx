"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Reorder } from "framer-motion";
import {
  ArrowLeft,
  Flame,
  GripVertical,
  Pencil,
  Plus,
  Save,
  Star,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MenuCategoryData, MenuItemData } from "@/types/menu";

type JobStatus = "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";

type EditorMenuItem = Omit<MenuItemData, "id" | "nameRu"> & {
  id: string;
  nameRu: string;
};
type EditorMenuCategory = Omit<MenuCategoryData, "id" | "items" | "nameRu"> & {
  id: string;
  nameRu: string;
  items: EditorMenuItem[];
};

interface VenueMenuApiResponse {
  job: {
    id: string;
    status: JobStatus;
    isPublished: boolean;
    createdAt: string;
    errorMessage: string | null;
  } | null;
  categories: VenueMenuApiCategory[];
}

interface VenueMenuApiItem {
  id: string;
  originalName: string;
  nameEn: string;
  nameRu: string | null;
  descriptionEn: string | null;
  descriptionRu: string | null;
  priceValue: number | null;
  priceCurrency: string;
  isSpicy: boolean;
  approxCalories: number | null;
  isLocalSpecial: boolean;
  order: number;
}

interface VenueMenuApiCategory {
  id: string;
  nameEn: string;
  nameOriginal: string | null;
  nameRu: string | null;
  order: number;
  items: VenueMenuApiItem[];
}

function createTempId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function reorderByIds<T extends { id: string }>(items: T[], orderedIds: string[]): T[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  const seen = new Set<string>();

  const result: T[] = [];
  for (const id of orderedIds) {
    const item = byId.get(id);
    if (!item) continue;
    result.push(item);
    seen.add(id);
  }

  for (const item of items) {
    if (!seen.has(item.id)) result.push(item);
  }

  return result;
}

function normalizeOrders(categories: EditorMenuCategory[]): EditorMenuCategory[] {
  return categories.map((category, categoryIndex) => ({
    ...category,
    order: categoryIndex,
    items: category.items.map((item, itemIndex) => ({
      ...item,
      order: itemIndex,
      priceCurrency: item.priceCurrency || "IDR",
    })),
  }));
}

function coerceNumberOrNull(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, Math.trunc(parsed));
}

function normalizeString(value: string | null | undefined, fallback: string): string {
  const candidate = (value ?? "").trim();
  if (candidate.length > 0) {
    return candidate;
  }
  const fallbackTrimmed = fallback.trim();
  if (fallbackTrimmed.length > 0) {
    return fallbackTrimmed;
  }
  return "Untitled";
}

function normalizeNullableString(value: string | null | undefined): string | null {
  const candidate = (value ?? "").trim();
  return candidate.length > 0 ? candidate : null;
}

function buildMenuSavePayload(categories: EditorMenuCategory[]) {
  return categories.map((category, categoryIndex) => {
    const sanitizedNameEn = normalizeString(
      category.nameEn,
      category.nameOriginal ?? category.nameRu ?? `Category ${categoryIndex + 1}`
    );
    const sanitizedNameRu = normalizeString(category.nameRu, sanitizedNameEn);
    return {
      nameEn: sanitizedNameEn,
      nameRu: sanitizedNameRu,
      nameOriginal: normalizeNullableString(category.nameOriginal),
      order: typeof category.order === "number" ? category.order : categoryIndex,
      items: category.items.map((item, itemIndex) => {
        const sanitizedOriginalName = normalizeString(item.originalName, item.nameEn || `Item ${itemIndex + 1}`);
        const sanitizedNameEn = normalizeString(item.nameEn, sanitizedOriginalName);
        const sanitizedNameRu = normalizeString(item.nameRu, sanitizedNameEn);
        return {
          originalName: sanitizedOriginalName,
          nameEn: sanitizedNameEn,
          nameRu: sanitizedNameRu,
          descriptionEn: normalizeNullableString(item.descriptionEn),
          descriptionRu: normalizeNullableString(item.descriptionRu),
          priceValue: item.priceValue ?? null,
          priceCurrency: item.priceCurrency || "IDR",
          isSpicy: Boolean(item.isSpicy),
          approxCalories: item.approxCalories ?? null,
          isLocalSpecial: Boolean(item.isLocalSpecial),
          order: typeof item.order === "number" ? item.order : itemIndex,
        };
      }),
    };
  });
}

export default function MenuEditorPage() {
  const t = useTranslations("venue.menu.editor");
  const commonT = useTranslations("common");
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [categories, setCategories] = useState<EditorMenuCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId) || null,
    [categories, selectedCategoryId]
  );

  const categoryIds = useMemo(() => categories.map((c) => c.id), [categories]);
  const itemIds = useMemo(
    () => (selectedCategory ? selectedCategory.items.map((i) => i.id) : []),
    [selectedCategory]
  );

  const editingItem = useMemo(() => {
    if (!selectedCategory || !editingItemId) return null;
    return selectedCategory.items.find((i) => i.id === editingItemId) || null;
  }, [selectedCategory, editingItemId]);

  useEffect(() => {
    setEditingItemId(null);
  }, [selectedCategoryId]);

  useEffect(() => {
    async function fetchMenu() {
      try {
        setError(null);
        setLoading(true);

        const response = await fetch("/api/venue/menu");
        if (response.status === 401) {
          router.push("/venue/login");
          return;
        }

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          setError(data?.message || commonT("error"));
          return;
        }

        const data = (await response.json()) as VenueMenuApiResponse;
        if (!data.job) {
          router.push("/venue/menu/upload");
          return;
        }

        setJobStatus(data.job.status);

        if (data.job.status !== "COMPLETED") {
          return;
        }

        const parsedCategories: EditorMenuCategory[] = (data.categories || []).map((c) => ({
          id: c.id,
          nameEn: c.nameEn,
          nameOriginal: c.nameOriginal ?? null,
          nameRu: c.nameRu ?? c.nameEn,
          order: c.order ?? 0,
          items: (c.items || []).map((i) => ({
            id: i.id,
            originalName: i.originalName,
            nameEn: i.nameEn,
            nameRu: i.nameRu ?? i.nameEn,
            descriptionEn: i.descriptionEn ?? null,
            descriptionRu: i.descriptionRu ?? null,
            priceValue: i.priceValue ?? null,
            priceCurrency: i.priceCurrency || "IDR",
            isSpicy: Boolean(i.isSpicy),
            approxCalories: i.approxCalories ?? null,
            isLocalSpecial: Boolean(i.isLocalSpecial),
            order: i.order ?? 0,
          })),
        }));

        const normalized = normalizeOrders(
          parsedCategories.sort((a, b) => a.order - b.order)
        );
        setCategories(normalized);
        setSelectedCategoryId((prev) => prev || normalized[0]?.id || null);
        setDirty(false);
      } catch (err: unknown) {
        console.error(err);
        setError(commonT("error"));
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, [commonT, router]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = t("unsavedChanges");
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty, t]);

  const updateCategoryField = <K extends keyof EditorMenuCategory>(
    categoryId: string,
    key: K,
    value: EditorMenuCategory[K]
  ) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, [key]: value } : c))
    );
    setDirty(true);
  };

  const updateItemField = <K extends keyof EditorMenuItem>(
    categoryId: string,
    itemId: string,
    key: K,
    value: EditorMenuItem[K]
  ) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== categoryId) return c;
        return {
          ...c,
          items: c.items.map((i) => (i.id === itemId ? { ...i, [key]: value } : i)),
        };
      })
    );
    setDirty(true);
  };

  const addCategory = () => {
    const newCategory: EditorMenuCategory = {
      id: createTempId("cat"),
      nameEn: "New Category",
      nameOriginal: null,
      nameRu: "",
      order: categories.length,
      items: [],
    };
    const next = normalizeOrders([...categories, newCategory]);
    setCategories(next);
    setSelectedCategoryId(newCategory.id);
    setDirty(true);
  };

  const deleteCategory = (categoryId: string) => {
    if (!confirm(commonT("confirm"))) return;
    setCategories((prev) => {
      const next = normalizeOrders(prev.filter((c) => c.id !== categoryId));
      setSelectedCategoryId((currentSelected) =>
        currentSelected === categoryId ? next[0]?.id || null : currentSelected
      );
      return next;
    });
    setDirty(true);
  };

  const addItem = (categoryId: string) => {
    const newItem: EditorMenuItem = {
      id: createTempId("item"),
      originalName: "New item",
      nameEn: "New item",
      nameRu: "",
      descriptionEn: null,
      descriptionRu: null,
      priceValue: null,
      priceCurrency: "IDR",
      isSpicy: false,
      approxCalories: null,
      isLocalSpecial: false,
      order: 0,
    };

    setCategories((prev) =>
      normalizeOrders(
        prev.map((c) => (c.id === categoryId ? { ...c, items: [...c.items, newItem] } : c))
      )
    );
    setEditingItemId(newItem.id);
    setDirty(true);
  };

  const deleteItem = (categoryId: string, itemId: string) => {
    if (!confirm(commonT("confirm"))) return;
    setCategories((prev) =>
      normalizeOrders(
        prev.map((c) =>
          c.id === categoryId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c
        )
      )
    );
    if (editingItemId === itemId) setEditingItemId(null);
    setDirty(true);
  };

  const saveMenu = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        categories: buildMenuSavePayload(categories),
      };
      const response = await fetch("/api/venue/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        router.push("/venue/login");
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Failed to save");
      }

      setDirty(false);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : commonT("error"));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const publishMenu = async () => {
    if (!confirm("Publish menu?")) return;
    setPublishing(true);
    setError(null);

    try {
      await saveMenu();

      const response = await fetch("/api/venue/menu/publish", { method: "POST" });
      if (response.status === 401) {
        router.push("/venue/login");
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Publish failed");
      }

      alert(t("publishedMessage"));
      router.push("/venue/menu");
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : commonT("error"));
    } finally {
      setPublishing(false);
    }
  };

  const handleBack = () => {
    if (dirty && !confirm(t("unsavedChanges"))) return;
    router.push("/venue/menu");
  };

  if (loading) {
    return <div className="p-8 text-center">{commonT("loading")}</div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="glass p-6 text-center space-y-4 max-w-md">
          <div className="text-muted-foreground">{error}</div>
          <Button onClick={() => window.location.reload()}>{commonT("retry")}</Button>
        </Card>
      </div>
    );
  }

  if (jobStatus && jobStatus !== "COMPLETED") {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="glass p-6 text-center space-y-4 max-w-md">
          <div className="text-muted-foreground">
            {jobStatus === "FAILED" ? commonT("error") : t("subtitle")}
          </div>
          <Button onClick={() => router.push("/venue/menu")}>{commonT("back")}</Button>
        </Card>
      </div>
    );
  }

  if (!selectedCategory) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <div className="text-muted-foreground">{t("subtitle")}</div>
        <Button onClick={addCategory}>
          <Plus className="w-4 h-4 mr-2" />
          {t("addCategory")}
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="sticky top-0 bg-background/95 backdrop-blur z-10 border-b">
        <div className="p-4 md:p-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="text-xl font-bold">{t("title")}</div>
              {dirty && (
                <div className="text-sm text-amber-500">{t("unsavedChanges")}</div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={saveMenu}
              disabled={saving || publishing || categories.length === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? commonT("loading") : t("saveDraft")}
            </Button>
            <Button onClick={publishMenu} disabled={saving || publishing || categories.length === 0}>
              {publishing ? t("publishing") : t("publish")}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        {/* Category List (mobile + desktop) */}
        <Card className="p-3 md:p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium">{t("categories")}</div>
            <Button variant="outline" size="sm" onClick={addCategory}>
              <Plus className="w-4 h-4 mr-2" />
              {t("addCategory")}
            </Button>
          </div>

          <Reorder.Group
            axis="y"
            values={categoryIds}
            onReorder={(newOrder) => {
              setCategories((prev) => normalizeOrders(reorderByIds(prev, newOrder)));
              setDirty(true);
            }}
            className="space-y-1"
          >
            {categoryIds.map((id) => {
              const category = categories.find((c) => c.id === id);
              if (!category) return null;
              const isActive = category.id === selectedCategoryId;

              return (
                <Reorder.Item
                  key={id}
                  value={id}
                  className={`flex items-center gap-2 rounded-lg px-2 py-2 ${
                    isActive ? "bg-primary/10" : "hover:bg-muted/50"
                  }`}
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <button
                    type="button"
                    className="flex-1 text-left min-w-0"
                    onClick={() => setSelectedCategoryId(category.id)}
                  >
                    <div className="font-medium truncate">{category.nameEn}</div>
                    <div className="text-xs text-muted-foreground">
                      {category.items.length} {t("items")}
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => deleteCategory(category.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        </Card>

        {/* Category Editor */}
        <div className="space-y-6">
          <Card className="p-4 md:p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="font-medium">{t("title")}</div>
              <Button variant="outline" size="sm" onClick={() => addItem(selectedCategory.id)}>
                <Plus className="w-4 h-4 mr-2" />
                {t("addItem")}
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t("english")}</Label>
                <Input
                  value={selectedCategory.nameEn}
                  onChange={(e) => updateCategoryField(selectedCategory.id, "nameEn", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("original")}</Label>
                <Input
                  value={selectedCategory.nameOriginal || ""}
                  onChange={(e) =>
                    updateCategoryField(
                      selectedCategory.id,
                      "nameOriginal",
                      e.target.value.trim() ? e.target.value : null
                    )
                  }
                />
              </div>
            <div className="space-y-2">
              <Label>{t("russian")}</Label>
              <Input
                value={selectedCategory.nameRu}
                onChange={(e) =>
                  updateCategoryField(selectedCategory.id, "nameRu", e.target.value)
                }
              />
            </div>
            </div>
          </Card>

          {/* Items */}
          <Card className="p-4 md:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{t("items")}</div>
              <Button variant="outline" size="sm" onClick={() => addItem(selectedCategory.id)}>
                <Plus className="w-4 h-4 mr-2" />
                {t("addItem")}
              </Button>
            </div>

            {selectedCategory.items.length === 0 ? (
              <div className="text-sm text-muted-foreground">{t("addItem")}</div>
            ) : (
              <>
                {/* Desktop "table" */}
                <div className="hidden md:block">
                  <div className="grid grid-cols-[24px_1fr_140px_100px_140px] gap-3 px-2 py-2 text-xs text-muted-foreground">
                    <span />
                    <span>{t("english")}</span>
                    <span>{t("price")}</span>
                    <span />
                    <span />
                  </div>
                  <Reorder.Group
                    axis="y"
                    values={itemIds}
                    onReorder={(newOrder) => {
                      setCategories((prev) =>
                        normalizeOrders(
                          prev.map((c) => {
                            if (c.id !== selectedCategory.id) return c;
                            return { ...c, items: reorderByIds(c.items, newOrder) };
                          })
                        )
                      );
                      setDirty(true);
                    }}
                    className="space-y-1"
                  >
                    {itemIds.map((id) => {
                      const item = selectedCategory.items.find((i) => i.id === id);
                      if (!item) return null;
                      return (
                        <Reorder.Item
                          key={id}
                          value={id}
                          className="grid grid-cols-[24px_1fr_140px_100px_140px] gap-3 items-center px-2 py-2 rounded-lg hover:bg-muted/50"
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                          <div className="min-w-0">
                            <div className="font-medium truncate">{item.nameEn}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {item.originalName}
                            </div>
                          </div>
                          <div className="font-medium">
                            {item.priceValue !== null ? `${item.priceValue.toLocaleString()} ${item.priceCurrency}` : "—"}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            {item.isSpicy && <Flame className="w-4 h-4 text-red-500" />}
                            {item.isLocalSpecial && <Star className="w-4 h-4 text-amber-500" />}
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setEditingItemId(item.id)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              {t("editItem")}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => deleteItem(selectedCategory.id, item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </Reorder.Item>
                      );
                    })}
                  </Reorder.Group>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden">
                  <Reorder.Group
                    axis="y"
                    values={itemIds}
                    onReorder={(newOrder) => {
                      setCategories((prev) =>
                        normalizeOrders(
                          prev.map((c) => {
                            if (c.id !== selectedCategory.id) return c;
                            return { ...c, items: reorderByIds(c.items, newOrder) };
                          })
                        )
                      );
                      setDirty(true);
                    }}
                    className="space-y-2"
                  >
                    {itemIds.map((id) => {
                      const item = selectedCategory.items.find((i) => i.id === id);
                      if (!item) return null;
                      return (
                        <Reorder.Item key={id} value={id}>
                          <Card className="p-4 flex items-center gap-3">
                            <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{item.nameEn}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {item.originalName}
                              </div>
                              <div className="text-sm mt-1">
                                {item.priceValue !== null
                                  ? `${item.priceValue.toLocaleString()} ${item.priceCurrency}`
                                  : "—"}
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                {item.isSpicy && <Flame className="w-4 h-4 text-red-500" />}
                                {item.isLocalSpecial && <Star className="w-4 h-4 text-amber-500" />}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button variant="outline" size="sm" onClick={() => setEditingItemId(item.id)}>
                                {t("editItem")}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => deleteItem(selectedCategory.id, item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </Card>
                        </Reorder.Item>
                      );
                    })}
                  </Reorder.Group>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      <Dialog open={Boolean(editingItem)} onOpenChange={(open) => !open && setEditingItemId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("editItem")}</DialogTitle>
          </DialogHeader>

          {editingItem && selectedCategory && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("original")}</Label>
                <Input
                  value={editingItem.originalName}
                  onChange={(e) =>
                    updateItemField(selectedCategory.id, editingItem.id, "originalName", e.target.value)
                  }
                />
              </div>

              <Tabs defaultValue="en">
                <TabsList className="h-9">
                  <TabsTrigger value="en" className="text-sm">
                    EN
                  </TabsTrigger>
                  <TabsTrigger value="ru" className="text-sm">
                    RU
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="en" className="space-y-3 mt-3">
                  <div className="space-y-2">
                    <Label>{t("english")}</Label>
                    <Input
                      value={editingItem.nameEn}
                      onChange={(e) =>
                        updateItemField(selectedCategory.id, editingItem.id, "nameEn", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("description")}</Label>
                    <textarea
                      value={editingItem.descriptionEn || ""}
                      onChange={(e) =>
                        updateItemField(
                          selectedCategory.id,
                          editingItem.id,
                          "descriptionEn",
                          e.target.value.trim() ? e.target.value : null
                        )
                      }
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[90px]"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="ru" className="space-y-3 mt-3">
                  <div className="space-y-2">
                    <Label>{t("russian")}</Label>
                  <Input
                    value={editingItem.nameRu}
                    onChange={(e) =>
                      updateItemField(selectedCategory.id, editingItem.id, "nameRu", e.target.value)
                    }
                  />
                </div>
                  <div className="space-y-2">
                    <Label>{t("description")}</Label>
                    <textarea
                      value={editingItem.descriptionRu || ""}
                      onChange={(e) =>
                        updateItemField(
                          selectedCategory.id,
                          editingItem.id,
                          "descriptionRu",
                          e.target.value.trim() ? e.target.value : null
                        )
                      }
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[90px]"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("price")}</Label>
                  <div className="flex gap-2">
                    <Input
                      inputMode="numeric"
                      value={editingItem.priceValue ?? ""}
                      onChange={(e) =>
                        updateItemField(
                          selectedCategory.id,
                          editingItem.id,
                          "priceValue",
                          coerceNumberOrNull(e.target.value)
                        )
                      }
                      placeholder="15000"
                    />
                    <Input
                      value={editingItem.priceCurrency || "IDR"}
                      onChange={(e) =>
                        updateItemField(
                          selectedCategory.id,
                          editingItem.id,
                          "priceCurrency",
                          e.target.value.toUpperCase()
                        )
                      }
                      className="w-24"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("calories")}</Label>
                  <Input
                    inputMode="numeric"
                    value={editingItem.approxCalories ?? ""}
                    onChange={(e) =>
                      updateItemField(
                        selectedCategory.id,
                        editingItem.id,
                        "approxCalories",
                        coerceNumberOrNull(e.target.value)
                      )
                    }
                    placeholder="320"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-red-500" />
                    <span className="text-sm">{t("spicy")}</span>
                  </div>
                  <Switch
                    checked={editingItem.isSpicy}
                    onCheckedChange={(checked) =>
                      updateItemField(selectedCategory.id, editingItem.id, "isSpicy", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span className="text-sm">{t("special")}</span>
                  </div>
                  <Switch
                    checked={editingItem.isLocalSpecial}
                    onCheckedChange={(checked) =>
                      updateItemField(selectedCategory.id, editingItem.id, "isLocalSpecial", checked)
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
