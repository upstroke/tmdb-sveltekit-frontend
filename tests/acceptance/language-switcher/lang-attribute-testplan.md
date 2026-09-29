# Acceptance Tests – Dynamic HTML lang Attribute

## 1. Test Plan Identifier

- **Project:** TMDB SvelteKit Frontend  
- **Module:** Language Switcher / Dynamic `lang` Attribute  
- **Version:** 1.0  
- **Date:** 2026-09-29  

## 2. Introduction

The purpose of this test plan is to validate that the `<html lang="...">` attribute is set correctly on every server-rendered response. The attribute is injected by the SvelteKit server hook (`src/hooks.server.js`) via a `%lang%` placeholder in `src/app.html`. The active locale is read from the `app-locale` session cookie, which is written by the locale store whenever the user switches the language. Screen readers and search engines rely on this attribute to determine the document language (WCAG 2.1 SC 3.1.1).

## 3. Test Items

- `src/hooks.server.js` — server hook that replaces `%lang%` with the active BCP 47 locale  
- `src/app.html` — HTML template containing the `%lang%` placeholder  
- `src/lib/stores/locale.js` — locale store that writes `sessionStorage` and the `app-locale` cookie  
- Language-switcher control in the global header  

## 4. Features to be tested

1. The `<html>` element carries `lang="en"` on the initial page load (default locale).  
2. After switching to German via the language-switcher, the `<html>` element carries `lang="de"` on the next server-rendered response.  
3. The `lang` attribute is present and non-empty on every tested route.  

## 5. Features not to be tested

- Visual rendering of the language-switcher control.  
- Translation correctness of UI strings.  
- Persistence of the locale across browser sessions (sessionStorage scope).  
- BCP 47 sub-tag format (e.g. `en-US` vs. `en`) — only the primary language subtag is verified.  
- Server-side locale resolution for routes other than the home page.  
- Locale propagation to TMDB API requests.  

## 6. Approach

- **Tool:** Playwright  
- **Syntax:** Gherkin for user stories  
- **Browser:** Chromium (default)  
- **Viewport:** Desktop (1920×1080)  
- **Data:** `?locale=en-US` and `?locale=de-DE` query parameters for deterministic locale selection; cookie-based verification after language switch.  
- **Selectors:** `page.locator('html')` for the `lang` attribute; role-based selectors for the language-switcher button.  
- **Test Design Techniques:** Equivalence Partitioning (supported locales), State Transition Testing (default → switched locale).  
- **Tags:** `@lang`, `@language-switcher`, `@a11y`, `@e2e`, `@black-box`, `@regression`  

## 7. Item Pass/Fail Criteria

- **Pass:** The `<html lang>` attribute matches the expected BCP 47 primary language subtag for every step; no assertion fails.  
- **Fail:** At least one assertion fails or the attribute is absent or empty.  

## 8. State Coverage Matrix

| Locale state | Expected `lang` value | Test case |
|---|---|---|
| Default (no cookie, `?locale=en-US`) | `en` or `en-US` | TC-LS-001 |
| German selected via language-switcher, page reloaded | `de` or `de-DE` | TC-LS-002 |
| Attribute present on non-home route | non-empty string | TC-LS-003 |

### Rationale

- The default-locale case covers the common path and verifies that the placeholder replacement is active.  
- The switched-locale case verifies the full cookie → hook → HTML pipeline after a user interaction.  
- The non-home-route case ensures the injection is not limited to the home page.  

## 9. Derived Test Cases

### TC-LS-001: Default locale sets correct lang attribute

- **Feature:** F-LS (Language Switcher / `lang` Attribute)  
- **Module:** Dynamic `lang` Attribute  
- **Priority:** High  
- **Type:** Functional (Black-Box)  
- **Tags:** `@lang`, `@language-switcher`, `@a11y`, `@e2e`, `@black-box`, `@regression`  

**Pre-Conditions:**

