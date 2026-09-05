import { labels } from '$lib/i18n/ui.json';

/**
 * Fixture: Navigation items for header tests
 *
 * Used in:
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
 * Helper function: NavItem with active status
 */
export const getNavItemWithActiveStatus = (label) => {
	return navItems.map((item) => ({
		...item,
		isActive: item.label === label
	}));
};
