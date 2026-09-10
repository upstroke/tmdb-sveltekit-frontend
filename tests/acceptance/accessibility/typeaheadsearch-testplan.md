# Typeahead Search Accessibility Test Plan

## 1. Scope

### Pages to Test
- Homepage (`/`) - Typeahead search in header
- All pages with header navigation

### Functional Areas
- Search input field
- Search results dropdown
- Result items (movie/TV show/person cards)
- Keyboard navigation (Arrow keys, Enter, Escape)
- Focus management
- Screen reader announcements
- No results state
- Loading state

### Exclusions
- Search results page (`/search`) - covered in separate test plan
- Filter/sort functionality on search results page

## 2. Conformance Target

- **Standard**: WCAG 2.2 Level AA
- **Browsers**: Chromium (Desktop), Safari Mobile (iOS), Chrome Mobile (Android)
- **Devices**: Desktop, iPhone 13, Pixel 5
- **Screen Readers**: NVDA (Windows), VoiceOver (macOS/iOS), TalkBack (Android)

## 3. Test Methods

| Method | Coverage | Tool | Frequency |
|--------|----------|------|-----------|
| Automated | ~40% of WCAG criteria | axe-core via Playwright | CI/CD |
| Manual Keyboard | Focus, navigation, shortcuts | Keyboard only | Pre-merge |
| Manual Screen Reader | Announcements, landmarks | NVDA/VoiceOver/TalkBack | Pre-merge |
| Visual | Color contrast, focus indicators | Manual inspection | Pre-merge |

## 4. Test Cases

### Automated Tests (axe-core)

| Test ID | WCAG Criterion | Description | Test File |
|---------|----------------|-------------|-----------|
| A11Y-TS-001 | 4.1.2 Name, Role, Value | Search input has accessible name | typeahead-search.a11y.spec.js |
| A11Y-TS-002 | 1.3.1 Info and Relationships | Results dropdown properly associated with input | typeahead-search.a11y.spec.js |
| A11Y-TS-003 | 4.1.3 Status Messages | Loading and no-results states announced | typeahead-search.a11y.spec.js |

### Manual Keyboard Tests

| Test ID | WCAG Criterion | Test Case | Expected Result |
|---------|----------------|-----------|-----------------|
| A11Y-TS-004 | 2.1.1 Keyboard | Tab to search input | Focus visible, input labeled |
| A11Y-TS-005 | 2.1.1 Keyboard | Type query, Arrow Down through results | Focus moves through results |
| A11Y-TS-006 | 2.1.1 Keyboard | Enter on result | Navigates to selected item |
| A11Y-TS-007 | 2.1.1 Keyboard | Escape closes dropdown | Focus returns to input |
| A11Y-TS-008 | 2.4.3 Focus Order | Tab order logical | Input → Results → Close |
| A11Y-TS-009 | 2.4.7 Focus Visible | Focus indicator visible | Clear outline on all elements |

### Manual Screen Reader Tests

| Test ID | WCAG Criterion | Test Case | Expected Result |
|---------|----------------|-----------|-----------------|
| A11Y-TS-010 | 1.3.1 Info and Relationships | Screen reader announces search field | "Search, edit box" or similar |
| A11Y-TS-011 | 4.1.3 Status Messages | Results count announced | "X results found" |
| A11Y-TS-012 | 4.1.3 Status Messages | Loading state announced | "Loading" or progress indicator |
| A11Y-TS-013 | 4.1.3 Status Messages | No results announced | "No results found" |
| A11Y-TS-014 | 2.4.6 Headings and Labels | Result items have descriptive labels | "Movie: Title (Year)" |
| A11Y-TS-015 | 1.3.1 Info and Relationships | Dropdown role announced | "Listbox" or "Menu" |

### Visual Tests

| Test ID | WCAG Criterion | Test Case | Expected Result |
|---------|----------------|-----------|-----------------|
| A11Y-TS-016 | 1.4.3 Contrast (Minimum) | Text contrast ≥ 4.5:1 | Pass color contrast check |
| A11Y-TS-017 | 1.4.11 Non-text Contrast | Focus indicator contrast ≥ 3:1 | Visible focus outline |
| A11Y-TS-018 | 1.4.1 Use of Color | Not relying on color alone | Icons/text in addition to color |

## 5. Tools

### Automated
- **axe-core** (`@axe-core/playwright`) - WCAG A/AA violations
- **Playwright** - Cross-browser testing

### Manual
- **NVDA** (Windows) - Free screen reader
- **VoiceOver** (macOS/iOS) - Built-in screen reader
- **TalkBack** (Android) - Built-in screen reader
- **WAVE** (Browser extension) - Visual accessibility audit
- **Lighthouse** - Automated accessibility scoring

## 6. Reporting

### Severity Levels
| Level | Description | Action |
|-------|-------------|--------|
| Critical | Blocks users with disabilities | Fix immediately |
| Serious | Significant barrier | Fix before release |
| Moderate | Minor barrier | Fix in next sprint |
| Minor | Cosmetic issue | Backlog |

### Report Format
```markdown
## Test Results: Typeahead Search

**Date**: YYYY-MM-DD
**Tester**: @username
**Browser/Device**: Chrome Desktop / iPhone 13 / Pixel 5

### Pass
- A11Y-TS-001: Search input has accessible name ✓

### Fail
- A11Y-TS-005: Arrow key navigation broken ✗
  - **WCAG**: 2.1.1 Keyboard
  - **Severity**: Critical
  - **Details**: Arrow Down does not move focus to results
  - **Recommendation**: Implement roving tabindex with arrow key handlers

### Notes
- VoiceOver announces results correctly
- Focus indicator needs higher contrast
```

## 7. Test File Structure

```
tests/acceptance/accessibility/
├── typeaheadsearch-testplan.md      # This document
└── typeahead-search.a11y.spec.js    # Automated tests
```

## 8. Running Tests

```bash
# Automated accessibility tests
npx playwright test tests/acceptance/accessibility/typeahead-search.a11y.spec.js

# With specific tag
npx playwright test -g "@typeahead and @accessibility"
```

## 9. References

- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [W3C WCAG-EM Evaluation Methodology](https://www.w3.org/WAI/eval/reviewtools)
- [WAI-ARIA Authoring Practices - Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [Inclusive Components - Autocomplete](https://inclusive-components.design/a-more-accessible-autocomplete/)