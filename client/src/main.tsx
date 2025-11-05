import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { useAuthStore } from "./store/authStore";

// Import react-utils to ensure React APIs are available
import "./lib/react-utils";

// Runtime check to ensure React.forwardRef is available
// if (typeof window !== "undefined") {
//   try {
//     // Test if React.forwardRef is available
//     if (typeof React.forwardRef !== "function") {
//       console.error("❌ React.forwardRef is not available!");
//     } else {
//     //  console.log("✅ React.forwardRef is available");
//     }
//   } catch (error) {
//     console.error("❌ React check failed:", error);
//   }
// }

// Initialize clean architecture services
// Use proxy for development to avoid CORS issues
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api/v1";

// For ApiClient (clean architecture), we need to separate the base URL
// ApiClient expects /api (it adds /v1 automatically)
// Simple API needs /api/v1 (complete path)
let apiClientBaseUrl: string;

if (
  apiBaseUrl.includes("https://erpapi.velonex.in") ||
  apiBaseUrl.includes("http://") ||
  apiBaseUrl.includes("https://")
) {
  console.warn(
    "Detected external API URL, using direct connection for ApiClient"
  );
  // In production, use the full URL directly
  apiClientBaseUrl = apiBaseUrl.replace("/api/v1", "/api"); // Remove /v1 for ApiClient
} else if (apiBaseUrl === "/api/v1") {
  // In development with proxy, ApiClient should use /api (without /v1)
  apiClientBaseUrl = "/api";
} else {
  apiClientBaseUrl = apiBaseUrl;
}

// Debug: Check auth store state
const authState = useAuthStore.getState();

// Check if user is authenticated
if (!authState.token || !authState.user) {
} else {
  // Check if token is expired
  if (authState.tokenExpireAt && Date.now() > authState.tokenExpireAt) {
  }
}

createRoot(document.getElementById("root")!).render(<App />);
