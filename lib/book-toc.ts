import type { Article, Book } from '@/lib/book-types';

export const book: Book = {
  title: 'The Great Sorting',
  subtitle: 'Political division in America, 1972–2024',
  parts: [
    {
      numeral: 'I',
      title: 'Foundations & Methodology',
      chapters: [
        {
          number: 1,
          title: 'Introduction & Methodological Framework',
          articles: [
            { slug: 'ch01-introduction', number: '1', title: 'Introduction & Methodological Framework', status: 'published' },
          ],
        },
      ],
    },
    {
      numeral: 'II',
      title: 'Mapping the Divide — Core Political Attitudes',
      chapters: [
        {
          number: 2,
          title: 'Institutional Confidence — The Erosion of Trust',
          articles: [
            { slug: 'ch02-government-institutions', number: '2.2', title: 'Government Institutions: The Partisan Flip', status: 'published' },
            { slug: 'ch02-knowledge-institutions', number: '2.3', title: 'Knowledge & Expertise Institutions: The Education Divide', status: 'published' },
            { slug: 'ch02-media', number: '2.4', title: 'Media & Information: The Credibility Chasm', status: 'published' },
            { slug: 'ch02-economic-institutions', number: '2.5', title: 'Economic Institutions: Class & Party Intersect', status: 'published' },
            { slug: 'ch02-social-cultural-institutions', number: '2.6', title: 'Social & Cultural Institutions', status: 'published' },
          ],
        },
        {
          number: 3,
          title: 'The Spending Divide — Priorities & Government’s Role',
          articles: [
            { slug: 'ch03-social-welfare', number: '3.2', title: 'The Social Welfare Domain: Care vs. Fairness', status: 'published' },
            { slug: 'ch03-security-order', number: '3.3', title: 'Security & Order: Shared Priorities, Different Emphasis', status: 'planned' },
            { slug: 'ch03-environment-infrastructure', number: '3.4', title: 'Environment & Infrastructure: Emerging Divides', status: 'planned' },
          ],
        },
        {
          number: 4,
          title: 'Social & Cultural Battlegrounds',
          articles: [
            { slug: 'ch04-abortion', number: '4.1', title: 'Abortion Rights — The Persistent Divide', status: 'planned' },
            { slug: 'ch04-civil-liberties', number: '4.2', title: 'Civil Liberties — Free Speech in a Polarized Era', status: 'planned' },
            { slug: 'ch04-sexual-morality', number: '4.3', title: 'Sexual Morality & Social Values', status: 'planned' },
            { slug: 'ch04-racial-attitudes', number: '4.4', title: 'Racial Attitudes & Explanations for Inequality', status: 'planned' },
          ],
        },
        {
          number: 5,
          title: 'Police, Authority & Social Order',
          articles: [
            { slug: 'ch05-police-authority', number: '5', title: 'Police, Authority & Social Order', status: 'planned' },
          ],
        },
      ],
    },
    {
      numeral: 'III',
      title: 'Social Fabric & Lived Experience',
      chapters: [
        { number: 6, title: 'Social Trust — The Foundational Divide', articles: [{ slug: 'ch06-social-trust', number: '6', title: 'Social Trust — The Foundational Divide', status: 'published' }] },
        {
          number: 7,
          title: 'Life Satisfaction & Subjective Well-Being',
          articles: [
            { slug: 'ch07-life-satisfaction', number: '7.1', title: 'Life Satisfaction & Subjective Well-Being', status: 'planned' },
            { slug: 'ch07-anxious-liberal', number: '7.2', title: 'The Anxious Liberal — Ideology, Age & Well-Being', status: 'published' },
          ],
        },
      ],
    },
    {
      numeral: 'IV',
      title: 'The Demographic Foundations of Divide',
      chapters: [
        { number: 8, title: 'The Educational Realignment', articles: [{ slug: 'ch08-educational-realignment', number: '8', title: 'The Educational Realignment', status: 'planned' }] },
        { number: 9, title: 'Gender & Political Identity', articles: [{ slug: 'ch09-gender', number: '9', title: 'Gender & Political Identity', status: 'planned' }] },
        { number: 10, title: 'The White Voter — Majority Dynamics', articles: [{ slug: 'ch10-white-voter', number: '10', title: 'The White Voter — Majority Dynamics', status: 'planned' }] },
      ],
    },
    {
      numeral: 'V',
      title: 'Temporal Dynamics & Synthesis',
      chapters: [
        { number: 11, title: 'The Long View — Five Decades of Change', articles: [{ slug: 'ch11-long-view', number: '11', title: 'The Long View — Five Decades of Change', status: 'planned' }] },
        { number: 12, title: 'The Great Sorting — Political Identity & Ideological Alignment', articles: [{ slug: 'ch12-great-sorting', number: '12', title: 'The Great Sorting', status: 'planned' }] },
        { number: 13, title: 'Issue Sorting, Geographic Patterns & Multi-Dimensional Divides', articles: [{ slug: 'ch13-issue-sorting', number: '13', title: 'Issue Sorting & Geography', status: 'planned' }] },
        { number: 14, title: 'The Multidimensional Divide — Beyond Left vs. Right', articles: [{ slug: 'ch14-multidimensional', number: '14', title: 'The Multidimensional Divide', status: 'planned' }] },
      ],
    },
    {
      numeral: 'VI',
      title: 'Conclusions & Implications',
      chapters: [
        { number: 15, title: 'The State of American Division — Findings & Future', articles: [{ slug: 'ch15-conclusions', number: '15', title: 'The State of American Division', status: 'planned' }] },
      ],
    },
  ],
};

export const allArticles: Array<Article & { partNumeral: string; chapter: number }> =
  book.parts.flatMap(part =>
    part.chapters.flatMap(ch =>
      ch.articles.map(a => ({ ...a, partNumeral: part.numeral, chapter: ch.number }))
    )
  );

export function findArticle(slug: string) {
  const idx = allArticles.findIndex(a => a.slug === slug);
  if (idx === -1) return null;
  return {
    article: allArticles[idx],
    prev: idx > 0 ? allArticles[idx - 1] : null,
    next: idx < allArticles.length - 1 ? allArticles[idx + 1] : null,
  };
}

export function getPublishedSlugs(): string[] {
  return allArticles.filter(a => a.status === 'published').map(a => a.slug);
}

export function getAllSlugs(): string[] {
  return allArticles.map(a => a.slug);
}
