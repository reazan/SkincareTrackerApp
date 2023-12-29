import type { DateTime } from "luxon";

export function useCountdown() {
	function getRemainingTime(endDate: DateTime): RemainingTimeObject {
		const t = endDate.diffNow().as("milliseconds");
		const seconds = Math.floor((t / 1000) % 60);
		const minutes = Math.floor((t / 1000 / 60) % 60);
		const hours = Math.floor((t / (1000 * 60 * 60)) % 24);
		const days = Math.floor(t / (1000 * 60 * 60 * 24));
		return {
			total: t,
			days,
			hours,
			minutes,
			seconds,
		};
	}

	return {
		getRemainingTime,
	};
}

export interface RemainingTimeObject {
	total: number
	days: number
	hours: number
	minutes: number
	seconds: number
}
