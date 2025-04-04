import axios from 'axios';
import type {
  ApiResponse,
  Article,
  ArticleDTO,
  ArticleComponent,
  PageRequest,
  PageResponse,
  Stock,
  CBNCalculation,
  SupplierOrder,
  ManufacturingOrder
} from '@/lib/types';

// Configuration de base de l'API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8095/api/v1';

// Instance axios avec configuration de base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.response?.data?.error || 'Une erreur est survenue';
    console.error('API Error:', message);
    return Promise.reject(message);
  }
);

export const articleService = {
  /**
   * Crée un nouvel article
   */
  createArticle: async (article: ArticleDTO): Promise<ApiResponse<Article>> => {
    try {
      const response = await apiClient.post<ApiResponse<Article>>('/article/create-article', article);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: typeof error === 'string' ? error : 'Erreur lors de la création'
      };
    }
  },

  /**
   * Supprime un article par son nom
   */
  deleteArticle: async (articleName: string): Promise<ApiResponse<void>> => {
    try {
      await apiClient.delete(`/article/delete/${articleName}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: typeof error === 'string' ? error : 'Erreur lors de la suppression'
      };
    }
  },

  /**
   * Récupère un article par son nom
   */
  getArticleByName: async (articleName: string): Promise<ApiResponse<Article>> => {
    try {
      const response = await apiClient.get<Article>(`/article/get-article/${articleName}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: typeof error === 'string' ? error : 'Erreur lors de la récupération'
      };
    }
  },

  /**
   * Récupère tous les articles avec pagination
   */
  getAllArticles: async (pageRequest: PageRequest): Promise<ApiResponse<PageResponse<Article>>> => {
    try {
      const response = await apiClient.get<PageResponse<Article>>('/article/all-articles', {
        params: {
          page: pageRequest.page,
          size: pageRequest.size,
          sort: pageRequest.sort,
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: typeof error === 'string' ? error : 'Erreur lors de la récupération'
      };
    }
  },

  /**
   * Récupère les articles matières premières
   */
  getRawMaterialArticles: async (pageRequest: PageRequest): Promise<ApiResponse<PageResponse<Article>>> => {
    try {
      const response = await apiClient.get<PageResponse<Article>>('/article/all-raw-material-articles', {
        params: {
          page: pageRequest.page,
          size: pageRequest.size,
          sort: pageRequest.sort,
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: typeof error === 'string' ? error : 'Erreur lors de la récupération'
      };
    }
  },

  /**
   * Récupère les articles finis
   */
  getFinishedArticles: async (pageRequest: PageRequest): Promise<ApiResponse<PageResponse<Article>>> => {
    try {
      const response = await apiClient.get<PageResponse<Article>>('/article/all-finished-articles', {
        params: {
          page: pageRequest.page,
          size: pageRequest.size,
          sort: pageRequest.sort,
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: typeof error === 'string' ? error : 'Erreur lors de la récupération'
      };
    }
  },

  /**
   * Met à jour un article
   */
  updateArticle: async (articleId: string, article: Partial<ArticleDTO>): Promise<ApiResponse<Article>> => {
    try {
      const response = await apiClient.put<Article>(`/article/update/${articleId}`, article);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: typeof error === 'string' ? error : 'Erreur lors de la mise à jour'
      };
    }
  },

  /**
   * Récupère les composants d'un article
   */
  getArticleComponents: async (articleId: string): Promise<ApiResponse<ArticleComponent[]>> => {
    try {
      const response = await apiClient.get<ArticleComponent[]>(`/article/${articleId}/components`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: typeof error === 'string' ? error : 'Erreur lors de la récupération'
      };
    }
  },

  /**
   * Ajoute un composant à un article
   */
  addComponent: async (articleId: string, component: Omit<ArticleComponent, 'articleId'>): Promise<ApiResponse<ArticleComponent>> => {
    try {
      const response = await apiClient.post<ArticleComponent>(`/article/${articleId}/components`, component);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: typeof error === 'string' ? error : 'Erreur lors de l\'ajout'
      };
    }
  },
};

export const stockService = {
  /**
   * Récupère le stock d'un article
   */
  getStock: async (articleId: string): Promise<ApiResponse<Stock>> => {
    try {
      const response = await apiClient.get<Stock>(`/stock/${articleId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: typeof error === 'string' ? error : 'Erreur lors de la récupération'
      };
    }
  },

  /**
   * Met à jour le stock d'un article
   */
  updateStock: async (articleId: string, stockUpdate: Partial<Stock>): Promise<ApiResponse<Stock>> => {
    try {
      const response = await apiClient.put<Stock>(`/stock/${articleId}`, stockUpdate);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: typeof error === 'string' ? error : 'Erreur lors de la mise à jour'
      };
    }
  },
};

export const cbnService = {
  /**
   * Calcule le CBN pour un article
   */
  calculateCBN: async (articleId: string, periods: number[]): Promise<ApiResponse<CBNCalculation>> => {
    try {
      const response = await apiClient.post<CBNCalculation>(`/cbn/calculate/${articleId}`, { periods });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: typeof error === 'string' ? error : 'Erreur lors du calcul'
      };
    }
  },

  /**
   * Récupère le calcul CBN existant
   */
  getCBN: async (articleId: string): Promise<ApiResponse<CBNCalculation>> => {
    try {
      const response = await apiClient.get<CBNCalculation>(`/cbn/${articleId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: typeof error === 'string' ? error : 'Erreur lors de la récupération'
      };
    }
  },
};

export const orderService = {
  /**
   * Récupère les commandes fournisseur
   */
  getSupplierOrders: async (articleId?: string): Promise<ApiResponse<SupplierOrder[]>> => {
    try {
      const url = articleId ? `/orders/supplier?articleId=${articleId}` : '/orders/supplier';
      const response = await apiClient.get<SupplierOrder[]>(url);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: typeof error === 'string' ? error : 'Erreur lors de la récupération'
      };
    }
  },

  /**
   * Récupère les ordres de fabrication
   */
  getManufacturingOrders: async (articleId?: string): Promise<ApiResponse<ManufacturingOrder[]>> => {
    try {
      const url = articleId ? `/orders/manufacturing?articleId=${articleId}` : '/orders/manufacturing';
      const response = await apiClient.get<ManufacturingOrder[]>(url);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: typeof error === 'string' ? error : 'Erreur lors de la récupération'
      };
    }
  },
};

export default {
  articleService,
  stockService,
  cbnService,
  orderService,
};