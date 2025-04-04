
import axios from 'axios';
import { ApiResponse, ArticleDTO, PageRequest, PageResponse } from '@/lib/types';

// Configuration de base de l'API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Instance axios avec configuration de base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Une erreur est survenue';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

// Services pour les articles
export const articleService = {
  // Récupérer tous les articles avec pagination
  getArticles: async (pageRequest: PageRequest) => {
    const response = await apiClient.get<ApiResponse<PageResponse<ArticleDTO>>>('/articles', {
      params: {
        page: pageRequest.page,
        size: pageRequest.size,
        sort: pageRequest.sort,
      },
    });
    return response.data;
  },

  // Récupérer un article par ID
  getArticleById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<ArticleDTO>>(`/articles/${id}`);
    return response.data;
  },

  // Créer un nouvel article
  createArticle: async (article: ArticleDTO) => {
    const response = await apiClient.post<ApiResponse<ArticleDTO>>('/articles', article);
    return response.data;
  },

  // Mettre à jour un article
  updateArticle: async (id: string, article: ArticleDTO) => {
    const response = await apiClient.put<ApiResponse<ArticleDTO>>(`/articles/${id}`, article);
    return response.data;
  },

  // Supprimer un article
  deleteArticle: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/articles/${id}`);
    return response.data;
  },
};

// Services pour le CBN
export const cbnService = {
  // Récupérer les données de CBN pour un article
  getCBNForArticle: async (articleId: string) => {
    const response = await apiClient.get<ApiResponse<any>>(`/cbn/${articleId}`);
    return response.data;
  },

  // Calculer le CBN pour un article
  calculateCBN: async (articleId: string, params: any) => {
    const response = await apiClient.post<ApiResponse<any>>(`/cbn/calculate/${articleId}`, params);
    return response.data;
  },
};

// Services pour les stocks
export const stockService = {
  // Récupérer les stocks pour un article
  getStockForArticle: async (articleId: string) => {
    const response = await apiClient.get<ApiResponse<any>>(`/stocks/${articleId}`);
    return response.data;
  },

  // Mettre à jour le stock d'un article
  updateStock: async (articleId: string, stockData: any) => {
    const response = await apiClient.put<ApiResponse<any>>(`/stocks/${articleId}`, stockData);
    return response.data;
  },
};

export default {
  articleService,
  cbnService,
  stockService,
};
