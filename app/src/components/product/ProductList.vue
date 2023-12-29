<template lang="pug">
ProductRow(
	v-for="product in productsGrouped"
	:key="product.key"
	:product="product"
	:is-add-list="isAddList"
	@select="onSingleRowSelection"
)

IonFab(slot="fixed" vertical="bottom" horizontal="end" v-if="longPressedMode")
	IonFabButton(@click="onMultipleRowSelection")
		IonIcon(:icon="menuOutline")
</template>

<script setup lang="ts">
import { menuOutline } from "ionicons/icons";
import type { PropType } from "vue";
import { Browser } from "@capacitor/browser";
import { actionSheetController } from "@ionic/vue";
import { v4 as uuidv4 } from "uuid";
import ProductRow from "./ProductRow.vue";
import ProductSettings from "./ProductSettings.vue";
import ProductDetails from "./ProductDetails.vue";
import type { IGroupedResult } from "@/composables/UseArrayUtils";
import { useArrayUtils } from "@/composables/UseArrayUtils";
import type { Product } from "@/models/products";

const props = defineProps({
	products: {
		type: Array as PropType<Array<Product>>,
		required: true,
	},
	isAddList: {
		type: Boolean,
		required: false,
		default: false,
	},
});

const emit = defineEmits<{
	refresh: []
}>();

const mainStore = useMainStore();

const { arrayGroupBy, sortAscendingBy } = useArrayUtils();
const selectedProducts = computed(() => props.products.filter(a => a.isSelected === true));
const longPressedMode = computed(() => selectedProducts.value.some(a => a.isSelected === true));

const productsGroupedByUrl = computed(() => {
	return arrayGroupBy(props.products, a => a.url, a => a.productId == null || a.productId === "");
});

const productsGroupedByIdGroup = computed(() => {
	return arrayGroupBy(props.products, a => a.productId ?? "", a => a.productId !== "");
});

const productsGrouped = computed(() => {
	return [...productsGroupedByIdGroup.value, ...productsGroupedByUrl.value];
});

const nav = props.isAddList ? document.querySelector<HTMLIonNavElement>("#list-ion-nav") : document.querySelector<HTMLIonNavElement>("#home-ion-nav");

async function openUrlInBrowser(url: string) {
	await Browser.open({ url });
}

async function trackProductAsync(grouped: IGroupedResult<Product>) {
	for (let i = 0; i < grouped.items.length; i++) {
		const product = grouped.items[i];
		await mainStore.trackProductAsync(product);
	}

	emit("refresh");
}

async function removeTracking(grouped: IGroupedResult<Product>) {
	await mainStore.removeProductsAsync(grouped.items.map(a => a.url));

	emit("refresh");
}

async function onSingleRowSelection(grouped: IGroupedResult<Product>) {
	if (longPressedMode.value) {
		grouped.items.forEach((a) => {
			a.isSelected = !a.isSelected;
		});
		return;
	}

	presentActionSheet(grouped, false);
}

function onMultipleRowSelection() {
	const grouped = arrayGroupBy(selectedProducts.value, _ => "");
	presentActionSheet(grouped.filter(a => a.key === "")[0], true);
}

type RowActionType = "select" | "details" | "remove" | "deselect" | "group" | "divide" | "open-url" | "notifications" | "track" | "cancel";

