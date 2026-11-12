import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog-data";
import { projects } from "@/lib/project-data";
import { SITE_URL as BASE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const blogPosts: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated ?? post.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const projectPages: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${BASE_URL}/projects/${project.id}`,
    lastModified: timelineEnd(project.timeline),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...blogPosts,
    ...projectPages,
  ];
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** The last "Mon YYYY" in a project timeline ("Jan 2024 - Dec 2024" → Dec 2024), if it has one. */
function timelineEnd(timeline: string | undefined): Date | undefined {
  const matches = [...(timeline ?? "").matchAll(/\b([A-Za-z]{3})[a-z]*\.? (\d{4})\b/g)];
  const last = matches.at(-1);
  if (!last) return undefined;
  const month = MONTHS.indexOf(last[1].toLowerCase());
  return month === -1 ? undefined : new Date(Date.UTC(Number(last[2]), month, 1));
}
