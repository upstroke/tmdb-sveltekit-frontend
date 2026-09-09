# Defect Report

## General Information

| Field | Value |
|-------|-------|
| **Defect ID** | BUG-001 |
| **Title** | Load More button disappears when no more results are available instead of remaining visible and disabled |
| **Status** | ✅ Closed / Fixed |
| **Priority** | Medium (P2) |
| **Severity** | Minor (S3) |
| **Created** | 2026-09-09 |
| **Created by** | QA Team |
| **Assigned to** | Frontend Development |
| **Component** | Load More functionality (Home, Movies, TV Shows pages) |
| **Affected Version** | 1.0.x |
| **Fixed in Version** | 1.1.0 |
| **Test Type** | Black-Box Acceptance Test |

---

## 1. Summary

During acceptance testing, it was observed that the "Load More" button completely disappears from the page when no more results are available. Instead, the button should remain visible in a disabled state to inform users that they have reached the end of the content list.

---

## 2. Pre-Conditions

- Application is running and accessible in a web browser
- User is on a page with a list of media cards (Home, Movies, or TV Shows)
- The page initially displays multiple cards
- A "Load More" button is visible at the bottom of the card list
- The button is clickable (enabled state)

---

## 3. Steps to Reproduce

| Step | Action | Expected Result | Actual Result |
|------|--------|-----------------|---------------|
| 1 | Navigate to a page with media cards (e.g., Home page) | Page loads successfully and displays cards | ✅ Page loads and displays cards |
| 2 | Scroll to the bottom of the page | "Load More" button is visible | ✅ "Load More" button is visible |
| 3 | Click the "Load More" button | Additional cards are loaded | ✅ Additional cards are loaded |
| 4 | Continue clicking "Load More" until no more results are available from the server | Button remains visible but appears disabled (greyed out, not clickable) | ❌ Button completely disappears from the page |
| 5 | Attempt to locate the "Load More" button | Button is still present on the page (disabled) | ❌ Button cannot be found on the page |

---

## 4. Expected Result

When no more results are available from the server:

- The "Load More" button **remains visible** on the page
- The button appears **disabled** (visually greyed out, not clickable)
- The button does **not** show any loading animation or spinner
- The button text remains "More results" (not a loading message)
- Users can see that the button exists but cannot interact with it
- This provides clear visual feedback that the end of the list has been reached

**Visual appearance:**
- Button is present in its usual location (centered below the card list)
- Button has a disabled/gray appearance
- No loading spinner or animation is shown
- Button text reads "More results"

---

## 5. Actual Result

When no more results are available from the server:

- The "Load More" button **completely disappears** from the page
- No visual element remains in the button's location
- Users cannot see any indication that a "Load More" feature exists
- The space where the button was previously shown becomes empty
- Users may be confused whether more content exists or not

**Visual appearance:**
- No button is visible on the page
- Empty space where the button used to be
- No visual feedback about end of content

---

## 6. Impact

| Area | Impact |
|------|--------|
| **Usability** | Users do not receive clear visual feedback that they have reached the end of the content list. They may be uncertain whether more content exists or if the page is still loading. |
| **Accessibility** | Users of screen readers cannot perceive that a "Load More" feature exists. The button is removed from the accessibility tree, violating WCAG 2.1 guidelines for consistent interface behavior. |
| **User Experience** | The sudden disappearance of the button is jarring and inconsistent with common web patterns where pagination controls remain visible but disabled. |
| **Consistency** | The behavior differs from standard pagination patterns where controls remain visible to indicate the current state (e.g., "Page 1 of 5"). |

---

## 7. Severity

**S3 – Minor**

The defect impairs usability and user experience, but the core functionality (viewing and navigating content) remains available. Users can still view all loaded content, but lack clear feedback about the end of the list.

---

## 8. Priority

**P2 – Medium**

The defect should be fixed in the next release because:
- It affects user experience and clarity
- It impacts accessibility compliance
- It is inconsistent with common web UI patterns
- The fix is straightforward and low-risk

---

## 9. Environment

| Component | Value |
|-----------|-------|
| **Application** | TMDB Frontend |
| **Version** | 1.0.x |
| **Browser** | Chromium (latest) |
| **Viewport** | Desktop (1920x1080) |
| **Operating System** | macOS 14.x |
| **Test Tool** | Playwright 1.46.x |

---

## 10. Attachments

### 10.1 Test Evidence

**Failing Test Scenario:**

```
Test: TC-LM-006 - Load More handles empty results (TV Shows)
Status: FAILED
Error: Button element not found in the DOM
```

**Test Steps:**
1. Navigate to TV Shows page
2. Verify "Load More" button is visible and clickable
3. Click "Load More" button
4. Wait for server response with no additional results
5. Verify button state

