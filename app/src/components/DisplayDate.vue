<template lang="pug">
span {{ formattedDate }}
</template>

<script setup lang="ts">
import { DateTime } from "luxon";
import type { PropType } from "vue";

const props = defineProps({
	date: {
		type: String as PropType<string | null>,
		default: "",
	},
});

const formattedDate = computed(() => {
	if (props.date == null || props.date.trim() === "")
		return "";

	return DateTime.fromISO(props.date).toFormat("yyyy-MM-dd HH:mm");
});
</script>

<style>
</style>
