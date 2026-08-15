export function deduplicateById(items = []) {
	const seen = new Set();

	return items.filter((item) => {
		if (item?.id == null || seen.has(item.id)) {
			return false;
		}

		seen.add(item.id);
		return true;
	});
}
