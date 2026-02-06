import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Component that redirects users to dashboard when direct access is blocked
 */
export function RedirectToDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard
    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold">Redirecting to Dashboard...</p>
        <p className="text-sm text-muted-foreground">
          Direct URL access is not allowed. Please use the navigation menu.
        </p>
      </div>
    </div>
  );
}

