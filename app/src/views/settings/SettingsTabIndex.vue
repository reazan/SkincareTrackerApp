<template lang="pug">
IonPage
	IonHeader
		IonToolbar
			IonTitle {{ t('menu.settings-title') }}
	IonContent(:fullscreen="true")
		IonHeader(collapse="condense")
			IonToolbar
				IonTitle(size="large") {{ t('menu.settings-title') }}

		IonList
			IonItem
				IonLabel Notifications
				IonButton(v-if="!mainStore.notificationEnabled" @click="registerNotificationsAsync") Enable
				IonButton(v-else color="success" :disabled="true") Enabled!
			IonItem
				IonLabel Dark mode
				IonToggle(slot="end" v-model="isDark")
			IonItem
				IonLabel Reset
				IonButton(@click="askReset" color="danger") Reset

	IonToast(
		duration="2500"
		:is-open="showResetSuccessToast"
		@onDidDismiss="showResetSuccessToast = false"
		message="Reset successfully"
		color="success"
	)
	IonToast(
		duration="2500"
		:is-open="showResetErrorToast"
		@onDidDismiss="showResetErrorToast = false"
		message="Reset error"
		color="danger"
	)
</template>

<script setup lang="ts">
import { alertController } from "@ionic/vue";
import { useIonicUserSettingsStorage } from "@/composables/UseIonicUserSettingsStorage";
import { useIonicProductStorage } from "@/composables/UseIonicProductStorage";
import OnlineStoreTrackerApi from "@/models/online-store-tracker-api";

const { t } = useI18n();

const mainStore = useMainStore();
const onlineStoreApi = new OnlineStoreTrackerApi();
const ionicUserSettings = useIonicUserSettingsStorage();
const ionicProductStorage = useIonicProductStorage();

const showResetSuccessToast = ref(false);
const showResetErrorToast = ref(false);

onMounted(() => {
	if (mainStore.darkMode == null)
		mainStore.darkMode = window.matchMedia("(prefers-color-scheme: dark)")?.matches ?? false;
});

async function registerNotificationsAsync() {
	const result = await mainStore.registerNotificationsAsync();
	if (result !== "denied")
		return;

	const alert = await alertController.create({
		header: "Enable Notifications",
		message: "Please go to Settings > Notifications and enable them for this application.",
		buttons: ["OK"],
	});

	await alert.present();
};

const isDark = computed({
	get: () => mainStore.darkMode ?? false,
	set: async (val) => {
		await ionicUserSettings.setUserSettingsAsync({ darkMode: val });
		mainStore.toggleDarkMode(val);
	},
});

async function askReset() {
	const alert = await alertController.create({
		header: "Clear",
		message: "This function will clear all your saved products and notifications, proceed?",
		buttons: [
			{
				text: "OK",
				role: "destructive",
				handler: () => { reset(); },
			},
			{
				text: "Cancel",
				role: "cancel",
			},
		],
	});

	await alert.present();
}

async function reset() {
	try {
		const result = await onlineStoreApi.clearDeviceProductAsync({ deviceId: mainStore.deviceId });
		if (!result) {
			showResetErrorToast.value = true;
			return;
		}

		await ionicProductStorage.clearStorage();
		await mainStore.refreshLocalTrackedProductsAsync();
	}
	catch {
		showResetErrorToast.value = true;
		return;
	}

	showResetSuccessToast.value = true;
}
</script>

<style>
</style>
