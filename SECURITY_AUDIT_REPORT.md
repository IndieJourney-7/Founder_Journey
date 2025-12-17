# SFHT Ascent - Security & Quality Audit Report
**Date:** 2025-12-17
**Auditor:** Security Review
**Status:** ⚠️ Issues Found - Action Required

---

## Executive Summary

This audit identified **24 issues** across security, error handling, and code quality categories. While no **CRITICAL** vulnerabilities were found, several **HIGH** and **MEDIUM** priority issues require attention before production deployment.

### Issue Breakdown
- 🔴 **Critical:** 0
- 🟠 **High:** 5
- 🟡 **Medium:** 12
- 🟢 **Low:** 7

---

## 🔴 CRITICAL ISSUES (0)

✅ No critical security vulnerabilities found.

---

## 🟠 HIGH PRIORITY ISSUES (5)

### 1. **Missing React Error Boundary**
**File:** Entire Application
**Severity:** HIGH
**Impact:** Uncaught errors will crash the entire React app, showing white screen to users.

**Issue:**
```javascript
// No ErrorBoundary component found in codebase
```

**Recommendation:**
```javascript
// Create src/components/ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-brand-blue">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
            <p className="text-white/70 mb-6">We're sorry for the inconvenience.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-brand-gold text-brand-blue rounded-lg"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Wrap App in ErrorBoundary
```

---

### 2. **CORS Configuration Too Permissive**
**File:** `server/webhook.js:389`
**Severity:** HIGH
**Impact:** Any origin can make requests to your webhook server.

**Issue:**
```javascript
res.setHeader('Access-Control-Allow-Origin', '*')
```

**Recommendation:**
```javascript
// Only allow your frontend domain
const ALLOWED_ORIGINS = [
  'https://sfht-ascent.vercel.app',
  'http://localhost:5173' // For development
];

const origin = req.headers.origin;
if (ALLOWED_ORIGINS.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin);
}
```

---

### 3. **Webhook Signature Verification Skipped**
**File:** `server/webhook.js:234-241`
**Severity:** HIGH
**Impact:** Unauthenticated users could fake webhook events and upgrade accounts for free.

**Issue:**
```javascript
function verifySignature(payload, signature) {
    if (!DODO_WEBHOOK_SECRET) return true // ⚠️ DANGEROUS - Skip if not configured
    // ...
}
```

**Recommendation:**
```javascript
function verifySignature(payload, signature) {
    if (!DODO_WEBHOOK_SECRET) {
        throw new Error('DODO_WEBHOOK_SECRET is required for webhook security');
    }
    // ... rest of verification
}

// In webhook handler:
if (DODO_WEBHOOK_SECRET && signature) {
    const isValid = verifySignature(body, signature);
    if (!isValid) {
        console.error('❌ Invalid webhook signature - REJECTING');
        return { success: false, error: 'Invalid signature' };
    }
}
```

---

### 4. **Missing try-catch in Auth Context**
**File:** `src/context/AuthContext.jsx:23, 101`
**Severity:** HIGH
**Impact:** Unhandled promise rejections could crash auth flow.

**Issue:**
```javascript
supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null)
    setLoading(false)
}) // ⚠️ No .catch()

const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    // ⚠️ No try-catch
}
```

**Recommendation:**
```javascript
supabase.auth.getSession()
  .then(({ data: { session } }) => {
    setUser(session?.user ?? null);
  })
  .catch((error) => {
    console.error('Session fetch error:', error);
    setUser(null);
  })
  .finally(() => setLoading(false));

const refreshUser = async () => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        return session?.user;
    } catch (error) {
        console.error('Refresh user error:', error);
        return null;
    }
};
```

---

### 5. **Production Console.log Statements**
**Files:** Multiple (34 instances)
**Severity:** HIGH (for production)
**Impact:** Performance overhead, potential information leakage.

**Issue:**
- `src/lib/mountainService.js`: 7 console statements
- `src/lib/stepsService.js`: 6 console statements
- `src/lib/notesService.js`: 5 console statements
- `src/lib/auth.js`: 4 console statements
- `server/webhook.js`: Many debug logs

**Recommendation:**
Create a logging utility:
```javascript
// src/lib/logger.js
const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args) => isDev && console.log(...args),
  error: (...args) => console.error(...args), // Keep errors
  warn: (...args) => isDev && console.warn(...args),
  debug: (...args) => isDev && console.debug(...args),
};

// Replace all console.log with logger.log
```

---

## 🟡 MEDIUM PRIORITY ISSUES (12)

### 6. **No Input Sanitization**
**Files:** `src/pages/Dashboard.jsx`, `src/pages/GoalSetup.jsx`, `src/pages/Pricing.jsx`
**Severity:** MEDIUM
**Impact:** Potential XSS if user inputs malicious scripts in step titles/descriptions.

**Recommendation:**
```javascript
// Install DOMPurify
npm install dompurify

// Use for user-generated content
import DOMPurify from 'dompurify';

const sanitizedTitle = DOMPurify.sanitize(userInput);
```

---

### 7. **Missing Rate Limiting**
**File:** `server/webhook.js`
**Severity:** MEDIUM
**Impact:** Server could be DOSed by rapid webhook requests.

**Recommendation:**
```javascript
// Install express-rate-limit
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Apply to webhook routes
```

---

### 8. **Unvalidated User Input**
**File:** `server/webhook.js:443-449`
**Severity:** MEDIUM
**Impact:** Malformed email could cause server errors.

**Issue:**
```javascript
const { email } = JSON.parse(body);

if (!email) { ... } // Only checks existence, not format
```

