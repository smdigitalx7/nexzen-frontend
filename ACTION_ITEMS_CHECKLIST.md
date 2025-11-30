# ✅ Action Items Checklist - Project Cleanup

## 🔴 CRITICAL - Must Do Before Handover

### 1. Testing Infrastructure
- [ ] Install testing dependencies
  ```bash
  npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
  ```
- [ ] Create `vitest.config.ts`
- [ ] Write tests for critical paths:
  - [ ] Authentication flow
  - [ ] Payment processing
  - [ ] Fee collection
  - [ ] Reservation management
- [ ] Setup CI/CD test runs
- [ ] Target: Minimum 60% code coverage

### 2. Remove Console.log Statements
- [ ] Audit all console.log statements (249+ found)
- [ ] Remove or replace with proper logging service
- [ ] Files to check:
  - [ ] `client/src/core/api/index.ts`
  - [ ] `client/src/core/auth/authStore.ts`
  - [ ] `client/src/common/components/layout/Sidebar.tsx`
  - [ ] All other files with console.log
- [ ] Setup production logging service (e.g., Sentry)

### 3. Delete Dead Code
- [ ] Delete unused files:
  - [ ] `client/src/components/features/school/fees/collect-fee/CollectFeeForm.tsx` (748 lines)
  - [ ] `client/src/components/features/college/fees/collect-fee/CollectFeeForm.tsx` (758 lines)
- [ ] Remove unused imports (run ESLint)
- [ ] Clean up commented code:
  - [ ] `client/src/app/main.tsx` - Remove commented blocks
  - [ ] Other files with commented code

### 4. Error Tracking Setup
- [ ] Install error tracking service
  ```bash
  npm install @sentry/react
  ```
- [ ] Configure Sentry in `ProductionApp.tsx`
- [ ] Setup error boundary integration
- [ ] Configure production error reporting
- [ ] Test error reporting works

### 5. Fix TypeScript Any Types
- [ ] Replace `any` types with proper types (69+ instances)
- [ ] Priority files:
  - [ ] `client/src/core/api/api.ts:55` - `user_info: any`
  - [ ] `client/src/features/school/components/reservations/ReservationManagement.tsx:146` - `currentBranch: any`
  - [ ] Payment components with `any` types
- [ ] Create proper type definitions
- [ ] Run TypeScript strict mode checks

### 6. Add Security Headers
- [ ] Add Content Security Policy (CSP)
- [ ] Add X-Frame-Options header
- [ ] Add X-Content-Type-Options header
- [ ] Add Strict-Transport-Security header
- [ ] Configure in `vite.config.ts` or server config
- [ ] Test headers are present

---

## 🟡 HIGH PRIORITY - Should Do

### 7. Complete TODOs
- [ ] Review all TODO comments (81+ found)
- [ ] Complete or remove TODOs:
  - [ ] `useEmployeeManagement.ts:157` - Implement pagination
  - [ ] `CollectFeeForm.tsx:199` - Payment month TODO
  - [ ] Other critical TODOs
- [ ] Create GitHub issues for non-critical TODOs
- [ ] Remove completed TODOs

### 8. Remove Hardcoded URLs
- [ ] Replace hardcoded API URLs with env variables:
  - [ ] `vite.config.ts:125` - `https://erpapi.velonex.in`
  - [ ] `vercel.json:5` - API URL
- [ ] Verify all env variables are properly loaded
- [ ] Document required environment variables

### 9. Consolidate Documentation
- [ ] Review all 93+ markdown files in `/docs`
- [ ] Remove redundant/outdated documentation
- [ ] Consolidate similar docs
- [ ] Create README index with links
- [ ] Keep only essential documentation

### 10. Standardize Error Handling
- [ ] Create error handling utility
- [ ] Standardize error message format
- [ ] Consistent error UI components
- [ ] Replace inconsistent error patterns

### 11. Review Deprecated Code
- [ ] Check usage of deprecated functions:
  - [ ] `client/src/core/auth/permissions.ts` - Deprecated permissions
  - [ ] `client/src/features/general/services/employee-attendance.service.ts` - Deprecated update()
- [ ] Migrate to new patterns
- [ ] Remove deprecated code if unused

### 12. Dependency Audit
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Run `depcheck` to find unused dependencies
- [ ] Remove unused dependencies
- [ ] Update outdated dependencies
- [ ] Document why each dependency is needed

---

## 🟢 MEDIUM PRIORITY - Nice to Have

### 13. Bundle Size Optimization
- [ ] Analyze bundle size
- [ ] Identify large dependencies
- [ ] Implement lazy loading for heavy features
- [ ] Add bundle size limits to CI/CD
- [ ] Monitor bundle size changes

### 14. Accessibility Improvements
- [ ] Audit accessibility (ARIA labels, keyboard navigation)
- [ ] Add missing ARIA labels
- [ ] Test with screen readers
- [ ] Fix accessibility issues
- [ ] Document accessibility features

### 15. Performance Optimization
- [ ] Profile application performance
- [ ] Optimize slow components
- [ ] Add performance monitoring
- [ ] Implement virtual scrolling for large lists
- [ ] Optimize image loading

### 16. Code Organization
- [ ] Review duplicate utilities
- [ ] Consolidate similar functions
- [ ] Split large components (>1000 lines)
- [ ] Organize imports consistently

### 17. API Documentation
- [ ] Generate API docs from TypeScript types
- [ ] Document API endpoints
- [ ] Create API integration guide
- [ ] Add example requests/responses

---

## 📋 File-Specific Actions

### Files to Delete:
1. `client/src/components/features/school/fees/collect-fee/CollectFeeForm.tsx`
2. `client/src/components/features/college/fees/collect-fee/CollectFeeForm.tsx`

### Files to Review:
1. `vite.config.ts` - Remove hardcoded URLs
2. `vercel.json` - Use env variables
3. `client/src/core/api/index.ts` - Remove console.log
4. `client/src/core/auth/authStore.ts` - Remove debug logs
5. `client/src/common/components/layout/Sidebar.tsx` - Remove debug logs

### Files to Refactor:
1. Large components (>1000 lines) - Split into smaller components
2. Files with many `any` types - Add proper types
3. Files with TODOs - Complete or remove

---

## 🎯 Progress Tracking

### Week 1 Goals:
- [ ] Testing infrastructure setup
- [ ] Console.log cleanup (50% complete)
- [ ] Dead code removal
- [ ] Error tracking setup

### Week 2 Goals:
- [ ] Complete console.log cleanup
- [ ] Fix critical TypeScript types
- [ ] Complete critical TODOs
- [ ] Security headers added

### Week 3 Goals:
- [ ] Test coverage 60%+
- [ ] Documentation consolidation
- [ ] Dependency audit complete
- [ ] Final security review

---

## 📊 Metrics to Track

- [ ] Test coverage: Target 60%+
- [ ] Console.log count: Target 0 (or only errors)
- [ ] Dead code removed: 1,500+ lines
- [ ] TypeScript any types: Target <10
- [ ] TODO comments: Target <20
- [ ] Bundle size: Monitor and keep under limits

---

**Status:** 🔴 Not Ready for Handover  
**Target Date:** TBD (2-3 weeks after starting fixes)  
**Last Updated:** January 2025

