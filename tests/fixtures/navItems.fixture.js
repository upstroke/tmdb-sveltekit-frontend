import { labels } from '$lib/i18n/ui.json';

/**
 * Fixture: Navigation Items fuer Header-Tests
 *
 * Verwendet in:
 * - tests/components/Header.test.js
 */
export const navItems = [
	{
		label: labels.nav_movies,
		href: '/movies',
		isActive: false
	},
	{
		label: labels.nav_tv_shows,
		href: '/tv-shows',
		isActive: false
	},
	{
		label: labels.nav_popular,
		href: '/popular',
		isActive: false
	}
];

/**
 * Hilfsfunktion: NavItem mit aktivem Status
 */
export const getNavItemWithActiveStatus = (label) => {
	return navItems.map((item) => ({
		...item,
		isActive: item.label === label
	}));
};