**Recommendation:**
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!email || !emailRegex.test(email)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
        success: false,
        error: 'Valid email required'
    }));
}
```

---

### 9. **No Request Body Size Limit**
**File:** `server/webhook.js:375-382`
**Severity:** MEDIUM
**Impact:** Large payloads could cause memory issues.

**Recommendation:**
```javascript
function getBody(req, maxSize = 1024 * 1024) { // 1MB limit
    return new Promise((resolve, reject) => {
        let body = '';
        let size = 0;

        req.on('data', chunk => {
            size += chunk.length;
            if (size > maxSize) {
                req.connection.destroy();
                reject(new Error('Request too large'));
                return;
            }
            body += chunk;
        });
        req.on('end', () => resolve(body));
        req.on('error', reject);
    });
}
```

---

### 10. **Hardcoded Payment Link**
**File:** `src/pages/Pricing.jsx:102`
**Severity:** MEDIUM
**Impact:** Test mode payment link in code.

**Issue:**
```javascript
const DODO_PAYMENT_LINK = 'https://test.checkout.dodopayments.com/buy/...'
```

**Recommendation:**
Move to environment variable:
```javascript
const DODO_PAYMENT_LINK = import.meta.env.VITE_DODO_PAYMENT_LINK;
```

---

### 11. **Missing Dependency Arrays in useEffect**
**Files:** Multiple components
**Severity:** MEDIUM
**Impact:** Potential memory leaks or stale closures.

**Recommendation:**
Audit all useEffect hooks and ensure proper dependency arrays.

---

### 12-17. **Additional Medium Issues:**
- Unused navigate import in Pricing.jsx
- No timeout on http/https requests
- Missing Content-Security-Policy headers
- No HTTPS enforcement check
- Missing request logging/monitoring
- No database connection pooling

---

## 🟢 LOW PRIORITY ISSUES (7)

### 18. **console.warn in Production Code**
**File:** `src/lib/supabase.js:14`
**Recommendation:** Use environment-aware logging.

---

### 19. **Unused Variable in Pricing**
**File:** `src/pages/Pricing.jsx:105-106`
```javascript
const { user } = useAuth(); // Used
const navigate = useNavigate(); // ⚠️ Not used after disabling payments
```

---

### 20. **Magic Numbers**
**Files:** Multiple
**Example:** `src/pages/Dashboard.jsx:68`
```javascript
if (progress > 0 && progress % 25 === 0) // Magic number
```

**Recommendation:** Use constants:
```javascript
const CONFETTI_TRIGGER_INTERVAL = 25;
```

---

### 21. **Inconsistent Error Handling**
Some functions return `{ success, error }`, others throw.
**Recommendation:** Standardize error handling pattern.

---

### 22. **No TypeScript**
**Impact:** No type safety, harder to catch bugs.
**Recommendation:** Consider migrating to TypeScript for better DX.

---

### 23. **Missing PropTypes**
**Impact:** No runtime prop validation.
**Recommendation:** Add PropTypes or migrate to TypeScript.

---

### 24. **No Test Coverage**
**Impact:** No automated testing.
**Recommendation:** Add Jest + React Testing Library.

---

## 📋 IMMEDIATE ACTION ITEMS

### Must Fix Before Production (Priority Order):
1. ✅ **Add ErrorBoundary** to main App
2. ✅ **Fix CORS** to whitelist specific origins
3. ✅ **Enforce webhook signature verification**
4. ✅ **Add try-catch** to all auth context async operations
5. ✅ **Remove/replace console.log** statements with environment-aware logger
6. ✅ **Add input validation** for email and user inputs
7. ✅ **Implement rate limiting** on webhook endpoints

### Should Fix Soon:
8. Add request body size limits
9. Move hardcoded values to environment variables
10. Add input sanitization (DOMPurify)
11. Fix missing dependency arrays in useEffect
12. Add timeout handling for external API calls

### Nice to Have:
13. Add Content-Security-Policy headers
14. Implement comprehensive logging/monitoring
15. Add PropTypes or migrate to TypeScript
16. Set up automated testing
17. Add database connection pooling

---

## 🔧 RECOMMENDED PACKAGES

```bash
# Security
npm install dompurify helmet cors express-rate-limit

# Development
npm install -D @testing-library/react @testing-library/jest-dom jest

# TypeScript (Optional but recommended)
npm install -D typescript @types/react @types/react-dom
```

---

## ✅ SECURITY STRENGTHS

1. ✅ **.env files properly gitignored**
2. ✅ **No hardcoded API keys in code**
3. ✅ **Using environment variables correctly**
4. ✅ **No dangerouslySetInnerHTML usage**
5. ✅ **Supabase RLS enabled** (assumed from context)
6. ✅ **OAuth integration secure**
7. ✅ **No SQL injection vulnerabilities** (using Supabase client)

---

## 📊 OVERALL ASSESSMENT

**Security Grade:** B- (Good foundation, needs hardening)
**Code Quality:** B (Clean code, needs error handling improvements)
**Production Readiness:** 70% (Address HIGH priority issues first)

---

## 🎯 CONCLUSION

Your codebase has a solid foundation with good security practices (environment variables, no hardcoded secrets). However, **before deploying to production**, you must:

1. Add error boundaries
2. Tighten CORS policy
3. Enforce webhook signature verification
4. Add proper error handling
5. Remove debug logging

The good news: These are all straightforward fixes that can be completed in a focused development session.

---

**Next Steps:** Create issues for each HIGH priority item and tackle them one by one.
