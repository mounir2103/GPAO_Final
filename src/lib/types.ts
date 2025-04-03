
// Types pour la gestion des articles et stocks

export type ArticleType = 'raw' | 'component' | 'finished';

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
