"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatPostDate, type BlogPost } from "@/lib/blog-data";
import { noteIdentity } from "@/lib/field-notes";

/** Two other layouts for the Blog section, offered beside the field-note cards. */

/** The notes as headlines: one oversized row each. */
export function BlogRows({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="blog-rows">
      {posts.map((post) => {
        const note = noteIdentity(post);
        return (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-row">
            <span className="blog-row-number">{note.number}</span>
            <span className="blog-row-main">
              <span className="blog-row-kicker">
                <span>{note.category}</span>
                <span>{post.readingTimeMinutes} min read</span>
                <span>{formatPostDate(post.date)}</span>
              </span>
              <h3 className="blog-row-title">
                <span>{note.title}</span>
              </h3>
              <span className="blog-row-sub">{note.subtitle}</span>
            </span>
            <span className="blog-row-arrow">
              <ArrowUpRight aria-hidden="true" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/** The notes as colour blocks, each led by what the note concluded. */
export function BlogBlocks({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="blog-blocks">
      {posts.map((post, index) => {
        const note = noteIdentity(post);
        return (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-block" data-tone={index % 2 ? "gold" : "ink"}>
            <span className="blog-block-top">
              <span>
                {note.number} / {note.category}
              </span>
              <span>{post.readingTimeMinutes} min read</span>
            </span>
            <span className="blog-block-quote">{note.takeaway}</span>
            <span className="blog-block-foot">
              <span>
                <h3>{note.title}</h3>
                <span>{formatPostDate(post.date)}</span>
              </span>
              <span className="blog-block-arrow">
                <ArrowUpRight aria-hidden="true" />
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
