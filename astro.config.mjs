import { defineConfig } from "astro/config";
import storyblok from "@storyblok/astro";
import { loadEnv } from "vite";
import tailwind from "@astrojs/tailwind";
import basicSsl from "@vitejs/plugin-basic-ssl";
import vercel from "@astrojs/vercel/serverless";

const env = loadEnv("", process.cwd(), "STORYBLOK");

export default defineConfig({
  output: "server",
  adapter: vercel(),
  integrations: [
    storyblok({
      accessToken: env.STORYBLOK_TOKEN,
      apiOptions: {
        region: "",
      },
      components: {
        header: "components/global-components/Header",
        footer: "components/global-components/Footer",
        page: "components/storyblok/Page",
        // feature: "components/storyblok/Feature",
        products: "components/storyblok/Products",
        hero: "components/storyblok/Hero",
        // grid: "components/storyblok/Grid",
        // teaser: "components/storyblok/Teaser",
      },
    }),
    tailwind(),
  ],
  vite: {
    plugins: [basicSsl()],
    server: {
      https: true,
    },
  },
});
