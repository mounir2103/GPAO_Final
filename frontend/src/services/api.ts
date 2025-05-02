// src/services/api.ts
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
  ManufacturingOrder,
  CBNEntity,
  CBNPeriod
} from '@/lib/types';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8095/api/v1/';
console.log('API Base URL:', API_BASE_URL);

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true
});

// Token management utilities
const getStoredToken = (): string | null => {
  return localStorage.getItem('access_token');
};

const setStoredToken = (token: string): void => {
  localStorage.setItem('access_token', token);
};

const isTokenValid = (token: string): boolean => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    const payload = JSON.parse(jsonPayload);
    return payload.exp * 1000 > Date.now();
  } catch (e) {
    return false;
  }
};

// Request interceptor
apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  console.log('API Request:', {
    url: config.url,
    method: config.method,
    hasToken: !!token,
    headers: config.headers
  });
  
  if (token) {
    if (!isTokenValid(token)) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
      throw new Error('Your session has expired. Please log in again.');
    }
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('No authentication token found for request:', config.url);
  }
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Only redirect on actual authentication errors, not 404s
    if (error.response?.status === 401) {
      console.warn('Authentication failed - redirecting to login');
      localStorage.removeItem('access_token');
      window.location.href = '/login';
      return Promise.reject({
        message: 'Your session has expired. Please log in again.',
        status: error.response?.status
      });
    }
    return Promise.reject(error);
  }
);

// Authentication utilities
export const authHelper = {
  setToken: (token: string): void => {
    setStoredToken(token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },
  clearToken: (): void => {
    localStorage.removeItem('access_token');
    delete apiClient.defaults.headers.common['Authorization'];
  },
  getCurrentToken: (): string | null => {
    return getStoredToken();
  }
};

// Article Service
export const articleService = {
  /**
   * Gets all articles with pagination
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
    } catch (error: any) {
      console.error('Error fetching articles:', error);
      return {
        success: false,
        error: error?.response?.data?.message || 'Error fetching articles',
        status: error?.response?.status
      };
    }
  },

  /**
   * Creates a new article
   */
  createArticle: async (article: ArticleDTO): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post('/article/create-article', article);
      return { 
        success: true, 
        message: (response.data as { message: string }).message 
      };
    } catch (error: any) {
      console.error('Error creating article:', error);
      return {
        success: false,
        error: error?.response?.data?.message || 'Error creating article',
        status: error?.response?.status
      };
    }
  },

  /**
   * Updates an existing article
   */
  updateArticle: async (id: number, article: ArticleDTO): Promise<ApiResponse<Article>> => {
    try {
      const response = await apiClient.put<Article>(`/article/${id}`, article);
      return { 
        success: true, 
        data: response.data,
        message: 'Article updated successfully'
      };
    } catch (error: any) {
      console.error('Error updating article:', error);
      return {
        success: false,
        error: error?.response?.data?.message || 'Failed to update article. Please try again.',
        status: error?.response?.status
      };
    }
  },

  /**
   * Deletes an article
   */
  deleteArticle: async (name: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete(`/article/delete/${name}`);
      return { 
        success: true,
        message: 'Article deleted successfully'
      };
    } catch (error: any) {
      console.error('Error deleting article:', error);
      return {
        success: false,
        error: error?.response?.data?.message || 'Failed to delete article. Please try again.',
        status: error?.response?.status
      };
    }
  },

  /**
   * Gets article by name
   */
  getArticleByName: async (articleName: string): Promise<ApiResponse<Article>> => {
    try {
      const response = await apiClient.get<Article>(`/article/get-article/${articleName}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Error fetching article',
        status: error?.status
      };
    }
  },

  /**
   * Gets raw material articles
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
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Error fetching raw materials',
        status: error?.status
      };
    }
  },

  /**
   * Gets finished articles
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
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Error fetching finished articles',
        status: error?.status
      };
    }
  },

  /**
   * Gets article components
   */
  getArticleComponents: async (articleId: string): Promise<ApiResponse<ArticleComponent[]>> => {
    try {
      const response = await apiClient.get<ArticleComponent[]>(`/article/${articleId}/components`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Error fetching components',
        status: error?.status
      };
    }
  },

  /**
   * Adds component to article
   */
  addComponent: async (articleId: string, component: Omit<ArticleComponent, 'articleId'>): Promise<ApiResponse<ArticleComponent>> => {
    try {
      const response = await apiClient.post<ArticleComponent>(`/article/${articleId}/components`, component);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Error adding component',
        status: error?.status
      };
    }
  },
};

// Stock Service
export const stockService = {
  /**
   * Gets all stocks
   */
  getAllStocks: async (): Promise<ApiResponse<Stock[]>> => {
    console.log('Calling getAllStocks API...');
    try {
      console.log('Making request to:', `${API_BASE_URL}stock`);
      const response = await apiClient.get<Stock[]>('/stock');
      console.log('getAllStocks response:', response);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error in getAllStocks:', error);
      console.error('Error response:', error?.response);
      return {
        success: false,
        error: error?.response?.data?.message || error?.message || 'Error fetching stocks',
        status: error?.response?.status
      };
    }
  },

  /**
   * Gets stock for an article
   */
  getStock: async (articleId: number): Promise<ApiResponse<Stock>> => {
    try {
      const response = await apiClient.get<Stock>(`/stock/${articleId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Error fetching stock',
        status: error?.status
      };
    }
  },

  /**
   * Updates stock for an article
   */
  updateStock: async (articleId: number, stockUpdate: Partial<Stock>): Promise<ApiResponse<Stock>> => {
    try {
      const response = await apiClient.put<Stock>(`/stock/${articleId}`, stockUpdate);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Error updating stock',
        status: error?.status
      };
    }
  },

  /**
   * Adjusts stock quantity for an article
   */
  adjustStock: async (articleId: number, adjustment: number): Promise<ApiResponse<Stock>> => {
    try {
      const response = await apiClient.post<Stock>(`/stock/${articleId}/adjust`, null, {
        params: { adjustment }
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Error adjusting stock',
        status: error?.status
      };
    }
  }
};

