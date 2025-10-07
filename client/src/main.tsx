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


// Debug: Check auth store state
const authState = useAuthStore.getState();

// Initialize ServiceLocator with current auth state
ServiceLocator.initialize({
  apiBaseUrl: apiClientBaseUrl, // Use /api for ApiClient (it adds /v1 automatically)
  authToken: authState.token || undefined
});

// Check if user is authenticated
if (!authState.token || !authState.user) {
} else {
  
  // Check if token is expired
  if (authState.tokenExpireAt && Date.now() > authState.tokenExpireAt) {
  }
}

// Listen for auth store changes and update ServiceLocator
useAuthStore.subscribe((state) => {
  
  if (state.token) {
    ServiceLocator.setAuthToken(state.token);
  } else {
    ServiceLocator.removeAuthToken();
  }
});


// Test ServiceLocator configuration
try {
  const apiClient = ServiceLocator.getApiClient();
} catch (error) {
  console.error('❌ ServiceLocator not properly initialized:', error);
}

createRoot(document.getElementById("root")!).render(<App />);
