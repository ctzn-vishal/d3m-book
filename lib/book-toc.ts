import type { Article, Book } from '@/lib/book-types';

export const book: Book = {
  title: 'Data Driven Decision Making',
  subtitle: 'From Business Questions to Visual Evidence, Algorithms, and AI Workflows',
  parts: [
    {
      numeral: '0',
      title: 'The D3M Mindset',
      chapters: [
        {
          number: 0,
          title: 'From Metrics to Decisions',
          articles: [
            { slug: 'ch00-0-foreword', number: '0.0', title: 'Foreword: How to Read This Book', status: 'published' },
            { slug: 'ch00-1-what-is-d3m', number: '0.1', title: 'What Is Data Driven Decision Making?', status: 'published' },
            { slug: 'ch00-2-evidence-stack', number: '0.2', title: 'The D3M Evidence Stack', status: 'published' },
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
            { slug: 'ch01-what-is-a-dataset', number: '1.1', title: 'What Is a Dataset?', status: 'published' },
            { slug: 'ch02-data-structures', number: '1.2', title: 'Data Structures', status: 'published' },
            { slug: 'ch03-variable-types', number: '1.3', title: 'Variable Types and Measurement', status: 'published' },
          ],
        },
        {
          number: 2,
          title: 'Working With Business Tables',
          articles: [
            { slug: 'ch04-sql-like-excel', number: '2.1', title: 'SQL Like Excel', status: 'published' },
            { slug: 'ch05-joining-data', number: '2.2', title: 'Joining Data', status: 'published' },
            { slug: 'ch06-reshaping-data', number: '2.3', title: 'Reshaping Data', status: 'published' },
          ],
        },
        {
          number: 3,
          title: 'Metrics, Transformations, and Data Trust',
          articles: [
            { slug: 'ch07-transformations-and-metrics', number: '3.1', title: 'Transformations and Business Metrics', status: 'published' },
            { slug: 'ch08-data-quality', number: '3.2', title: 'Data Quality and Measurement Bias', status: 'published' },
          ],
        },
        {
          number: 4,
          title: 'Data Language Studio',
          articles: [
            { slug: 'data-language-studio', number: '4.1', title: 'Data Language Studio', status: 'published' },
          ],
        },
      ],
    },
    {
      numeral: 'II',
      title: 'Visual Evidence: From Charts to Dashboards',
      chapters: [
        {
          number: 5,
          title: 'Chart Grammar for Business Questions',
          articles: [
            { slug: 'ch09-exploratory-viz', number: '5.1', title: 'Exploratory Visualization and Dashboards', status: 'published' },
            { slug: 'chart-atlas', number: '5.2', title: 'Chart Atlas', status: 'published' },
          ],
        },
        {
          number: 6,
          title: 'Comparison Design and Small Multiples',
          articles: [
            { slug: 'visual-comparison-baselines', number: '6.1', title: 'Baselines, Indexes, and Benchmarks', status: 'published' },
            { slug: 'small-multiples-for-heterogeneity', number: '6.2', title: 'Small Multiples for Heterogeneity', status: 'published' },
          ],
        },
        {
          number: 7,
          title: 'Uncertainty and Statistical Charts',
          articles: [
            { slug: 'uncertainty-for-managers', number: '7.1', title: 'Uncertainty for Managers', status: 'published' },
            { slug: 'statistical-charts-before-statistics', number: '7.2', title: 'Statistical Charts Before Statistics', status: 'published' },
          ],
        },
        {
          number: 8,
          title: 'Dashboards as Decision Systems',
          articles: [
            { slug: 'dashboard-decision-systems', number: '8.1', title: 'Dashboard Decision Systems', status: 'published' },
            { slug: 'ch10-capstone-growth-diagnostic', number: '8.2', title: 'Visual Decision Brief Studio', status: 'published' },
          ],
        },
      ],
    },
    {
      numeral: 'III',
      title: 'Quantifying Effects: Experiments, Causality, Regression, and Pricing',
      chapters: [
        {
          number: 9,
          title: 'From Metrics to Counterfactuals',
          articles: [
            { slug: 'ch11-from-metrics-to-decisions', number: '9.1', title: 'From Metrics to Decisions', status: 'published' },
            { slug: 'ch12-causality-counterfactual', number: '9.2', title: 'Causality and the Counterfactual', status: 'published' },
          ],
        },
        {
          number: 10,
          title: 'Experiments and Bias in Historical Data',
          articles: [
            { slug: 'ch13-experiments-ab-testing', number: '10.1', title: 'Experiments and A/B Testing', status: 'published' },
            { slug: 'ch14-why-historical-data-is-hard', number: '10.2', title: 'Why Historical Data Is Hard', status: 'published' },
          ],
        },
        {
          number: 11,
          title: 'Regression and Identification',
          articles: [
            { slug: 'ch15-regression-effect-isolation', number: '11.1', title: 'Regression as Effect Isolation', status: 'published' },
            { slug: 'ch16-identification', number: '11.2', title: 'Identification', status: 'published' },
            { slug: 'ch17-panel-fixed-effects', number: '11.3', title: 'Panel Data and Fixed Effects', status: 'published' },
          ],
        },
        {
          number: 12,
          title: 'Causal Designs for Field Data',
          articles: [
            { slug: 'ch18-difference-in-differences', number: '12.1', title: 'Difference-in-Differences', status: 'published' },
            { slug: 'ch19-synthetic-control', number: '12.2', title: 'Synthetic Control', status: 'published' },
            { slug: 'ch20-heterogeneous-effects', number: '12.3', title: 'Heterogeneous Treatment Effects', status: 'published' },
          ],
        },
        {
          number: 13,
          title: 'Pricing and Managerial Levers',
          articles: [
            { slug: 'ch21-price-elasticity', number: '13.1', title: 'Price Elasticity', status: 'published' },
            { slug: 'ch22-cross-price-elasticity', number: '13.2', title: 'Cross-Price Elasticity and Substitution', status: 'published' },
            { slug: 'ch23-elasticity-to-pricing', number: '13.3', title: 'From Elasticity to Pricing Decisions', status: 'published' },
            { slug: 'ch24-capstone-pricing-promotion', number: '13.4', title: 'Pricing and Promotion Strategy Studio', status: 'published' },
          ],
        },
      ],
    },
    {
      numeral: 'IV',
      title: 'Language of Algorithms: Prediction, Segmentation, and Model Evaluation',
      chapters: [
        {
          number: 14,
          title: 'Predictive Task Design',
          articles: [
            { slug: 'ch25-rules-to-algorithms', number: '14.1', title: 'From Business Rules to Algorithms', status: 'published' },
            { slug: 'ch26-supervised-setup', number: '14.2', title: 'The Supervised Learning Setup', status: 'published' },
            { slug: 'ch27-train-test-generalization', number: '14.3', title: 'Train/Test Splits, Generalization, and Leakage', status: 'published' },
            { slug: 'ch28-feature-engineering', number: '14.4', title: 'Feature Engineering', status: 'published' },
          ],
        },
        {
          number: 15,
          title: 'Supervised Models and Business Evaluation',
          articles: [
            { slug: 'ch29-logistic-churn', number: '15.1', title: 'Logistic Regression for Churn Scoring', status: 'published' },
            { slug: 'ch30-classification-evaluation', number: '15.2', title: 'Classification Evaluation', status: 'published' },
            { slug: 'ch31-numeric-prediction', number: '15.3', title: 'Numeric Prediction', status: 'published' },
            { slug: 'ch32-trees-ensembles', number: '15.4', title: 'Trees and Ensembles', status: 'published' },
            { slug: 'ch33-automl-explainability', number: '15.5', title: 'AutoML, Explainability, and Model Cards', status: 'published' },
          ],
        },
        {
          number: 16,
          title: 'Segmentation and Latent Structure',
          articles: [
            { slug: 'ch36-unsupervised-segmentation', number: '16.1', title: 'Clustering for Segmentation', status: 'published' },
            { slug: 'ch37-pca-perceptual-maps', number: '16.2', title: 'PCA, Factor Analysis, and Perceptual Maps', status: 'published' },
            { slug: 'ch37b-tsne-umap', number: '16.3', title: 'Nonlinear Maps: t-SNE and UMAP', status: 'published' },
          ],
        },
        {
          number: 17,
          title: 'Targeting, Ranking, and Operating ML',
          articles: [
            { slug: 'ch38-targeting-lookalikes', number: '17.1', title: 'From Segments to Targeting: Ad Platforms and Lookalikes', status: 'published' },
            { slug: 'ch39-recommenders-ranking', number: '17.2', title: 'Recommenders and Ranking', status: 'published' },
            { slug: 'ch40-deployment-monitoring', number: '17.3', title: 'Deployment, Monitoring, and Drift', status: 'published' },
            { slug: 'ch41-capstone-customer-intelligence', number: '17.4', title: 'Customer Intelligence Studio', status: 'published' },
          ],
        },
      ],
    },
    {
      numeral: 'V',
      title: 'Unstructured Data, Embeddings, and Generative AI',
      chapters: [
        {
          number: 18,
          title: 'Text as Business Data',
          articles: [
            { slug: 'ch42a-structured-to-unstructured', number: '18.1', title: 'From Structured to Unstructured Data', status: 'published' },
            { slug: 'ch42b-text-as-data', number: '18.2', title: 'Text as Data', status: 'published' },
            { slug: 'ch42-preprocessing-tfidf', number: '18.3', title: 'Preprocessing, Bag-of-Words, and TF-IDF', status: 'published' },
            { slug: 'ch43-text-classification', number: '18.4', title: 'Text Classification and Sentiment', status: 'published' },
            { slug: 'ch44-topic-models', number: '18.5', title: 'Topic Models and Text Dashboards', status: 'published' },
            { slug: 'ch45-limits-of-classical-nlp', number: '18.6', title: 'Limits of Classical NLP', status: 'published' },
          ],
        },
        {
          number: 19,
          title: 'Embeddings and Measured Constructs',
          articles: [
            { slug: 'ch46-embeddings', number: '19.1', title: 'What Are Embeddings?', status: 'published' },
            { slug: 'ch47-semantic-search', number: '19.2', title: 'Semantic Search and Brand Positioning', status: 'published' },
            { slug: 'ch47b-gpt-measurement', number: '19.3', title: 'GPT-as-Measurement: From Surface Features to Constructs', status: 'published' },
          ],
        },
        {
          number: 20,
          title: 'Retrieval, Vision, and Multimodal Workflows',
          articles: [
            { slug: 'ch48-rag', number: '20.1', title: 'Retrieval-Augmented Generation', status: 'published' },
            { slug: 'ch49-vision-fundamentals', number: '20.2', title: 'Computer Vision Fundamentals', status: 'published' },
            { slug: 'ch49b-ocr-document-ai', number: '20.3', title: 'OCR and Document AI', status: 'published' },
            { slug: 'ch49c-multimodal-ai', number: '20.4', title: 'Multimodal AI', status: 'published' },
          ],
        },
        {
          number: 21,
          title: 'LLMs, Prompting, and Structured Workflows',
          articles: [
            { slug: 'ch50-llms-capabilities', number: '21.1', title: 'What LLMs Do — Capabilities and Limits', status: 'published' },
            { slug: 'ch50b-prompting', number: '21.2', title: 'Prompting as Task Design', status: 'published' },
            { slug: 'ch50c-structured-outputs', number: '21.3', title: 'Structured Outputs and Extraction', status: 'published' },
            { slug: 'ch51-agents-tools', number: '21.4', title: 'Agents and Tool Use', status: 'published' },
          ],
        },
        {
          number: 22,
          title: 'AI Evaluation, Governance, and Customer Voice Studio',
          articles: [
            { slug: 'ch52-ai-governance', number: '22.1', title: 'AI Evaluation, Risk, and Governance', status: 'published' },
            { slug: 'ch53-capstone-customer-voice', number: '22.2', title: 'Customer Voice Intelligence Studio', status: 'published' },
          ],
        },
      ],
    },
    {
      numeral: 'VI',
      title: 'Operating the D3M System',
      chapters: [
        {
          number: 23,
          title: 'Reusable Evidence Assets',
          articles: [
            { slug: 'ch54-data-product-view', number: '23.1', title: 'The Data Product View', status: 'published' },
          ],
        },
        {
          number: 24,
          title: 'Decision Communication and Learning Loops',
          articles: [
            { slug: 'ch55-decision-memos', number: '24.1', title: 'Decision Memos', status: 'published' },
            { slug: 'ch56-monitoring-feedback', number: '24.2', title: 'Monitoring, Feedback, and Learning Loops', status: 'published' },
          ],
        },
        {
          number: 25,
          title: 'Final D3M Executive Challenge',
          articles: [
            { slug: 'ch57-final-integrative-case', number: '25.1', title: 'Final Integrative Case: The Bean &amp; Basket Expansion', status: 'published' },
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
