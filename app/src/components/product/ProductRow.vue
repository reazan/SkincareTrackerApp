<template lang="pug">
IonItem(
	v-if="showRow"
	:disabled="isGroupDisabled"
	@click="select"
	:color="isSelected ? 'tertiary' : ''"
	style="padding: 3px; border-radius: 15px;"
)
	ProductRowStatus(:product="product" :is-add-list="isAddList")
	div(style="display: flex; gap: 10px; width: 100%; padding: 5px")
		div.thumbnail(style="height: 70px; aspect-ratio: 2/2;")
			img(style="height: 100%;" :src="firstItem.imageUrl ?? 'https://ionicframework.com/docs/img/demos/thumbnail.svg'")
		div(style="display: flex; flex-direction: column; width: 100%; flex-grow: 1;")
			div
				div {{ firstItem.name }}
				div(style="color: gray" v-if="firstItem.productId === ''") {{ firstItem.brand }}
			div(style="display: flex; justify-content: end; flex-wrap: wrap; margin-top: 5px;")
				ProductRowItem(v-for="item in product.items" :product="item")
</template>

<script setup lang="ts">
import type { PropType } from "vue";
import ProductRowItem from "./ProductRowItem.vue";
import ProductRowStatus from "./ProductRowStatus.vue";
import type { Product } from "@/models/products";
import type { IGroupedResult } from "@/composables/UseArrayUtils";

const props = defineProps({
	product: {
		type: Object as PropType<IGroupedResult<Product>>,
		required: true,
	},
	isAddList: {
		type: Boolean,
		required: false,
		default: false,
	},
});

const emit = defineEmits<{
	select: [IGroupedResult<Product>]
}>();

const mainStore = useMainStore();

const isGroupDisabled = computed(() => {
	if (!props.isAddList)
		return false;
	return props.product.items.some(a => mainStore.isUrlInTrackedProducts(a.url));
});

const showRow = computed(() => props.product != null && props.product.items != null);

const isSelected = computed(() => props.product.items.some(a => a.isSelected === true));
const firstItem = computed(() => props.product.items[0]);

function select() {
	emit("select", props.product);
}
</script>

<style scoped>
.thumbnail > img {
	object-fit: contain;
}
</style>
