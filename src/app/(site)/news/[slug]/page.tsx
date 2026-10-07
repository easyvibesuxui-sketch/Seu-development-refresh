import type { Metadata } from "next";
import NewsPostScreen, { newsPostMeta, newsPostParams } from "@/screens/NewsPostScreen";

export const generateStaticParams = newsPostParams;

export async function generateMetadata({ params }: PageProps<"/news/[slug]">): Promise<Metadata> {
  return newsPostMeta("en", (await params).slug);
}

export default async function Page({ params }: PageProps<"/news/[slug]">) {
  return <NewsPostScreen lang="en" slug={(await params).slug} />;
}
