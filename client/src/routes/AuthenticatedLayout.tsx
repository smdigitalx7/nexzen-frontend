import React from "react";
import { Layout } from "./Layout";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

/**
 * Auth wrapper around Layout. Layout is the persistent shell (Sidebar + Header + Outlet).
 */
export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return <Layout>{children}</Layout>;
}
