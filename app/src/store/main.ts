import { defineStore } from "pinia";
import { PushNotifications } from "@capacitor/push-notifications";
import { Device } from "@capacitor/device";
import { FCM } from "@capacitor-community/fcm";
import { DateTime } from "luxon";
import type { Product } from "@/models/products";
import { useIonicProductStorage } from "@/composables/UseIonicProductStorage";
import type { OnlineStoreTrackerConfig } from "@/models/online-store-tracker-api";
import OnlineStoreTrackerApi from "@/models/online-store-tracker-api";

export interface IOnlineStoreTrackerMainStore {
	darkMode?: boolean
	token: string
	deviceId: string
	lastRefreshDate: DateTime | undefined
	trackedProducts: Array<Product>
	notificationEnabled: boolean
	totalPossibleFavorites: number
	totalPossibleNotifications: number
	configuration: OnlineStoreTrackerConfig
}

const ionicProductStorage = useIonicProductStorage();
const apiStore = new OnlineStoreTrackerApi();

export const useMainStore = defineStore("main", {
	state: (): IOnlineStoreTrackerMainStore => {
		return {
			darkMode: undefined,
			lastRefreshDate: undefined,
			token: "",
			deviceId: "",
			trackedProducts: [],
			notificationEnabled: false,
			totalPossibleFavorites: 150,
			totalPossibleNotifications: 15,
			configuration: {
				productTimeRecycleMinutes: 300,
			},
		};
	},
	actions: {
		async startupAsync() {
			const conf = await apiStore.getConfiguration();
			this.configuration.productTimeRecycleMinutes = conf.ProductTimeRecycleMinutes ?? 300;

			this.deviceId = (await Device.getId())?.identifier ?? "";
			this.token = (await FCM.getToken())?.token ?? "";

			if (this.deviceId === "" && this.token === "") {
				setTimeout(() => this.startupAsync(), 1000);
				return;
			}

			await apiStore.upsertDeviceTokenAsync({
				deviceId: this.deviceId,
				token: this.token,
			});
		},
		getTrackedProductByUrl(url: string) {
			return this.trackedProducts.filter(a => a.url === url)[0];
		},
		async refreshLocalTrackedProductsAsync() {
			const productUrls = await ionicProductStorage.getAllProductUrlsAsync();
			const privateProducts: Array<Product> = [];

			for (let i = 0; i < productUrls.length; i++) {
				const result = await ionicProductStorage.getProductAsync(productUrls[i]);
				if (result == null)
					continue;
				privateProducts.push(result);
			}

			this.trackedProducts = privateProducts;
		},
		async updateTrackedProductsFromServerAsync() {
			await this.refreshLocalTrackedProductsAsync();

			const now = DateTime.now();
			const productsToUpdate = this.trackedProducts.filter((a) => {
				if (a.lastScrapingDate == null)
					return true;

				const diff = now.diff(DateTime.fromISO(a.lastScrapingDate), "minutes");
				return diff.minutes >= 60; // >= 1 hour
			});

			if (productsToUpdate.length === 0)
				return;

			try {
				const result = await apiStore.getTrackedProductsAsync({
					trackedProducts: productsToUpdate.map(a => ({
						url: a.url,
						currentPriceDate: a.lastScrapingDate == null || a.lastScrapingDate.trim() === "" ? null : a.lastScrapingDate,
					})),
				});

				if (result == null || result.length === 0)
					return;

				for (let i = 0; i < result.length; i++) {
					const product = result[i];
					const alreadyTrackedProduct = this.trackedProducts.filter(a => a.url === product.url)[0];

					if (alreadyTrackedProduct == null)
						continue;

					Object.keys(product).forEach((key) => {
						const source = product as Record<string, any>;
						const target = alreadyTrackedProduct as Record<string, any>;

						try {
							if (target[key] == null)
								return;

							target[key] = source[key];
						}
						catch {
							// ignored
						}
					});

					await this.trackProductAsync(alreadyTrackedProduct);
				}
			}
			catch {
				// ignored
			}
		},
		async trackProductAsync(product: Product): Promise<{ isSuccess: boolean; message?: string }> {
			if (this.trackedProducts.length >= this.totalPossibleFavorites) {
				return {
					isSuccess: false,
					message: `Cannot put more than ${this.totalPossibleFavorites} products in favorites.`,
				};
			}

			const newProduct = await ionicProductStorage.setProductAsync(product.url, product, {
				notifyAlwaysWhenIsLower: product.notifyAlwaysWhenIsLower,
				notifyPercentageGreaterOrEqualThan: product.notifyPercentageGreaterOrEqualThan,
				notifyValueLesserOrEqualThan: product.notifyValueLesserOrEqualThan,
				notificationEnabled: product.notificationEnabled ?? false,
				url: product.url,
			});

			if (newProduct == null)
				return { isSuccess: false, message: "Product not found" };

			const tracked = this.trackedProducts.filter(a => a.url === product.url)[0];

			if (tracked == null)
				this.trackedProducts.push(newProduct);

			Object.keys(newProduct).forEach((key) => {
				const source = newProduct as Record<string, any>;
				const target = tracked as Record<string, any>;

				try {
					if (target[key] == null)
						return;

					target[key] = source[key];
				}
				catch {
					// ignored
				}
			});

			return {
				isSuccess: true,
			};
		},
		async removeProductsAsync(urls: Array<string>) {
			try {
				await apiStore.upsertDeviceWithProductsAsync({
					deviceId: this.deviceId,
					token: this.token,
					isRemoveRequest: true,
					trackedProducts: urls.map(a => ({
						notificationEnabled: false,
						url: a,
					})),
				});

				await ionicProductStorage.removeProductsAsync(urls);

				this.trackedProducts = this.trackedProducts.filter(a => !urls.includes(a.url));
			}
			catch (e) {
			}
		},
		async updateNotificationsAsync(products: Array<Product>) {
			if (this.totalActiveNotifications >= this.totalPossibleNotifications) {
				return {
					isSuccess: false,
					message: `Cannot have more than ${this.totalPossibleNotifications} active notifications.`,
				};
			}

			await ionicProductStorage.updateNotificationsAsync(products.map(a => ({
				notificationEnabled: a.notificationEnabled ?? false,
				url: a.url,
				notifyAlwaysWhenIsLower: a.notifyAlwaysWhenIsLower ?? false,
				notifyPercentageGreaterOrEqualThan: a.notifyPercentageGreaterOrEqualThan,
				notifyValueLesserOrEqualThan: a.notifyValueLesserOrEqualThan,
			})));

			return {
				isSuccess: true,
			};
		},
		isUrlInTrackedProducts(url: string) {
			return this.trackedProducts?.some(a => a.url === url);
		},
		async registerNotificationsAsync(): Promise<string> {
			try {
				let permStatus = await PushNotifications.checkPermissions();

				if (permStatus.receive !== "granted")
					permStatus = await PushNotifications.requestPermissions();

				if (permStatus.receive !== "granted")
					return permStatus.receive;

				await PushNotifications.register();

				this.notificationEnabled = true;

				return "granted";
			}
			catch (e) {
				return "denied";
			}
		},
		toggleDarkMode(val?: boolean) {
			const body = document.querySelector<HTMLBodyElement>("body");
			if (val)
				body?.classList.add("dark");
			else
				body?.classList.remove("dark");

			this.darkMode = val;
		},
	},
	getters: {
		getTrackedProducts(state) {
			return state.trackedProducts;
		},
		totalActiveNotifications(state) {
			return state.trackedProducts.filter(a => a.notificationEnabled === true).length;
		},
	},
});
