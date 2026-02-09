# Nexzen Frontend – Project Audit

**Audit date:** February 2026  
**Scope:** Full codebase – security, robustness, performance, production readiness.

---

## 1. Executive Summary

| Area | Grade | Notes |
|------|--------|------|
| **Security** | A- | Strong auth (memory-only token, HttpOnly refresh), no secrets in env template; minor XSS hardening possible. |
| **Robustness** | B+ | Good error boundaries, API retry logic, validation; some deprecated APIs and empty catches. |
| **Performance** | B+ | Lazy routes, manual chunks, Brotli; a few dynamic imports that don’t split. |
| **Production readiness** | B+ | Build config solid; env and error reporting could be tightened. |

**Overall:** Production-grade with clear, low-risk improvements.

---

## 2. Security Audit

### 2.1 Authentication & Tokens ✅ Strong

- **Access token:** Stored only in memory (Zustand), not in `localStorage`/`sessionStorage` – reduces XSS exposure.
- **Refresh token:** HttpOnly cookie (backend); not readable by JS.
- **API:** `withCredentials: true`; interceptors add `Authorization: Bearer`; 401 triggers single-in-flight refresh; logout blocks new requests and clears state.
- **Persistence:** `storage.ts` explicitly strips `accessToken`, `token`, `tokenExpireAt`, `refreshToken` and does not persist `currentBranch` (backend/cookies as source of truth).

**Recommendation:** Keep current design; document it in a short SECURITY.md for onboarding.

### 2.2 Environment & Secrets ✅ Good

- **env.template:** No API keys or passwords; only `VITE_*` (URLs, brand, assets). Safe to commit.
- **Usage:** `import.meta.env.VITE_*` only; no raw secrets in code.

**Recommendation:** Add a one-line note in env.template: “Never put secrets in VITE_ variables; they are embedded in the client bundle.”

### 2.3 Input Sanitization & XSS ✅ Good (one hardening)

- **DOMPurify:** `common/utils/security/sanitization.ts` – `sanitizeHTML`, `sanitizeText`, `escapeRegex`, `sanitizeSearchTerm`, `highlightText` used for user-facing HTML.
- **dangerouslySetInnerHTML:** Only in `common/components/ui/chart.tsx` – injects **CSS variables** built from theme/config objects (no user input). Risk is low; hardening: ensure `id` and theme keys are never user-controlled, or run through a strict allowlist/sanitizer for extra safety.

**Recommendation:** If `id` or theme keys can ever come from URL/API, sanitize or allowlist them before building the CSS string.

### 2.4 Authorization ✅ Good

- **ProtectedRoute:** Role-based; supports `preventDirectAccess`; uses sessionStorage only for “from sidebar” navigation hint (short-lived).
- **Permissions:** `canAccessModule`, `hasPermission` from auth store; module/role mapping in one place.

**Recommendation:** None critical; consider centralizing all route–role mappings in one config file.

---

## 3. Robustness & Error Handling

### 3.1 API Layer ✅ Good

- **api.ts:** 30s timeout; concurrency-safe refresh; retry only after new token; logout race handling (`isLoggingOut`); auth init blocks authenticated requests until bootstrap done.
- **React Query (core/query):** No retry on 4xx; retry on 5xx/network (max 2, exponential backoff); `refetchOnMount/WindowFocus/Reconnect` off by default to avoid storms.

### 3.2 Error Boundaries ✅ Good

- **ProductionErrorBoundary:** Catches errors, reports (stub), retries (max 3), shows user-friendly fallback; `showDetails` only in dev.
- **Usage:** Wraps high-value areas; can be extended to more feature roots if needed.

### 3.3 Validation ✅ Good

- **Auth store:** Validates `user_info`, `branches` (array, non-empty); throws on invalid login/setUser.
- **Forms:** React Hook Form + Zod where used; good base for validation.

### 3.4 Issues to Fix

| Issue | Location | Severity | Fix |
|-------|----------|----------|-----|
| Deprecated `batchInvalidateAndRefetch` | useGlobalRefetch.ts; used in AdmissionsList, AdmissionDetailsPage, fees, reservations, etc. | Low | Replace with `queryClient.invalidateQueries` + `queryClient.refetchQueries` using same keys; optionally keep a small wrapper that uses queryClient. |
| Empty or minimal catch blocks | Various (e.g. ProductionErrorBoundary, authStore) | Low | Log or rethrow; avoid silent swallows in non-dev. |
| `(error: any)` in catch | Multiple files | Low | Prefer `unknown` and type narrowing, or a small `ApiError` type. |

---

## 4. Performance

### 4.1 Build & Bundle ✅ Good

- **Vite:** Manual chunks (react, react-query, framer-motion, lucide, zustand, axios); Brotli; Terser (drop console in prod); sourcemaps in dev only; `chunkSizeWarningLimit: 1000`.
- **Routes:** Lazy-loaded via `React.lazy` in route-config (Login, dashboards, school/college modules).
- **optimizeDeps:** Key libs pre-bundled; React deduped.

### 4.2 Dynamic Import Warnings ⚠️ Fix

