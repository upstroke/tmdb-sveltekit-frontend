# Security Headers — Test Plan

**Feature:** HTTP Security Headers
**Scope:** Automated verification of HTTP response headers set by `src/hooks.server.js`
**Test Level:** Acceptance (Playwright)
**Tags:** `@security`

---

## Roles and Responsibilities

| Role | Responsibilities |
|---|---|
| **Test Manager** | Approve scope, accept residual risk for any skipped assertions |
| **Test Engineer** | Write and maintain `security-headers.spec.js` |
| **Security Reviewer** | Interpret findings, escalate header misconfigurations |
| **Developer** | Fix header issues in `src/hooks.server.js`, confirm resolution |

> In a solo project, all roles are fulfilled by the same person.

---

## Objective

Verify that every HTTP response served by the SvelteKit application includes the security headers defined in `src/hooks.server.js`. These headers form the first line of defense against clickjacking, MIME-type sniffing, and unauthorized resource loading.

This test plan accompanies `security-headers.spec.js` in the same directory.

---

## Scope

**In scope:**
- Presence and value of `Content-Security-Policy`
- `X-Frame-Options` or `frame-ancestors` directive
- `X-Content-Type-Options`
- `Referrer-Policy`
- Absence of the API key in HTML response bodies

**Out of scope:**
- Backend authentication (no backend exists)
- HTTPS/TLS configuration (infrastructure concern, not application code)
- Subresource Integrity (SRI) for CDN assets

---

## Test Cases

### TC-SEC-001: Content-Security-Policy header is present

| Field | Value |
|---|---|
| **Precondition** | Application running via `npm run dev` or `npm run preview` |
| **Steps** | Navigate to `/` and inspect the response headers |
| **Expected result** | Response includes a `content-security-policy` header |
| **Tag** | `@security` |

### TC-SEC-002: CSP restricts scripts to same-origin

| Field | Value |
|---|---|
| **Precondition** | Application running |
| **Steps** | Inspect the `content-security-policy` value |
| **Expected result** | `script-src` contains `'self'` |
| **Tag** | `@security` |

### TC-SEC-003: CSP allows TMDB images

| Field | Value |
|---|---|
| **Precondition** | Application running |
| **Steps** | Inspect the `content-security-policy` value |
| **Expected result** | `img-src` contains `image.tmdb.org` |
| **Tag** | `@security` |

### TC-SEC-004: CSP allows TMDB API connections

| Field | Value |
|---|---|
| **Precondition** | Application running |
| **Steps** | Inspect the `content-security-policy` value |
| **Expected result** | `connect-src` contains `api.themoviedb.org` |
| **Tag** | `@security` |

### TC-SEC-005: CSP blocks iframe embedding

| Field | Value |
|---|---|
| **Precondition** | Application running |
| **Steps** | Inspect the `content-security-policy` value |
| **Expected result** | `frame-ancestors 'none'` is present |
| **Tag** | `@security` |

### TC-SEC-006: X-Content-Type-Options is set

| Field | Value |
|---|---|
| **Precondition** | Application running |
| **Steps** | Inspect response headers for `/` |
| **Expected result** | `x-content-type-options: nosniff` |
| **Tag** | `@security` |

### TC-SEC-007: Referrer-Policy is set

| Field | Value |
|---|---|
| **Precondition** | Application running |
| **Steps** | Inspect response headers for `/` |
| **Expected result** | `referrer-policy` header is present and not empty |
| **Tag** | `@security` |

### TC-SEC-008: API key is not exposed in HTML response

| Field | Value |
|---|---|
| **Precondition** | Application running with a real `TMDB_API_KEY` set in `.env` |
| **Steps** | Load `/` and inspect the full page HTML source |
| **Expected result** | The string `api_key=` does not appear in the rendered HTML |
| **Tag** | `@security` |

---

## Test Commands

```bash
# All security acceptance tests
npx playwright test tests/acceptance/security/

# By tag
npx playwright test -g @security
```

---

## Pass / Fail Criteria

- All TC-SEC-001 through TC-SEC-008 must pass.
- A failing TC-SEC-008 (API key exposure) is a **blocker** — the application must not be released until resolved.
- Failing header checks (TC-SEC-001 to TC-SEC-007) are **high severity** and must be fixed before the next production deployment.
