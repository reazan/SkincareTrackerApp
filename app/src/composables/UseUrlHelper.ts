import { useBackedUrls } from "./UseBackendUrls";

export class UrlHelper {
	static action(actionDescriptor: ActionDescriptor, queryParameters?: Record<string, QueryParameter>): string {
		return UrlHelper.privateAction(actionDescriptor.action, actionDescriptor.controller, queryParameters);
	}

	private static privateAction(
		action: string,
		controller: string,
		queryParameters?: Record<string, QueryParameter>,
	): string {
		const { BaseUrl } = useBackedUrls();
		let url = `${BaseUrl}/${controller}/${action}`;
		if (queryParameters != null)
			url = url + UrlHelper.buildQueryParameters(queryParameters, false);

		return url;
	}

	private static buildQueryParameters(parameters: Record<string, QueryParameter>, addTimestamp?: boolean): string {
		if (addTimestamp)
			parameters._ = new Date().getTime().toString();

		let q = "";
		for (const p in parameters) {
			if (Object.prototype.hasOwnProperty.call(parameters, p)) {
				const val = parameters[p];
				if (val == null)
					continue;
				if (p === "raw_querystring_parameter" && typeof val == "string")
					q += `&${val.replace(/^\?/, "")}`;

				else
					q += `&${p}=${val}`;
			}
		}
		q = `?${q.substring(1)}`;
		return q;
	}
}

type QueryParameter = string | boolean | number | string[] | boolean[] | number[] | null;

export class ActionDescriptor {
	action: string;
	controller: string;
	constructor(action: string, controller: string) {
		this.action = action;
		this.controller = controller;
	}
}
