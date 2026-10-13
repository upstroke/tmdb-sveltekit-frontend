export interface NamedItem {
	id: string | number;
	name: string;
}

export interface CastMember extends NamedItem {
	creditId?: string;
	character?: string;
}

export interface CrewMember extends NamedItem {
	creditId?: string;
	job?: string;
}

export interface MediaItem {
	id: string | number;
	mediaType: 'movie' | 'tv';
	title?: string;
	releaseDate?: string;
	overview?: string;
	posterUrl?: string | null;
	imageUrl?: string | null;
	genres?: NamedItem[];
}

export interface PagedMedia {
	featured?: MediaItem;
	cards?: MediaItem[];
	page?: number;
	hasMore?: boolean;
	error?: string | null;
}
