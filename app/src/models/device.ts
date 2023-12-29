export interface IDevice {
	id: string
	token: string
	deviceId: string
	trackedProducts: Array<IProductNotificationOptions>
	isDeleted: boolean
}

export interface IProductNotificationOptions {
	url: string
	notifyPercentageGreaterOrEqualThan?: number
	notifyValueLesserOrEqualThan?: number
	notifyAlwaysWhenIsLower?: boolean
	notificationEnabled: boolean
}
