<template lang="pug">
IonHeader
	IonToolbar
		IonButtons(slot="start")
			IonBackButton(ref="settingsBackButton")
		IonTitle {{ storesForProduct.length == 1 ? 'Notifications' : 'Grouped Notifications' }}
		IonProgressBar(type="indeterminate" v-if="isLoading")
IonContent(class="ion-padding")
	div(v-if="!mainStore.notificationEnabled" style="display: flex; text-align: center; margin-bottom: 15px;")
		IonIcon(color="warning" :icon="alertCircleOutline")
		| &nbsp;
		IonLabel(color="warning"): em App notification setting is disabled. Enable notification to use this feature.
	div(v-if="!canActivateNotifications" style="display: flex; text-align: center; margin-bottom: 15px;")
		IonIcon(color="warning" :icon="alertCircleOutline")
		| &nbsp;
		IonLabel(color="warning"): em Max enabled Notifications reached (max {{ mainStore.totalPossibleNotifications }}).
	div(v-for="product in storesForProduct" :key="product.id" style="margin-bottom: 20px")
		IonLabel
			h1 {{  product.name }}
			p {{ product.brand }}

		div(style="text-align: center; margin-top: 5px; margin-bottom: 5px;" v-if="product.imageUrl")
			img(style="height: 300px;" :src="product.imageUrl")

		div(style="display: flex; justify-content: space-between;")
			ProductRowItem(:product="product")
			IonButton
				span Open
				IonIcon(slot="end" :icon="openOutline")
		IonList
			IonItem
				IonToggle(
					:disabled="!mainStore.notificationEnabled || !canActivateNotifications"
					v-model="product.notificationEnabled"
				) Notification Enabled
			IonItem
				IonToggle(
					:disabled="!mainStore.notificationEnabled || !product.notificationEnabled"
					v-model="product.notifyAlwaysWhenIsLower"
				) Always when is lower
			IonItem
				IonInput(
					label="$ lesser or equal than"
					type="number"
					placeholder="Example: 10.58"
					v-model="product.notifyValueLesserOrEqualThan"
					:disabled="!mainStore.notificationEnabled || !product.notificationEnabled"
				)
			IonItem
				IonInput(
					label="% greater or equal than"
					type="number"
					placeholder="Example: 20"
					v-model="product.notifyPercentageGreaterOrEqualThan"
					:disabled="!mainStore.notificationEnabled || !product.notificationEnabled"
				)

	br
	div(style="display: flex; justify-content: end;")
		IonButton(color="primary" @click="save" :disabled="!mainStore.notificationEnabled") Save
		IonButton(color="secondary" @click="reset" :disabled="!mainStore.notificationEnabled") Reset

	IonToast(
		duration="2000"
		:is-open="showToast"
		@onDidDismiss="showToast = false"
		message="Notification saved!"
		color="success"
	)
</template>

<script setup lang="ts">
import { alertCircleOutline, openOutline } from "ionicons/icons";
import { useBackButton } from "@ionic/vue";
import { Product } from "@/models/products";

const props = defineProps({
	productUrls: {
		type: Array as PropType<Array<string>>,
		required: true,
	},
});

const isLoading = ref(false);
const mainStore = useMainStore();
const storesForProduct = ref<Array<Product>>([]);

const showToast = ref(false);

const settingsBackButton = ref<HTMLButtonElement>();

onMounted(() => {
	const result = new Array<Product>();
	for (let i = 0; i < props.productUrls.length; i++) {
		const product = mainStore.getTrackedProductByUrl(props.productUrls[i]);
		if (product == null)
			continue;

		result.push(new Product(product, {
			notifyAlwaysWhenIsLower: product.notifyAlwaysWhenIsLower,
			notifyPercentageGreaterOrEqualThan: product.notifyPercentageGreaterOrEqualThan,
			notifyValueLesserOrEqualThan: product.notifyValueLesserOrEqualThan,
			notificationEnabled: product.notificationEnabled ?? false,
			url: product.url,
		}));
	}

	storesForProduct.value = result;
});

async function reset() {
	storesForProduct.value.forEach((a) => {
		a.notifyPercentageGreaterOrEqualThan = undefined;
		a.notificationEnabled = false;
		a.notifyValueLesserOrEqualThan = undefined;
		a.notifyAlwaysWhenIsLower = false;
	});

	await save();
}

async function save() {
	isLoading.value = true;
	await mainStore.updateNotificationsAsync(storesForProduct.value);
	isLoading.value = false;

	showToast.value = true;

	await mainStore.refreshLocalTrackedProductsAsync();
}

useBackButton(10, () => {
	settingsBackButton.value?.click();
});

const canActivateNotifications = computed(() => {
	return mainStore.totalPossibleNotifications - mainStore.totalActiveNotifications >= 0;
});
</script>

<style>
</style>
