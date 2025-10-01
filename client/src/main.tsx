import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize Clean Architecture
import { ServiceLocator } from "./core";
import { useAuthStore } from "./store/authStore";

// Initialize clean architecture services
// Use proxy for development to avoid CORS issues
let apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// For ApiClient (clean architecture), we need to separate the base URL
// ApiClient expects /api (it adds /v1 automatically)
// Simple API needs /api/v1 (complete path)
let apiClientBaseUrl: string;

if (apiBaseUrl.includes('nexzenapi.smdigitalx.com') || apiBaseUrl.includes('http://') || apiBaseUrl.includes('https://')) {
  console.warn('Detected external API URL, using direct connection for ApiClient');
  // In production, use the full URL directly
  apiClientBaseUrl = apiBaseUrl.replace('/api/v1', '/api'); // Remove /v1 for ApiClient
} else if (apiBaseUrl === '/api/v1') {
  // In development with proxy, ApiClient should use /api (without /v1)
  apiClientBaseUrl = '/api';
} else {
  apiClientBaseUrl = apiBaseUrl;
}

console.log('🔧 API Configuration:');
console.log('  - Environment VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('  - Simple API base URL (api.ts):', apiBaseUrl);
console.log('  - ApiClient base URL (ServiceLocator):', apiClientBaseUrl);
console.log('  - Expected Simple API calls: ' + apiBaseUrl + '/auth/login');
console.log('  - Expected ApiClient calls: ' + apiClientBaseUrl + '/v1/roles');
console.log('  - Is external URL detected:', apiBaseUrl.includes('nexzenapi.smdigitalx.com'));
console.log('  - Will use proxy:', apiClientBaseUrl === '/api');

// Debug: Check auth store state
const authState = useAuthStore.getState();
console.log('🔍 Auth Store State:', {
  token: authState.token ? authState.token.substring(0, 20) + '...' : 'No token',
  user: authState.user,
  isAuthenticated: authState.isAuthenticated,
  hasUser: !!authState.user,
  tokenExpireAt: authState.tokenExpireAt ? new Date(authState.tokenExpireAt).toISOString() : 'No expiry',
  isTokenExpired: authState.tokenExpireAt ? Date.now() > authState.tokenExpireAt : 'No expiry set'
});

// Initialize ServiceLocator with current auth state
ServiceLocator.initialize({
  apiBaseUrl: apiClientBaseUrl, // Use /api for ApiClient (it adds /v1 automatically)
  authToken: authState.token || undefined
});

// Check if user is authenticated
if (!authState.token || !authState.user) {
  console.warn('⚠️ User is not authenticated. Please log in first.');
  console.warn('⚠️ This will cause API requests to fail with 403/401 errors.');
} else {
  console.log('✅ User is authenticated, ServiceLocator initialized with token');
  
  // Check if token is expired
  if (authState.tokenExpireAt && Date.now() > authState.tokenExpireAt) {
    console.warn('⚠️ Token is expired! User needs to log in again.');
  }
}

// Listen for auth store changes and update ServiceLocator
useAuthStore.subscribe((state) => {
  console.log('🔔 Auth store changed:', {
    hasToken: !!state.token,
    tokenPreview: state.token ? state.token.substring(0, 20) + '...' : 'No token',
    isAuthenticated: state.isAuthenticated
  });
  
  if (state.token) {
    ServiceLocator.setAuthToken(state.token);
  } else {
    ServiceLocator.removeAuthToken();
  }
});

console.log("🚀 Clean Architecture Initialized");

// Test ServiceLocator configuration
try {
  const apiClient = ServiceLocator.getApiClient();
  console.log('🔧 ServiceLocator ApiClient configured:', {
    baseUrl: apiClient['baseUrl'],
    hasAuthHeader: !!apiClient['defaultHeaders']['Authorization'],
    authHeaderPreview: apiClient['defaultHeaders']['Authorization'] ? 
      apiClient['defaultHeaders']['Authorization'].substring(0, 30) + '...' : 'No auth header'
  });
} catch (error) {
  console.error('❌ ServiceLocator not properly initialized:', error);
}

// Final authentication status check
console.log('🔍 FINAL AUTH STATUS CHECK:');
console.log('  - Should see Login page if not authenticated');
console.log('  - Should see main app if authenticated');
console.log('  - API calls will fail if not authenticated');
console.log('  - Check browser console for detailed auth logs above');

createRoot(document.getElementById("root")!).render(<App />);

// Debug: verify API base URL at runtime
// eslint-disable-next-line no-console
console.debug("API Base URL:", (import.meta as any).env.VITE_API_BASE_URL);