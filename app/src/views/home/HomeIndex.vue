<template lang="pug">
IonHeader
	IonToolbar
		IonTitle Favorites
		IonProgressBar(type="indeterminate" v-if="isLoading")

IonContent(class="ion-padding")
	IonRefresher(slot="fixed" @ion-refresh="handleRefresh($event)")
		IonRefresherContent(
			:pulling-icon="chevronDownCircleOutline"
			pulling-text="Pull to refresh"
			refreshing-spinner="circles"
			:pull-factor="0.5"
			:pull-min="100"
			:pull-max="200"
		)

	div(v-if="!canAddToFavorites" style="display: flex; text-align: center; margin-bottom: 15px;")
		IonIcon(color="warning" :icon="alertCircleOutline")
		| &nbsp;
		IonLabel(color="warning"): em Total possible favorites reached (max {{ mainStore.totalPossibleFavorites }}).

	ProductListControlPanel(
		v-model:brand="filters.brand",
		v-model:name="filters.name"
		v-model:online-store="filters.onlineStore"
		v-model:order="filters.order",
		v-model:direction="filters.direction"
	)

	div(style="display: flex; justify-content: end;")
		IonButton(color="secondary" @click="resetFiltersAsync") Reset

	ProductList(v-if="trackedProducts.length > 0" :products="trackedProducts")
	div(style="display: flex; justify-content: center;" v-else)
		span No results.
</template>

<script setup lang="ts">
import { alertCircleOutline, chevronDownCircleOutline } from "ionicons/icons";

import { OnlineStoreType } from "@/models/products";
import type { IProductControlPanel, Product } from "@/models/products";
import { useArrayUtils } from "@/composables/UseArrayUtils";

const mainStore = useMainStore();

const { t } = useI18n();

const { sortBy } = useArrayUtils();

const filters = ref<IProductControlPanel>({
	brand: "",
	name: "",
	onlineStore: OnlineStoreType.None,
	order: "none",
	direction: "none",
});

async function resetFiltersAsync() {
	filters.value.brand = "";
	filters.value.name = "";
	filters.value.onlineStore = OnlineStoreType.None;
	filters.value.order = "none";
	filters.value.direction = "none";
}

const trackedProducts = computed(() => {
	let privateProducts: Array<Product> = [];

	const trackedProducts = mainStore.getTrackedProducts;

	for (let i = 0; i < trackedProducts.length; i++) {
		const result = trackedProducts[i];

		if (filters.value.brand != null && filters.value.brand.trim() !== "") {
			if (!result.brand.toUpperCase().includes(filters.value.brand!.toUpperCase()))
				continue;
		}

		if (filters.value.name != null && filters.value.name.trim() !== "") {
			if (!result.name.toUpperCase().includes(filters.value.name!.toUpperCase()))
				continue;
		}

		if (filters.value.onlineStore !== OnlineStoreType.None) {
			if (result.onlineStore !== filters.value.onlineStore)
				continue;
		}

		privateProducts.push(result);
	}

	if (filters.value.order !== "none") {
		const direction = filters.value.direction === "desc" ? "desc" : "asc";
		switch (filters.value.order) {
			case "brand":
				privateProducts = sortBy(privateProducts, a => a.brand, direction);
				break;
			case "name":
				privateProducts = sortBy(privateProducts, a => a.name, direction);
				break;
			case "price":
				privateProducts = sortBy(privateProducts, a => a.currentPrice ?? 0, direction);
				break;
			case "date":
				privateProducts = sortBy(privateProducts, a => a.currentPriceDate ?? "", direction);
				break;
			case "store":
				privateProducts = sortBy(privateProducts, a => a.onlineStoreString ?? "", direction);
				break;
		}
	}

	return privateProducts;
});

const isLoading = ref(false);

async function handleRefresh(event: Event) {
	isLoading.value = true;
	await mainStore.updateTrackedProductsFromServerAsync();
	isLoading.value = false;

	(event.target as any).complete();
}

const canAddToFavorites = computed(() => {
	return mainStore.totalPossibleFavorites - mainStore.trackedProducts.length >= 0;
});
</script>

<style>
</style>
