import { createRouter, createWebHistory } from "@ionic/vue-router";
import type { RouteRecordRaw } from "vue-router";
import TabsPage from "../views/TabsPage.vue";

const routes: Array<RouteRecordRaw> = [
	{
		path: "/",
		redirect: "/tracker/",
	},
	{
		path: "/tracker/",
		component: TabsPage,
		children: [
			{
				path: "",
				redirect: "/tracker/home",
			},
			{
				path: "home",
				component: () => import("@/views/home/HomeTabIndex.vue"),
			},
			{
				path: "list",
				component: () => import("@/views/list/ListTabIndex.vue"),
			},
			{
				path: "add",
				component: () => import("@/views/add/AddTabIndex.vue"),
			},
			{
				path: "settings",
				component: () => import("@/views/settings/SettingsTabIndex.vue"),
			},
			{
				path: "about",
				component: () => import("@/views/about/AboutTabIndex.vue"),
			},
		],
	},
];

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
});

export default router;
