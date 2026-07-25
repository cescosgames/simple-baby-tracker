export function formatDate(d: Date): string {
	const mm = String(d.getMonth() + 1).padStart(2, '0');
	const dd = String(d.getDate()).padStart(2, '0');
	const yy = String(d.getFullYear() % 100).padStart(2, '0');
	return `${mm}/${dd}/${yy}`;
}

export function formatTime(d: Date): string {
	const hh = String(d.getHours()).padStart(2, '0');
	const min = String(d.getMinutes()).padStart(2, '0');
	return `${hh}:${min}`;
}

export function formatTimeDisplay(time: string): string {
	const [h, m] = time.split(':').map(Number);
	const period = h >= 12 ? 'PM' : 'AM';
	const hour12 = h % 12 === 0 ? 12 : h % 12;
	return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export function dayLabel(dateStr: string): string {
	const [mm, dd, yy] = dateStr.split('/').map(Number);
	const date = new Date(2000 + yy, mm - 1, dd);
	const today = new Date();
	const yesterday = new Date();
	yesterday.setDate(today.getDate() - 1);
	const sameDay = (a: Date, b: Date) =>
		a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
	if (sameDay(date, today)) return 'Today';
	if (sameDay(date, yesterday)) return 'Yesterday';
	return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatDateHeader(dateStr: string): string {
	const [mm, dd, yy] = dateStr.split('/').map(Number);
	const date = new Date(2000 + yy, mm - 1, dd);
	return date.toLocaleDateString(undefined, {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
}
