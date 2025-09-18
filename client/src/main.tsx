import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Debug: verify API base URL at runtime
// eslint-disable-next-line no-console
console.debug("API Base URL:", (import.meta as any).env.VITE_API_BASE_URL);