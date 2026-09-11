# Typeahead Search Accessibility Test Plan

## 1. Scope

### 1.1 Test Object
Typeahead search component in global header navigation for media catalog application.

### 1.2 Pages to Test
- Homepage (`/`) - Typeahead search in header
- All pages with header navigation (movies, TV shows, detail pages)

### 1.3 Functional Areas Under Test
- Search input field (text entry, accessible name)
- Search results dropdown (listbox with result items)
- Result items (movie/TV show/person cards as clickable links)
- Keyboard navigation (Arrow keys, Enter, Escape)
- Focus management (input → results → selection)
- Screen reader announcements (results count, loading, no results)
- No results state
- Loading state
- Locale switching behavior

### 1.4 Exclusions (Out of Scope)
- Search results page (`/search`) - covered in separate test plan
- Filter/sort functionality on search results page
- Backend search logic and TMDB API integration

## 2. Conformance Target

- **Standard**: WCAG 2.2 Level AA
- **Browsers**:
  - Desktop: Chromium (Playwright default)
  - Mobile iOS: Safari (iPhone 13 emulation)
  - Mobile Android: Chrome (Pixel 5 emulation)
- **Devices**: Desktop (1920x1080), iPhone 13 (390x844), Pixel 5
- **Screen Readers** (manual testing):
  - NVDA 2023.x+ (Windows 10/11)
  - VoiceOver (macOS 13+, iOS 15+)
  - TalkBack (Android 12+)

## 3. Test Methods

| Method | Coverage | Tool | Frequency | Test Level |
|--------|----------|------|-----------|------------|
| Automated | ~40% of WCAG A/AA criteria | axe-core via Playwright | CI/CD, pre-merge | Acceptance |
| Manual Keyboard | Focus order, navigation, shortcuts | Keyboard only | Pre-merge | Acceptance |
| Manual Screen Reader | Announcements, landmarks, roles | NVDA/VoiceOver/TalkBack | Pre-merge, sprint review | Acceptance |
| Visual Inspection | Color contrast, focus indicators | Manual + WAVE/Lighthouse | Pre-merge | Acceptance |

### 3.1 Test Completion Criteria
- All automated tests pass (0 failures)
- All critical and serious manual test cases pass
- No WCAG A/AA violations detected by axe-core
- Keyboard-only navigation fully functional
- Screen reader users can complete search workflow

## 4. Test Cases

### 4.1 Automated Tests (axe-core via Playwright)

| Test ID | WCAG Criterion | Description | Test File | Status |
|---------|----------------|-------------|-----------|--------|
| A11Y-TS-001 | 4.1.2 Name, Role, Value | Desktop typeahead search results - no WCAG A/AA violations | typeahead-search.a11y.spec.js | Implemented |
| A11Y-TS-002 | 2.1.1 Keyboard, 2.4.3 Focus Order | Desktop keyboard interaction (Arrow keys, focus management) - no WCAG A/AA violations | typeahead-search.a11y.spec.js | Implemented |
| A11Y-TS-003 | 4.1.2 Name, Role, Value | Mobile iOS typeahead search results - no WCAG A/AA violations | typeahead-search.a11y.spec.js | Implemented |
| A11Y-TS-004 | 4.1.2 Name, Role, Value | Mobile Android typeahead search results - no WCAG A/AA violations | typeahead-search.a11y.spec.js | Implemented |
| A11Y-TS-005 | 4.1.2 Name, Role, Value | Selected result exposes aria-selected attribute | typeahead-search.a11y.spec.js | Implemented |

### 4.2 Manual Keyboard Tests

| Test ID | WCAG Criterion | Test Case | Precondition | Test Steps | Expected Result | Priority |
|---------|----------------|-----------|--------------|------------|-----------------|----------|
| A11Y-TS-006 | 2.1.1 Keyboard | Tab to search input | Page loaded | 1. Press Tab until search input focused | Focus visible, input labeled "Search" | High |
| A11Y-TS-007 | 2.1.1 Keyboard | Type query, Arrow Down through results | Input focused | 1. Type "Hero"<br>2. Press Arrow Down 3x | Focus moves through first 3 results | High |
| A11Y-TS-008 | 2.1.1 Keyboard | Enter on result | Result focused | 1. Arrow Down to result<br>2. Press Enter | Navigates to selected item detail page | High |
| A11Y-TS-009 | 2.1.1 Keyboard | Escape closes dropdown | Results visible | 1. Press Escape | Dropdown closes, focus returns to input | High |
| A11Y-TS-010 | 2.4.3 Focus Order | Tab order logical | Results visible | 1. Press Tab from input | Focus: Input → Results → Close button | Medium |
| A11Y-TS-011 | 2.4.7 Focus Visible | Focus indicator visible | Any element focused | 1. Tab through all interactive elements | Clear visible outline (≥3:1 contrast) | High |
| A11Y-TS-012 | 2.1.1 Keyboard | Arrow Up navigation | Result focused | 1. Press Arrow Up | Focus moves to previous result | Medium |
| A11Y-TS-013 | 2.1.1 Keyboard | Home/End keys | Results visible | 1. Press Home<br>2. Press End | Focus: First result → Last result | Low |

