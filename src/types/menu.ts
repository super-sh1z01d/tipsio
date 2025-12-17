export interface MenuCategoryData {
  id?: string;
  nameEn: string;
  nameOriginal: string | null;
  nameRu: string | null;
  order: number;
  items: MenuItemData[];
}

export interface MenuItemData {
  id?: string;
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

export interface PublicMenuCategory {
  id: string;
  nameEn: string;
  nameOriginal: string | null;
  nameRu: string | null;
  items: PublicMenuItem[];
}

export interface PublicMenuItem {
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
}
