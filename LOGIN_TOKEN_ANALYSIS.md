# Login Implementation & Token Storage Analysis

## Executive Summary

This document provides a comprehensive analysis of the authentication system, focusing on login flow, token storage mechanisms, and security considerations.

---

## 1. Login Flow Architecture

### 1.1 Login Process Flow

```
User Input (Login.tsx)
    ↓
useLogin Hook (useAuth.ts)
    ↓
AuthService.login() → unifiedApi.post("/auth/login")
    ↓
API Layer (api.ts) - handles request/response
    ↓
Token Extraction & Storage
    ↓
Auth Store Update (authStore.ts)
    ↓
User Redirect
```

### 1.2 Detailed Login Steps

**Step 1: User Submission** (`Login.tsx`)

- User enters email and password
- Form validation (email format, required fields)
- Calls `loginMutation.mutateAsync()`

**Step 2: API Call** (`useAuth.ts` → `unifiedApi.post`)

- Sends credentials to `/auth/login` endpoint
- Receives response with:
  - `access_token`
  - `expiretime` (ISO timestamp)
  - `user_info` (full_name, email, branches array)

**Step 3: Token Storage** (`useAuth.ts` → `authStore.setTokenAndExpiry`)

- Token stored in **sessionStorage** (primary)
- Expiration timestamp stored in **sessionStorage**
- Token stored in **Zustand store** (in-memory)
- User data stored in **localStorage** (via Zustand persist)

**Step 4: User Data Processing**

- Extracts branches from response
- Determines current branch (first branch or from `/auth/me`)
- Extracts user role from branch roles
- Normalizes role to match application roles
- Calls `/auth/me` to get additional user info (user_id, institute_id)

**Step 5: State Update**

- Updates Zustand auth store with user, branches, token
- Sets `isAuthenticated = true`
- Schedules proactive token refresh

**Step 6: Redirect**

- Redirects to dashboard (`/`)

---

## 2. Token Storage Mechanism

### 2.1 Dual Storage Strategy

The application uses a **hybrid storage approach**:

#### Primary Storage: sessionStorage

- **Location**: `sessionStorage.getItem("access_token")`
- **Expiration**: `sessionStorage.getItem("token_expires")`
- **Purpose**: Security - tokens cleared on browser tab close
- **Storage Events**:
  - Set: When `setTokenAndExpiry()` is called
  - Remove: On logout or token expiration

#### Secondary Storage: Zustand Store (In-Memory)

- **Location**: `useAuthStore.getState().token`
- **Purpose**: Fast access for API calls
- **Persistence**: NOT persisted to localStorage (intentionally excluded)

#### User Data Storage: localStorage

- **Location**: Zustand persist middleware → localStorage
- **Stored Data**:
  - User object (user_id, full_name, email, role, etc.)
  - Branches array
  - Current branch
  - Academic year data
- **Excluded Data**:
  - `token` (stored in sessionStorage)
  - `tokenExpireAt` (stored in sessionStorage)
  - `refreshToken` (not used/stored)
  - `isAuthenticated` (computed from token presence)

### 2.2 Storage Implementation Details

#### Token Setting (`authStore.ts:545-569`)

```typescript
setTokenAndExpiry: (token, expireAtMs) => {
  // Update Zustand store
  set((state) => {
    state.token = token;
    state.tokenExpireAt = expireAtMs;
    if (token && state.user) {
      state.isAuthenticated = true;
    }
  });

  // Store in sessionStorage
  if (token) {
    sessionStorage.setItem("access_token", token);
    sessionStorage.setItem("token_expires", String(expireAtMs));
  }
};
```

#### Custom Storage Middleware (`authStore.ts:691-757`)

- **Custom `getItem`**: Reads from localStorage, checks sessionStorage for token
- **Custom `setItem`**:
  - Extracts token from Zustand state
  - Stores token in sessionStorage
  - Removes token from localStorage data before storing
- **Custom `removeItem`**: Clears both localStorage and sessionStorage

#### Rehydration (`authStore.ts:785-838`)

- Runs after Zustand rehydrates from localStorage
- Checks sessionStorage for token
- Validates token expiration
- Sets `isAuthenticated` based on token + user presence
- Logs out if token expired

---

## 3. Token Refresh Mechanism

### 3.1 Refresh Token Strategy

**Current Implementation**: Uses **httpOnly cookies** for refresh tokens

