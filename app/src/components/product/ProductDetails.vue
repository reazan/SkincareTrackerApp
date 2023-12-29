<template lang="pug">
IonHeader
	IonToolbar
		IonButtons(slot="start")
			IonBackButton(ref="detailBackButton")
		IonTitle {{ storesForProduct.length == 1 ? 'Detail' : 'Grouped Detail' }}
IonContent(class="ion-padding")
	div(v-for="product in storesForProduct" :key="product.id" style="margin-bottom: 20px;")
		ProductDetail(:product="product")
</template>

<script setup lang="ts">
import type { PropType } from "vue";
import { useBackButton } from "@ionic/vue";
import ProductRowItem from "./ProductRowItem.vue";
import type { IProduct } from "@/models/products";
import { Product } from "@/models/products";
import { useIonicLogStorage } from "@/composables/UseIonicLogStorage";

const props = defineProps({
	productUrls: {
		type: Array as PropType<Array<string>>,
		required: false,
	},
	products: {
		type: Array as PropType<Array<IProduct>>,
		required: false,
	},
});

const storesForProduct = ref<Array<Product>>([]);
const mainStore = useMainStore();
const logStorage = useIonicLogStorage();

const detailBackButton = ref<HTMLButtonElement>();

onMounted(() => {
	addListenerOnHardwareBackButton();

	const result = new Array<Product>();

	if (props.products != null && props.products.length > 0) {
		for (let i = 0; i < props.products.length; i++) {
			const product = new Product(props.products[i]);
			if (product == null)
				continue;

			result.push(product);
		}
	}

	if (props.productUrls != null && props.productUrls.length > 0) {
		for (let i = 0; i < props.productUrls.length; i++) {
			const product = mainStore.getTrackedProductByUrl(props.productUrls[i]);
			if (product == null)
				continue;

			result.push(product);
		}
	}

	storesForProduct.value = result;
});

onUnmounted(() => {
	removeListenerOnHardwareBackButton();
});

function addListenerOnHardwareBackButton() {
	document.addEventListener("ionBackButton", () => {
		detailBackButton.value?.click();
		logStorage.setLogAsync("DocumentEventListener BackButton pressed");
		logStorage.setLogAsync(`detailBackButton is empty? ${detailBackButton.value == null ? "true" : "false"}`);
	});
}

function removeListenerOnHardwareBackButton() {
	document.removeEventListener("ionBackButton", () => {});
}

useBackButton(10, (processNextHandler) => {
	detailBackButton.value?.click();
	logStorage.setLogAsync("BackButton pressed");
	logStorage.setLogAsync(`detailBackButton is empty? ${detailBackButton.value == null ? "true" : "false"}`);
	processNextHandler();
});
</script>

<style>
</style>