**Error Message:**
```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'More results' })
Expected: visible
Timeout: 10000ms
Error: element(s) not found
```

### 10.2 Screenshots (if available)

**Before (button visible):**
- Button is present below the card list
- Button text: "More results"
- Button is clickable

**After (button missing):**
- No button visible on the page
- Empty space where button was located
- No visual indication of end-of-list

---

## 11. Root Cause (Developer Analysis)

*Note: This section is for developer reference and was identified during debugging.*

The page templates conditionally render the Load More component only when more results are available:

```svelte
{#if hasMore}
  <LoadMore {hasMore} {loading} onload={() => loadMore()} />
{/if}
```

This causes the component to be completely removed from the DOM when no more results exist.

---

## 12. Proposed Solution

### 12.1 Behavioral Change

The "Load More" button should **always be rendered** when the card list is displayed, regardless of whether more results are available.

**State transitions:**
- **Initial state:** Button is visible and enabled (can be clicked)
- **Loading state:** Button is visible, disabled, shows loading animation
- **No more results:** Button is visible, disabled, no loading animation

### 12.2 Visual States

| State | Visible | Clickable | Loading Animation | Button Text |
|-------|---------|-----------|-------------------|-------------|
| More results available | ✅ Yes | ✅ Yes | ❌ No | "More results" |
| Loading next page | ✅ Yes | ❌ No | ✅ Yes | "Loading..." |
| No more results | ✅ Yes | ❌ No | ❌ No | "More results" |

### 12.3 Implementation Guidance

*Note: This section is for developer reference.*

**Page Templates:**
- Remove conditional rendering of Load More component
- Always render Load More when card list is present

**Load More Component:**
- Button is always rendered when component is present
- Button disabled state is controlled by whether more results exist
- Loading animation is shown only during data fetch

---

## 13. Acceptance Criteria

- [ ] "Load More" button remains visible on the page when no more results are available
- [ ] Button appears disabled (visually greyed out, not clickable) when no more results exist
- [ ] Button does not show a loading animation when no more results exist
- [ ] Button text remains "More results" (not a loading message) when no more results exist
- [ ] Button is present in the page's accessibility tree even when disabled
- [ ] All new acceptance tests pass (TC-LM-006, TC-LM-007, TC-LM-008)
- [ ] Manual testing confirms button behavior across all three pages (Home, Movies, TV Shows)

---

## 14. History

| Date | Version | Status | Description |
|------|---------|--------|-------------|
| 2026-09-09 | 1.0.x | Open | Defect report created based on acceptance test failure |
| 2026-09-09 | 1.0.x | In Progress | Development team analyzing root cause |
| 2026-09-09 | 1.1.0 | Resolved | Fix implemented: button now always rendered |
| 2026-09-09 | 1.1.0 | Closed | Acceptance tests pass; QA confirms fix |

---

## 15. References

- **ISTQB Standard:** CTFL-Syllabus v4.0, Section 2.3.2 (Defect Report)
- **WCAG 2.1:** Criterion 4.1.2 (Name, Role, Value) - UI components should maintain consistent presence in accessibility tree
- **Test Documentation:** `../loadmore-testplan.md`
- **Affected Test Cases:**
  - TC-LM-006: `../loadmore-tvshows.spec.js`
  - TC-LM-007: `../loadmore-home.spec.js`
  - TC-LM-008: `../loadmore-movies.spec.js`

---

## 16. Storage Location

**Recommended Location:**

```
tests/acceptance/loadmore/BUG-001-loadmore-button-hidden-instead-of-disabled.md
```

**Rationale:**
- ✅ Defect was discovered during Load More acceptance testing
- ✅ Report belongs thematically to the Load More feature
- ✅ The `..` folder contains all related artifacts:
  - Test specification files (`*.spec.js`)
  - Test plan documentation (`../loadmore-testplan.md`)
  - Defect report (this document)

**Alternative Locations:**
- `.github/ISSUE_TEMPLATE/BUG-001-loadmore-button.md` (for GitHub Issues integration)
- `docs/bugs/BUG-001-loadmore-button.md` (centralized bug tracking documentation)

---

## 17. Review Checklist

- [ ] All fields are completed
- [ ] Steps to reproduce are clear and can be followed without code knowledge
- [ ] Expected and actual results describe observable behavior only (no internal variables)
- [ ] Severity and priority are justified based on user impact
- [ ] Root cause section is clearly marked as developer reference
- [ ] Proposed solution describes desired behavior, not implementation details
- [ ] Acceptance criteria are testable from a user perspective
- [ ] References are correctly linked

---

**Created according to ISTQB CTFL v4.0 Standard for Defect Reports (Black-Box Testing)** ✅
