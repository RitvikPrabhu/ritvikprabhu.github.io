import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob, file } from "astro/loaders";

const publications = defineCollection({
  loader: file("src/data/publications.json"),
  schema: z.object({
    title: z.string(),
    authors: z.string(),
    year: z.number().int(),
    venue: z.string(),
    publicationType: z.enum(["Conference", "Journal", "Workshop"]),
    venueShort: z.string().optional(),
    status: z.string().optional(),
    summary: z.string().optional(),
    abstract: z.string().optional(),
    abstractReviewed: z.boolean().optional(),
    selected: z.boolean().default(false),
    links: z.record(z.string(), z.url()).default({}),
    doi: z.string().optional(),
    arxiv: z.url().optional(),
    paper: z.url().optional(),
    code: z.url().optional(),
    slides: z.url().optional(),
    bibtex: z.string().optional(),
    award: z.string().optional(),
    type: z.string(),
    category: z.string(),
    shortTitle: z.string().optional(),
    areas: z.array(z.string()).default([]),
    methods: z.array(z.string()).default([]),
    systems: z.array(z.string()).default([]),
    keywords: z.array(z.string()).default([]),
    pdfPath: z.string().optional(),
    sortOrder: z.number().default(999),
  }),
});
const writing = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/writing" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      published: z.coerce.date(),
      updated: z.coerce.date().optional(),
      draft: z.boolean().default(false),
      example: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
      thumbnail: z.object({ src: image(), alt: z.string().min(1) }).optional(),
    }),
});
export const collections = { publications, writing };
