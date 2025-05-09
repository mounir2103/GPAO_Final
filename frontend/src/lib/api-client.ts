import { API_BASE_URL } from '@/config';

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

class ApiClient {
  private static getAuthHeader(): HeadersInit {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return { 'Authorization': `Bearer ${token}` };
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        // Clear token and redirect to login
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        throw new Error('Authentication required');
      }
      if (response.status === 403) {
        // Forbidden: do not clear token, just throw
        throw new Error('Forbidden: You do not have permission to perform this action.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  static async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { requiresAuth = true, ...fetchOptions } = options;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(requiresAuth ? this.getAuthHeader() : {}),
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error && error.message === 'No authentication token found') {
        window.location.href = '/login';
      }
      throw error;
    }
  }

  static get<T>(endpoint: string, options: RequestOptions = {}) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  static post<T>(endpoint: string, data?: any, options: RequestOptions = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static put<T>(endpoint: string, data?: any, options: RequestOptions = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static delete<T>(endpoint: string, options: RequestOptions = {}) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export default ApiClient; 