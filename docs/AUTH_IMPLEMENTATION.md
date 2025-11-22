# Authentication Layer Implementation

This document describes the refactored authentication layer for the React SPA.

## Overview

The authentication system implements a secure token-based authentication flow with:
- **Access tokens** stored ONLY in memory (Zustand store) - reduces XSS risk
- **Refresh tokens** in HttpOnly cookies (set by backend) - JavaScript cannot read them
- **Automatic token refresh** on 401 errors
- **Idle session timeout** (5 minutes of inactivity)
- **Bootstrap authentication** on app startup

## Architecture

### 1. Axios Instance (`client/src/lib/api/api.ts`)

- **Base URL**: `https://erpapi.velonex.in/api/v1`
- **Configuration**:
  - `withCredentials: true` - sends cookies (refreshToken) with all requests
  - 30 second timeout
  - JSON content-type headers

- **Request Interceptor**:
  - Reads `accessToken` from auth store
  - Adds `Authorization: Bearer <accessToken>` header to all requests

- **Response Interceptor**:
  - Detects 401 (Unauthorized) responses
  - Implements concurrency-safe refresh mechanism:
    - Only one refresh call at a time
    - Other requests wait on the same `refreshPromise`
  - On 401:
    1. Calls `POST /api/v1/auth/refresh` (uses HttpOnly cookie)
    2. Updates `accessToken` in auth store
    3. Retries original request with new token
  - On refresh failure:
    - Clears auth state
    - Redirects to login page

### 2. Auth Store (`client/src/store/authStore.ts`)

**State**:
- `accessToken: string | null` - **Stored ONLY in memory, NOT in localStorage**
- `user: UserInfo | null` - User information
- `isAuthenticated: boolean` - Authentication status
- `isAuthInitializing: boolean` - Initial app load / refresh check
- `tokenExpireAt: number | null` - Token expiration timestamp (ms)
- `currentBranch: Branch | null` - Current branch selection

**Actions**:

- `bootstrapAuth(): Promise<void>`
  - Called once on app startup
  - Calls `POST /api/v1/auth/refresh` to restore session
  - On success: Sets `accessToken`, `user`, `isAuthenticated = true`
  - On failure: Clears auth state, sets `isAuthenticated = false`
  - Sets `isAuthInitializing = false` when done

- `login(identifier: string, password: string): Promise<void>`
  - Calls `POST /api/v1/auth/login` with credentials
  - Backend sets HttpOnly `refreshToken` cookie automatically
  - On success: Sets `accessToken`, `user`, `isAuthenticated = true`
  - On failure: Throws error with message

- `logout(): Promise<void>`
  - Optionally calls `POST /api/v1/auth/logout` (if implemented)
  - Clears `accessToken`, `user`, `tokenExpireAt`
  - Sets `isAuthenticated = false`
  - Clears React Query cache
  - Redirects to `/login`

- `setTokenAndExpiry(accessToken: string, expiretime: string | null)`
  - Sets access token and expiry (in memory only)
  - Parses ISO `expiretime` string into timestamp (ms)

- `setUser(userInfo)`
  - Sets user information from backend response
  - Extracts role from branches
  - Sets current branch

### 3. Idle Timeout Hook (`client/src/hooks/useIdleTimeout.ts`)

**WHAT**: Automatically logs out user after 5 minutes of inactivity

**WHY**: Extra security and compliance - ensures users don't leave sessions open

**HOW**:
- Listens to user activity events:
  - `mousemove`, `mousedown`, `keydown`, `scroll`, `touchstart`, `click`, `keypress`
- On any activity: Resets 5-minute timer
- After 5 minutes of inactivity:
  - Calls `authStore.logout()`
  - Redirects to login page

**Note**: This is frontend-only and independent from JWT expiry. The refreshToken cookie might still exist, but UX-wise we log the user out.

### 4. Login Page (`client/src/components/pages/general/Login.tsx`)

- Controlled form with `identifier` (email) and `password` fields
- On submit:
  - Calls `authStore.login(identifier, password)`
  - Shows loading state
  - Shows error messages on failure
  - On success: Navigates to `/` (dashboard)

### 5. Protected Route (`client/src/components/routing/ProtectedRoute.tsx`)

- Uses `isAuthInitializing` and `isAuthenticated` from auth store
- While `isAuthInitializing` is true:
  - Renders loading screen
- If NOT authenticated:
  - Redirects to `/login`
- If authenticated:
  - Renders child component

### 6. App Bootstrap (`client/src/App.tsx`)

