<template lang="pug">
IonApp(v-if="mainStore.darkMode != null")
	IonRouterOutlet
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, alertController } from "@ionic/vue";
import { PushNotifications } from "@capacitor/push-notifications";
import { FCM } from "@capacitor-community/fcm";

import { useIonicLogStorage } from "./composables/UseIonicLogStorage";
import { useIonicUserSettingsStorage } from "./composables/UseIonicUserSettingsStorage";
import { useAjaxStore } from "./store/ajax";

const ionicLogStorage = useIonicLogStorage();
const ionicUserSettings = useIonicUserSettingsStorage();
const mainStore = useMainStore();
const ajaxStore = useAjaxStore();

onBeforeMount(async () => {
	const userSettings = await ionicUserSettings.getUserSettingsAsync();
	mainStore.toggleDarkMode(userSettings?.darkMode ?? window.matchMedia("(prefers-color-scheme: dark)")?.matches ?? false);
});

onMounted(async () => {
	try {
		await mainStore.startupAsync();

		await mainStore.registerNotificationsAsync();
		await addListenersAsync();
	}
	catch (e) {
		await ionicLogStorage.setLogAsync(`${e}`);
	}

	await mainStore.updateTrackedProductsFromServerAsync();

	try {
		FCM.subscribeTo({ topic: "test" })
			.then(_ => ionicLogStorage.setLogAsync("subscribed to 'test' topic"))
			.catch(err => ionicLogStorage.setLogAsync(`SubscribeTo test topic: ${err}`));
	}
	catch (e) {
		await ionicLogStorage.setLogAsync(`${e}`);
	}
});

async function addListenersAsync() {
	await PushNotifications.addListener("registration", async (token) => {
		await ionicLogStorage.setLogAsync(`PN registration: ${token.value}`);
	});

	await PushNotifications.addListener("registrationError", async (err) => {
		await ionicLogStorage.setLogAsync(`PN registration: ${err.error}`);
	});

	await PushNotifications.addListener("pushNotificationReceived", async (notification) => {
		await mainStore.updateTrackedProductsFromServerAsync();
		await ionicLogStorage.setLogAsync(`PN notification: ${notification.title} - ${notification.body}`);
	});

	await PushNotifications.addListener("pushNotificationActionPerformed", async (request) => {
		await ionicLogStorage.setLogAsync(`PN action performed: ${request.actionId} - ${request.inputValue}`);
	});
};

async function removeListenersAsync() {
	await PushNotifications.removeAllListeners();
};

watch(() => ajaxStore.showError, async (val) => {
	if (!val)
		return;

	const alert = await alertController.create({
		header: "Error",
		message: ajaxStore.errorMessage,
		buttons: ["OK"],
	});

	await alert.present();
});


onUnmounted(async () => {
	await removeListenersAsync();
});

</script>

<style>
</style>
