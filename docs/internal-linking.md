# Internal Linking Rules

The internal linking system is the difference between 30 unrelated articles and
30 articles that flow PageRank intentionally across topics. This document is the
ruleset every article follows.

---

## The 70/20/10 link distribution

Each article should include **3-5 internal links**. The distribution across
those 3-5 links:

| Link type | Share | Description |
|---|---|---|
| Same-silo | 70% | Links to other articles in the same cluster |
| Pillar of own cluster | 20% | Link to the pillar article of the cluster |
| Cross-silo | 10% | Link to articles in different clusters when naturally relevant |

For a 4-link article: ~3 same-silo, ~1 pillar, ~0-1 cross-silo.
For a 5-link article: ~3-4 same-silo, ~1 pillar, ~0-1 cross-silo.

---

## Pillar articles — one per cluster

Each cluster has one designated pillar. Pillars receive the most internal links
across the site; supporting articles within the cluster all link to the pillar.

| Cluster | Pillar |
|---|---|
| Training | hair-transplant-training-course-for-doctors |
| PRP & Mesotherapy | prp-and-mesotherapy-training-for-clinics |
| FUE & DHI | fue-vs-dhi-hair-transplant-comparison |
| Clinic Growth | clinic-growth-playbook-for-hair-transplant-clinics |
| Team Operations | building-a-hair-transplant-clinical-team |
| Instruments & Suppliers | hair-transplant-instruments-guide |

---

## Authority flow — descending and lateral

```
Pillar (cluster authority)
   │
   ├─→ Support article 1   ←──→   Support article 2
   │                                    │
   │                                    ↓
   └─→ Support article 3   ←──── (linked back to pillar)
```

- **Pillar links DOWN** to all major support articles in its cluster.
- **Support articles link UP** to the pillar exactly once each.
- **Support articles link LATERALLY** to 1-2 other support articles in
  the same cluster.

This pattern concentrates authority on pillar pages — which are the pages most
likely to rank for high-volume keywords — while keeping the support pages
internally connected.

---

## Anchor text rules

- **Use natural variation.** Do not use the same anchor for the same target
  in two articles.
- **Match the surrounding sentence.** The anchor should read like a normal
  reference: "covered in [the FUE training programme guide]" rather than
  "[fue hair transplant training program]".
- **Avoid exact-match repetition.** Don't use the slug verbatim as anchor
  text repeatedly. It looks spammy and Google notices.
- **Vary the wrapping language.** "covered in", "see our pillar guide on",
  "the related discussion is in", "we walk through this in".

---

## When NOT to add an internal link

- **Forced relevance.** If the link doesn't naturally fit the sentence,
  cut it. A weak link hurts more than no link.
- **In the introduction.** First two paragraphs should be link-free for
  readability. Place links in body and conclusion.
- **In the FAQ.** FAQ answers stay self-contained.
- **In the Quick Answer.** Quick Answer is for featured snippet — clean text only.
- **More than 5 per article.** Too many internal links dilute each one's
  weight signal.

---

## When CROSS-CLUSTER linking is appropriate

The 10% cross-silo budget exists for genuine connections, not random insertions:

✓ A clinic-growth article linking to a training article when training
  is part of the growth recommendation.

✓ An instruments article linking to a technique article when the
  instrument is technique-specific.

✓ A team operations article linking to a clinic-growth article when
  the team decision affects clinic capacity.

✗ Linking just to "use up the cross-silo budget" — skip it instead.

---

## Internal link audit

The `npm run seo:audit` script checks:

- Every internal link points to a real article slug
- Every published article has 3-5 internal links
- No article links to itself
- Internal-link distribution leans toward same-silo

The audit fails the build if any internal link is broken.

---

## Adding a new article

When adding a new article:

1. Identify its cluster.
2. Identify the cluster pillar — the new article links to it.
3. Identify 2-3 same-silo support articles to link to.
4. Identify 0-1 cross-silo article to link to (if genuinely relevant).
5. Add internalLinks array to frontmatter (as slugs, not URLs).
6. The render pipeline converts slugs to internal `<a>` tags automatically.
7. Run audit to confirm no broken links.

---

## Updating the linking graph as the site grows

Every 50 published articles, audit the linking graph:

- Are any pillars under-linked? (Each pillar should have 5+ inbound from same cluster.)
- Are any support articles orphaned? (Every article should have 1+ inbound link.)
- Is the cross-silo budget being used too aggressively? (>15% is a flag.)

The audit runs in `automation/link-graph-audit.js` and reports patterns;
acting on the patterns is manual.
