import React from "react";
import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router-dom";
import { ErrorFallback } from "./ErrorFallback";

export const RouterErrorElement: React.FC = () => {
    const error = useRouteError();
    const navigate = useNavigate();

    let errorMessage = "Unknown error";
    let errorCode = "ERR-500";
    let errorObj: Error | null = null;

    if (isRouteErrorResponse(error)) {
        errorMessage = error.statusText || error.data?.message || "Error";
        errorCode = `ERR-${error.status}`;
        errorObj = new Error(errorMessage);
    } else if (error instanceof Error) {
        errorMessage = error.message;
        errorCode = "ERR-500";
        if (error.message.includes("suspended")) {
             errorCode = "ERR-SUSPENSE";
        }
        errorObj = error;
    } else if (typeof error === 'string') {
        errorMessage = error;
        errorObj = new Error(error);
    } else {
         errorObj = new Error("An unknown error occurred");
    }

    return (
        <ErrorFallback
            error={errorObj}
            errorCode={errorCode}
            enableRetry={true}
            onRetry={() => window.location.reload()}
            onGoHome={() => navigate("/", { replace: true })}
            onReload={() => window.location.reload()}
        />
    );
};