- Refresh token stored in httpOnly cookie (server-side)
- Not accessible via JavaScript (security best practice)
- Automatically sent with requests via `credentials: "include"`

### 3.2 Automatic Token Refresh

#### Proactive Refresh (`api.ts:100-119`)

- Scheduled 60 seconds before token expiration
- Uses `setTimeout` to trigger refresh
- Automatically reschedules after successful refresh

#### On-Demand Refresh (`api.ts:128-180`)

- Triggered on 401/403 responses
- Uses `tryRefreshToken()` function
- Prevents infinite loops with `_isRetry` flag
- Clears auth state on failure

#### Refresh Endpoint (`api.ts:135-141`)

```typescript
POST /auth/refresh
Headers: {
  "Content-Type": "application/json"
}
Credentials: include (httpOnly cookie sent automatically)
```

### 3.3 Refresh Flow

```
API Request Returns 401/403
    ↓
tryRefreshToken() called
    ↓
POST /auth/refresh (with httpOnly cookie)
    ↓
New access_token received
    ↓
setTokenAndExpiry() updates token
    ↓
Original request retried with new token
```

---

## 4. Security Analysis

### 4.1 Security Strengths ✅

1. **sessionStorage for Tokens**
   - Tokens cleared on tab close
   - Reduces XSS attack surface
   - Prevents token persistence across sessions

2. **httpOnly Cookies for Refresh Tokens**
   - JavaScript cannot access refresh tokens
   - Protects against XSS attacks
   - Industry best practice

3. **Token Expiration Validation**
   - Checks expiration before use
   - Automatic logout on expired tokens
   - Proactive refresh before expiration

4. **Separate Storage for Tokens**
   - Tokens NOT in localStorage
   - User data in localStorage (acceptable)
   - Reduces risk of token theft

5. **Automatic Token Refresh**
   - Seamless user experience
   - Prevents unauthorized access
   - Handles refresh failures gracefully

### 4.2 Security Concerns ⚠️

1. **sessionStorage Still Vulnerable to XSS**
   - While better than localStorage, still accessible to JavaScript
   - If XSS occurs, tokens can be stolen
   - **Mitigation**: Ensure proper CSP headers, input sanitization

2. **Token in Memory (Zustand Store)**
   - Token accessible in browser DevTools
   - Can be extracted from memory
   - **Mitigation**: This is acceptable for access tokens (short-lived)

3. **No CSRF Protection Visible**
   - Refresh endpoint uses POST (good)
   - But no explicit CSRF token visible
   - **Mitigation**: Ensure backend implements CSRF protection

4. **Token Expiration Check Gap**
   - Line 224-226 in `api.ts`: Expiration check exists but not used

   ```typescript
   if (state.tokenExpireAt) {
     const isExpired = Date.now() > state.tokenExpireAt;
     // Result not used!
   }
   ```

   - **Issue**: Token expiration checked but not acted upon

5. **Remember Me Functionality**
   - Stores email in localStorage (acceptable)
   - No password storage (good)
   - But could be improved with encrypted storage

6. **Refresh Token Not Explicitly Stored**
   - Refresh token in httpOnly cookie (good)
   - But no client-side tracking of refresh token state
   - **Impact**: Minimal - server handles it

---

## 5. Code Quality Issues

### 5.1 Unused Code

**Location**: `api.ts:224-226`

```typescript
if (state.tokenExpireAt) {
  const isExpired = Date.now() > state.tokenExpireAt;
  // Variable 'isExpired' is computed but never used
}
```

**Fix**: Either use it or remove it:

```typescript
if (state.tokenExpireAt && Date.now() > state.tokenExpireAt) {
  // Token expired, attempt refresh
  const refreshed = await tryRefreshToken(token);
  if (!refreshed) {
    throw new Error("Token expired and refresh failed");
  }
}
```

### 5.2 Redundant Token Storage

**Location**: `api.ts:264-273`

- Token extracted from login response
- But `setTokenAndExpiry()` already called in `useAuth.ts:94`
- This is a duplicate operation (defensive programming)

### 5.3 Error Handling

**Strengths**:

- Good error handling in refresh flow
- Graceful degradation on refresh failure
- Clear error messages

**Improvements Needed**:

- More specific error types
- Error recovery strategies
- User-friendly error messages

---

## 6. Token Usage in API Requests

### 6.1 Authorization Header

**Location**: `api.ts:234-240`

