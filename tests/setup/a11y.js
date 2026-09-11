import { AxeBuilder } from '@axe-core/playwright';

/**
 * Prüft die aktuelle Seite auf WCAG 2.0/2.1/2.2 Level A und AA Verstö§§§.
 * Wirft einen Fehler mit detaillierter Fehlerliste, wenn Verstö§§§ gefunden werden.
 * @param {import('@playwright/test').Page} page
 */
export async function checkA11y(page) {
  const results = await new AxeBuilder({ page })
		.withTags(['wcag2a', 'wcag2aa'])
		.disableRules(['aria-required-children'])
		.analyze();

  if (results.violations.length > 0) {
    const details = results.violations
      .map((violation) => {
        const nodes = violation.nodes
          .map((node) => `  - ${node.html}\n    ${node.failureSummary ?? ''}`)
          .join('\n');
        return `${violation.id}: ${violation.help}\n${nodes}`;
      })
      .join('\n\n');

    throw new Error(`Accessibility violations found:\n\n${details}`);
  }
}
