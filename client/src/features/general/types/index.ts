// General types barrel export
export * from "./academic-year";
export * from "./advances";
// Note: attendance.ts excluded - conflicts with employee-attendance.ts
// Use employee-attendance.ts for monthly attendance records
// export * from "./attendance";
export * from "./branches";
export * from "./distance-slabs";
export * from "./grades";
export * from "./dropdowns";
export * from "./employee-attendance";
export * from "./employee-leave";
export * from "./employees";
export * from "./audit-logs";
export * from "./health";
export * from "./logs";
export * from "./payrolls";
export * from "./roles";
// Note: transport.ts excluded - DistanceSlab types conflict with distance-slabs.ts
// Import DistanceSlab types from "./distance-slabs" or specific types from "./transport"
export type { DriverDetails, BusRouteRead, BusRouteCreate, BusRouteUpdate, TransportDashboardStats, RecentRoute } from "./transport";
export * from "./userBranchAccess";
export * from "./users";

