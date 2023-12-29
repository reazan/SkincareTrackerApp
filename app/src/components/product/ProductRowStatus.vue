<template lang="pug">
div.badge-like(v-if="isOnlyOneProduct && !isAddList")
	IonIcon(v-if="notificationEnabled" :icon="notifications" color="success")
	IonIcon(v-else :icon="notificationsOff" color="danger")
	IonIcon(v-if="productIsUpdated" :icon="sparkles" color="warning")
</template>

<script setup lang="ts">
import { notifications, notificationsOff, sparkles } from "ionicons/icons";
import { DateTime } from "luxon";
import type { Product } from "@/models/products";
import type { IGroupedResult } from "@/composables/UseArrayUtils";

const props = defineProps({
	product: {
		type: Object as PropType<IGroupedResult<Product>>,
		required: true,
	},
	isAddList: {
		type: Boolean,
		default: false,
		required: false,
	},
});

const isOnlyOneProduct = computed(() => props.product.items != null && props.product.items.length === 1);
const notificationEnabled = computed(() => {
	if (!isOnlyOneProduct.value)
		return false;

	if (props.product?.items == null)
		return false;

	return props.product.items[0]?.notificationEnabled ?? false;
});

const productIsUpdated = computed(() => {
	const prd = props.product.items[0];

	if (prd == null)
		return false;

	if (prd.currentPrice == null || prd.currentPrice <= 0)
		return false;

	if (prd.lastPrice == null || prd.lastPrice <= 0)
		return false;

	const isLesser = prd.currentPrice < prd.lastPrice;

	if (prd.currentPriceDate == null)
		return false;

	const date1 = DateTime.fromISO(prd.currentPriceDate);

	const diffInHours = date1.diffNow("days");
	const obj = diffInHours.toObject();

	return isLesser && obj.days != null && (obj.days * -1) <= 1;
});
</script>

<style scoped>
.badge-like {
	position: absolute;
	transform: translate(-100%);
	top: 0px;
	left: 100% !important;
}
</style>
