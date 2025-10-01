export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private fallbackUrl: string;
  
  constructor(baseUrl: string, defaultHeaders: Record<string, string> = {}) {
    // Use the provided baseUrl (which should be properly configured in main.tsx)
    this.baseUrl = baseUrl;
    
    // Set fallback URL for error handling
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      this.fallbackUrl = 'https://nexzenapi.smdigitalx.com/api';
      console.log('ApiClient: Development mode - using proxy:', this.baseUrl);
    } else {
      this.fallbackUrl = baseUrl.replace('http://', 'https://');
    }

    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };

    // Get auth token from auth store if available
    if (typeof window !== 'undefined') {
      this.refreshAuthToken();
    }

    // Debug: Check if we have an auth token in the headers
    console.log('🔍 ApiClient Constructor - Default headers:', this.defaultHeaders);
    console.log('🔍 ApiClient Constructor - Auth token present:', !!this.defaultHeaders['Authorization']);
    
    // Debug logging to understand what URL is being used
    console.log('🔍 ApiClient initialized with baseUrl:', this.baseUrl);
    console.log('🔍 ApiClient baseUrl type:', typeof this.baseUrl);
    console.log('🔍 ApiClient baseUrl JSON:', JSON.stringify(this.baseUrl));
    console.log('ApiClient fallbackUrl:', this.fallbackUrl);
    console.log('ApiClient defaultHeaders:', this.defaultHeaders);
    
    // Debug: Check if we're in development and using proxy
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      if (this.baseUrl === '/api') {
        console.log('✅ ApiClient correctly configured for proxy usage');
        console.log('🔄 Requests will be proxied through Vite dev server');
      } else {
        console.error('❌ ApiClient NOT configured for proxy usage:', this.baseUrl);
      }
    }
  }
  
  private async makeRequest<T>(
    method: string,
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    // Refresh auth token before making request
    this.refreshAuthToken();
    
    // Debug: Log the current state before making the request
    console.log('🚀 Making API request:', {
      method,
      endpoint,
      hasAuthHeader: !!this.defaultHeaders['Authorization'],
      authHeader: this.defaultHeaders['Authorization'] ? 
        this.defaultHeaders['Authorization'].substring(0, 30) + '...' : 'No auth header'
    });
    
    return this.tryRequest<T>(method, endpoint, data, headers, this.baseUrl);
  }
  
  private async tryRequest<T>(
    method: string,
    endpoint: string,
    data?: any,
    headers?: Record<string, string>,
    baseUrl?: string
  ): Promise<ApiResponse<T>> {
    // Don't add /v1 prefix if baseUrl already includes it
    const baseUrlToUse = baseUrl || this.baseUrl;
    const normalizedEndpoint = baseUrlToUse.includes('/v1') ? endpoint : `/v1${endpoint}`;
    let url = `${baseUrlToUse}${normalizedEndpoint}`;
    
    // Simple URL handling
    
    const requestHeaders = { ...this.defaultHeaders, ...headers };
    
        console.log('🌐 API Request:', { method, url, headers: requestHeaders });
        console.log('🔑 Authorization header:', requestHeaders['Authorization'] ? 'Present' : 'Missing');
        console.log('🔍 Full URL being called:', url);
        console.log('🔍 Base URL used:', baseUrlToUse);
        console.log('🔍 Endpoint:', endpoint);
        console.log('🔍 Normalized endpoint:', normalizedEndpoint);

        // Debug: Show the actual token being sent
        if (requestHeaders['Authorization']) {
          const token = requestHeaders['Authorization'].replace('Bearer ', '');
          console.log('🎫 Token being sent:', token.substring(0, 50) + '...');
          
          // Try to decode the JWT token to see what's inside
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('🔍 JWT Payload:', payload);
            console.log('👤 User ID:', payload.user_id);
            console.log('🏢 Institute ID:', payload.institute_id);
            console.log('🏢 Current Branch ID:', payload.current_branch_id);
            console.log('🎭 Roles in token:', payload.roles);
            console.log('👑 Is institute admin:', payload.is_institute_admin);
          } catch (e) {
            console.log('❌ Could not decode JWT token:', e);
          }
        }
    
    // Debug: Log the request
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log('🌐 Making API request to:', url);
    }
    
    const config: RequestInit = {
      method,
      headers: requestHeaders,
      credentials: 'include',
      redirect: 'follow', // Follow redirects properly
    };
    
    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(url, config);
      
      // Log response details for debugging
      console.log('API Response:', { 
        url: response.url, 
        status: response.status, 
        redirected: response.redirected,
        type: response.type 
      });
      
      // Check if we were redirected to HTTP (which causes CORS issues)
      if (response.redirected && response.url.startsWith('http://')) {
        console.warn('⚠️ Request was redirected to HTTP, which may cause CORS issues');
        console.warn('Original URL:', url);
        console.warn('Final URL:', response.url);
      }
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new ApiError(
          responseData.message || responseData.detail || 'Request failed',
          response.status,
          responseData.code,
          responseData
        );
      }
      
      return {
        data: responseData,
        status: response.status,
        message: responseData.message,
      };
    } catch (error) {
      // Simple error handling
      console.error('API request failed:', error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle CORS errors specifically
      if (error instanceof TypeError && error.message.includes('CORS')) {
        throw new ApiError(
          'CORS error: Unable to connect to API server. Please check your network connection.',
          0,
          'CORS_ERROR'
        );
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError(
          'Network error: Unable to connect to API server. Please check your internet connection.',
          0,
          'NETWORK_ERROR'
        );
      }
      
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0,
        'NETWORK_ERROR'
      );
    }
  }
  
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('GET', endpoint, undefined, headers);
  }
  
  async post<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('POST', endpoint, data, headers);
  }
  
  async put<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PUT', endpoint, data, headers);
  }
  
  async patch<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PATCH', endpoint, data, headers);
  }
  
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('DELETE', endpoint, undefined, headers);
  }
  
  setAuthToken(token: string): void {
    console.log('🔑 ApiClient.setAuthToken called with token:', token.substring(0, 20) + '...');
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    console.log('🔑 Auth token set in headers:', !!this.defaultHeaders['Authorization']);
    console.log('🔑 Updated headers:', this.defaultHeaders);
  }
  
  removeAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }
  
  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  refreshAuthToken(): void {
    console.log('🔄 Refreshing auth token...');
    console.log('🔄 Current headers before refresh:', this.defaultHeaders);
    
    // First try to get token from auth store directly (more reliable)
    try {
      // Import auth store dynamically to avoid circular dependencies
      const { useAuthStore } = require('../../../store/authStore');
      const authState = useAuthStore.getState();
      console.log('🔄 Auth store state:', {
        hasToken: !!authState.token,
        tokenPreview: authState.token ? authState.token.substring(0, 20) + '...' : 'No token',
        isAuthenticated: authState.isAuthenticated,
        hasUser: !!authState.user,
        tokenExpireAt: authState.tokenExpireAt ? new Date(authState.tokenExpireAt).toISOString() : 'No expiry',
        isTokenExpired: authState.tokenExpireAt ? Date.now() > authState.tokenExpireAt : 'No expiry set'
      });
      
      if (authState.token && authState.user) {
        // Check if token is expired
        if (authState.tokenExpireAt && Date.now() > authState.tokenExpireAt) {
          console.warn('⚠️ Token is expired, removing authorization header');
          delete this.defaultHeaders['Authorization'];
          return;
        }
        
        this.defaultHeaders['Authorization'] = `Bearer ${authState.token}`;
        console.log('🔄 Auth token refreshed from auth store:', authState.token.substring(0, 20) + '...');
        console.log('🔄 Updated headers after refresh:', this.defaultHeaders);
        return;
      } else {
        console.log('🔄 No token or user in auth store, removing authorization header');
        delete this.defaultHeaders['Authorization'];
      }
    } catch (error) {
      console.log('Could not access auth store directly, falling back to localStorage:', error);
    }

    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      try {
        const authData = localStorage.getItem('auth-storage');
        if (authData) {
          const parsed = JSON.parse(authData);
          if (parsed.state?.token) {
            this.defaultHeaders['Authorization'] = `Bearer ${parsed.state.token}`;
            console.log('🔄 Auth token refreshed from localStorage:', parsed.state.token.substring(0, 20) + '...');
          } else {
            delete this.defaultHeaders['Authorization'];
            console.warn('⚠️ No auth token found in localStorage, removed from headers');
          }
        } else {
          delete this.defaultHeaders['Authorization'];
          console.warn('⚠️ No auth data found in localStorage, removed from headers');
        }
      } catch (error) {
        console.warn('⚠️ Could not refresh auth token from localStorage:', error);
      }
    }
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
