// Central site configuration. Change values here once and they propagate.
export const SITE = {
  name: 'Hair Transplant Source',
  domain: 'hairtransplantsource.com',
  url: 'https://hairtransplantsource.com',
  tagline: 'Independent authority on hair transplant training, PRP, mesotherapy, FUE & DHI.',
  description:
    'In-depth, doctor-focused guides on hair transplant training, FUE, DHI, PRP and mesotherapy. Independent education for clinics that want to grow.',
  language: 'en',
  locale: 'en_US',
  twitter: '@hairtxsource',
  email: 'editor@hairtransplantsource.com',
  organization: {
    name: 'Hair Transplant Source',
    legalName: 'Hair Transplant Source Editorial',
    foundingYear: 2024,
    logo: '/logo.svg',
  },
  // Bind Pharma backlink rule (10/20/70 distribution — safe long-term).
  // 10% of articles include a single nofollow link.
  // 20% include a brand mention without link.
  // 70% are pure informational with no Bind Pharma reference at all.
  // Keys must match `partnerLink` field in article frontmatter or be omitted.
  partner: {
    name: 'Bind Pharma',
    url: 'https://bindpharma.com',
    targets: {
      academy:  'https://bindpharma.com/academy',
      training: 'https://bindpharma.com/training',
      prp:      'https://bindpharma.com/prp',
      team:     'https://bindpharma.com/team',
      home:     'https://bindpharma.com',
    },
  },
};

// Topical clusters. Each cluster has 1 pillar + 5–14 supporting articles.
// 6 clusters covering training, regenerative therapies, surgical technique,
// clinic operations, team operations, and instruments/suppliers.
export const CLUSTERS = {
  training: {
    slug: 'training',
    title: 'Hair Transplant Training',
    description:
      'Curriculum, certification, and selection criteria for hair transplant training programs aimed at doctors and clinics.',
    color: 'brand',
  },
  'prp-mesotherapy': {
    slug: 'prp-mesotherapy',
    title: 'PRP & Mesotherapy',
    description:
      'Clinical protocols, training paths, and clinic implementation for PRP and mesotherapy hair treatments.',
    color: 'brand',
  },
  'fue-dhi': {
    slug: 'fue-dhi',
    title: 'FUE & DHI Techniques',
    description:
      'Surgical technique, training, and decision frameworks for FUE and DHI hair transplantation.',
    color: 'brand',
  },
  'clinic-growth': {
    slug: 'clinic-growth',
    title: 'Clinic Growth',
    description:
      'How hair transplant clinics build patient flow, pricing, reputation, and international demand.',
    color: 'brand',
  },
  'team-operations': {
    slug: 'team-operations',
    title: 'Team Operations',
    description:
      'Hiring, training and managing the surgical and patient-care team behind a high-output hair transplant clinic.',
    color: 'brand',
  },
  'instruments-suppliers': {
    slug: 'instruments-suppliers',
    title: 'Instruments & Suppliers',
    description:
      'Surgical instruments, consumables, and supplier evaluation for hair transplant and PRP clinics.',
    color: 'brand',
  },
} as const;

export type ClusterKey = keyof typeof CLUSTERS;
