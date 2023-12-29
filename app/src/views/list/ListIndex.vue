<template lang="pug">
IonHeader
	IonToolbar
		IonButtons(slot="start")
			IonBackButton
		IonTitle Search

IonContent(class="ion-padding")
	ProductListControlPanel(
		v-model:brand="filters.brand",
		v-model:name="filters.name"
		v-model:online-store="filters.onlineStore"
		:is-add-list="true"
	)

	div(style="display: flex; justify-content: end;")
		IonButton(color="secondary" @click="reset") Reset
		IonButton(color="dark" @click="search") Search
	div(style="display: flex; justify-content: center;" v-if="products.length > 0")
		Pagination(:pagination="filters" @change="search")

	br

	ProductList(:products="products" :is-add-list="true" @refresh="getProductsAsync" v-if="products.length > 0")

	div(style="display: flex; justify-content: center;" v-else)
		span No results.

	div(style="display: flex; justify-content: center;" v-if="filters.total > filters.size")
		Pagination(:pagination="filters" @change="search")
</template>

<script setup lang="ts">
import { OnlineStoreType, Product } from "@/models/products";
import type { SearchProductsRequest } from "@/models/online-store-tracker-api";
import OnlineStoreTrackerApi from "@/models/online-store-tracker-api";

const products = ref<Array<Product>>([]);
const filters = reactive<SearchProductsRequest>({
	brand: "",
	name: "",
	onlineStore: OnlineStoreType.None,
	page: 1,
	size: 30,
	total: 0,
});

const prevFilters = reactive({
	brand: "",
	name: "",
	onlineStore: OnlineStoreType.None,
});

onMounted(() => {
	getProductsAsync();
});

const storeApi = new OnlineStoreTrackerApi();

async function getProductsAsync() {
	filtersAreChangedAndIfSoUpdate();

	const result = await storeApi.searchProductsAsync(filters);
	products.value = (result.products ?? []).map(a => new Product(a));
	filters.total = result.total ?? 0;
}

function reset() {
	filters.brand = "";
	filters.name = "";
	filters.onlineStore = OnlineStoreType.None;
	filters.page = 1;
	products.value = [];

	search();
}

function filtersAreChangedAndIfSoUpdate() {
	const currentName = filters.name ?? "";
	const previousName = prevFilters.name ?? "";

	const currentBrand = filters.brand ?? "";
	const previousBrand = prevFilters.brand ?? "";

	const currentStore = filters.onlineStore;
	const previousStore = prevFilters.onlineStore;

	let areChanged = false;

	if (currentName.toUpperCase() !== previousName.toUpperCase()) {
		areChanged = true;
		prevFilters.name = currentName;
	}

	if (currentBrand.toUpperCase() !== previousBrand.toUpperCase()) {
		areChanged = true;
		prevFilters.brand = currentBrand;
	}

	if (currentStore !== previousStore) {
		areChanged = true;
		prevFilters.onlineStore = currentStore;
	}

	if (areChanged)
		filters.page = 1;
}

async function search() {
	await getProductsAsync();
}
</script>

<style>
</style>
