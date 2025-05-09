// src/lib/types.ts
// Types pour la gestion des articles et stocks

export type ArticleType = 'raw' | 'component' | 'finished';
export type ArticleStatus = 'RAW_MATERIAL' | 'FINISHED';

export interface Article {
  articleId: number;
  codeBare: string;
  name: string;
  articleDescription: string;
  unitPrice: number;
  tva: number;
  fournisseur: string;
  delaidoptention: number;
  status: ArticleStatus;
  isArticleFabrique: boolean;
  isArticleAchte: boolean;
  safetyStock: number;
  bomEntries: ArticleComponent[];
  // Properties needed for CBN calculation
  stockSecurity: number;
  leadTime: number;
  lotSize: number;
  components?: ArticleComponent[];
  // Legacy properties for compatibility
  code?: string;
  type?: ArticleType;
  unit?: string;
  price?: number;
  supplier?: string;
  isActive?: boolean;
  // Stock information
  stock?: {
    quantity: number;
    minQuantity: number;
    location: string;
    lastUpdated: string;
  };
}

export interface ArticleComponent {
  articleId: number;
  parentArticle?: Article;
  childArticle?: Article;
  quantity: number;
}

export interface Stock {
  id: number;
  articleId: number;
  articleName: string;
  articleCode: string;
  quantity: number;
  minQuantity: number;
  lastUpdated: string;
  location: string;
}

export interface PlanningPeriod {
  periodId: number;
  periodName?: string;
  startDate?: string;
  endDate?: string;
}

export interface CBNInput {
  articleId: string;
  periodId: number;
  quantity: number;
}

export interface CBNCalculation {
  articleId: number;
  periods: CBNPeriod[];
}

export interface CBNPeriod {
  periodId: number;
  periodName?: string;
  grossRequirements: number;
  scheduledReceipts: number;
  projectedInventory: number;
  netRequirements: number;
  plannedOrders: number;
  plannedOrderReleases: number;
  plannedOrderReceipts: number;
}

export interface SupplierOrder {
  id: string;
  supplierName: string;
  articleId: string;
  articleName?: string;
  quantity: number;
  expectedDate: Date;
  status: 'pending' | 'confirmed' | 'received';
}

export interface ManufacturingOrder {
  id: string;
  articleId: string;
  articleName?: string;
  quantity: number;
  startDate: Date;
  endDate: Date;
  status: 'planned' | 'inProgress' | 'completed';
}

// Nouvelles interfaces pour les API REST Spring Boot

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status?: number;
  details?: string;
}

export interface PageRequest {
  page: number;
  size: number;
  sort?: string;
}

export interface PageResponse<T> {
  list: T[];
  totalElements: number;
  totalPages: number;
  pageSize: number;
  pageNumber: number;
  firstPage: boolean;
  lastPage: boolean;
}

export interface ArticleDTO {
  articleId?: number;
  codeBare: string;
  articleName: string;
  articleDescription: string;
  unitPrice: number;
  tva: number;
  fournisseur: string;
  delaidoptention: number;
  status: ArticleStatus;
  isArticleFabrique: boolean;
  isArticleAchte: boolean;
  safetyStock: number;
  lotSize: number;
  type: ArticleType;
  unit: string;
}

export interface CBNEntity {
  id: number;
  articleId: number;
  periodId: number;
  periodName: string;
  grossRequirements: number;
  scheduledReceipts: number;
  projectedInventory: number;
  netRequirements: number;
  plannedOrders: number;
  plannedOrderReleases: number;
  createdDate: string;
}

export interface StockTransaction {
  id: number;
  quantityChange: number;
  type: "ENTRY" | "EXIT";
  user: string;
  timestamp: string;
  note: string;
}

