# Lang Attribute Accessibility Test Plan

## 1. Scope

### Pages to Test
- Homepage (`/`)
- Movies page (`/movies`)
- TV Shows page (`/tv`)
- Any route after a language switch

### Functional Areas
- Server-side rendering: `html[lang]` reflects the active locale on initial response
- Client-side language switch: `html[lang]` updates immediately after locale change
- Persistence across navigation: `html[lang]` is retained when navigating to a new page
- Cookie/session: locale cookie is set so the server can restore the locale on hard reload

### Exclusions
- Correctness of translated UI strings (covered by unit tests)
- Typeahead search locale behaviour (covered in `typeahead-search-a11y-testplan.md`)

## 2. Conformance Target

- **Standard**: WCAG 2.1 / 2.2, Success Criterion 3.1.1 – Language of Page (Level A)
- **Browsers**: Chromium (Desktop)
- **Devices**: Desktop

## 3. Test Methods

| Method | Coverage | Tool | Frequency |
|--------|----------|------|-----------|
| Automated | SC 3.1.1 – html[lang] value | Playwright assertions | CI/CD |
| Manual Screen Reader | Pronunciation change after switch | VoiceOver / NVDA | Pre-merge |

## 4. Test Cases

### Automated Tests

| Test ID | WCAG Criterion | Description | Test File |
|---------|----------------|-------------|-----------|
| A11Y-LANG-001 | 3.1.1 Language of Page | Default locale: `html[lang]` is `en-US` on SSR | lang-attribute.a11y.spec.js |
| A11Y-LANG-002 | 3.1.1 Language of Page | After switch to `de-DE`: `html[lang]` is `de-DE` | lang-attribute.a11y.spec.js |
| A11Y-LANG-003 | 3.1.1 Language of Page | After switch back to `en-US`: `html[lang]` is `en-US` | lang-attribute.a11y.spec.js |
| A11Y-LANG-004 | 3.1.1 Language of Page | `html[lang]` retained after client-side navigation | lang-attribute.a11y.spec.js |
| A11Y-LANG-005 | 3.1.1 Language of Page | Direct URL call with `locale=de-DE` sets `html[lang]` on SSR | lang-attribute.a11y.spec.js |

### Manual Screen Reader Tests

| Test ID | WCAG Criterion | Test Case | Expected Result |
|---------|----------------|-----------|-----------------|
| A11Y-LANG-006 | 3.1.1 Language of Page | Switch to `de-DE`, let VoiceOver read a German heading | Pronunciation switches to German |
| A11Y-LANG-007 | 3.1.1 Language of Page | Switch back to `en-US`, let VoiceOver read an English heading | Pronunciation switches back to English |

## 5. Tools

### Automated
- **Playwright** – `expect(page.locator('html')).toHaveAttribute('lang', ...)`

### Manual
- **VoiceOver** (macOS/iOS) – verify pronunciation change
- **NVDA** (Windows) – verify pronunciation change

## 6. Reporting

### Severity Levels
| Level | Description | Action |
|-------|-------------|--------|
| Critical | `html[lang]` missing or wrong on SSR | Fix immediately |
| Serious | `html[lang]` not updated after language switch | Fix before release |
| Moderate | Lang not persisted across navigation | Fix in next sprint |

### Report Format
```markdown
## Test Results: Lang Attribute

**Date**: YYYY-MM-DD
**Tester**: @username
**Browser/Device**: Chrome Desktop

### Pass
- A11Y-LANG-001: html[lang] is "en-US" on initial load ✓

### Fail
- A11Y-LANG-002: html[lang] not updated after switch to de-DE ✗
  - **WCAG**: 3.1.1 Language of Page
  - **Severity**: Serious
  - **Details**: Attribute stays "en-US" after language switch
  - **Recommendation**: Check locale store → hooks.server.js pipeline
```

## 7. Test File Structure

```
tests/acceptance/accessibility/
├── lang-attribute-a11y-testplan.md   # This document
└── lang-attribute.a11y.spec.js       # Automated tests
```

## 8. Running Tests

```bash
# Run lang attribute tests only
npx playwright test tests/acceptance/accessibility/lang-attribute.a11y.spec.js

# With tag filter
npx playwright test --grep "@lang-attribute"
```

## 9. References

- [WCAG 2.1 SC 3.1.1 – Language of Page](https://www.w3.org/WAI/WCAG21/Understanding/language-of-page.html)
- [WCAG 2.2 SC 3.1.1](https://www.w3.org/WAI/WCAG22/quickref/#language-of-page)
- [HTML spec – The lang attribute](https://html.spec.whatwg.org/multipage/dom.html#attr-lang)
- [BCP 47 language tags](https://www.rfc-editor.org/rfc/bcp/bcp47.txt)
