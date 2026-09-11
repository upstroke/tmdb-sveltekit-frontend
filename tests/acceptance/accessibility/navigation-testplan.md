# Navigation Accessibility Test Plan

## 1. Scope

### Pages to Test
- Homepage (`/`)
- Movies page (`/movies`)
- All pages with header navigation

### Functional Areas
- Header navigation (logo, menu items)
- Burger menu (mobile)
- Footer navigation
- Load more functionality
- Skip links (if present)
- Focus management during navigation

### Exclusions
- Typeahead search (covered in `typeaheadsearch-testplan.md`)
- Movie/TV show detail pages (covered in separate test plan)
- Filter/sort functionality

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
| A11Y-NAV-001 | 4.1.2 Name, Role, Value | Navigation landmarks properly defined | navigation.a11y.spec.js |
| A11Y-NAV-002 | 1.3.1 Info and Relationships | Skip links have correct structure | navigation.a11y.spec.js |
| A11Y-NAV-003 | 4.1.3 Status Messages | Load more button state announced | navigation.a11y.spec.js |

### Manual Keyboard Tests

| Test ID | WCAG Criterion | Test Case | Expected Result |
|---------|----------------|-----------|-----------------|
| A11Y-NAV-004 | 2.1.1 Keyboard | Tab through header navigation | All links focusable in order |
| A11Y-NAV-005 | 2.1.1 Keyboard | Open/close burger menu with keyboard | Menu toggles with Enter/Space |
| A11Y-NAV-006 | 2.1.1 Keyboard | Navigate within open burger menu | Arrow keys move focus between items |
| A11Y-NAV-007 | 2.1.1 Keyboard | Close burger menu with Escape | Menu closes, focus returns to trigger |
| A11Y-NAV-008 | 2.1.1 Keyboard | Activate "Load more" button | New content loads, focus managed |
| A11Y-NAV-009 | 2.4.3 Focus Order | Tab order matches visual order | Logical navigation flow |
| A11Y-NAV-010 | 2.4.7 Focus Visible | Focus indicator visible on all elements | Clear outline on interactive elements |
| A11Y-NAV-011 | 2.1.1 Keyboard | Skip to main content link works | Focus jumps to main content |

### Manual Screen Reader Tests

| Test ID | WCAG Criterion | Test Case | Expected Result |
|---------|----------------|-----------|-----------------|
| A11Y-NAV-012 | 1.3.1 Info and Relationships | Navigation landmark announced | "Navigation" or "Nav" region |
| A11Y-NAV-013 | 1.3.1 Info and Relationships | Burger menu state announced | "Menu button, collapsed/expanded" |
| A11Y-NAV-014 | 4.1.3 Status Messages | Load more progress announced | "Loading more items" or similar |
| A11Y-NAV-015 | 2.4.6 Headings and Labels | Navigation links have descriptive labels | "Movies", "TV Shows", etc. |
| A11Y-NAV-016 | 1.3.1 Info and Relationships | Footer landmark announced | "Contentinfo" or "Footer" |
| A11Y-NAV-017 | 2.4.1 Bypass Blocks | Skip link allows bypassing navigation | Jumps to main content |

### Visual Tests

| Test ID | WCAG Criterion | Test Case | Expected Result |
|---------|----------------|-----------|-----------------|
| A11Y-NAV-018 | 1.4.3 Contrast (Minimum) | Navigation text contrast ≥ 4.5:1 | Pass color contrast check |
| A11Y-NAV-019 | 1.4.11 Non-text Contrast | Focus indicator contrast ≥ 3:1 | Visible focus outline |
| A11Y-NAV-020 | 1.4.1 Use of Color | Active state not color-only | Underline or icon in addition to color |
| A11Y-NAV-021 | 1.4.4 Resize Text | Navigation readable at 200% zoom | No content loss or overlap |

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
## Test Results: Navigation

**Date**: YYYY-MM-DD
**Tester**: @username
**Browser/Device**: Chrome Desktop / iPhone 13 / Pixel 5

### Pass
- A11Y-NAV-001: Navigation landmarks properly defined ✓

### Fail
- A11Y-NAV-005: Burger menu keyboard toggle broken ✗
  - **WCAG**: 2.1.1 Keyboard
  - **Severity**: Critical
  - **Details**: Enter/Space does not open/close menu
  - **Recommendation**: Add keyboard event handlers for Enter and Space

### Notes
- VoiceOver announces navigation landmarks correctly
- Focus indicator on mobile needs higher contrast
```

## 7. Test File Structure

```
tests/acceptance/accessibility/
├── navigation-testplan.md           # This document
└── navigation.a11y.spec.js          # Automated tests
```

## 8. Running Tests

```bash
# Automated accessibility tests
npx playwright test tests/acceptance/accessibility/navigation.a11y.spec.js

# With specific tag
npx playwright test -g "@navigation and @accessibility"
npx playwright test -g "@mobile and @ios"
npx playwright test -g "@mobile and @android"
```

## 9. References

- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [W3C WCAG-EM Evaluation Methodology](https://www.w3.org/WAI/eval/reviewtools)
- [WAI-ARIA Authoring Practices - Navigation Menus](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/)
- [WebAIM - Navigation and Menus](https://webaim.org/techniques/semanticstructure/)