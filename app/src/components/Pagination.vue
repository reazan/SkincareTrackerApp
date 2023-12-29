<template lang="pug">
div
	IonRow
		div(class="mx-1")
			IonButton(:disabled="disabledPreviousPages" @click="firstPage" size="small")
				IonIcon(:icon="chevronBackOutline")
		div(class="mx-1")
			IonButton(:disabled="disabledPreviousPages" @click="previousPage" size="small")
				IonIcon(slot="start" :icon="chevronBackOutline")
				| Prev
		div(class="mx-1")
			IonButton(:disabled="disabledNextPages" @click="nextPage" size="small")
				IonIcon(slot="end" :icon="chevronForwardOutline")
				| Next
		div(class="mx-1")
			IonButton(:disabled="disabledNextPages" @click="lastPage" size="small")
				IonIcon(:icon="chevronForwardOutline")

	div(style="display: flex; justify-content: center;" v-if="pagination.total >= pagination.size")
		IonLabel {{ pageCountMsg }}
</template>

<script setup lang="ts">
import { IonRow } from "@ionic/vue";
import { chevronBackOutline, chevronForwardOutline } from "ionicons/icons";
import type { PropType } from "vue";

const props = defineProps({
	pagination: {
		type: Object as PropType<{ page: number; total: number; size: number }>,
		required: true,
	},
});

const emit = defineEmits<{
	change: [void]
}>();

const disabledNextPages = computed<boolean>(() => {
	return props.pagination.page * props.pagination.size >= props.pagination.total;
});
const disabledPreviousPages = computed<boolean>(() => {
	return props.pagination.page === 1;
});

function lastPage(): void {
	props.pagination.page = Math.ceil(props.pagination.total / props.pagination.size);
	emit("change");
}

function nextPage(): void {
	props.pagination.page += 1;
	emit("change");
}

function previousPage(): void {
	props.pagination.page -= 1;
	emit("change");
}

function firstPage(): void {
	props.pagination.page = 1;
	emit("change");
}

const pageCountMsg = computed<string>((): string => {
	const filters = props.pagination;
	if (filters.total <= filters.size)
		return `${filters.total}`;

	const start = filters.page * filters.size - filters.size + 1;
	const end = filters.page * filters.size <= filters.total ? filters.page * filters.size : filters.total;
	return `${start} - ${end} of ${filters.total}`;
});
</script>

<style>
</style>
