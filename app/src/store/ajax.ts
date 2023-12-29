import { defineStore } from "pinia";
import { v4 } from "uuid";

export const useAjaxStore = defineStore({
	id: "ajax",
	state: () => {
		return {
			buildNumber: "v231220.3",
			pendingAjaxCalls: new Array<string>(),
			preventNextLoading: false,
			errorMessage: "",
			showError: false,
		};
	},
	actions: {
		startAjaxCall() {
			if (this.preventNextLoading) {
				this.preventNextLoading = false;
				return;
			}
			const callId = v4();
			this.pendingAjaxCalls.push(callId);
			return callId;
		},
		endAjaxCall(id: string | undefined) {
			if (id == null)
				return;
			const index = this.pendingAjaxCalls.indexOf(id);
			if (index < 0)
				return;
			this.pendingAjaxCalls.splice(index, 1);
		},
		onError(errorMessage: string) {
			this.errorMessage = errorMessage;
			this.showError = true;
		},
	},
	getters: {
		anyPendingAjaxCall: (state) => {
			return state.pendingAjaxCalls.length > 0;
		},
	},
});
