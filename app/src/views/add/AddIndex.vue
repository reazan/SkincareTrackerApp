<template lang="pug">
IonHeader
	IonToolbar
		IonButtons(slot="start")
			IonBackButton
		IonTitle Add
		IonProgressBar(:buffer="buffer / 10" :value="verifyWithIdAttempts / 10" v-if="taskId != undefined")
IonContent(class="ion-padding")
	IonList
		IonItem
			IonInput(v-model="url" placeholder="Insert URL here" :disabled="isLoading || product != undefined || taskId != undefined")

	div(style="display: flex; justify-content: end; align-items: center;")
		IonButton(
			v-if="product === undefined && taskId == null"
			color="secondary"
			:disabled="isLoading || !isUrlNotEmpty"
			@click="verify"
		) Verify
		div(style="display: flex; align-items: center;" v-if="product != undefined")
			IonLabel(v-if="mainStore.isUrlInTrackedProducts(product.url)" style="margin-right: 15px;"): em Already marked as favorite.
			IonButton(
				color="secondary"
				:disabled="isLoading || !isUrlNotEmpty"
				@click="reset"
			) Reset
			IonButton(
				v-if="!mainStore.isUrlInTrackedProducts(product.url)"
				color="success"
				:disabled="isLoading || !isUrlNotEmpty || product === undefined"
				@click="addToFavorites"
			) Favorite
		div(v-if="taskId != null")
			div(style="display: flex; align-items: center;")
				IonLabel: em Url is in list to be checked. Please wait
				|&nbsp;
				IonSpinner(name="lines")

	div(v-if="product != undefined")
		ProductDetail(:product="product")

	div(v-else)
		br
		IonAccordionGroup
			IonAccordion(value="first")
				IonItem(slot="header")
					IonLabel Currently supported stores

				IonList(slot="content")
					IonItem
						IonLabel
							span Jolse
							br
							IonNote https://jolse.com/...
					IonItem
						IonLabel
							span StyleKorean
							br
							IonNote https://www.stylekorean.com/...
					IonItem
						IonLabel
							span Stylevana (IT)
							br
							IonNote https://www.stylevana.com/it_IT/...
					IonItem
						IonLabel
							span Stylevana (EN)
							br
							IonNote https://www.stylevana.com/en_US/...
					IonItem
						IonLabel
							span YesStyle (IT)
							br
							IonNote https://www.yesstyle.com/it/...
					IonItem
						IonLabel
							span YesStyle (EN)
							br
							IonNote https://www.yesstyle.com/en/...

IonToast(
	duration="2500"
	:is-open="showVerifySuccessToast"
	@onDidDismiss="showVerifySuccessToast = false"
	message="Successful verify!"
	color="success"
)
</template>

<script setup lang="ts">
import { IonNote, IonSpinner, alertController } from "@ionic/vue";
import { Product } from "@/models/products";
import OnlineStoreTrackerApi from "@/models/online-store-tracker-api";

const url = ref("");
const isLoading = ref(false);

const isUrlNotEmpty = computed(() =>
	url.value != null
	&& url.value.trim() !== "",
);

const showVerifySuccessToast = ref(false);

const storeApi = new OnlineStoreTrackerApi();
const mainStore = useMainStore();
const product = ref<Product>();
const taskId = ref<string>();

let verifyTimeout: ReturnType<typeof setTimeout>;
const verifyWithIdAttempts = ref(1);
const buffer = ref(2);

async function verify() {
	clearTimeout(verifyTimeout);

	if (verifyWithIdAttempts.value >= 10) {
		resetAllButUrl();

		const alert = await alertController.create({
			header: "Verify result",
			message: "A minute as passed, probably there are too many request, retry again later.",
			buttons: ["OK"],
		});

		await alert.present();
		return;
	}

	isLoading.value = true;
	const result = await storeApi.verifyNewProductAsync({
		url: url.value,
		taskId: taskId.value,
	});
	isLoading.value = false;
	if (result == null)
		return;

	taskId.value = result.taskId;

	if (!result.isSuccess) {
		product.value = undefined;
		const message = result.message ?? "";

		const alert = await alertController.create({
			header: "Verify error",
			message,
			buttons: ["OK"],
		});

		await alert.present();

		return;
	}

	if (result.newAddedProduct != null) {
		product.value = new Product(result.newAddedProduct);
		showVerifySuccessToast.value = true;

		return;
	}

	verifyTimeout = setTimeout(() => {
		buffer.value++;
		verifyWithIdAttempts.value++;
		verify();
	}, 6000);
}

function reset() {
	product.value = undefined;
	url.value = "";
	taskId.value = undefined;
	resetAttempts();
}

function resetAllButUrl() {
	product.value = undefined;
	taskId.value = undefined;
	resetAttempts();
}

function resetAttempts() {
	verifyWithIdAttempts.value = 1;
	buffer.value = 2;
}

async function addToFavorites() {
	if (product.value == null)
		return;

	try {
		await mainStore.trackProductAsync(product.value);
	}
	catch { }
	finally {
		reset();
	}
}
</script>

<style>
</style>
