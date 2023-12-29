<template lang="pug">
IonPage
	IonHeader
		IonToolbar
			IonTitle {{ t('menu.about-title') }}
	IonContent(:fullscreen="true")
		IonHeader(collapse="condense")
			IonToolbar
				IonTitle(size="large") {{ t('menu.about-title') }}

		div(style="text-align: center; margin-top: 5px; margin-bottom: 5px;")
			img(style="height: 300px;" :src="Icon")
			h1 Skincare Tracker
			h3 {{ ajaxStore.buildNumber }}

		div(style="text-align: center;  margin-top: 5px; margin-bottom: 5px;")
			a(href="javascript:void(0)" @click="openGithub" style="color: rosybrown")
				IonIcon(:icon="logoGithub" size="large")

</template>

<script setup lang="ts">
import { logoGithub } from "ionicons/icons";
import { Browser } from "@capacitor/browser";
import Icon from "@/assets/icon.png";
import { useAjaxStore } from "@/store/ajax";

const { t } = useI18n();

const ajaxStore = useAjaxStore();

function openGithub() {
	Browser.open({ url: "https://github.com/theramenboy/SkincareTrackerApp" });
}
</script>

<style>
</style>
