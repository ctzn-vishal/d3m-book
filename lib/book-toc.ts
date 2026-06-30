import type { Article, Book, Chapter } from '@/lib/book-types';

export const book: Book = {
  title: 'Data Driven Decision Making',
  subtitle: 'From Business Questions to Visual Evidence, Algorithms, and AI Workflows',
  parts: [
    {
      numeral: '0',
      title: 'The Modern Data Operating System',
      chapters: [
        {
          number: 0,
          title: 'From Data Traces to Decisions',
          articles: [
            { slug: 'ch00-foreword', number: '0.0', title: 'Foreword: How to Read This Book', status: 'published' },
            { slug: 'ch00-data-system', number: '0.1', title: 'Data, Storage, Use, and the Decision Loop', status: 'published' },
          ],
        },
      ],
    },
    {
      numeral: 'I',
      title: 'Language of Data: Reading the Business in Rows and Columns',
      chapters: [
        {
          number: 1,
          title: 'Reading Data as Business Evidence',
          articles: [
            { slug: 'ch01-reading-data', number: '1.1', title: 'Grain, Structure, and Measurement', status: 'published' },
          ],
        },
        {
          number: 2,
          title: 'Working With Business Tables',
          articles: [
            { slug: 'ch02-sql', number: '2.1', title: 'SQL Like Excel', status: 'published' },
            { slug: 'ch02-joins', number: '2.2', title: 'Joining Data', status: 'published' },
            { slug: 'ch02-reshaping', number: '2.3', title: 'Reshaping Data', status: 'published' },
            { slug: 'ch02-metrics', number: '2.4', title: 'Transformations and Business Metrics', status: 'published' },
            { slug: 'ch02-data-quality', number: '2.5', title: 'Data Quality and Measurement Bias', status: 'published' },
            { slug: 'ch02-studio-data-language', number: '2.6', title: 'Data Language Studio', status: 'published' },
          ],
        },
      ],
    },
    {
      numeral: 'II',
      title: 'Visual Evidence: From Charts to Dashboards',
      chapters: [
        {
          number: 3,
          title: 'Chart Grammar for Business Questions',
          articles: [
            { slug: 'ch03-exploratory-viz', number: '3.1', title: 'Exploratory Visualization and Dashboards', status: 'published' },
            { slug: 'ch03-chart-atlas', number: '3.2', title: 'Chart Atlas', status: 'published' },
            { slug: 'ch03-concentration-case', number: '3.3', title: 'Case Study: Market Concentration Metrics', status: 'published' },
          ],
        },
        {
          number: 4,
          title: 'Comparison, Uncertainty, and Dashboards',
          articles: [
            { slug: 'ch04-baselines', number: '4.1', title: 'Baselines, Indexes, and Benchmarks', status: 'published' },
            { slug: 'ch04-small-multiples', number: '4.2', title: 'Small Multiples for Heterogeneity', status: 'published' },
            { slug: 'ch04-uncertainty', number: '4.3', title: 'Uncertainty for Managers', status: 'published' },
            { slug: 'ch04-statistical-charts', number: '4.4', title: 'Statistical Charts Before Statistics', status: 'published' },
            { slug: 'ch04-dashboards', number: '4.5', title: 'Dashboard Decision Systems', status: 'published' },
            { slug: 'ch04-studio-visual-brief', number: '4.6', title: 'Visual Decision Brief Studio', status: 'published' },
          ],
        },
      ],
    },
    {
      numeral: 'III',
      title: 'Quantifying Effects: Experiments, Causality, Regression, and Pricing',
      chapters: [
        {
          number: 5,
          title: 'From Metrics to Counterfactuals',
          articles: [
            { slug: 'ch05-metrics-to-decisions', number: '5.1', title: 'From Metrics to Decisions', status: 'published' },
            { slug: 'ch05-counterfactual', number: '5.2', title: 'Causality and the Counterfactual', status: 'published' },
            { slug: 'ch05-experiments', number: '5.3', title: 'Experiments and A/B Testing', status: 'published' },
            { slug: 'ch05-historical-data', number: '5.4', title: 'Why Historical Data Is Hard', status: 'published' },
          ],
        },
        {
          number: 6,
          title: 'Regression and Identification',
          articles: [
            { slug: 'ch06-regression', number: '6.1', title: 'Regression as Effect Isolation', status: 'published' },
            { slug: 'ch06-identification', number: '6.2', title: 'Identification', status: 'published' },
            { slug: 'ch06-fixed-effects', number: '6.3', title: 'Panel Data and Fixed Effects', status: 'published' },
          ],
        },
        {
          number: 7,
          title: 'Causal Designs for Field Data',
          articles: [
            { slug: 'ch07-did', number: '7.1', title: 'Difference-in-Differences', status: 'published' },
            { slug: 'ch07-synthetic-control', number: '7.2', title: 'Synthetic Control', status: 'published' },
            { slug: 'ch07-heterogeneous-effects', number: '7.3', title: 'Heterogeneous Treatment Effects', status: 'published' },
          ],
        },
        {
          number: 8,
          title: 'Pricing and Managerial Levers',
          articles: [
            { slug: 'ch08-price-elasticity', number: '8.1', title: 'Price Elasticity', status: 'published' },
            { slug: 'ch08-cross-price-elasticity', number: '8.2', title: 'Cross-Price Elasticity and Substitution', status: 'published' },
            { slug: 'ch08-pricing-decisions', number: '8.3', title: 'From Elasticity to Pricing Decisions', status: 'published' },
            { slug: 'ch08-studio-pricing', number: '8.4', title: 'Pricing and Promotion Strategy Studio', status: 'published' },
          ],
        },
      ],
    },
    {
      numeral: 'IV',
      title: 'Language of Algorithms: Prediction, Segmentation, and Model Evaluation',
      chapters: [
        {
          number: 9,
          title: 'Predictive Task Design',
          articles: [
            { slug: 'ch09-rules-to-algorithms', number: '9.1', title: 'From Business Rules to Algorithms', status: 'published' },
            { slug: 'ch09-supervised-setup', number: '9.2', title: 'The Supervised Learning Setup', status: 'published' },
            { slug: 'ch09-generalization', number: '9.3', title: 'Train/Test Splits, Generalization, and Leakage', status: 'published' },
            { slug: 'ch09-feature-engineering', number: '9.4', title: 'Feature Engineering', status: 'published' },
          ],
        },
        {
          number: 10,
          title: 'Supervised Models and Business Evaluation',
          articles: [
            { slug: 'ch10-logistic-churn', number: '10.1', title: 'Logistic Regression for Churn Scoring', status: 'published' },
            { slug: 'ch10-classification-eval', number: '10.2', title: 'Classification Evaluation', status: 'published' },
            { slug: 'ch10-numeric-prediction', number: '10.3', title: 'Numeric Prediction', status: 'published' },
            { slug: 'ch10-trees-ensembles', number: '10.4', title: 'Trees and Ensembles', status: 'published' },
            { slug: 'ch10-automl-explainability', number: '10.5', title: 'AutoML, Explainability, and Model Cards', status: 'published' },
            { slug: 'ch10-renthop-case', number: '10.6', title: 'Case Study: RentHop Hot Listings', status: 'published' },
          ],
        },
        {
          number: 11,
          title: 'Segmentation and Latent Structure',
          articles: [
            { slug: 'ch11-clustering', number: '11.1', title: 'Clustering for Segmentation', status: 'published' },
            { slug: 'ch11-pca', number: '11.2', title: 'PCA, Factor Analysis, and Perceptual Maps', status: 'published' },
            { slug: 'ch11-tsne-umap', number: '11.3', title: 'Nonlinear Maps: t-SNE and UMAP', status: 'published' },
            { slug: 'ch11-lottery-case', number: '11.4', title: 'Case Study: Lottery ZIP Psychographics', status: 'published' },
          ],
        },
        {
          number: 12,
          title: 'Targeting, Ranking, and Operating ML',
          articles: [
            { slug: 'ch12-targeting', number: '12.1', title: 'From Segments to Targeting: Ad Platforms and Lookalikes', status: 'published' },
            { slug: 'ch12-recommenders', number: '12.2', title: 'Recommenders and Ranking', status: 'published' },
            { slug: 'ch12-deployment-monitoring', number: '12.3', title: 'Deployment, Monitoring, and Drift', status: 'published' },
            { slug: 'ch12-studio-customer-intel', number: '12.4', title: 'Customer Intelligence Studio', status: 'published' },
          ],
        },
      ],
    },
    {
      numeral: 'V',
      title: 'Unstructured Data, Embeddings, and Generative AI',
      chapters: [
        {
          number: 13,
          title: 'Text as Business Data',
          articles: [
            { slug: 'ch13-structured-to-unstructured', number: '13.1', title: 'From Structured to Unstructured Data', status: 'published' },
            { slug: 'ch13-text-as-data', number: '13.2', title: 'Text as Data', status: 'published' },
            { slug: 'ch13-preprocessing-tfidf', number: '13.3', title: 'Preprocessing, Bag-of-Words, and TF-IDF', status: 'published' },
            { slug: 'ch13-text-classification', number: '13.4', title: 'Text Classification and Sentiment', status: 'published' },
            { slug: 'ch13-topic-models', number: '13.5', title: 'Topic Models and Text Dashboards', status: 'published' },
            { slug: 'ch13-classical-nlp-limits', number: '13.6', title: 'Limits of Classical NLP', status: 'published' },
          ],
        },
        {
          number: 14,
          title: 'Applied Text, Embeddings, and Measured Constructs',
          articles: [
            { slug: 'ch14-trump-case', number: '14.1', title: 'Case Study: Trump Tweet Source Classification', status: 'published' },
            { slug: 'ch14-goose-island-case', number: '14.2', title: 'Case Study: Goose Island Acquisition Sentiment', status: 'published' },
            { slug: 'ch14-embeddings', number: '14.3', title: 'Embeddings and Semantic Search', status: 'published' },
            { slug: 'ch14-gpt-measurement', number: '14.4', title: 'GPT-as-Measurement: From Surface Features to Constructs', status: 'published' },
          ],
        },
        {
          number: 15,
          title: 'Retrieval, Vision, and Multimodal Workflows',
          articles: [
            { slug: 'ch15-rag', number: '15.1', title: 'Retrieval-Augmented Generation', status: 'published' },
            { slug: 'ch15-vision', number: '15.2', title: 'Computer Vision Fundamentals', status: 'published' },
            { slug: 'ch15-ocr-document-ai', number: '15.3', title: 'OCR and Document AI', status: 'published' },
            { slug: 'ch15-multimodal', number: '15.4', title: 'Multimodal AI', status: 'published' },
          ],
        },
        {
          number: 16,
          title: 'LLMs, Workflows, and Governance',
          articles: [
            { slug: 'ch16-llm-capabilities', number: '16.1', title: 'LLM Capabilities and Prompting', status: 'published' },
            { slug: 'ch16-structured-outputs', number: '16.2', title: 'Structured Outputs and Extraction', status: 'published' },
            { slug: 'ch16-agents-tools', number: '16.3', title: 'Agents and Tool Use', status: 'published' },
            { slug: 'ch16-ai-governance', number: '16.4', title: 'AI Evaluation, Risk, and Governance', status: 'published' },
            { slug: 'ch16-studio-customer-voice', number: '16.5', title: 'Customer Voice Intelligence Studio', status: 'published' },
          ],
        },
      ],
    },
    {
      numeral: 'VI',
      title: 'D3M with AI Agents',
      chapters: [
        {
          number: 17,
          title: 'D3M with AI Agents',
          articles: [
            { slug: 'ch17-agentic-turn', number: '17.1', title: 'The Agentic Turn', status: 'published' },
            { slug: 'ch17-text-to-sql', number: '17.2', title: 'Talking to the Warehouse: Text-to-SQL and the Semantic Layer', status: 'published' },
            { slug: 'ch17-predictive-workflows', number: '17.3', title: 'Automated, Agent-Driven Predictive Workflows', status: 'published' },
            { slug: 'ch17-mcp-orchestration', number: '17.4', title: 'MCP, Tools, and Orchestration', status: 'published' },
            { slug: 'ch17-agent-governance', number: '17.5', title: 'Trust, Evaluation, and Governance of Data Agents', status: 'published' },
            { slug: 'ch17-horizon', number: '17.6', title: 'The Horizon: Where Agent-Operated Analytics Is Headed', status: 'published' },
          ],
        },
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

/** Part navigation: find a part by numeral, with its index and adjacent parts. */
export function findPart(numeral: string) {
  const idx = book.parts.findIndex(p => p.numeral === numeral);
  if (idx === -1) return null;
  return {
    part: book.parts[idx],
    index: idx,
    prev: idx > 0 ? book.parts[idx - 1] : null,
    next: idx < book.parts.length - 1 ? book.parts[idx + 1] : null,
  };
}

/** Flat list of every chapter, tagged with its part — the chapter reading order. */
export const allChapters = book.parts.flatMap((part, partIndex) =>
  part.chapters.map(chapter => ({ chapter, part, partIndex }))
);

/** Chapter navigation: find a chapter by number, with its part and adjacent chapters. */
export function findChapter(number: number) {
  const idx = allChapters.findIndex(c => c.chapter.number === number);
  if (idx === -1) return null;
  const here = allChapters[idx];
  return {
    chapter: here.chapter,
    part: here.part,
    partIndex: here.partIndex,
    prev: idx > 0 ? allChapters[idx - 1] : null,
    next: idx < allChapters.length - 1 ? allChapters[idx + 1] : null,
  };
}

export function getAllPartNumerals(): string[] {
  return book.parts.map(p => p.numeral);
}

/**
 * Landing path for a chapter: its first published article. Every chapter has at
 * least one article, so this always resolves to a real article route. Chapters
 * no longer have a dedicated overview page — every chapter link in the nav
 * (cover, part page, sidebar, breadcrumb) opens directly at the first section.
 */
export function chapterHref(chapter: Chapter): string {
  const first = chapter.articles.find(a => a.status === 'published') ?? chapter.articles[0];
  return `/${first.slug}`;
}

export function getAllChapterNumbers(): number[] {
  return allChapters.map(c => c.chapter.number);
}
