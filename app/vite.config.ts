import path from "path";
import legacy from "@vitejs/plugin-legacy";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		legacy(),
		Components({
			dts: "src/components.d.ts",
			resolvers: [
				(name) => {
					if (name.startsWith("Ion"))
						return { name, from: "@ionic/vue" };
				},
			],
		}),
		AutoImport({
			imports: ["vue", "vue-router", "vue-i18n"],
			dirs: ["src/store"],
			dts: "src/auto-imports.d.ts",
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
