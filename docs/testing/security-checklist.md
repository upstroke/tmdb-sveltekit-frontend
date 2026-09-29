# Security Checklist for SvelteKit Frontend

**Goal:** This checklist supports a repeatable frontend security review for this SvelteKit application. It combines automated static analysis and dependency scanning with manual checks for HTTP headers, client-side exposure, and configuration hygiene.

> A frontend application has no backend attack surface, but it does have real risks: leaked secrets, missing HTTP security headers, insecure dependencies, and XSS via unsanitized rendering. This checklist addresses each of these areas.

---

## Roles and Responsibilities

| Role | Responsibilities |
|---|---|
| **Test Manager** | Define security review scope, prioritize findings, accept residual risk |
| **Security Reviewer** | Run automated tools, execute manual checks, document findings |
| **Test Engineer** | Write and maintain automated security tests (Playwright, ESLint) |
| **Developer** | Remediate findings, verify fixes, update dependencies |

> In a solo project, all roles are fulfilled by the same person.

---

## 1. Prepare the Review

- [ ] Define the review goal: HTTP header compliance, dependency CVEs, client-side secret exposure
- [ ] Confirm the target environment: local dev server (`npm run dev`) and production build (`npm run build && npm run preview`)
- [ ] Note the Node.js and npm versions in use (currently `v26.6.0` / `11.18.0`)
- [ ] Document findings with: area, description, reproduction steps, severity, and fix suggestion

---

## 2. Dependency Scanning

### npm audit

```bash
npm audit
npm audit --audit-level=moderate
```

- [ ] Run `npm audit` and review all findings
- [ ] Address or explicitly accept all findings at `moderate` severity or above
- [ ] Add a dedicated script to `package.json`:

```json
"test:security": "npm audit --audit-level=moderate"
```

- [ ] Add `just test-security` to the `justfile` as a shortcut

### audit-ci (optional stricter enforcement)

Install:

```bash
npm install --save-dev audit-ci
```

Add `audit-ci.json` to the project root:

```json
{
  "moderate": true
}
```

Run:

```bash
npx audit-ci --config audit-ci.json
```

- [ ] Integrate into the pre-commit hook or CI pipeline

---

## 3. Static Analysis

The project already includes `eslint-plugin-security`. Run it explicitly:

```bash
npm run lint:eslint
```

- [ ] Confirm `eslint-plugin-security` is active in `eslint.config.js`
- [ ] Review all `security/*` rule findings — do not suppress globally
- [ ] Suppressed findings must include a comment explaining why they are safe

---

## 4. HTTP Security Headers

All headers are set in `src/hooks.server.js`. Review them in both development and production builds.

### Manual Check (Browser DevTools)

- [ ] Open DevTools → Network → select any document request → Headers tab
- [ ] Verify `Content-Security-Policy` is present and includes:
  - `script-src 'self'` with a per-request nonce
  - `img-src 'self' image.tmdb.org`
  - `connect-src 'self' api.themoviedb.org`
  - `frame-ancestors 'none'`
- [ ] Verify `X-Frame-Options: DENY` or `frame-ancestors 'none'` in CSP
- [ ] Verify `X-Content-Type-Options: nosniff`
- [ ] Verify `Referrer-Policy` is set (e.g. `strict-origin-when-cross-origin`)
- [ ] Verify no `Access-Control-Allow-Origin: *` on sensitive endpoints

### Automated Check (Playwright)

See `tests/acceptance/security/security-headers.spec.js` for automated header verification.

- [ ] Run the security header spec: `npx playwright test tests/acceptance/security/`
- [ ] Confirm all assertions pass in both dev and preview mode

---

## 5. API Key and Secret Exposure

- [ ] Confirm `TMDB_API_KEY` is **not** prefixed with `VITE_` — it must remain server-side only
- [ ] Inspect the production client bundle for the API key:

```bash
npm run build
grep -r "TMDB_API_KEY\|api_key=" ./build/client/ || echo "Not found — OK"
```

- [ ] Confirm `.env` is listed in `.gitignore`
- [ ] Confirm no secrets appear in `git log` history:

```bash
git log -p | grep -i "api_key\|secret\|token" | head -20
```

- [ ] Confirm `.env.example` contains only placeholder values, no real keys

---

## 6. Cross-Site Scripting (XSS)

SvelteKit escapes template expressions by default. Manual review focuses on explicit bypass patterns.

- [ ] Search for uses of `{@html ...}` in all `.svelte` files:

```bash
grep -r "{@html" src/
```

- [ ] For each `{@html}` usage, confirm the value is sanitized before rendering
- [ ] Confirm no `innerHTML` assignments occur in JavaScript files:

```bash
grep -r "innerHTML" src/
```

- [ ] Confirm no `eval()` or `new Function()` calls exist:

```bash
grep -rn "eval(\|new Function(" src/
```

---

## 7. Content Security Policy — Nonce Verification

- [ ] Confirm `src/hooks.server.js` generates a unique nonce per request (not a static value)
- [ ] Confirm the nonce is passed to SvelteKit's CSP integration, not hardcoded in the `<script>` tag manually
- [ ] In DevTools, verify the `nonce` attribute on inline `<script>` tags changes on every page reload

---

## 8. Release Gate

- [ ] `npm audit --audit-level=moderate` exits cleanly
- [ ] `npm run lint:eslint` shows no `security/*` findings
- [ ] Playwright security header spec passes in production build
- [ ] No API key found in the client bundle
- [ ] No `{@html}` rendering of unsanitized user input
- [ ] Findings above `low` severity are either fixed or explicitly risk-accepted with a rationale

---

## Finding Template

| Field | Content |
|---|---|
| ID | Unique identifier, e.g. `SEC-007` |
| Area | HTTP Headers / Dependency / Secret Exposure / XSS / CSP |
| Description | What is the issue and what is the risk? |
| Reproduction | Steps, environment, tool output or screenshot |
| Expectation | Expected secure configuration or behavior |
| Severity | Critical, High, Medium, Low, Informational |
| Fix | Concrete, verifiable change |
| Owner / Status | Responsible person and current status |
| Validation | Date, method, and result after the fix |