- Calls `bootstrapAuth()` on mount
- Sets up `useIdleTimeout()` hook
- Handles token management

## Security Considerations

### Access Token Storage

**CRITICAL**: Access token is stored **ONLY in memory** (Zustand store), **NOT in localStorage or sessionStorage**.

**Why**:
- Reduces XSS (Cross-Site Scripting) risk
- Even if malicious script runs, it cannot access the token
- Token is cleared when browser tab/window closes

**Tradeoff**:
- Token is lost on page refresh
- Solution: `bootstrapAuth()` calls `/auth/refresh` on app startup to get a new token

### Refresh Token Storage

- Stored in **HttpOnly cookie** (set by backend)
- JavaScript **cannot read** HttpOnly cookies
- Automatically sent with requests via `withCredentials: true`
- More secure than localStorage/sessionStorage

### Token Refresh Flow

1. User makes request with expired access token
2. Backend returns 401
3. Interceptor detects 401
4. Calls `POST /api/v1/auth/refresh` (refreshToken in cookie)
5. Backend returns new `access_token` and sets new `refreshToken` cookie
6. Interceptor updates `accessToken` in store
7. Retries original request with new token
8. User sees no disruption

## Backend Contract

### POST /api/v1/auth/login

**Request**:
```json
{
  "identifier": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "access_token": "eyJ...",
  "token_type": "Bearer",
  "expiretime": "2025-11-21T08:54:45.497291+05:30",
  "user_info": {
    "full_name": "John Doe",
    "email": "user@example.com",
    "branches": [
      {
        "branch_id": 1,
        "branch_name": "Main Branch",
        "roles": ["ADMIN", "INSTITUTE_ADMIN"]
      }
    ]
  }
}
```

**Cookie**: Backend sets `refreshToken` cookie (HttpOnly, Secure, SameSite=None)

### POST /api/v1/auth/refresh

**Request**: No body (refreshToken in HttpOnly cookie)

**Response**: Same as login response

**Cookie**: Backend sets new `refreshToken` cookie (rotated)

### POST /api/v1/auth/logout

**Request**: No body (refreshToken in HttpOnly cookie)

**Response**:
```json
{
  "message": "Logged out successfully"
}
```

**Cookie**: Backend clears `refreshToken` cookie

## Usage Examples

### Making Authenticated API Calls

```typescript
import { apiClient } from "@/lib/api/api";

// Access token is automatically added to request
const response = await apiClient.get("/some-protected-resource");

// If token expires, interceptor automatically refreshes and retries
// User sees no disruption
```

### Checking Auth State

```typescript
import { useAuthStore } from "@/store/authStore";

function MyComponent() {
  const { isAuthenticated, user, accessToken } = useAuthStore();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome, {user?.full_name}</div>;
}
```

### Programmatic Login

```typescript
import { useAuthStore } from "@/store/authStore";

const { login } = useAuthStore();

try {
  await login("user@example.com", "password123");
  // User is now authenticated
} catch (error) {
  // Handle login error
  console.error("Login failed:", error.message);
}
```

## File Structure

```
client/src/
├── lib/
│   └── api/
│       └── api.ts                    # Axios instance + interceptors
├── store/
│   ├── authStore.ts                  # Zustand auth store
│   └── auth/
│       ├── authState.ts              # Auth state interface
│       ├── types.ts                   # Type definitions
│       └── storage.ts                 # Storage configuration
├── hooks/
│   └── useIdleTimeout.ts             # Idle timeout hook
├── components/
│   ├── pages/
│   │   └── general/
│   │       ├── Login.tsx             # Login page
│   │       └── ProfilePage.tsx      # Example protected page
│   └── routing/
│       ├── AppRouter.tsx             # Main router
│       └── ProtectedRoute.tsx        # Protected route wrapper
└── App.tsx                           # App bootstrap
```

## Testing

### Test Automatic Token Refresh

1. Log in
2. Wait for access token to expire (or manually expire it)
3. Make any API call
4. Interceptor should automatically refresh token and retry request
5. User should see no disruption

### Test Idle Timeout

1. Log in
2. Don't interact with the page for 5 minutes
3. User should be automatically logged out
4. Redirected to login page

### Test Bootstrap Auth

1. Log in
2. Refresh the page
3. `bootstrapAuth()` should call `/auth/refresh`
4. User should remain authenticated

## Notes

- Access token is **short-lived** (typically 15-60 minutes)
- Refresh token is **long-lived** (typically 7-30 days)
- Idle timeout is **frontend-only** (5 minutes)
- All API calls use `withCredentials: true` to send cookies
- React Query cache is cleared on logout



