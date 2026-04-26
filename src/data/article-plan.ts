// Master article plan for the 30-article authority site.
// Source of truth lives in `article-plan.json` so both TypeScript code
// and Node automation scripts can read the same data without a build step.
//
// Cluster distribution (5 clusters × 6 = 30 articles, 1 pillar + 5 supporting each).
// Partner-link distribution across all 30: 15 none / 9 one-link / 6 two-link
// (matches the 50% / 30% / 20% spec).

import plan from './article-plan.json';

export type ArticlePlan = {
  slug: string;
  title: string;
  cluster: 'training' | 'prp-mesotherapy' | 'fue-dhi' | 'clinic-growth' | 'team-operations';
  isPillar: boolean;
  primaryKeyword: string;
  secondaryKeywords: string[];
  metaTitle: string;
  metaDescription: string;
  partnerLink: 'academy' | 'training' | 'prp' | 'team' | 'home' | null;
  partnerLinkCount: 0 | 1 | 2;
  author: string;
  reviewedBy?: string;
};

export const ARTICLE_PLAN: ArticlePlan[] = plan as ArticlePlan[];
export default ARTICLE_PLAN;
