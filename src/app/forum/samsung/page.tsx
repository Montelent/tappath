import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ForumBoard from "@/components/forum/ForumBoard";

export const metadata: Metadata = {
  title: "Samsung Forum",
  description: "Samsung Galaxy and One UI community discussions.",
};

export default function SamsungForumPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <Link href="/" className="hover:text-[var(--foreground)]">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/forum" className="hover:text-[var(--foreground)]">
          Forum
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-[var(--foreground)]">Samsung</span>
      </nav>
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Samsung board</h1>
      <ForumBoard brand="samsung" />
    </div>
  );
}
