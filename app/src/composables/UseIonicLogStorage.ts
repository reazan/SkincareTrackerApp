import { Storage } from "@ionic/storage";

const storage = new Storage({
	name: "logs-db",
	storeName: "logs-db",
	dbKey: "logs-db",
	version: 1,
});
storage.create();

const count = ref(0);

export function useIonicLogStorage() {
	async function setLogAsync(log: string) {
		updateCountValue();
		try {
			if (storage.keys.length > 20)
				await removeFirstLogAsync();

			await storage.set(count.value.toString(), log);
			count.value += 1;
		}
		catch (e) {

			// ignored
		}
	}

	async function getAllLogsAsync() {
		const logs = new Array<string>();
		const keys = await storage.keys();
		for (let i = 0; i <= keys.length; i++) {
			try {
				const log = await storage.get(keys[i]);
				logs.push(log);
			}
			catch (e) {
				// ignored
			}
		}
		return logs;
	}

	async function removeAllLogsAsync() {
		const keys = await storage.keys();
		for (let i = 0; i <= keys.length; i++) {
			try {
				await storage.remove(keys[i]);
			}
			catch (e) {
				// ignored
			}
		}

		count.value = 0;
	}

	async function removeFirstLogAsync() {
		const keys = await storage.keys();
		if (keys.length === 0)
			return;

		await storage.remove(keys[0]);
	}

	async function updateCountValue() {
		const keys = await storage.keys();

		let key = 0;
		keys.forEach((a) => {
			try {
				const parsed = Number.parseInt(a);

				if (parsed >= key)
					key = parsed;
			}
			catch {
				// ignored;
			}
		});
		count.value = key;
	}

	return {
		setLogAsync,
		removeAllLogsAsync,
		getAllLogsAsync,
	};
}
