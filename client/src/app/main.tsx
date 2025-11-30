import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { useAuthStore } from "@/core/auth/authStore";

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
  if (import.meta.env.DEV) {
    console.warn(
      "Detected external API URL, using direct connection for ApiClient"
    );
  }
  // In production, use the full URL directly
  apiClientBaseUrl = apiBaseUrl.replace("/api/v1", "/api"); // Remove /v1 for ApiClient
} else if (apiBaseUrl === "/api/v1") {
  // In development with proxy, ApiClient should use /api (without /v1)
  apiClientBaseUrl = "/api";
} else {
  apiClientBaseUrl = apiBaseUrl;
}

// Auth state is managed by authStore and initialized in App component

createRoot(document.getElementById("root")!).render(<App />);
