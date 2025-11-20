# Authentication Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Complete Login Flow](#complete-login-flow)
4. [Token Management](#token-management)
5. [Bootstrap & Hydration Flow](#bootstrap--hydration-flow)
6. [Issues Encountered & Solutions](#issues-encountered--solutions)
7. [Advantages](#advantages)
8. [Disadvantages & Trade-offs](#disadvantages--trade-offs)
9. [Security Considerations](#security-considerations)
10. [Best Practices](#best-practices)
11. [Future Improvements](#future-improvements)

---

## Overview

This document describes the complete authentication architecture for the Velocity ERP frontend application. The system implements a modern, secure authentication flow using:

- **Access Tokens**: Stored in-memory only (Zustand store)
- **Refresh Tokens**: Stored in HttpOnly, Secure cookies (set by backend)
- **Automatic Token Refresh**: Concurrency-safe refresh mechanism
- **Idle Session Timeout**: 5-minute inactivity detection
- **Bootstrap Authentication**: Automatic session restoration on app startup

### Key Technologies
- **React 18** with TypeScript
- **Zustand** for state management
- **Axios** for HTTP client with interceptors
- **Wouter** for routing
- **TanStack Query v5** for server state management

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              React Application (SPA)                      │  │
│  │                                                           │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │         App.tsx (Root Component)                  │  │  │
│  │  │  • bootstrapAuth() on mount                        │  │  │
│  │  │  • useIdleTimeout() hook                           │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                        │                                    │  │
│  │                        ▼                                    │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │            AppRouter.tsx                           │  │  │
│  │  │  • Checks isAuthInitializing                         │  │  │
│  │  │  • Checks isAuthenticated                           │  │  │
│  │  │  • Routes to Login or Protected Routes             │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                        │                                    │  │
│  │        ┌───────────────┴───────────────┐                  │  │
│  │        ▼                               ▼                    │  │
│  │  ┌──────────────┐            ┌──────────────────┐         │  │
│  │  │  LoginPage   │            │ ProtectedRoute    │         │  │
│  │  │  • Form      │            │ • Checks auth    │         │  │
│  │  │  • Submit    │            │ • Renders child   │         │  │
│  │  └──────────────┘            └──────────────────┘         │  │
│  │        │                               │                    │  │
│  │        └───────────────┬─────────────┘                    │  │
│  │                        │                                    │  │
│  │                        ▼                                    │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │         Auth Store (Zustand)                       │  │  │
│  │  │  • accessToken (in-memory)                         │  │  │
│  │  │  • user (localStorage)                             │  │  │
│  │  │  • isAuthenticated                                  │  │  │
│  │  │  • isAuthInitializing                              │  │  │
│  │  │  • login(), logout(), bootstrapAuth()              │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                        │                                    │  │
│  │                        ▼                                    │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │         Axios Instance (apiClient)                  │  │  │
│  │  │  • Request Interceptor: Adds Authorization header │  │  │
│  │  │  • Response Interceptor: Handles 401, refreshes    │  │  │
│  │  │  • Concurrency-safe refresh mechanism              │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                        │                                    │  │
│  └────────────────────────┼──────────────────────────────────┘  │
│                           │                                        │
└───────────────────────────┼────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API Server                            │
│              (https://erpapi.velonex.in)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  POST /api/v1/auth/login                                         │
│  • Validates credentials                                         │
│  • Returns access_token, expiretime, user_info                  │
│  • Sets refreshToken in HttpOnly cookie                         │
│                                                                   │
│  POST /api/v1/auth/refresh                                       │
│  • Validates refreshToken cookie                                 │
│  • Returns new access_token, expiretime, user_info              │
│  • Sets new refreshToken cookie                                 │
│                                                                   │
│  POST /api/v1/auth/logout                                        │
│  • Invalidates refreshToken cookie                              │
│                                                                   │
│  GET /api/v1/dashboard (Protected)                              │
│  • Requires Authorization: Bearer <access_token>                  │
│  • Returns dashboard data based on user role                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Complete Login Flow

### 1. Initial App Load (Bootstrap Flow)

```
User Opens App
    │
    ▼
App.tsx mounts
    │
    ▼
useEffect runs bootstrapAuth()
    │
    ▼
POST /api/v1/auth/refresh
    │
    ├─── Success ─────────────────────────┐
    │                                       │
    │    • accessToken stored in memory    │
    │    • user_info stored in store       │
    │    • isAuthenticated = true           │
    │    • isAuthInitializing = false       │
    │                                       │
    └─── Failure ──────────────────────────┐
                                            │
    • Clear auth state                      │
    • isAuthenticated = false              │
    • isAuthInitializing = false            │
                                            │
    ▼                                       ▼
AppRouter checks state
    │
    ├─── isAuthenticated = true ──► Show Dashboard
    │
    └─── isAuthenticated = false ──► Show Login Page
```

### 2. User Login Flow

```
User Enters Credentials
    │
    ▼
LoginPage.tsx: User clicks "Sign In"
    │
    ▼
authStore.login(email, password)
    │
    ▼
POST /api/v1/auth/login
    │
    ├─── Success ─────────────────────────┐
    │                                       │
    │    • Response contains:              │
    │      - access_token                  │
    │      - expiretime (ISO string)       │
    │      - user_info (with branches)     │
    │                                       │
    │    • Store accessToken in memory     │
    │    • Parse expiretime to timestamp    │
    │    • Call setUser(user_info)         │
    │    • Set isAuthenticated = true      │
    │                                       │
    │    • Optional: GET /api/v1/auth/me  │
    │      (for additional user details)   │
    │                                       │
    └─── Failure ──────────────────────────┐
                                            │
    • Throw typed error                     │
    • Display error message                │
    • Stay on login page                    │
                                            │
    ▼                                       ▼
Navigate to "/" (Dashboard)
    │
    ▼
DashboardRouter renders
    │
    ▼
useAdminDashboard() / useAccountantDashboard() / useAcademicDashboard()
    │
    ▼
DashboardService.getDashboard()
    │
    ▼
GET /api/v1/dashboard
    │
    │  Request Headers:
    │  Authorization: Bearer <access_token>
    │
    ├─── Success ──► Display Dashboard Data
    │
    └─── 401 Unauthorized ──► Auto Refresh Token (see Token Refresh Flow)
```

### 3. Token Refresh Flow (Automatic)

```
API Request Made
    │
    ▼
Request Interceptor adds Authorization header
    │
    ▼
Request sent to backend
    │
    ├─── Success (200-299) ──► Return response to caller
    │
    └─── 401 Unauthorized ─────────────────┐
                                            │
    Response Interceptor catches 401       │
        │                                   │
        ▼                                   │
    Check if request had Authorization header
        │                                   │
        ├─── No ──► Reject error (no refresh)│
        │                                   │
        └─── Yes ───────────────────────────┘
                │
                ▼
            Check if refresh already in progress
                │
                ├─── Yes ──► Wait for existing refreshPromise
                │
                └─── No ──► Start new refresh
                            │
                            ▼
                        POST /api/v1/auth/refresh
                        (refreshToken sent via cookie)
                            │
                            ├─── Success ───────────────────┐
                            │                                 │
                            │    • Update accessToken        │
                            │    • Update tokenExpireAt      │
                            │    • Update user_info (if new) │
                            │    • Clone original request    │
                            │    • Add new Authorization     │
                            │    • Retry original request    │
                            │                                 │
                            └─── Failure ────────────────────┐
                                                            │
                            • Call logout()                 │
                            • Clear auth state              │
                            • Redirect to /login            │
                            • Reject error                  │
                                                            │
                            ▼                               ▼
                    Return response to caller
```

### 4. Idle Session Timeout Flow

```
User Activity Detected
    │
    ▼
Event Listeners (mousemove, mousedown, keydown, scroll, touchstart)
    │
    ▼
Reset 5-minute timer
    │
    ▼
[5 minutes of inactivity]
    │
    ▼
Timer expires
    │
    ▼
authStore.logout()
    │
    ▼
POST /api/v1/auth/logout (optional)
    │
    ▼
Clear auth state
    │
    ▼
Clear React Query cache
    │
    ▼
Redirect to /login
```

### 5. Logout Flow

```
User Clicks Logout
    │
    ▼
authStore.logout()
    │
    ▼
POST /api/v1/auth/logout (optional)
    │
    ▼
Clear auth state:
    • accessToken = null
    • user = null
    • isAuthenticated = false
    • branches = []
    • currentBranch = null
    │
    ▼
Clear React Query cache
    │
    ▼
Redirect to /login
```

---

## Token Management

### Access Token Storage

**Location**: In-memory only (Zustand store)
**Never stored in**: localStorage, sessionStorage, cookies

```typescript
// ✅ CORRECT: Stored in Zustand store (memory)
const authStore = useAuthStore.getState();
authStore.accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

// ❌ WRONG: Never store in localStorage
localStorage.setItem("access_token", token); // SECURITY RISK!
```

**Why in-memory only?**
- Reduces XSS attack surface
- Even if malicious script runs, it cannot access token from memory easily
- Token is lost on page refresh (by design)

### Refresh Token Storage

**Location**: HttpOnly, Secure cookie (set by backend)
**JavaScript access**: Cannot be read by JavaScript

```typescript
// Backend sets cookie:
Set-Cookie: refreshToken=xxx; HttpOnly; Secure; SameSite=Strict

// Frontend cannot read it:
document.cookie // refreshToken is NOT visible
```

**Why HttpOnly cookie?**
- Prevents XSS attacks from stealing refresh token
- Automatically sent with requests (via `withCredentials: true`)
- Cannot be accessed by JavaScript

### Token Expiration

**Access Token**: Short-lived (typically 15-30 minutes)
**Refresh Token**: Long-lived (typically 7-30 days)

```typescript
// Token expiration check
const now = Date.now();
const expireAt = authStore.tokenExpireAt;

if (now >= expireAt) {
  // Token expired - refresh needed
}
```

---

## Bootstrap & Hydration Flow

### Bootstrap Authentication (`bootstrapAuth`)

**Purpose**: Restore user session on app startup

**Flow**:
1. Set `isAuthInitializing = true`
2. Call `POST /api/v1/auth/refresh` (refreshToken sent via cookie)
3. On success:
   - Store `accessToken` in memory
   - Store `tokenExpireAt` timestamp
   - Call `setUser(user_info)`
   - Set `isAuthenticated = true`
4. On failure:
   - Clear auth state
   - Set `isAuthenticated = false`
5. Set `isAuthInitializing = false` (in `finally` block)

**When it runs**:
- Once on app mount (in `App.tsx`)
- Only if user is not already authenticated
- Uses ref to prevent multiple calls

### Hydration (`useAuthHydration`)

**Purpose**: Wait for Zustand persist hydration and bootstrapAuth to complete

**Flow**:
1. Wait for `isAuthInitializing` to become `false`
2. Complete hydration (set `isHydrated = true`)
3. AppRouter can now render based on auth state

**Why needed?**
- Prevents flash of incorrect UI during initialization
- Ensures auth state is ready before rendering routes

---

## Issues Encountered & Solutions

### Issue 1: Token Not Being Passed in API Requests (403 Forbidden)

**Problem**: All API requests were getting 403 Forbidden errors.

**Root Cause**: 
- Old `api.ts` was using `state.token` getter which might not work correctly
- Some hooks were using the getter instead of `accessToken` directly

**Solution**:
```typescript
// ❌ BEFORE: Using token getter
const token = state.token;

// ✅ AFTER: Using accessToken directly
const token = state.accessToken || (state as any).token;
```

**Files Fixed**:
- `client/src/lib/api.ts` - All token references
- `client/src/lib/api/api.ts` - Request interceptor
- `client/src/lib/hooks/general/useAdminDashboard.ts`
- `client/src/lib/hooks/general/useAccountantDashboard.ts`
- `client/src/lib/hooks/general/useAcademicDashboard.ts`
- `client/src/components/routing/DashboardRouter.tsx`

---

### Issue 2: Login Page Flash on Refresh

**Problem**: When refreshing the page, login page would flash for 1-2 seconds before showing the dashboard.

**Root Cause**:
- `useAuthHydration` was checking for tokens in sessionStorage (which doesn't exist)
- `bootstrapAuth` was running and temporarily clearing state
- AppRouter was rendering login page before bootstrapAuth completed

**Solution**:
```typescript
// ✅ FIXED: Simplified hydration to wait for bootstrapAuth
export function useAuthHydration() {
  const { isAuthInitializing } = useAuthStore();
  
  useEffect(() => {
    const checkAndRestore = () => {
      const store = useAuthStore.getState();
      
      // Wait for bootstrapAuth to complete
      if (store.isAuthInitializing) {
        setTimeout(checkAndRestore, 100);
        return;
      }
      
      setIsHydrated(true);
    };
    
    checkAndRestore();
  }, [isAuthInitializing]);
}

// ✅ FIXED: AppRouter shows loading during hydration/initialization
if (!isHydrated || isAuthInitializing) {
  return <LoadingScreen />;
}
```

**Files Fixed**:
- `client/src/hooks/useAuthHydration.ts` - Simplified logic
- `client/src/components/routing/AppRouter.tsx` - Show loading during init

---

### Issue 3: Double `/api/v1` in URL

**Problem**: API calls were going to `http://localhost:7000/api/v1/api/v1/auth/refresh` (404 error).

**Root Cause**: 
- `VITE_API_BASE_URL` already contained `/api/v1`
- Code was adding `/api/v1` again in `baseURL`

**Solution**:
```typescript
// ✅ FIXED: Strip trailing /api/v1 or /api from env variable
let API_BASE_URL: string;
if (ENV_API_BASE_URL.includes("http")) {
  // Full URL - remove trailing /api/v1 or /api if present
  API_BASE_URL = ENV_API_BASE_URL
    .replace(/\/api\/v1\/?$/, "")
    .replace(/\/api\/?$/, "");
} else {
  // Path-only - if it starts with /api/v1, use empty string
  API_BASE_URL = ENV_API_BASE_URL.startsWith("/api/v1") ? "" : ENV_API_BASE_URL;
}

// Then add /api/v1 in baseURL
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL ? `${API_BASE_URL}/api/v1` : "/api/v1",
  // ...
});
```

**Files Fixed**:
- `client/src/lib/api/api.ts` - URL parsing logic

---

### Issue 4: `branches.find is not a function`

**Problem**: After login, error occurred: "branches.find is not a function".

**Root Cause**: 
- API response `user_info.branches` was not always an array
- Code was calling `.find()` without checking if it's an array

**Solution**:
```typescript
// ✅ FIXED: Validate branches is an array before using array methods
if (response.data?.user_info?.branches) {
  const branches = response.data.user_info.branches;
  
  if (!Array.isArray(branches)) {
    console.error("branches is not an array:", branches);
    throw new Error("Invalid user_info: branches must be an array");
  }
  
  // Now safe to use array methods
  const branch = branches.find(b => b.branch_id === branchId);
}
```

**Files Fixed**:
- `client/src/store/authStore.ts` - Added validation in `login()` and `setUser()`

---

### Issue 5: Dashboard Not Loading After Login

**Problem**: After successful login, dashboard would not load and API endpoint was not called.

**Root Cause**:
- Dashboard hooks were checking `state.token` getter which might return null
- `DashboardRouter` was checking `token` getter instead of `accessToken`

**Solution**:
```typescript
// ✅ FIXED: Use accessToken directly in dashboard hooks
const { accessToken, isAuthenticated, user } = useAuthStore();
const token = accessToken; // Use accessToken directly

const fetchDashboard = useCallback(async () => {
  const currentState = useAuthStore.getState();
  const currentToken = currentState.accessToken || (currentState as any).token;
  
  if (!currentIsAuthenticated || !currentToken || !currentUser) {
    return; // Don't fetch
  }
  
  // Fetch dashboard...
}, [accessToken, isAuthenticated, user]);
```

**Files Fixed**:
- `client/src/lib/hooks/general/useAdminDashboard.ts`
- `client/src/lib/hooks/general/useAccountantDashboard.ts`
- `client/src/lib/hooks/general/useAcademicDashboard.ts`
- `client/src/components/routing/DashboardRouter.tsx`

---

### Issue 6: `bootstrapAuth` Running After Login

**Problem**: After successful login, `bootstrapAuth` would run again and clear auth state.

**Root Cause**:
- `useEffect` dependency on `bootstrapAuth` function reference
- `bootstrapAuth` was checking auth state but clearing it on failure

**Solution**:
```typescript
// ✅ FIXED: Only run bootstrapAuth once on mount
useEffect(() => {
  if (hasBootstrappedRef.current) {
    return; // Already bootstrapped
  }
  
  hasBootstrappedRef.current = true;
  
  // Skip if already authenticated
  const currentState = useAuthStore.getState();
  if (currentState.isAuthenticated && currentState.user && currentState.accessToken) {
    return;
  }
  
  bootstrapAuth().catch(console.error);
}, []); // Empty dependency array - only run once

// ✅ FIXED: bootstrapAuth doesn't clear state if already authenticated
bootstrapAuth: async () => {
  const currentState = get();
  
  // Skip if already authenticated
  if (currentState.isAuthenticated && currentState.user && currentState.accessToken) {
    set((state) => {
      state.isAuthInitializing = false;
    });
    return;
  }
  
  // ... rest of bootstrap logic
}
```

**Files Fixed**:
- `client/src/App.tsx` - Use ref to prevent multiple calls
- `client/src/store/authStore.ts` - Skip bootstrap if already authenticated

---

## Advantages

### 1. Security

✅ **In-Memory Token Storage**
- Access tokens stored only in memory (Zustand store)
- Not accessible via `localStorage.getItem()` or `document.cookie`
- Reduces XSS attack surface significantly

✅ **HttpOnly Refresh Token**
- Refresh token in HttpOnly cookie cannot be read by JavaScript
- Automatically sent with requests via `withCredentials: true`
- Protected from XSS attacks

✅ **Automatic Token Refresh**
- Tokens refreshed automatically before expiration
- Concurrency-safe mechanism prevents multiple refresh calls
- Seamless user experience

✅ **Idle Session Timeout**
- Automatically logs out inactive users after 5 minutes
- Prevents unauthorized access if user leaves device unattended

### 2. User Experience

✅ **Seamless Authentication**
- No manual token refresh needed
- Automatic session restoration on app startup
- Smooth login/logout flows

✅ **No Flash of Wrong UI**
- Proper loading states during initialization
- Hydration waits for bootstrapAuth to complete
- Smooth transitions between auth states

✅ **Error Handling**
- Typed errors for better error messages
- Clear feedback on login failures
- Automatic retry on token refresh

### 3. Developer Experience

✅ **Type Safety**
- Full TypeScript support
- Typed auth state and actions
- Type-safe API responses

✅ **Centralized State Management**
- Single source of truth (Zustand store)
- Easy to debug and test
- Clear separation of concerns

✅ **Automatic Token Injection**
- Axios interceptors handle Authorization header automatically
- No need to manually add tokens to each request
- Consistent across all API calls

### 4. Performance

✅ **Efficient Token Refresh**
- Only one refresh call at a time (concurrency-safe)
- Other requests wait for refresh to complete
- No duplicate refresh calls

✅ **Proactive Refresh**
- Tokens refreshed before expiration
- Prevents 401 errors during user sessions
- Better user experience

---

## Disadvantages & Trade-offs

### 1. Token Loss on Page Refresh

❌ **Issue**: Access token is lost on page refresh (stored in memory only)

**Impact**: 
- User must wait for `bootstrapAuth` to complete
- Requires refresh token cookie to be valid
- If refresh token expired, user must login again

**Mitigation**:
- Refresh token has longer expiration (7-30 days)
- `bootstrapAuth` automatically restores session
- User experience is still smooth

**Trade-off**: Security vs Convenience
- More secure (token not in localStorage)
- Slightly less convenient (requires refresh token)

### 2. Complexity

❌ **Issue**: Multiple moving parts (bootstrap, hydration, interceptors, hooks)

**Impact**:
- More code to maintain
- More potential points of failure
- Harder to debug issues

**Mitigation**:
- Well-documented code
- Clear separation of concerns
- Comprehensive error handling

**Trade-off**: Simplicity vs Features
- More complex but more secure and feature-rich
- Simpler alternatives exist but with security trade-offs

### 3. Dependency on Cookies

❌ **Issue**: Refresh token stored in HttpOnly cookie

**Impact**:
- Requires `withCredentials: true` on all requests
- CORS configuration must allow credentials
- Cannot work with some third-party APIs

**Mitigation**:
- Backend properly configured for CORS
- All API calls use same domain or proper CORS setup
- Standard practice for secure authentication

**Trade-off**: Security vs Flexibility
- More secure but less flexible
- Standard approach for modern web apps

### 4. Memory-Only Token Storage

❌ **Issue**: Token not persisted across browser sessions

**Impact**:
- User must login again if browser closed
- Cannot restore session after browser restart
- Requires refresh token to be valid

**Mitigation**:
- Refresh token persists in cookie
- `bootstrapAuth` restores session automatically
- User experience is still good

**Trade-off**: Security vs Persistence
- More secure but less persistent
- Standard security practice

### 5. Race Conditions

❌ **Issue**: Multiple components checking auth state simultaneously

**Impact**:
- Potential race conditions during initialization
- Multiple API calls before token is ready
- Flash of wrong UI

**Mitigation**:
- `isAuthInitializing` flag prevents premature rendering
- `useAuthHydration` hook ensures state is ready
- Proper loading states

**Trade-off**: Complexity vs Reliability
- More complex but more reliable
- Proper handling prevents issues

---

## Security Considerations

### 1. XSS Protection

✅ **Access Token**: Stored in memory only
- Cannot be accessed via `localStorage.getItem()`
- Cannot be accessed via `document.cookie`
- Reduces XSS attack surface

✅ **Refresh Token**: HttpOnly cookie
- Cannot be read by JavaScript
- Automatically sent with requests
- Protected from XSS attacks

### 2. CSRF Protection

✅ **SameSite Cookie**: Refresh token cookie uses `SameSite=Strict`
- Prevents CSRF attacks
- Cookie only sent with same-site requests

✅ **CSRF Tokens**: Additional CSRF protection for state-changing requests
- Tokens added to headers for POST/PUT/DELETE
- Backend validates CSRF tokens

### 3. Token Expiration

✅ **Short-Lived Access Tokens**: 15-30 minutes
- Limits exposure if token is compromised
- Automatic refresh before expiration

✅ **Long-Lived Refresh Tokens**: 7-30 days
- Allows persistent sessions
- Can be revoked by backend if compromised

### 4. Idle Timeout

✅ **5-Minute Inactivity**: Automatic logout
- Prevents unauthorized access if device left unattended
- User must login again after timeout

### 5. Secure Cookie Flags

✅ **HttpOnly**: Prevents JavaScript access
✅ **Secure**: Only sent over HTTPS
✅ **SameSite**: Prevents CSRF attacks

---

## Best Practices

### 1. Token Storage

✅ **DO**: Store access token in memory only
```typescript
// ✅ CORRECT
const authStore = useAuthStore.getState();
authStore.accessToken = token;
```

❌ **DON'T**: Store access token in localStorage
```typescript
// ❌ WRONG - Security risk!
localStorage.setItem("access_token", token);
```

### 2. Token Usage

✅ **DO**: Use `accessToken` directly from store
```typescript
// ✅ CORRECT
const token = state.accessToken || (state as any).token;
```

❌ **DON'T**: Rely on getter if not needed
```typescript
// ❌ AVOID if possible
const token = state.token; // Getter might not work in all contexts
```

### 3. API Calls

✅ **DO**: Use `apiClient` for all API calls
```typescript
// ✅ CORRECT - Automatic token injection
const response = await apiClient.get("/dashboard");
```

❌ **DON'T**: Manually add Authorization header
```typescript
// ❌ WRONG - Interceptor handles this
const response = await axios.get("/dashboard", {
  headers: { Authorization: `Bearer ${token}` }
});
```

### 4. Error Handling

✅ **DO**: Handle 401 errors gracefully
```typescript
// ✅ CORRECT - Interceptor handles refresh automatically
try {
  const response = await apiClient.get("/dashboard");
} catch (error) {
  // Error already handled by interceptor
  // Only handle business logic errors here
}
```

❌ **DON'T**: Manually refresh tokens
```typescript
// ❌ WRONG - Interceptor handles this automatically
if (error.response?.status === 401) {
  await refreshToken(); // Don't do this!
}
```

### 5. State Management

✅ **DO**: Use Zustand store for auth state
```typescript
// ✅ CORRECT
const { accessToken, user, isAuthenticated } = useAuthStore();
```

❌ **DON'T**: Store auth state in component state
```typescript
// ❌ WRONG - Use store instead
const [token, setToken] = useState(null);
```

---

## Future Improvements

### 1. Token Refresh Optimization

**Current**: Refresh on 401 error
**Improvement**: Proactive refresh before expiration
- Already implemented but can be optimized
- Use `tokenExpireAt` to schedule refresh earlier
- Reduce 401 errors even further

### 2. Offline Support

**Current**: No offline support
**Improvement**: Cache user data for offline access
- Store user info in IndexedDB
- Show cached data when offline
- Sync when back online

### 3. Multi-Tab Synchronization

**Current**: Each tab has separate auth state
**Improvement**: Sync auth state across tabs
- Use `storage` event listener
- Broadcast auth state changes
- Logout in all tabs when one tab logs out

### 4. Biometric Authentication

**Current**: Username/password only
**Improvement**: Add biometric authentication
- WebAuthn API for fingerprint/face ID
- Store encrypted credentials
- Seamless login experience

### 5. Session Management

**Current**: Single session per user
**Improvement**: Multiple active sessions
- Show active sessions in settings
- Allow revoking specific sessions
- Better security control

### 6. Token Rotation

**Current**: Refresh token reused until expiration
**Improvement**: Rotate refresh tokens
- Issue new refresh token on each refresh
- Invalidate old refresh token
- Better security if token is compromised

---

## Conclusion

The authentication architecture provides a secure, user-friendly authentication system with:

✅ **Strong Security**: In-memory tokens, HttpOnly cookies, automatic refresh
✅ **Great UX**: Seamless login, automatic session restoration, idle timeout
✅ **Developer Friendly**: Type-safe, centralized state, automatic token injection
✅ **Production Ready**: Handles edge cases, proper error handling, comprehensive logging

While there are some trade-offs (complexity, token loss on refresh), the security and user experience benefits outweigh the disadvantages. The system follows modern security best practices and provides a solid foundation for the application.

---

## References

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
- [HTTP Cookies Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#security)

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-20  
**Author**: Frontend Engineering Team

