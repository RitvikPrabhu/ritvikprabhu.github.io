import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

export default defineConfig({
  site: "https://ritvikprabhu.github.io",
  output: "static",
  trailingSlash: "always",
  devToolbar: { enabled: false },
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
      ],
    }),
    shikiConfig: { themes: { light: "github-light", dark: "github-dark" } },
  },
});
