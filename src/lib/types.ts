
// Types pour la gestion des articles et stocks

export type ArticleType = 'raw' | 'component' | 'finished';
export type ArticleStatus = 'active' | 'inactive' | 'discontinued' | 'pending';

export interface Article {
  id: string;
  code: string;
  name: string;
  type: ArticleType;
  unit: string;
  stockSecurity: number;
  leadTime: number;
  lotSize: number;
  price: number;
  // Attributs complémentaires
  articleDescription?: string;
  TVA?: number;
  fournisseur?: string;
  status?: ArticleStatus;
  isArticleFabrique?: boolean;
  isArticleAchete?: boolean;
  // Pour les composants ou produits finis
  components?: ArticleComponent[];
}

export interface ArticleComponent {
  articleId: string;
  articleCode?: string;
  articleName?: string;
  quantity: number;
}

export interface Stock {
  articleId: string;
  articleCode?: string;
  articleName?: string;
  available: number;
  reserved: number;
  expected: number;
  date?: Date;
}

export interface PlanningPeriod {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
}

export interface CBNInput {
  articleId: string;
  periodId: number;
  quantity: number;
}

export interface CBNCalculation {
  articleId: string;
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
}

export interface PageRequest {
  page: number;
  size: number;
  sort?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ArticleDTO {
  id?: string;
  code: string;
  name: string;
  type: ArticleType;
  unit: string;
  stockSecurity: number;
  leadTime: number;
  lotSize: number;
  price: number;
  articleDescription?: string;
  TVA?: number;
  fournisseur?: string;
  status?: ArticleStatus;
  isArticleFabrique: boolean;
  isArticleAchete: boolean;
}