- App running on `localhost:4173`  
- Browser: Chromium, viewport: 1920×1080  
- No `app-locale` cookie set  

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/?locale=en-US` | Home page is displayed |
| 2 | Read the `lang` attribute from `<html>` | Attribute value starts with `en` |

**Pass/Fail Criteria:**

- The `lang` attribute is present and its value starts with `en`.  

---

### TC-LS-002: Switching language updates lang attribute

- **Feature:** F-LS (Language Switcher / `lang` Attribute)  
- **Module:** Dynamic `lang` Attribute / State Transition  
- **Priority:** High  
- **Type:** Functional / State Transition (Black-Box)  
- **Tags:** `@lang`, `@language-switcher`, `@a11y`, `@e2e`, `@black-box`, `@regression`  

**Pre-Conditions:**

- App running on `localhost:4173`  
- Browser: Chromium, viewport: 1920×1080  
- German locale option available in the language-switcher  

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/?locale=en-US` | Home page is displayed; `lang` starts with `en` |
| 2 | Click the German language option in the language-switcher | Locale changes to `de`; page navigates or reloads |
| 3 | Wait for navigation to complete | Page is still displayed |
| 4 | Read the `lang` attribute from `<html>` | Attribute value starts with `de` |

**Pass/Fail Criteria:**

- After switching to German the `lang` attribute starts with `de`.  

---

### TC-LS-003: lang attribute is present on a non-home route

- **Feature:** F-LS (Language Switcher / `lang` Attribute)  
- **Module:** Dynamic `lang` Attribute / Route coverage  
- **Priority:** Medium  
- **Type:** Functional (Black-Box)  
- **Tags:** `@lang`, `@language-switcher`, `@a11y`, `@e2e`, `@black-box`, `@regression`  

**Pre-Conditions:**

- App running on `localhost:4173`  
- Browser: Chromium, viewport: 1920×1080  

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/movies?locale=en-US` | Movies overview page is displayed |
| 2 | Read the `lang` attribute from `<html>` | Attribute is present and non-empty |

**Pass/Fail Criteria:**

- The `lang` attribute is non-empty on a route other than the home page.  

---

## 10. Gherkin User Stories

```gherkin
Feature: Dynamic HTML lang Attribute (F-LS)
  As a visitor of the TMDB website
  I want the <html lang> attribute to reflect the active language
  So that screen readers and search engines identify the correct document language

  Background:
    Given the app is available in the browser
    And I use the desktop viewport 1920x1080

  @TC-LS-001
  Scenario: Default locale sets the correct lang attribute
    Given I navigate to the home page with locale "en-US"
    Then the html element should have a lang attribute starting with "en"

  @TC-LS-002
  Scenario: Switching to German updates the lang attribute
    Given I navigate to the home page with locale "en-US"
    When I select the German language option in the language-switcher
    And the page navigation is complete
    Then the html element should have a lang attribute starting with "de"

  @TC-LS-003
  Scenario: lang attribute is present on a non-home route
    Given I navigate to the movies page with locale "en-US"
    Then the html element should have a non-empty lang attribute
```

---

## 11. Run Tests

```bash
# All acceptance tests
just test-acceptance

# Only lang-attribute tests
npx playwright test tests/acceptance/language-switcher/lang-attribute.spec.js

# Lang-attribute tests by tag
npx playwright test -g @lang
npx playwright test -g @language-switcher
npx playwright test -g @a11y
npx playwright test -g @regression

# Combined filters
npx playwright test -g "(?=.*@lang)(?=.*@regression)"

# With UI mode
npx playwright test tests/acceptance/language-switcher/lang-attribute.spec.js --ui

# Headed mode
npx playwright test tests/acceptance/language-switcher/lang-attribute.spec.js --headed
```

---

## 12. Notes

- **Test File:** `tests/acceptance/language-switcher/lang-attribute.spec.js`  
- **Test Cases:** TC-LS-001 through TC-LS-003  
- **Dependencies:** Live development server at `localhost:4173`  
- **Cookie:** The `app-locale` cookie is written by the locale store; TC-LS-002 relies on the language-switcher control triggering this write.  
- **Viewport:** Desktop (1920×1080)  
- **Attribute format:** The assertion uses `startsWith` to accommodate both `en` and `en-US` forms.  

---

## 13. Traceability Matrix

| Test Case | Feature | Module | Type | Priority | Tags |
|-----------|---------|--------|------|----------|------|
| TC-LS-001 | F-LS | Default locale | Functional (Black-Box) | High | `@lang`, `@language-switcher`, `@a11y`, `@e2e`, `@black-box`, `@regression` |
| TC-LS-002 | F-LS | State transition | Functional / State Transition (Black-Box) | High | `@lang`, `@language-switcher`, `@a11y`, `@e2e`, `@black-box`, `@regression` |
| TC-LS-003 | F-LS | Route coverage | Functional (Black-Box) | Medium | `@lang`, `@language-switcher`, `@a11y`, `@e2e`, `@black-box`, `@regression` |
