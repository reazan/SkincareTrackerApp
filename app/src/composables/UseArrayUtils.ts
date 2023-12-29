export function useArrayUtils() {
	function arrayGroupBy<T>(array: Array<T>, getKey: (row: T) => string, filter?: (row: T) => boolean): Array<IGroupedResult<T>> {
		const result = new Array<IGroupedResult<T>>();

		array.forEach((t) => {
			if (filter != null && !filter(t))
				return;

			const rowKey = getKey(t);

			let r = result.filter(a => a.key === rowKey)[0];
			if (r == null) {
				r = { key: rowKey, items: [] };
				result.push(r);
			}
			r.items.push(t);
		});

		return result;
	}

	function sortBy<T>(array: Array<T>, sortKey: (row: T) => string | number, direction: "asc" | "desc"): Array<T> {
		if (direction === "asc")
			return sortAscendingBy(array, sortKey);

		return sortDescendingBy(array, sortKey);
	}

	function sortAscendingBy<T>(array: Array<T>, sortKey: (row: T) => string | number): Array<T> {
		return [...array].sort((a, b) => {
			const ka = sortKey(a);
			const kb = sortKey(b);

			if (ka > kb)
				return 1;
			if (ka < kb)
				return -1;
			return 0;
		});
	}

	function sortDescendingBy<T>(array: Array<T>, sortKey: (row: T) => string | number): Array<T> {
		return [...array].sort((a, b) => {
			const ka = sortKey(a);
			const kb = sortKey(b);

			if (ka > kb)
				return -1;
			if (ka < kb)
				return 1;
			return 0;
		});
	}

	function distinct(array: Array<string>): Array<string> {
		const result = new Array<string>();
		array.forEach((s) => {
			const found = result.filter(a => a.toUpperCase() === s.toUpperCase())[0];
			if (!found)
				result.push(s);
		});
		return result;
	}

	function distinctBy<T>(array: Array<T>, distinctKey: (row: T) => string): Array<T> {
		return array.filter((value, index, self) => {
			return self.findIndex(a => distinctKey(a) === distinctKey(value)) === index;
		});
	}

	return {
		arrayGroupBy,
		sortAscendingBy,
		sortDescendingBy,
		sortBy,
		distinct,
		distinctBy,
	};
}

export interface IGroupedResult<T> {
	key: string
	items: Array<T>
}