// CBN Service
export const cbnService = {
  /**
   * Calculates CBN for an article
   */
  calculateCBN: async (articleId: string, periods: CBNPeriod[]): Promise<ApiResponse<CBNCalculation>> => {
    try {
      console.log('Calculating CBN for article:', articleId, 'with periods:', periods);
      const response = await apiClient.post<CBNEntity[]>(`/cbn/calculate/${articleId}`, 
        periods.map(p => ({
          periodId: p.periodId,
          grossRequirements: p.grossRequirements,
          scheduledReceipts: p.scheduledReceipts
        }))
      );
      console.log('CBN calculation response:', response);
      return { 
        success: true, 
        data: {
          articleId: parseInt(articleId),
          periods: response.data.map(period => ({
            periodId: period.periodId,
            periodName: period.periodName,
            grossRequirements: period.grossRequirements,
            scheduledReceipts: period.scheduledReceipts,
            projectedInventory: period.projectedInventory,
            netRequirements: period.netRequirements,
            plannedOrders: period.plannedOrders,
            plannedOrderReleases: period.plannedOrderReleases,
            plannedOrderReceipts: ('plannedOrderReceipts' in period && typeof (period as any).plannedOrderReceipts === 'number') ? (period as any).plannedOrderReceipts : 0
          }))
        }
      };
    } catch (error: any) {
      console.error('Error calculating CBN:', error);
      return {
        success: false,
        error: error?.response?.data?.message || 'Error calculating CBN',
        status: error?.response?.status
      };
    }
  },

  /**
   * Gets existing CBN calculation
   */
  getCBN: async (articleId: string): Promise<ApiResponse<CBNCalculation>> => {
    try {
      console.log('Getting CBN for article:', articleId);
      const response = await apiClient.get<CBNEntity[]>(`/cbn/${articleId}`);
      console.log('Get CBN response:', response);
      return { 
        success: true, 
        data: {
          articleId: parseInt(articleId),
          periods: response.data.map(period => ({
            periodId: period.periodId,
            periodName: period.periodName,
            grossRequirements: period.grossRequirements,
            scheduledReceipts: period.scheduledReceipts,
            projectedInventory: period.projectedInventory,
            netRequirements: period.netRequirements,
            plannedOrders: period.plannedOrders,
            plannedOrderReleases: period.plannedOrderReleases,
            plannedOrderReceipts: ('plannedOrderReceipts' in period && typeof (period as any).plannedOrderReceipts === 'number') ? (period as any).plannedOrderReceipts : 0
          }))
        }
      };
    } catch (error: any) {
      console.error('Error fetching CBN:', error);
      if (error?.response?.status === 404) {
        // Return a default empty CBN structure instead of treating it as an error
        return {
          success: true,
          data: {
            articleId: parseInt(articleId),
            periods: [
              { 
                periodId: 1, 
                periodName: "Period 1",
                grossRequirements: 0,
                scheduledReceipts: 0,
                projectedInventory: 0,
                netRequirements: 0,
                plannedOrders: 0,
                plannedOrderReleases: 0,
                plannedOrderReceipts: 0
              },
              { 
                periodId: 2, 
                periodName: "Period 2",
                grossRequirements: 0,
                scheduledReceipts: 0,
                projectedInventory: 0,
                netRequirements: 0,
                plannedOrders: 0,
                plannedOrderReleases: 0,
                plannedOrderReceipts: 0
              },
              { 
                periodId: 3, 
                periodName: "Period 3",
                grossRequirements: 0,
                scheduledReceipts: 0,
                projectedInventory: 0,
                netRequirements: 0,
                plannedOrders: 0,
                plannedOrderReleases: 0,
                plannedOrderReceipts: 0
              },
              { 
                periodId: 4, 
                periodName: "Period 4",
                grossRequirements: 0,
                scheduledReceipts: 0,
                projectedInventory: 0,
                netRequirements: 0,
                plannedOrders: 0,
                plannedOrderReleases: 0,
                plannedOrderReceipts: 0
              }
            ]
          }
        };
      }
      return {
        success: false,
        error: error?.response?.data?.message || 'Error fetching CBN',
        status: error?.response?.status
      };
    }
  },
};

// Order Service
export const orderService = {
  /**
   * Gets supplier orders
   */
  getSupplierOrders: async (articleId?: string): Promise<ApiResponse<SupplierOrder[]>> => {
    try {
      const url = articleId ? `/orders/supplier?articleId=${articleId}` : '/orders/supplier';
      const response = await apiClient.get<SupplierOrder[]>(url);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Error fetching supplier orders',
        status: error?.status
      };
    }
  },

  /**
   * Gets manufacturing orders
   */
  getManufacturingOrders: async (articleId?: string): Promise<ApiResponse<ManufacturingOrder[]>> => {
    try {
      const url = articleId ? `/orders/manufacturing?articleId=${articleId}` : '/orders/manufacturing';
      const response = await apiClient.get<ManufacturingOrder[]>(url);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Error fetching manufacturing orders',
        status: error?.status
      };
    }
  },
};

// Export all services
export default {
  authHelper,
  articleService,
  stockService,
  cbnService,
  orderService,
};