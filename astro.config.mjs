import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExternalLinks from "rehype-external-links";

export default defineConfig({
  site: "https://ritvikprabhu.github.io",
  output: "static",
  trailingSlash: "always",
  devToolbar: { enabled: false },
  vite: {
    server: { allowedHosts: [".onamp.dev"] },
    preview: { allowedHosts: [".onamp.dev"] },
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) =>
        !page.includes("/writing/example/") && !page.includes(".html"),
    }),
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [
        rehypeKatex,
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: "wrap" }],
        [
          rehypeExternalLinks,
          {
            target: "_blank",
            rel: ["noopener", "noreferrer"],
            test: (element) =>
              new URL(element.properties.href, "https://ritvikprabhu.github.io")
                .origin !== "https://ritvikprabhu.github.io",
          },
        ],
      ],
    }),
    shikiConfig: { themes: { light: "github-light", dark: "github-dark" } },
  },
});
