<template lang="pug">
IonChip(:color="product.delta < 0 ? 'success' : product.delta > 0 ? 'danger' : ''" style="height: 25px;")
	IonLabel {{ product.onlineStoreString }}:  {{ product.currentPrice }}
	IonLabel(v-if="product.delta != 0") &nbsp;({{ product.delta }}%)
	IonIcon(v-if="product.isUrlWorking" :icon="cloudOutline" color="success")
	IonIcon(v-else :icon="cloudOfflineOutline" color="danger")
</template>

<script setup lang="ts">
import { cloudOfflineOutline, cloudOutline } from "ionicons/icons";
import type { Product } from "@/models/products";

defineProps({
	product: {
		type: Object as PropType<Product>,
		required: true,
	},
});
</script>

<style>
</style>
