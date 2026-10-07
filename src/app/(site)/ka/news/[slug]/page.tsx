import type { Metadata } from "next";
import NewsPostScreen, { newsPostMeta, newsPostParams } from "@/screens/NewsPostScreen";

export const generateStaticParams = newsPostParams;

export async function generateMetadata({ params }: PageProps<"/ka/news/[slug]">): Promise<Metadata> {
  return newsPostMeta("ka", (await params).slug);
}

export default async function Page({ params }: PageProps<"/ka/news/[slug]">) {
  return <NewsPostScreen lang="ka" slug={(await params).slug} />;
}