- **dropdowns.service:** Was dynamically imported in school ReservationManagement while statically imported elsewhere – **fixed** (static import + direct call).
- **distance-slabs.service:** Same pattern in **school** and **college** ReservationManagement; statically imported in useDistanceSlabs, DistanceSlabDropdown, general/services. Causes Vite “dynamically imported but also statically imported” warning; chunk not split.

**Fix:** In both ReservationManagement files, statically import `DistanceSlabsService` from `@/features/general/services` and use `DistanceSlabsService.listDistanceSlabs()` in the queryFn (same as dropdowns fix).

### 4.3 React Query Defaults ✅ Good

- `staleTime: 5m`, `gcTime: 10m`; no refetch on focus/reconnect/mount by default – avoids storms; individual hooks set `enabled`, `staleTime` where needed.

### 4.4 Large Components ⚠️ Monitor

- **School ReservationManagement.tsx** (~1700 lines), **College ReservationManagement.tsx** (~2100+ lines): Consider splitting into smaller components (e.g. CreateReservation, EditReservation, Tables, Payment flows) for maintainability and smaller component trees.

---

## 5. Code Quality & Consistency

### 5.1 Strengths

- **Structure:** Clear separation – `core/` (api, auth, query), `common/` (ui, hooks, utils), `features/` (school, college, general).
- **Query keys:** Centralized in `collegeKeys`, `schoolKeys`, `ENTITY_QUERY_MAP`; consistent prefixes.
- **Types:** TypeScript throughout; shared types in features and common.

### 5.2 Inconsistencies

- **Admission detail key:** School uses `["school", "admissions", student_id]` in useSchoolAdmissionById; query-keys has `schoolKeys.admissions.detail(studentId)` → `["school", "admissions", "detail", studentId]`. Mismatch; invalidation still works via prefix match. Prefer using `schoolKeys.admissions.detail(studentId)` in the hook for consistency.
- **College:** Same pattern – use `collegeKeys.admissions.detail(student_id)` in useCollegeAdmissionById if the backend is keyed by student_id.

### 5.3 Linter / Sonar

- Existing Sonar warnings: nested ternaries, cognitive complexity, “replace union with type alias”, unused imports, component-in-component. Address incrementally; not blocking for production.

---

## 6. Production Checklist

| Item | Status |
|------|--------|
| No secrets in repo / env template | ✅ |
| Access token not in localStorage | ✅ |
| Refresh token HttpOnly | ✅ (backend) |
| HTTPS in production | ✅ (assumed; enforce at host) |
| Console stripped in prod build | ✅ |
| Error boundary in place | ✅ |
| Lazy routes | ✅ |
| API timeout & retry policy | ✅ |
| Env vars documented | ✅ (env.template) |
| Source maps in prod | ⚠️ Off; turn on for error reporting if needed |

---

## 7. Recommended Fixes (Priority Order)

1. **High – Distance-slabs dynamic import (Vite):**  
   In school and college `ReservationManagement.tsx`, replace dynamic `import("@/features/general/services/distance-slabs.service")` with static import and `DistanceSlabsService.listDistanceSlabs()` in the queryFn.

2. **Medium – Deprecated batchInvalidateAndRefetch:**  
   Migrate all call sites to `queryClient.invalidateQueries` + `queryClient.refetchQueries` (or a thin wrapper); remove or repurpose the deprecated helper.

3. **Medium – Chart dangerouslySetInnerHTML:**  
   Ensure chart `id` and theme keys are never user-supplied; if they can be, allowlist or sanitize before building the CSS string.

4. **Low – Error handling:**  
   Replace `catch (e) {}` / minimal catches with at least `console.warn` or rethrow in non-dev; standardize on `unknown` or `ApiError` in catch clauses.

5. **Low – Query key consistency:**  
   Use `schoolKeys.admissions.detail(studentId)` and `collegeKeys.admissions.detail(student_id)` in the admission-by-id hooks so all code uses the same key shape.

6. **Ongoing – Large reservation components:**  
   Refactor into smaller components when touching those files; no urgent change required.

---

## 8. Module-by-Module Notes

- **core/api:** Solid; interceptors and refresh logic are production-ready.
- **core/auth:** Robust bootstrap, login, logout, branch/year switch; storage strips tokens and avoids persisting currentBranch.
- **core/query:** Sensible defaults; 4xx no-retry and refetch defaults are appropriate.
- **routes:** ProtectedRoute and lazy loading in good shape; RequireAuth handles init.
- **common/utils/security:** DOMPurify-based sanitization present and used.
- **common/hooks/useGlobalRefetch:** Deprecated API; migrate to queryClient calls.
- **features/school & college:** Structure good; pay-fee by student_id and admissions refresh are correctly implemented; reservation components are the main size/maintainability concern.
- **vite.config:** Build and dev settings are production-suitable; envDir and env prefix correct.

---

## 9. Conclusion

The project is **production-grade** with strong security (auth, tokens, env, sanitization) and good robustness (API, React Query, error boundaries). The highest-impact, low-effort improvements are: (1) fixing the distance-slabs dynamic import in both reservation modules, (2) replacing deprecated batch invalidation with direct queryClient usage, and (3) minor hardening and consistency fixes above. After these, the codebase is in good shape for production deployment and ongoing maintenance.
