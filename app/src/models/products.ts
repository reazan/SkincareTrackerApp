import type { IProductNotificationOptions } from "./device";

export interface IProduct {
	id: string
	productId: string
	name: string | null
	code: string | null
	brand: string | null
	fullName: string | null
	description: string | null
	url: string
	onlineStore: OnlineStoreType
	minPrice: number | null
	minPriceDate: string | null
	lastPrice: number | null
	lastPriceDate: string | null
	currentPrice: number | null
	currentPriceDate: string | null
	lastScrapingDate: string | null
	isUrlWorking: boolean
	isDeleted: boolean
	imageUrl?: string
}

export enum OnlineStoreType {
	None = 0,
	Amazon = 1,
	StylevanaIT = 2,
	YesStyleIT = 3,
	Jolse = 4,
	StylevanaEN = 5,
	YesStyleEN = 6,
	StyleKorean = 7,
}

export interface AddNewProductResult {
	isSuccess: boolean
	message?: string
	newAddedProduct?: IProduct
	similarProducts: Array<IProduct>
}

export class Product implements IProduct {
	id: string;
	productId: string;
	name: string;
	code: string;
	brand: string;
	fullName: string;
	description: string;
	url: string;
	onlineStore: OnlineStoreType;
	onlineStoreString: string;
	minPrice: number | null;
	minPriceDate: string | null;
	lastPrice: number | null;
	lastPriceDate: string | null;
	currentPrice: number | null;
	currentPriceDate: string | null;
	lastScrapingDate: string | null;
	isUrlWorking: boolean;
	isDeleted: boolean;
	isSelected: boolean;
	delta: number;
	imageUrl?: string | undefined;

	notifyPercentageGreaterOrEqualThan?: number;
	notifyValueLesserOrEqualThan?: number;
	notifyAlwaysWhenIsLower?: boolean;
	notificationEnabled?: boolean;

	constructor(product?: IProduct, options?: IProductNotificationOptions) {
		this.id = product?.id ?? "";
		this.productId = product?.productId ?? "";

		this.name = product?.name ?? "";
		this.code = product?.code ?? "";
		this.brand = product?.brand ?? "";
		this.fullName = product?.fullName ?? "";
		this.description = product?.description ?? "";

		this.url = product?.url ?? "";
		this.onlineStore = product?.onlineStore ?? OnlineStoreType.Amazon;
		this.onlineStoreString = Product.onlineStoreEnumStringConverter(this.onlineStore);
		this.minPrice = product?.minPrice ?? -1;
		this.minPriceDate = product?.minPriceDate ?? "";
		this.lastPrice = product?.lastPrice ?? -1;
		this.lastPriceDate = product?.lastPriceDate ?? "";
		this.currentPrice = product?.currentPrice ?? -1;
		this.currentPriceDate = product?.currentPriceDate ?? "";
		this.lastScrapingDate = product?.lastScrapingDate ?? "";
		this.isUrlWorking = product?.isUrlWorking ?? false;
		this.isDeleted = product?.isDeleted ?? false;
		this.imageUrl = product?.imageUrl ?? undefined;

		this.notifyPercentageGreaterOrEqualThan = options?.notifyPercentageGreaterOrEqualThan;
		this.notifyValueLesserOrEqualThan = options?.notifyValueLesserOrEqualThan;
		this.notifyAlwaysWhenIsLower = options?.notifyAlwaysWhenIsLower ?? false;
		this.notificationEnabled = options?.notificationEnabled ?? false;

		this.isSelected = false;
		this.delta = this.getDelta(product?.lastPrice, product?.currentPrice);
	}

	static onlineStoreEnumStringConverter(value: OnlineStoreType): string {
		switch (value) {
			case OnlineStoreType.None:
				return "None";
			case OnlineStoreType.Amazon:
				return "Amazon";
			case OnlineStoreType.YesStyleIT:
				return "YesStyleIT";
			case OnlineStoreType.StylevanaIT:
				return "StylevanaIT";
			case OnlineStoreType.StylevanaEN:
				return "StylevanaEN";
			case OnlineStoreType.YesStyleEN:
				return "YesStyleEN";
			case OnlineStoreType.Jolse:
				return "Jolse";
			case OnlineStoreType.StyleKorean:
				return "StyleKorean";
		}
	}

	getDelta(lastPrice?: number | null, currentPrice?: number | null) {
		const initial = lastPrice ?? 1;
		const final = currentPrice ?? 0;

		if (initial <= 0 || final <= 0)
			return 0;

		const delta = (final - initial) / initial * 100;

		return Math.round(delta);
	}
}

export interface IProductControlPanel {
	brand?: string
	name?: string
	onlineStore: OnlineStoreType
	order?: Order
	direction?: Direction
}

export type Direction = "none" | "asc" | "desc";
export type Order = "none" | "price" | "brand" | "name" | "date" | "store";
