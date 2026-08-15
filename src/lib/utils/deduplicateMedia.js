// src/lib/utils/deduplicateMedia.js

export function getMediaKey(item) {
	if (!item || item.id == null || !item.mediaType) {
		return null;
	}

	return `${item.mediaType}-${item.id}`;
}

export function deduplicateMedia(items = []) {
	const seen = new Set();

	return items.filter((item) => {
		const key = getMediaKey(item);

		if (!key || seen.has(key)) {
			return false;
		}

		seen.add(key);
		return true;
	});
}
