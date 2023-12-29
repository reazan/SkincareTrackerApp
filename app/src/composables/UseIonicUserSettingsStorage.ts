import { Storage } from "@ionic/storage";

const storage = new Storage({
	name: "user-settings-db",
	storeName: "user-settings-db",
	dbKey: "user-settings-db",
	version: 1,
});
storage.create();

const id = "user-settings";

export function useIonicUserSettingsStorage() {
	async function setUserSettingsAsync(request: IUserSettings) {
		try {
			let settings = await getUserSettingsAsync();

			if (settings == null) {
				settings = request;
				await storage.set(id, settings);
			}

			settings.darkMode = request.darkMode;

			await storage.set(id, settings);
		}
		catch (e) {

			// ignored
		}
	}

	async function getUserSettingsAsync() {
		try {
			return await storage.get(id) as IUserSettings | null;
		}
		catch (e) {
			// ignored
			return null;
		}
	}

	return {
		setUserSettingsAsync,
		getUserSettingsAsync,
	};
}

export interface IUserSettings {
	darkMode?: boolean
}
