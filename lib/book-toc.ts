import type { Article, Book } from '@/lib/book-types';

export const book: Book = {
  title: 'Data Driven Decision Making',
  subtitle: 'From Business Questions to Evidence, Algorithms, and AI Workflows',
  parts: [
    {
      numeral: '0',
      title: 'The D3M Mindset: From Metrics to Decisions',
      chapters: [
        {
          number: 0.1,
          title: 'What Is Data Driven Decision Making?',
          articles: [
            { slug: 'ch00-1-what-is-d3m', number: '0.1', title: 'What Is Data Driven Decision Making?', status: 'planned' },
          ],
        },
        {
          number: 0.2,
          title: 'The D3M Evidence Stack',
          articles: [
            { slug: 'ch00-2-evidence-stack', number: '0.2', title: 'The D3M Evidence Stack', status: 'planned' },
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
          title: 'What Is a Dataset?',
          articles: [
            { slug: 'ch01-what-is-a-dataset', number: '1', title: 'What Is a Dataset?', status: 'draft' },
          ],
        },
        {
          number: 2,
          title: 'Data Structures: Cross-Sectional, Time-Series, Panel, Geo, Network',
          articles: [
            { slug: 'ch02-data-structures', number: '2', title: 'Data Structures', status: 'planned' },
          ],
        },
        {
          number: 3,
          title: 'Variable Types and Measurement Choices',
          articles: [
            { slug: 'ch03-variable-types', number: '3', title: 'Variable Types and Measurement', status: 'planned' },
          ],
        },
        {
          number: 4,
          title: 'SQL Like Excel: Query Operations for Managers',
          articles: [
            { slug: 'ch04-sql-like-excel', number: '4', title: 'SQL Like Excel', status: 'planned' },
          ],
        },
        {
          number: 5,
          title: 'Joining Data: How Business Context Enters a Table',
          articles: [
            { slug: 'ch05-joining-data', number: '5', title: 'Joining Data', status: 'planned' },
          ],
        },
        {
          number: 6,
          title: 'Reshaping Data: Wide, Long, and Analysis-Ready',
          articles: [
            { slug: 'ch06-reshaping-data', number: '6', title: 'Reshaping Data', status: 'planned' },
          ],
        },
        {
          number: 7,
          title: 'Transformations and Business Metrics',
          articles: [
            { slug: 'ch07-transformations-and-metrics', number: '7', title: 'Transformations and Business Metrics', status: 'planned' },
          ],
        },
        {
          number: 8,
          title: 'Data Quality, Missingness, Outliers, and Measurement Bias',
          articles: [
            { slug: 'ch08-data-quality', number: '8', title: 'Data Quality and Measurement Bias', status: 'planned' },
          ],
        },
        {
          number: 9,
          title: 'Exploratory Visualization and BI Dashboards',
          articles: [
            { slug: 'ch09-exploratory-viz', number: '9', title: 'Exploratory Visualization and Dashboards', status: 'planned' },
          ],
        },
        {
          number: 10,
          title: 'Capstone: Bean & Basket Coffee Growth Diagnostic',
          articles: [
            { slug: 'ch10-capstone-growth-diagnostic', number: '10', title: 'Capstone: Growth Diagnostic', status: 'planned' },
          ],
        },
      ],
    },
    {
      numeral: 'II',
      title: 'Quantifying Metrics: Effects, Experiments, Causality, and Pricing',
      chapters: [
        {
          number: 11,
          title: 'From Metrics to Decisions',
          articles: [
            { slug: 'ch11-from-metrics-to-decisions', number: '11', title: 'From Metrics to Decisions', status: 'planned' },
          ],
        },
        {
          number: 12,
          title: 'Causality and the Counterfactual',
          articles: [
            { slug: 'ch12-causality-counterfactual', number: '12', title: 'Causality and the Counterfactual', status: 'planned' },
          ],
        },
        {
          number: 13,
          title: 'Experiments and A/B Testing',
          articles: [
            { slug: 'ch13-experiments-ab-testing', number: '13', title: 'Experiments and A/B Testing', status: 'planned' },
          ],
        },
        {
          number: 14,
          title: 'Why Historical Data Is Hard',
          articles: [
            { slug: 'ch14-why-historical-data-is-hard', number: '14', title: 'Why Historical Data Is Hard', status: 'planned' },
          ],
        },
        {
          number: 15,
          title: 'Regression as Effect Isolation',
          articles: [
            { slug: 'ch15-regression-effect-isolation', number: '15', title: 'Regression as Effect Isolation', status: 'planned' },
          ],
        },
        {
          number: 16,
          title: 'Identification: The Core Causal Argument',
          articles: [
            { slug: 'ch16-identification', number: '16', title: 'Identification', status: 'planned' },
          ],
        },
        {
          number: 17,
          title: 'Panel Data and Fixed Effects',
          articles: [
            { slug: 'ch17-panel-fixed-effects', number: '17', title: 'Panel Data and Fixed Effects', status: 'planned' },
          ],
        },
        {
          number: 18,
          title: 'Difference-in-Differences',
          articles: [
            { slug: 'ch18-difference-in-differences', number: '18', title: 'Difference-in-Differences', status: 'planned' },
          ],
        },
        {
          number: 19,
          title: 'Synthetic Control',
          articles: [
            { slug: 'ch19-synthetic-control', number: '19', title: 'Synthetic Control', status: 'planned' },
          ],
        },
        {
          number: 20,
          title: 'Heterogeneous Treatment Effects',
          articles: [
            { slug: 'ch20-heterogeneous-effects', number: '20', title: 'Heterogeneous Treatment Effects', status: 'planned' },
          ],
        },
        {
          number: 21,
          title: 'Price Elasticity: Demand Response',
          articles: [
            { slug: 'ch21-price-elasticity', number: '21', title: 'Price Elasticity', status: 'planned' },
          ],
        },
        {
          number: 22,
          title: 'Cross-Price Elasticity and Substitution',
          articles: [
            { slug: 'ch22-cross-price-elasticity', number: '22', title: 'Cross-Price Elasticity and Substitution', status: 'planned' },
          ],
        },
        {
          number: 23,
          title: 'From Elasticity to Pricing Decisions',
          articles: [
            { slug: 'ch23-elasticity-to-pricing', number: '23', title: 'From Elasticity to Pricing Decisions', status: 'planned' },
          ],
        },
        {
          number: 24,
          title: 'Capstone: Pricing and Promotion Strategy',
          articles: [
            { slug: 'ch24-capstone-pricing-promotion', number: '24', title: 'Capstone: Pricing and Promotion', status: 'planned' },
          ],
        },
      ],
    },
    {
      numeral: 'III',
      title: 'Language of Algorithms: Prediction, Segmentation, and Model Evaluation',
      chapters: [
        {
          number: 25,
          title: 'From Business Rules to Algorithms',
          articles: [
            { slug: 'ch25-rules-to-algorithms', number: '25', title: 'From Business Rules to Algorithms', status: 'planned' },
          ],
        },
        {
          number: 26,
          title: 'The Supervised Learning Setup',
          articles: [
            { slug: 'ch26-supervised-setup', number: '26', title: 'The Supervised Learning Setup', status: 'planned' },
          ],
        },
        {
          number: 27,
          title: 'Train/Test Splits, Generalization, and Leakage',
          articles: [
            { slug: 'ch27-train-test-generalization', number: '27', title: 'Train/Test Splits and Generalization', status: 'planned' },
          ],
        },
        {
          number: 28,
          title: 'Feature Engineering: Business Knowledge as Model Input',
          articles: [
            { slug: 'ch28-feature-engineering', number: '28', title: 'Feature Engineering', status: 'planned' },
          ],
        },
        {
          number: 29,
          title: 'Logistic Regression for Churn Prediction',
          articles: [
            { slug: 'ch29-logistic-churn', number: '29', title: 'Logistic Regression for Churn', status: 'planned' },
          ],
        },
        {
          number: 30,
          title: 'Classification Evaluation: Accuracy Is Not Enough',
          articles: [
            { slug: 'ch30-classification-evaluation', number: '30', title: 'Classification Evaluation', status: 'planned' },
          ],
        },
        {
          number: 31,
          title: 'Numeric Prediction: Airbnb-Style Price Prediction',
          articles: [
            { slug: 'ch31-numeric-prediction', number: '31', title: 'Numeric Prediction', status: 'planned' },
          ],
        },
        {
          number: 32,
          title: 'Decision Trees',
          articles: [
            { slug: 'ch32-decision-trees', number: '32', title: 'Decision Trees', status: 'planned' },
          ],
        },
        {
          number: 33,
          title: 'Ensembles: Random Forests and Gradient Boosting',
          articles: [
            { slug: 'ch33-ensembles', number: '33', title: 'Ensembles', status: 'planned' },
          ],
        },
        {
          number: 34,
          title: 'AutoML and Model Selection',
          articles: [
            { slug: 'ch34-automl-model-selection', number: '34', title: 'AutoML and Model Selection', status: 'planned' },
          ],
        },
        {
          number: 35,
          title: 'Explainability and Model Cards',
          articles: [
            { slug: 'ch35-explainability-model-cards', number: '35', title: 'Explainability and Model Cards', status: 'planned' },
          ],
        },
        {
          number: 36,
          title: 'Unsupervised Learning and Segmentation',
          articles: [
            { slug: 'ch36-unsupervised-segmentation', number: '36', title: 'Unsupervised Learning and Segmentation', status: 'planned' },
          ],
        },
        {
          number: 37,
          title: 'PCA, Perceptual Mapping, t-SNE, and UMAP',
          articles: [
            { slug: 'ch37-pca-perceptual-maps', number: '37', title: 'PCA and Perceptual Maps', status: 'planned' },
          ],
        },
        {
          number: 38,
          title: 'Recommenders, Ranking, and Deployment Monitoring',
          articles: [
            { slug: 'ch38-recommenders-deployment', number: '38', title: 'Recommenders and Deployment', status: 'planned' },
          ],
        },
        {
          number: 39,
          title: 'Capstone: Customer Intelligence and Structured ML',
          articles: [
            { slug: 'ch39-capstone-customer-intelligence', number: '39', title: 'Capstone: Customer Intelligence', status: 'planned' },
          ],
        },
      ],
    },
    {
      numeral: 'IV',
      title: 'Unstructured Data, Embeddings, and Generative AI',
      chapters: [
        {
          number: 40,
          title: 'From Structured to Unstructured Data',
          articles: [
            { slug: 'ch40-structured-to-unstructured', number: '40', title: 'From Structured to Unstructured', status: 'planned' },
          ],
        },
        {
          number: 41,
          title: 'Text as Data',
          articles: [
            { slug: 'ch41-text-as-data', number: '41', title: 'Text as Data', status: 'planned' },
          ],
        },
        {
          number: 42,
          title: 'Text Preprocessing, Bag-of-Words, and TF-IDF',
          articles: [
            { slug: 'ch42-preprocessing-tfidf', number: '42', title: 'Preprocessing, BoW, and TF-IDF', status: 'planned' },
          ],
        },
        {
          number: 43,
          title: 'Text Classification and Sentiment Analysis',
          articles: [
            { slug: 'ch43-text-classification', number: '43', title: 'Text Classification and Sentiment', status: 'planned' },
          ],
        },
        {
          number: 44,
          title: 'Topic Models and Text Dashboards',
          articles: [
            { slug: 'ch44-topic-models', number: '44', title: 'Topic Models and Text Dashboards', status: 'planned' },
          ],
        },
        {
          number: 45,
          title: 'Limits of Classical NLP',
          articles: [
            { slug: 'ch45-limits-of-classical-nlp', number: '45', title: 'Limits of Classical NLP', status: 'planned' },
          ],
        },
        {
          number: 46,
          title: 'What Are Embeddings?',
          articles: [
            { slug: 'ch46-embeddings', number: '46', title: 'What Are Embeddings?', status: 'planned' },
          ],
        },
        {
          number: 47,
          title: 'Semantic Search, Clustering, and Brand Positioning',
          articles: [
            { slug: 'ch47-semantic-search', number: '47', title: 'Semantic Search and Brand Positioning', status: 'planned' },
          ],
        },
        {
          number: 48,
          title: 'Retrieval-Augmented Generation',
          articles: [
            { slug: 'ch48-rag', number: '48', title: 'Retrieval-Augmented Generation', status: 'planned' },
          ],
        },
        {
          number: 49,
          title: 'Computer Vision, OCR, and Multimodal AI',
          articles: [
            { slug: 'ch49-vision-multimodal', number: '49', title: 'Computer Vision and Multimodal AI', status: 'planned' },
          ],
        },
        {
          number: 50,
          title: 'LLMs, Prompting, and Structured Outputs',
          articles: [
            { slug: 'ch50-llms-prompting', number: '50', title: 'LLMs, Prompting, Structured Outputs', status: 'planned' },
          ],
        },
        {
          number: 51,
          title: 'Agents and AI Workflows',
          articles: [
            { slug: 'ch51-agents-workflows', number: '51', title: 'Agents and AI Workflows', status: 'planned' },
          ],
        },
        {
          number: 52,
          title: 'Evaluation, Risk, and Governance',
          articles: [
            { slug: 'ch52-ai-governance', number: '52', title: 'Evaluation, Risk, and Governance', status: 'planned' },
          ],
        },
        {
          number: 53,
          title: 'Capstone: Customer Voice Intelligence System',
          articles: [
            { slug: 'ch53-capstone-customer-voice', number: '53', title: 'Capstone: Customer Voice Intelligence', status: 'planned' },
          ],
        },
      ],
    },
    {
      numeral: 'V',
      title: 'Operating the D3M System',
      chapters: [
        {
          number: 54,
          title: 'The Data Product View of Decision Making',
          articles: [
            { slug: 'ch54-data-product-view', number: '54', title: 'The Data Product View', status: 'planned' },
          ],
        },
        {
          number: 55,
          title: 'From Analysis to Action: Decision Memos',
          articles: [
            { slug: 'ch55-decision-memos', number: '55', title: 'Decision Memos', status: 'planned' },
          ],
        },
        {
          number: 56,
          title: 'Monitoring, Feedback, and Learning Loops',
          articles: [
            { slug: 'ch56-monitoring-feedback', number: '56', title: 'Monitoring, Feedback, and Learning Loops', status: 'planned' },
          ],
        },
        {
          number: 57,
          title: 'Final Integrative Case: The D3M Executive Challenge',
          articles: [
            { slug: 'ch57-final-integrative-case', number: '57', title: 'Final Integrative Case', status: 'planned' },
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
