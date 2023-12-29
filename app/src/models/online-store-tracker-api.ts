import type { CancelTokenSource } from "axios";
import type { IProduct, OnlineStoreType } from "./products";
import type { IDevice, IProductNotificationOptions } from "./device";
import { useAxios } from "@/composables/UseAxios";
import { ActionDescriptor, UrlHelper } from "@/composables/UseUrlHelper";

export interface SearchProductsRequest {
	brand?: string
	name?: string
	onlineStore: OnlineStoreType
	page: number
	size: number
	total: number
}

export interface SearchProductResult {
	products: Array<IProduct>
	total: number
}

export interface GetTrackedProductsRequest {
	trackedProducts: Array<SingleTrackedProductRequest>
}

export interface SingleTrackedProductRequest {
	url: string
	currentPriceDate?: string | null
}

export interface VerifyNewProductRequest {
	url: string
	taskId?: string
}

export interface AddNewProductResult {
	isSuccess: boolean
	message?: string
	newAddedProduct?: IProduct
	taskId?: string
}

export interface UpsertNewProductRequest {
	product?: IProduct
}

export interface UpsertDeviceWithProductsRequest {
	deviceId: string
	token: string
	isRemoveRequest: boolean
	trackedProducts: Array<IProductNotificationOptions>
}

export interface GetDeviceWithProductsRequest {
	deviceId: string
}

export interface UpsertDeviceTokenRequest {
	token: string
	deviceId: string
}

export interface ClearDeviceProductsRequest {
	deviceId: string
}

export interface OnlineStoreTrackerConfig {
	productTimeRecycleMinutes: number
}

class PrivateActions {
	static SearchProducts = new ActionDescriptor("SearchProducts", "api/v1/OnlineStoreTracker");
	static GetProduct = new ActionDescriptor("GetProduct", "api/v1/OnlineStoreTracker");
	static GetTrackedProducts = new ActionDescriptor("GetTrackedProducts", "api/v1/OnlineStoreTracker");
	static VerifyNewProduct = new ActionDescriptor("VerifyNewProduct", "api/v1/OnlineStoreTracker");
	static UpsertNewProduct = new ActionDescriptor("UpsertNewProduct", "api/v1/OnlineStoreTracker");
	static UpsertDeviceWithProducts = new ActionDescriptor("UpsertDeviceWithProducts", "api/v1/OnlineStoreTracker");
	static GetDeviceWithProducts = new ActionDescriptor("GetDeviceWithProducts", "api/v1/OnlineStoreTracker");
	static UpsertDeviceToken = new ActionDescriptor("UpsertDeviceToken", "api/v1/OnlineStoreTracker");
	static ClearDeviceProducts = new ActionDescriptor("ClearDeviceProducts", "api/v1/OnlineStoreTracker");
	static GetConfiguration = new ActionDescriptor("GetConfiguration", "api/v1/OnlineStoreTracker");
}

export default class OnlineStoreTrackerApi {
	axiosWrapper = useAxios();
	axios = this.axiosWrapper.axios;

	async searchProductsAsync(request: SearchProductsRequest, cancelTokenSource?: CancelTokenSource): Promise<SearchProductResult> {
		return (await this.axios.post<SearchProductResult>(UrlHelper.action(PrivateActions.SearchProducts), request, { cancelToken: cancelTokenSource?.token })).data;
	}

	async getProductAsync(productUrl: string, cancelTokenSource?: CancelTokenSource): Promise<IProduct | undefined> {
		return (await this.axios.get<IProduct | undefined>(UrlHelper.action(PrivateActions.GetProduct, { productUrl }), { cancelToken: cancelTokenSource?.token })).data;
	}

	async getTrackedProductsAsync(request: GetTrackedProductsRequest, cancelTokenSource?: CancelTokenSource): Promise<Array<IProduct>> {
		return (await this.axios.post<Array<IProduct>>(UrlHelper.action(PrivateActions.GetTrackedProducts), request, { cancelToken: cancelTokenSource?.token })).data;
	}

	async verifyNewProductAsync(request: VerifyNewProductRequest, cancelTokenSource?: CancelTokenSource): Promise<AddNewProductResult> {
		return (await this.axios.post<AddNewProductResult>(UrlHelper.action(PrivateActions.VerifyNewProduct), request, { cancelToken: cancelTokenSource?.token })).data;
	}

	async upsertNewProductAsync(request: UpsertNewProductRequest, cancelTokenSource?: CancelTokenSource): Promise<boolean> {
		return (await this.axios.post<boolean>(UrlHelper.action(PrivateActions.UpsertNewProduct), request, { cancelToken: cancelTokenSource?.token })).data;
	}

	async upsertDeviceWithProductsAsync(request: UpsertDeviceWithProductsRequest, cancelTokenSource?: CancelTokenSource): Promise<boolean> {
		return (await this.axios.post<boolean>(UrlHelper.action(PrivateActions.UpsertDeviceWithProducts), request, { cancelToken: cancelTokenSource?.token })).data;
	}

	async getDeviceWithProductsAsync(request: GetDeviceWithProductsRequest, cancelTokenSource?: CancelTokenSource): Promise<IDevice> {
		return (await this.axios.post<IDevice>(UrlHelper.action(PrivateActions.GetDeviceWithProducts), request, { cancelToken: cancelTokenSource?.token })).data;
	}

	async upsertDeviceTokenAsync(request: UpsertDeviceTokenRequest, cancelTokenSource?: CancelTokenSource): Promise<boolean> {
		return (await this.axios.post<boolean>(UrlHelper.action(PrivateActions.UpsertDeviceToken), request, { cancelToken: cancelTokenSource?.token })).data;
	}

	async clearDeviceProductAsync(request: ClearDeviceProductsRequest, cancelTokenSource?: CancelTokenSource): Promise<boolean> {
		return (await this.axios.post<boolean>(UrlHelper.action(PrivateActions.ClearDeviceProducts), request, { cancelToken: cancelTokenSource?.token })).data;
	}

	async getConfiguration(cancelTokenSource?: CancelTokenSource): Promise<Record<string, any>> {
		return (await this.axios.post<Record<string, any>>(UrlHelper.action(PrivateActions.GetConfiguration), {}, { cancelToken: cancelTokenSource?.token })).data;
	}
}