async function presentActionSheet(grouped: IGroupedResult<Product>, multipleSelection: boolean) {
	const actionSheet = await actionSheetController.create(getActionSheetOptions(grouped, props.isAddList, multipleSelection));

	await actionSheet.present();

	const result = await actionSheet.onDidDismiss();

	const action = result.data?.action as RowActionType;

	switch (action) {
		case "select":
			grouped.items.forEach((a) => {
				a.isSelected = true;
			});
			break;
		case "details":
			await pushNavigationToProductDetails(grouped);
			break;
		case "remove":
			await removeTracking(grouped);
			break;
		case "deselect":
			props.products.forEach((a) => {
				a.isSelected = false;
			});
			break;
		case "group":
			// eslint-disable-next-line no-case-declarations
			const newIdGroup = uuidv4();

			selectedProducts.value.forEach((a) => {
				a.productId = newIdGroup;
			});

			await trackProductAsync(arrayGroupBy(selectedProducts.value, a => a.productId ?? "", a => a.productId === newIdGroup)[0]);
			break;
		case "divide":
			grouped.items.forEach((a) => {
				a.productId = "";
			});

			await trackProductAsync(grouped);
			break;
		case "open-url":
			await openUrlInBrowser(result.data?.url ?? "");
			break;
		case "notifications":
			await pushNavigationToProductSettings(grouped);
			break;
		case "track":
			await trackProductAsync(grouped);
			break;
		// case "track-notifications":
		// 	await trackProduct(grouped);
		// 	await pushNavigationToProductSettings(grouped);
	}
}

async function pushNavigationToProductSettings(grouped: IGroupedResult<Product>) {
	await nav?.push(
		ProductSettings,
		{
			productUrls: grouped.items.map(a => a.url),
		},
		{
			direction: "forward",
			animated: true,
		},

	);
}

async function pushNavigationToProductDetails(grouped: IGroupedResult<Product>) {
	await nav?.push(
		ProductDetails,
		props.isAddList
			? {
				products: grouped.items,
			}
			: {
				productUrls: grouped.items.map(a => a.url),
			},
		{
			direction: "forward",
			animated: true,
		});
}

const actions: Array<RowAction> = [
	{
		text: "Select",
		data: {
			action: "select",
			show: (_, multipleSelection) => !multipleSelection,
			order: 10,
		},

	},
	{
		text: "Deselect All",
		data: {
			action: "deselect",
			show: (_, multipleSelection) => multipleSelection,
			order: 11,
		},

	},
	{
		text: "Track",
		data: {
			action: "track",
			show: (isAddList, _) => isAddList,
			order: 20,
		},

	},
	{
		text: "Group",
		data: {
			action: "group",
			show: (isAddList, multipleSelection) => multipleSelection && !isAddList,
			order: 30,
		},

	},
	{
		text: "Divide",
		data: {
			action: "divide",
			show: (isAddList, multipleSelection, anyGrouped) => !multipleSelection && !isAddList && anyGrouped === true,
			order: 31,
		},

	},
	{
		text: "Details",
		data: {
			action: "details",
			show: (_, __) => true,
			order: 40,
		},

	},
	{
		text: "Notifications",
		data: {
			action: "notifications",
			show: (isAddList, _) => !isAddList,
			order: 41,
		},

	},
	{
		text: "Remove",
		data: {
			action: "remove",
			show: (isAddList, _) => !isAddList,
			order: 60,
		},

	},
	{
		text: "Cancel",
		data: {
			action: "cancel",
			show: (_, __) => true,
			order: 100,
		},

	},
];

function getActionSheetOptions(grouped: IGroupedResult<Product>, isAddList: boolean, multipleSelection: boolean) {
	let fullName = grouped.items[0].fullName;

	if (multipleSelection)
		fullName = `Action for (${grouped.items.length}) items`;

	const linksRowActions = grouped.items.map((a): RowAction => {
		return {
			text: `Open with ${a.onlineStoreString}`,
			data: {
				action: "open-url",
				url: a.url,
				order: 50,
				show: (_, multipleSelection) => !multipleSelection,
			},

		};
	});

	const allRowActions = [...actions, ...linksRowActions];
	return {
		header: fullName,
		buttons: sortAscendingBy(allRowActions.filter(a => a.data.show(isAddList, multipleSelection, grouped.items.some(a => a.productId !== ""))), a => a.data.order),
	};
}

interface RowAction {
	text: string
	data: {
		action: RowActionType
		url?: string
		order: number
		show: (isAddList: boolean, multipleSelection: boolean, anyGrouped?: boolean) => boolean
	}
}
</script>
