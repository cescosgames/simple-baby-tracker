export type FeedQuality = 'poor' | 'normal' | 'good';

export type DiaperSubtype = 'pee' | 'poop';

export type DiaperColor =
	| 'yellow'
	| 'green'
	| 'brown'
	| 'orange'
	| 'black'
	| 'red'
	| 'white';

export interface Feed {
	id: string;
	kind: 'feed';
	date: string; // MM/DD/YY
	time: string; // HH:MM 24hr
	quality: FeedQuality;
	created: string; // ISO timestamp, sort/audit only
}

export interface Diaper {
	id: string;
	kind: 'diaper';
	date: string; // MM/DD/YY
	time: string; // HH:MM 24hr
	subtype: DiaperSubtype;
	color: DiaperColor | null; // only set when subtype === 'poop'
	urgent: boolean; // true when color is 'red' or 'white'
	created: string; // ISO timestamp, sort/audit only
}

export type Entry = Feed | Diaper;
