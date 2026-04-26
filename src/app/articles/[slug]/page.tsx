import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getAllArticles,
  getArticleBySlug,
  getRelatedArticles,
} from '@/lib/articles';
import { buildArticleMetadata } from '@/lib/seo';
import ArticleLayout from '@/components/ArticleLayout';

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) return {};
  return buildArticleMetadata(article);
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();
  const related = await getRelatedArticles(article, 4);
  return <ArticleLayout article={article} related={related} />;
}
