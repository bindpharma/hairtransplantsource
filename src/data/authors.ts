// Editorial bylines used across articles for E-E-A-T signals.
// Each article references one of these via the `author` slug in its frontmatter.
//
// Editorial policy:
//   - All articles are written by the editorial research team.
//   - Articles that have been read and approved by Dr. Dursun Eser carry his
//     name in the `reviewedBy` field. Articles without his approval do not
//     claim clinical review.
//   - We do not publish under fabricated bylines.

export type Author = {
  slug: string;
  name: string;
  title: string;
  bio: string;
  credentials: string[];
  avatar: string;
  url: string;
};

export const AUTHORS: Record<string, Author> = {
  'editorial-team': {
    slug: 'editorial-team',
    name: 'Editorial Team',
    title: 'Hair Transplant Source Editorial',
    bio: 'The Hair Transplant Source editorial team produces independent, technique-level reference material for hair restoration clinicians and clinic operators. Articles are written by the team and, where the topic is clinical, reviewed by a named hair restoration surgeon before they are presented as reviewed clinical content.',
    credentials: [
      'Independent editorial line',
      'Clinical articles reviewed by named surgeons',
      'No paid editorial coverage',
    ],
    avatar: '/images/authors/editorial.svg',
    url: '/about',
  },
  'dr-dursun-eser': {
    slug: 'dr-dursun-eser',
    name: 'Dr. Dursun Eser',
    title: 'Hair Restoration Surgeon · Medical Reviewer',
    bio: 'Dr. Dursun Eser is a hair restoration surgeon with 13+ years of clinical experience in FUE and DHI hair transplantation. He serves as the medical reviewer for Hair Transplant Source. Articles flagged as reviewed on this site have been read and clinically approved by him before publication.',
    credentials: [
      '13+ years in hair transplantation',
      'FUE and DHI surgical practice',
      'Medical reviewer, Hair Transplant Source',
    ],
    avatar: '/images/authors/dr-dursun-eser.svg',
    url: '/about#dr-dursun-eser',
  },
};

export const DEFAULT_AUTHOR = 'editorial-team';
