import type { AxiosError, AxiosInstance } from "axios";
import axios from "axios";
import { useAjaxStore } from "@/store/ajax";

const axiosInstance = ref<AxiosInstance | null>();

export function setupAxios() {
	const requestIdHeaderName = "X-REQUEST-ID";

	if (axiosInstance.value != null)
		return;

	axiosInstance.value = axios.create();

	if (axiosInstance.value.defaults.headers != null)
		axiosInstance.value.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

	axiosInstance.value.interceptors.request.use((config) => {
		const ajaxStore = useAjaxStore();
		const requestId = ajaxStore.startAjaxCall();

		config.headers.set(requestIdHeaderName, requestId);

		return config;
	},
	(error) => {
		Promise.reject(error);
	});

	axiosInstance.value.interceptors.response.use(
		(response) => {
			const requestId = response.config.headers.get(requestIdHeaderName)?.toString();
			if (requestId != null) {
				const ajaxStore = useAjaxStore();
				ajaxStore.endAjaxCall(requestId);
			}

			return response;
		},
		(error: AxiosError) => {
			const ajaxStore = useAjaxStore();
			const requestId = error.config?.headers.get(requestIdHeaderName)?.toString();

			if (requestId != null)
				ajaxStore.endAjaxCall(requestId);

			const isCancelError = axios.isCancel(error);

			if (!error.response && !isCancelError) {
				ajaxStore.onError("Server not available");
				return;
			}

			const statusCode = (error?.response?.status) ?? 0;

			if (statusCode >= 400) {
				// eslint-disable-next-line no-console
				console.log(error);
			}
		},
	);
}

export function useAxios() {
	setupAxios();

	if (axiosInstance.value == null)
		throw new Error("AxiosInstance is null");

	return { axios: axiosInstance.value };
}
