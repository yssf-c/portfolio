"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getLatestPosts } from "@/lib/blog-data";
import { NotesGrid } from "@/components/field-notes/notes-grid";
import { BlogBlocks, BlogRows } from "@/components/blog-drafts";
import { DraftSwitch, useDraft } from "@/components/draft-switch";

const BLOG_DRAFTS = [
  { id: "blocks", label: "Takeaways" },
  { id: "rows", label: "Headlines" },
  { id: "cards", label: "Experiments" },
] as const;

export function BlogSection() {
  const [draft, setDraft] = useDraft("blog", BLOG_DRAFTS, "blocks");
  const posts = getLatestPosts(3);

  return (
    <section id="blog" className="relative py-24 md:py-32">
      <div className="container mx-auto px-6 md:px-12">
        <header className="fn-index-heading">
          <div>
            <h2 className="fn-blog-title" aria-label="Blog">
              BL
              <span className="fn-arabic-title" aria-hidden="true">
                <small>「</small>
                <span lang="ar" dir="rtl">
                  مقالات
                </span>
                <small>」</small>
              </span>
              OG
            </h2>
            <p className="fn-kicker">Writings & research / Field notes</p>
          </div>
          <p className="fn-introduction">
            A few things I’ve built, questioned, and tried to make sense of.
            Pull on a thread.
          </p>
        </header>
        <div className="mb-8 flex justify-end">
          <DraftSwitch section="Blog" options={BLOG_DRAFTS} value={draft} onChange={setDraft} />
        </div>
        {draft === "blocks" && <BlogBlocks posts={posts} />}
        {draft === "rows" && <BlogRows posts={posts} />}
        {draft === "cards" && <NotesGrid posts={posts} filters={false} />}
        <div className="mt-10 flex justify-center">
          <Link href="/blog" className="fn-text-button">
            Explore all field notes <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