```typescript
if (!noAuth && token) {
  requestHeaders["Authorization"] = `Bearer ${token}`;
}
```

**Flow**:

1. Get token from Zustand store: `useAuthStore.getState().token`
2. Check if request requires auth (`noAuth` flag)
3. Add `Authorization: Bearer {token}` header
4. Send request with `credentials: "include"` (for refresh token cookie)

### 6.2 Request Retry Logic

**Location**: `api.ts:277-295`

- On 401/403, attempts token refresh
- Retries original request with new token
- Prevents infinite loops with `_isRetry` flag
- Logs out user if refresh fails

---

## 7. Recommendations

### 7.1 High Priority 🔴

1. **Fix Unused Expiration Check**
   - Use the `isExpired` check in `api.ts:224-226`
   - Implement proactive token refresh before making requests

2. **Add CSRF Protection**
   - Ensure backend implements CSRF tokens
   - Verify CSRF protection on refresh endpoint

3. **Improve Error Handling**
   - Add specific error types for different failure scenarios
   - Implement retry logic with exponential backoff
   - Better user feedback on token refresh failures

### 7.2 Medium Priority 🟡

1. **Token Expiration Validation**
   - Add validation before every API request
   - Show warning to user when token expiring soon
   - Implement "keep me logged in" functionality

2. **Security Headers**
   - Ensure proper CSP headers
   - Verify XSS protection
   - Add security headers in backend responses

3. **Code Cleanup**
   - Remove redundant token storage in `api.ts:264-273`
   - Consolidate token management logic
   - Improve code documentation

### 7.3 Low Priority 🟢

1. **Enhanced Remember Me**
   - Encrypt email in localStorage
   - Add option to remember for longer periods
   - Implement secure "remember device" functionality

2. **Token Rotation**
   - Implement token rotation on refresh
   - Add token versioning
   - Track token usage statistics

3. **Monitoring & Logging**
   - Add analytics for token refresh success/failure
   - Log authentication events
   - Monitor for suspicious activity

---

## 8. Architecture Strengths

### 8.1 Separation of Concerns ✅

- **UI Layer**: `Login.tsx` - handles user input
- **Business Logic**: `useAuth.ts` - orchestrates login flow
- **API Layer**: `api.ts` - handles HTTP requests
- **State Management**: `authStore.ts` - manages auth state
- **Service Layer**: `auth.service.ts` - API service abstraction

### 8.2 State Management ✅

- Zustand for state management (lightweight)
- Persist middleware for user data
- Custom storage for token separation
- Reactive updates with selectors

### 8.3 Token Refresh Strategy ✅

- Proactive refresh (before expiration)
- Reactive refresh (on 401/403)
- Automatic retry logic
- Prevents infinite loops

---

## 9. Testing Recommendations

### 9.1 Unit Tests

- Test token storage in sessionStorage
- Test token expiration validation
- Test refresh token flow
- Test logout cleanup

### 9.2 Integration Tests

- Test complete login flow
- Test token refresh on API failure
- Test branch switching with token refresh
- Test session persistence across page reloads

### 9.3 Security Tests

- Test XSS vulnerability (token theft)
- Test CSRF protection
- Test token expiration handling
- Test concurrent request handling

---

## 10. Conclusion

The authentication system is **well-architected** with good separation of concerns and security practices. The dual storage strategy (sessionStorage for tokens, localStorage for user data) is a solid approach.

**Key Strengths**:

- ✅ httpOnly cookies for refresh tokens
- ✅ sessionStorage for access tokens
- ✅ Automatic token refresh
- ✅ Good error handling

**Areas for Improvement**:

- ⚠️ Fix unused expiration check
- ⚠️ Add CSRF protection verification
- ⚠️ Improve error handling specificity
- ⚠️ Remove redundant code

**Overall Assessment**: **Good** - The implementation follows security best practices with room for minor improvements.

---

## 11. Appendix: Key Files

- `client/src/components/pages/general/Login.tsx` - Login UI
- `client/src/lib/hooks/general/useAuth.ts` - Login hook
- `client/src/store/authStore.ts` - Auth state management
- `client/src/lib/api.ts` - API client with token management
- `client/src/lib/services/general/auth.service.ts` - Auth service
- `client/src/lib/services/general/unified-api.service.ts` - Unified API wrapper

---

_Analysis Date: 2025-01-27_
_Analyzed by: Auto (AI Assistant)_