### 4.3 Manual Screen Reader Tests

| Test ID | WCAG Criterion | Test Case | Precondition | Test Steps | Expected Result | Priority |
|---------|----------------|-----------|--------------|------------|-----------------|----------|
| A11Y-TS-014 | 1.3.1 Info and Relationships | Screen reader announces search field | Page loaded | 1. Navigate to search input | Announces: "Search, edit box" or equivalent | High |
| A11Y-TS-015 | 4.1.3 Status Messages | Results count announced | Results visible | 1. Type "Hero"<br>2. Wait for results | Announces: "X results found" | High |
| A11Y-TS-016 | 4.1.3 Status Messages | Loading state announced | Typing query | 1. Type new query | Announces: "Loading" or progress indicator | High |
| A11Y-TS-017 | 4.1.3 Status Messages | No results announced | No matches | 1. Type "xyz123notfound" | Announces: "No results found" | High |
| A11Y-TS-018 | 2.4.6 Headings and Labels | Result items have descriptive labels | Results visible | 1. Navigate through results | Announces: "Movie: Title (Year)" or "TV Show: Title (Year)" | High |
| A11Y-TS-019 | 1.3.1 Info and Relationships | Dropdown role announced | Results visible | 1. Focus results container | Announces: "Listbox" or "Search results" | Medium |
| A11Y-TS-020 | 4.1.2 Name, Role, Value | Locale change re-announces results | Results visible, locale changed | 1. Change language<br>2. Results reload | Results re-announced in new locale | Medium |

### 4.4 Visual Tests

| Test ID | WCAG Criterion | Test Case | Tool | Expected Result | Priority |
|---------|----------------|-----------|------|-----------------|----------|
| A11Y-TS-021 | 1.4.3 Contrast (Minimum) | Text contrast ≥ 4.5:1 | WAVE, Lighthouse | All text passes contrast check | High |
| A11Y-TS-022 | 1.4.11 Non-text Contrast | Focus indicator contrast ≥ 3:1 | Manual inspection | Focus outline clearly visible | High |
| A11Y-TS-023 | 1.4.1 Use of Color | Not relying on color alone | Manual inspection | Icons/text in addition to color (e.g., selected state) | Medium |
| A11Y-TS-024 | 1.4.4 Resize Text | Text resizable to 200% | Browser zoom | No content loss or overlap at 200% | Medium |
| A11Y-TS-025 | 1.4.10 Reflow | No horizontal scroll at 320px | Mobile viewport | Content reflows without horizontal scroll | Medium |

## 5. Tools

### 5.1 Automated Testing
| Tool | Purpose | Version |
|------|---------|---------|
| **axe-core** (`@axe-core/playwright`) | WCAG A/AA violation detection | Latest |
| **Playwright** | Cross-browser test automation | Latest |
| **Vitest** | Component/unit test runner (for related logic) | Latest |

### 5.2 Manual Testing
| Tool | Purpose | Platform |
|------|---------|----------|
| **NVDA** | Screen reader testing | Windows 10/11 |
| **VoiceOver** | Screen reader testing | macOS, iOS |
| **TalkBack** | Screen reader testing | Android |
| **WAVE** | Visual accessibility audit | Browser extension |
| **Lighthouse** | Automated accessibility scoring | Chrome DevTools |
| **axe DevTools** | Manual accessibility inspection | Browser extension |

### 5.3 Test Environment
- Node.js v26.6.0
- npm 11.18.0
- Playwright browsers (chromium, webkit, firefox)

## 6. Reporting

### 6.1 Defect Severity Classification (ISTQB-aligned)

| Severity | Description | Example | Action |
|----------|-------------|---------|--------|
| **Critical (S1)** | Blocks users with disabilities from completing core task | Keyboard trap, missing accessible name | Fix immediately, block release |
| **Serious (S2)** | Significant barrier, workarounds exist | Missing focus indicator, incorrect ARIA role | Fix before release |
| **Moderate (S3)** | Minor barrier, does not block task | Low contrast on secondary text | Fix in next sprint |
| **Minor (S4)** | Cosmetic issue, no functional impact | Slightly misaligned focus outline | Backlog |

### 6.2 Defect Report Template
```markdown
## Defect Report: [Test ID] - [Brief Description]

**Date**: YYYY-MM-DD  
**Tester**: @username  
**Environment**: Browser/OS/Device/Screen Reader  
**Severity**: S1 | S2 | S3 | S4  
**WCAG Criterion**: [e.g., 2.1.1 Keyboard]  

### Description
[Clear description of the accessibility barrier]

### Steps to Reproduce
1. [First step]
2. [Second step]
3. [Expected vs. actual behavior]

### Impact
[How this affects users with disabilities]

### Recommendation
[Suggested fix, e.g., "Add aria-label to button" or "Implement roving tabindex"]

### Evidence
- [ ] Screenshot attached
- [ ] Screen recording attached
- [ ] Screen reader output logged
