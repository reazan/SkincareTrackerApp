<template lang="pug">
IonLabel
	h1 {{ product.name }}
	p {{ product.brand }}

div(style="text-align: center; margin-top: 5px; margin-bottom: 5px;" v-if="product.imageUrl")
	img(style="height: 300px;" :src="product.imageUrl")

div(style="display: flex; justify-content: space-between;")
	ProductRowItem(:product="product")
	IonButton(@click="openUrl(product.url)")
		span Open
		IonIcon(slot="end" :icon="openOutline")
IonList
	IonItem
		IonLabel(slot="start")
			h3 LastCheck
			p: DisplayDate(:date="product.lastScrapingDate")
		IonLabel(slot="end" v-if="duration != null && duration.total > 0")
			span -
			span(v-if="duration.days > 0") {{ formatNumber(duration.days) }}:
			span {{ formatNumber(duration.hours) }}:
			span {{ formatNumber(duration.minutes) }}:
			span {{ formatNumber(duration.seconds) }}
		IonLabel(slot="end" v-else-if="duration != null && duration.total <= 0")
			span Updating...
	IonItem
		IonLabel(slot="start")
			h3 MinPrice
			p: DisplayDate(:date="product.minPriceDate")
		IonLabel(slot="end") {{ product.minPrice }}
	IonItem
		IonLabel(slot="start")
			h3 LastPrice
			p: DisplayDate(:date="product.lastPriceDate")
		IonLabel(slot="end") {{ product.lastPrice }}
	IonItem
		IonLabel(slot="start")
			h3 CurrentPrice
			p: DisplayDate(:date="product.currentPriceDate")
		IonLabel(slot="end") {{ product.currentPrice }}
</template>

<script setup lang="ts">
import { openOutline } from "ionicons/icons";
import { Browser } from "@capacitor/browser";
import { DateTime, Duration } from "luxon";
import type { RemainingTimeObject } from "@/composables/UseCountdown";
import { useCountdown } from "@/composables/UseCountdown";
import type { Product } from "@/models/products";

const p = defineProps({
	product: {
		type: Object as PropType<Product>,
		required: true,
	},
});

const mainStore = useMainStore();
const duration = ref<RemainingTimeObject>();
const lastScrapingDateTime = ref<DateTime>();

const { getRemainingTime } = useCountdown();

onMounted(() => {
	if (p.product.lastScrapingDate == null)
		return;

	lastScrapingDateTime.value = DateTime.fromISO(p.product.lastScrapingDate);
	countDownToNextUpdate();
});

async function openUrl(url: string) {
	await Browser.open({ url });
}

let countDownTimeout: ReturnType<typeof setTimeout>;
function countDownToNextUpdate() {
	clearTimeout(countDownTimeout);

	if (lastScrapingDateTime.value == null)
		return;

	duration.value = getRemainingTime(lastScrapingDateTime.value.plus(Duration.fromObject({ minutes: mainStore.configuration.productTimeRecycleMinutes })));
	countDownTimeout = setTimeout(() => countDownToNextUpdate(), 1000);
}

function formatNumber(numb: number) {
	if (numb < 10)
		return `0${numb}`;

	return `${numb}`;
}
</script>

<style>
</style>
