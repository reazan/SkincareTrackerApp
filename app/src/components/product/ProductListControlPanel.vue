<template lang="pug">
IonAccordionGroup
	IonAccordion(value="first")
		IonItem(slot="header")
			IonLabel(style="color: aquamarine")
				IonIcon(:icon="funnelOutline")
			IonChip {{ filtersCount }}
		IonList(slot="content")
			IonItem
				IonSelect(label="Store" placeholder="Choose store" v-model="pStore")
					IonSelectOption(:value="OnlineStoreType.None") All
					IonSelectOption(:value="OnlineStoreType.Jolse") Jolse
					IonSelectOption(:value="OnlineStoreType.StyleKorean") StyleKorean
					IonSelectOption(:value="OnlineStoreType.StylevanaIT") Stylevana (IT)
					IonSelectOption(:value="OnlineStoreType.StylevanaEN") Stylevana (EN)
					IonSelectOption(:value="OnlineStoreType.YesStyleIT") YesStyle (IT)
					IonSelectOption(:value="OnlineStoreType.YesStyleEN") YesStyle (EN)

					//- IonSelectOption(:value="OnlineStoreType.Amazon") Amazon (IT)
			IonItem
				IonInput(label="Brand" v-model="pBrand")
			IonItem
				IonInput(label="Name" v-model="pName")
	IonAccordion(value="second" v-if="!isAddList")
		IonItem(slot="header")
			IonLabel(style="color: aquamarine")
				IonIcon(:icon="swapVerticalOutline")

			IonItem(v-if="pOrder != 'none'")
				IonLabel(style="margin-right: 10px;") {{ pOrder }}
				IonIcon(:icon="caretDown" v-if="pDirection == 'desc'")
				IonIcon(:icon="caretUp" v-if="pDirection == 'asc'")
		IonList(slot="content")
			IonItem(@click="selectOrder('store')" style="cursor: pointer;")
				IonLabel Store
			IonItem(@click="selectOrder('brand')" style="cursor: pointer;")
				IonLabel Brand
			IonItem(@click="selectOrder('name')" style="cursor: pointer;")
				IonLabel Name
			IonItem(@click="selectOrder('price')" style="cursor: pointer;")
				IonLabel Price
			IonItem(@click="selectOrder('date')" style="cursor: pointer;")
				IonLabel Date
</template>

<script setup lang="ts">
import { caretDown, caretUp, funnelOutline, swapVerticalOutline } from "ionicons/icons";
import type { Direction, IProductControlPanel, Order } from "@/models/products";

import { OnlineStoreType } from "@/models/products";

const props = withDefaults(defineProps<IProductControlPanel & { isAddList?: boolean }>(), {
	brand: "",
	name: "",
	onlineStore: OnlineStoreType.None,
	order: "none",
	direction: "none",
	isAddList: false,
});

const emit = defineEmits<{
	"update:brand": [string]
	"update:name": [string]
	"update:onlineStore": [OnlineStoreType]
	"update:order": [Order]
	"update:direction": [Direction]
}>();

const pBrand = computed({
	get: () => props.brand,
	set: (val: string) => emit("update:brand", val),
});

const pName = computed({
	get: () => props.name,
	set: (val: string) => emit("update:name", val),
});

const pStore = computed({
	get: () => props.onlineStore,
	set: (val: OnlineStoreType) => emit("update:onlineStore", val),
});

// let delayedEmitTimeout: ReturnType<typeof setTimeout>;
// function delayedEmit(emitFunc: () => void) {
// 	clearTimeout(delayedEmitTimeout);

// 	delayedEmitTimeout = setTimeout(() => emitFunc(), 500);
// }

const pOrder = computed({
	get: () => props.order,
	set: (val: Order) => emit("update:order", val),
});

const pDirection = computed({
	get: () => props.direction,
	set: (val: Direction) => emit("update:direction", val),
});

const filtersCount = computed(() => {
	let count = 0;

	if (pStore.value !== OnlineStoreType.None)
		count += 1;

	if (pBrand.value != null && pBrand.value.trim() !== "")
		count += 1;

	if (pName.value != null && pName.value.trim() !== "")
		count += 1;

	return count;
});

function selectOrder(order: Order) {
	if (pOrder.value !== order) {
		pOrder.value = order;
		if (pDirection.value === "none")
			pDirection.value = "asc";

		return;
	}

	if (pDirection.value === "asc") {
		pDirection.value = "desc";
	}
	else if (pDirection.value === "desc") {
		pDirection.value = "none";
		pOrder.value = "none";
	}
}
</script>

<style>
</style>
