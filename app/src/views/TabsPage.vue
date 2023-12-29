<template lang="pug">
IonPage
	IonTabs
		IonRouterOutlet
		IonTabBar(slot="bottom")
			IonTabButton(tab="home" href="/tracker/home")
				IonIcon(aria-hidden="true" :icon="starOutline")

			IonTabButton(tab="list" href="/tracker/list")
				IonIcon(aria-hidden="true" :icon="search")

			IonTabButton(tab="add" href="/tracker/add")
				IonIcon(aria-hidden="true" :icon="add")

			IonTabButton(tab="settings" href="/tracker/settings")
				IonIcon(aria-hidden="true" :icon="settings")

			IonTabButton(tab="about" href="/tracker/about")
				IonIcon(aria-hidden="true" :icon="informationCircle")
</template>

<script setup lang="ts">
import { IonIcon, IonPage, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from "@ionic/vue";
import { add, informationCircle, search, settings, starOutline } from "ionicons/icons";
</script>

<style>
</style>
