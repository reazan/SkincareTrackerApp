import { Storage } from "@ionic/storage";
import type { IProduct } from "@/models/products";
import { Product } from "@/models/products";
import type { IProductNotificationOptions } from "@/models/device";
import OnlineStoreTrackerApi from "@/models/online-store-tracker-api";

const storage = new Storage({
	name: "tracked-products-3",
	storeName: "tracked-products-db-3",
	dbKey: "tracked-products-db-3",
	version: 1,
});
storage.create();

const apiStore = new OnlineStoreTrackerApi();

export function useIonicProductStorage() {
	async function setProductAsync(url: string, product: IProduct, options?: IProductNotificationOptions, productId?: string) {
		try {
			const newProduct = new Product(product, options);

			if (productId != null && productId !== "")
				newProduct.productId = productId;

			await storage.set(url, newProduct);
			return newProduct;
		}
		catch (e) {
			return null;
			// ignored
		}
	}

	async function getProductAsync(url: string) {
		try {
			return await storage.get(url) as Product;
		}
		catch {
			return null;
		}
	}

	async function getAllProductUrlsAsync() {
		return await storage.keys();
	}

	async function removeProductsAsync(urls: Array<string>) {
		try {
			for (let i = 0; i < urls.length; i++) {
				const url = urls[i];
				await storage.remove(url);
			}
		}
		catch (e) {
		}
	}

	async function updateNotificationsAsync(notifications: Array<IProductNotificationOptions>) {
		const mainStore = useMainStore();

		await apiStore.upsertDeviceWithProductsAsync({
			token: mainStore.token,
			deviceId: mainStore.deviceId,
			isRemoveRequest: false,
			trackedProducts: notifications,
		});

		for (let i = 0; i < notifications.length; i++) {
			const notification = notifications[i];
			const product = await getProductAsync(notification.url);

			if (product == null)
				continue;

			await setProductAsync(notification.url, product, notification);
		}
	}

	async function clearStorage() {
		try {
			await storage.clear();
		}
		catch (e) {
		}
	}

	return {
		setProductAsync,
		getProductAsync,
		getAllProductUrlsAsync,
		removeProductsAsync,
		clearStorage,
		updateNotificationsAsync,
	};
}
