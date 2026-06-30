import type { PartContent, ChapterContent } from '@/lib/book-types';

/**
 * Editorial summary content for the teaching book — Part section-intros and
 * Chapter overviews, drafted from the real article MDX and hand-refined.
 * Kept separate from the structural TOC (book-toc.ts) and the visual system
 * (book-visuals.ts); merged in by the accessors at the bottom.
 *
 * Icons are lucide-react names, chosen so each part and its chapters read as
 * visually distinct in any single view. They resolve through
 * book-visuals.ts#resolveIcon, which falls back safely on an unknown name.
 */

export const partContent: Record<string, PartContent> = {
  '0': {
    tagline: 'The map before the methods',
    summary:
      "This opening part builds the one capability every later technique depends on: seeing a business as a system that turns activity into data, stores it, and converts it into decisions someone owns. Rather than leading with a method, it maps the territory the rest of the book moves through — following a single customer's morning at Bean & Basket to show why a search, an impression, a transaction, a review, and an AI log each capture behavior with a different blind spot — then sorts the storage stack and the workflow families that route evidence to action. It ends on the data-to-decision loop and the test that separates genuine data-driven work from its decorated imitation: an action, a counterfactual comparison, and a threshold.",
    whatYoullLearn: [
      'Read any business event as a data trace and name the specific blind spot baked into how it was recorded',
      'Match a question to the right storage layer across operational SQL, warehouses, local analytics, and vector or graph stores',
      'Route a business question to the workflow family that fits it rather than reaching for a familiar method',
      'Trace a decision around the full data-to-decision loop from source activity through evidence, action, and feedback',
      'Tell genuine data-driven work from data-decorated work using the action, counterfactual, and threshold test',
    ],
    icon: 'Network',
  },
  I: {
    tagline: 'Before any model, read the table',
    summary:
      "This part builds the literacy a manager needs before running any model, because most analytical disasters are settled at the level of the table, not the model. Chapter 1 covers how to read a dataset the way you would read a financial statement — recognizing how a row's grain, a table's shape, and a column's measurement type cap what any analysis can honestly claim. Chapter 2 puts that reading into motion, translating familiar spreadsheet moves into the GROUP BYs, JOINs, and reshapes that scale, while exposing where business reality leaks in: joins that double revenue, averages that secretly weight every store equally, deletes that fabricate a trend. Together they move from passively receiving a dataset to actively governing one, and leave a reusable data-and-metric brief for the rest of the book to build on.",
    whatYoullLearn: [
      "Diagnose a table's grain, shape, and column types before trusting any number it produces",
      'Translate familiar spreadsheet operations into SQL, dplyr, and pandas that run identically and scale',
      'Catch the conceptual errors that survive clean syntax — exploding joins, average-of-ratios, survivorship bias from hard deletes',
      'Convert raw columns into governed metrics with definitions that hold up under scrutiny',
      'Assemble a reusable row-contract, metric-definition, and join-map brief that anchors the rest of the book',
    ],
    icon: 'Rows3',
  },
  II: {
    tagline: 'Charts that answer, not decorate',
    summary:
      "This part is about visual argument: turning a clean dataset into a chart that answers a named business question without quietly overclaiming. Chapter 3 supplies the grammar, matching each visual family to the decision it serves and treating a dashboard as a structured memo from executive question to recommended action. Chapter 4 sharpens the craft — a chart's first choice is its baseline, confidence intervals describe variation rather than cause, and the honest endpoint of any dashboard is the next test to run. Together they move the reader from picking a chart type to defending a one-page board memo with its limits stated out loud.",
    whatYoullLearn: [
      'Map a business question to the right visual family — distribution, comparison, time, relationship, geography, or uncertainty',
      'Structure a dashboard as a memo: KPI, trend, breakdown, drilldown, and a recommended action',
      'Choose the baseline and index a series before choosing color, so comparisons read honestly',
      'Read confidence intervals and small multiples as descriptions of variation, not claims of causation',
      'Assemble grain, joins, metrics, and reshaping into a one-page board memo that names its own causal limits',
    ],
    icon: 'LineChart',
  },
  III: {
    tagline: 'From what happened to what to do',
    summary:
      'This part is about acting on data by asking what would have happened otherwise. Every chapter chases the same object — the counterfactual — and the arc moves from naming it (Chapter 5 reframes any metric as a missing comparison) to identifying it (Chapter 6 makes regression earn the word "causal"), to recovering it from field data no one randomized (Chapter 7\'s difference-in-differences, synthetic control, and heterogeneous effects), to spending it on the firm\'s highest-leverage lever (Chapter 8 turns an elasticity into a price). A single thread of worked evidence — Progresso soup scanner data, a 1,700-store milk experiment, a Zillow-and-cannabis synthetic control — runs through all four, so the same number grows more trustworthy as the design tightens. The discipline it leaves behind is refusing to read a coefficient until you know which counterfactual produced it.',
    whatYoullLearn: [
      'Translate any business metric into a precise causal question — naming the lever, unit, horizon, comparison, and decision threshold before fitting a model',
      'Distinguish identification from estimation, and demand the identification memo and diagnostics that separate a causal coefficient from a precisely-wrong one',
      'Recover treatment effects from unrandomized field data using difference-in-differences, synthetic control, and panel fixed effects, and audit each with balance and placebo checks',
      'Surface heterogeneous effects so a single average lift no longer hides which segments actually pay',
      'Convert an own-price elasticity into an optimal markup via the Lerner rule, and see in dollars why a naive elasticity hands back the wrong price',
    ],
    icon: 'FlaskConical',
  },
  IV: {
    tagline: 'From explaining the past to predicting the next move',
    summary:
      'This part turns the question forward — what will happen next, to whom, and what to do about it — and hands that work to algorithms operating at a scale no analyst could match by hand. The four chapters trace one arc: write the prediction problem down as a Task Contract and guard it against leakage (Chapter 9), build and grade supervised models on a threshold-profit curve rather than raw accuracy (Chapter 10), let the algorithm propose a lens when no target exists (Chapter 11), then push scores into a media budget through targeting, ranking, and the monitoring that keeps a live model honest (Chapter 12). The recurring discipline is that in an AutoML world the human leverage has migrated toward defining the task, crafting features, naming segments, and insisting on incrementality — because a high conversion rate proves selection, not causation.',
    whatYoullLearn: [
      'Write a leakage-proof Task Contract — target, features, unit, and label timing — and choose the right train/test split before any model is fit',
      "Grade a classifier on a manager's threshold-profit curve and read a model card instead of trusting raw accuracy",
      'Turn unlabeled behavior into named, action-ready segments using clustering and dimensionality reduction, with stability as the test',
      'Convert model scores into ranked, targetable audiences graded by precision@k and NDCG rather than a confusion matrix',
      'Keep a deployed model alive by separating data drift from concept drift and proving lift with an incrementality holdout',
    ],
    icon: 'BrainCircuit',
  },
  V: {
    tagline: 'Turning prose and pixels into governed evidence',
    summary:
      "This part takes on the data that never made it into a warehouse — reviews, tickets, transcripts, invoices, and images — and turns it into evidence a manager can act on. The arc climbs in four steps: Chapter 13 earns trust with transparent word-counting NLP and then catalogs where it breaks; Chapter 14 moves from words to meaning, using embeddings for structure and a language model to score the constructs a manager cares about; Chapter 15 makes embeddings concrete as retrieval, vision, and document extraction; and Chapter 16 reframes the model as a programmable, schema-bound, human-gated component inside a real governance layer. The throughline is a refusal to treat any of it as magic: name the document, choose the representation, state the construct, and inspect what the method discarded.",
    whatYoullLearn: [
      'Build a transparent text pipeline (tokens, TF-IDF, classifiers, topic models) and recognize the failure modes — sarcasm, negation, polysemy — that force a move to embeddings',
      'Use embeddings for semantic search, clustering, brand maps, and drift detection, and direct a language model to score named constructs like intent-to-return or evasiveness instead of a sentiment proxy',
      'Stand up retrieval-augmented generation, vision, and document-AI workflows where the boundary work — chunking, confidence thresholds, citations, bias audits — decides whether anything ships',
      'Convert a language model into a governed workflow component with schema-enforced JSON output, tool use, a human-approval gate, and an evaluation-and-risk rubric',
      'Integrate classification, construct measurement, embedding clusters, and RAG into one monitored customer-voice loop a sponsor can approve',
    ],
    icon: 'FileText',
  },
  VI: {
    tagline: 'When the analyst is an agent',
    summary:
      "This closing part surveys the frontier the rest of the book leads to: a data-to-decision loop operated by AI agents rather than by hand. It is a grounded, citation-backed survey of the state of the art in mid-2026 — what is real, what is hype, and where it is headed. It defines what a data agent actually is, then takes the four capabilities that make agentic analytics work in turn: querying production databases in natural language through a governed semantic layer, running automated predictive workflows, connecting agents to the data stack through MCP and orchestration, and the evaluation, security, and governance that keep all of it safe. It closes not on a tidy capstone but on a contradiction — bold forecasts beside sober failure rates — and the argument that the discipline this book teaches matters more in the agentic era, not less.",
    whatYoullLearn: [
      'Tell a genuine agent from a workflow, and read the anatomy and autonomy dial of a data agent',
      'Judge text-to-SQL honestly — why it is near-solved on clean schemas yet fragile on real ones, and why the semantic layer is the fix',
      'See how far data-science agents have come on real benchmarks, and where the monitor-and-retrain loop pays off',
      'Map the agentic stack — tool use, MCP, A2A, orchestration, durable execution — and connect agents to data safely',
      'Evaluate, observe, secure, and govern a production data agent against the lethal trifecta, NIST, the EU AI Act, and ISO 42001',
    ],
    icon: 'Bot',
  },
};

export const chapterContent: Record<number, ChapterContent> = {
  0: {
    throughLine:
      'Treat data as a trace of business activity, then route the question through storage, evidence, and a decision someone can own.',
    summary:
      "This chapter draws the map the rest of the book follows. Its argument is that a manager's missing skill is not another technique but an operating discipline — one that links a business question to the data trace that records it, the storage system that holds it, and the decision someone has to own. Following a single Bean & Basket customer's Tuesday morning, it shows how a search, an impression, a transaction, a four-star review, and an AI log capture different slices of behavior with different blind spots, then sorts the storage stack (operational SQL, warehouses, local analytics, vector and graph stores) and the workflow families that turn evidence into action. It closes on the data-to-decision loop, where genuine data-driven work is separated from data-decorated work by three ingredients: an action, a counterfactual comparison, and a threshold.",
    topics: [
      'activity bias and workflow bias',
      'data trace vs. truth',
      'transactional vs. analytical systems',
      'warehouses, lakes, and local analytics',
      'vector and graph stores',
      'batch vs. streaming freshness',
      'the use-case router',
      'the data-to-decision loop',
      'data-driven vs. data-decorated decisions',
      'metric, model, and AI workflow cards',
    ],
    icon: 'Workflow',
  },
  1: {
    throughLine:
      'Before you ask what model to run, ask what one row means, what shape the table is in, and what kind of column you are looking at.',
    summary:
      "This chapter focuses on the three reading errors that sit behind almost every analytical mistake a manager hears about — double-counted revenue, joins that explode, a 4.2-star average that misleads, a quarterly ranking that rewards a fading store. Working through a single week, then eight weeks, at Bean & Basket Coffee, it shows how the grain of a row, the shape of a table, and the measurement type of a column quietly set the ceiling on what any analysis can honestly claim. The takeaway is a posture rather than a formula: read the panel before you rank, keep the finest grain you can sustain, and write the one-page variable dictionary that catches type confusion at design time instead of slide-review time.",
    topics: [
      'dataset grain and unit of observation',
      'mean-of-a-mean weighting error',
      'duplicate explosion across mismatched join grains',
      'cross-section vs. time-series vs. panel',
      'geo-spatial and network data shapes',
      'snapshot mistaken for trend',
      'storage type vs. measurement type',
      'ordered categoricals and the top-2-box share',
      'the variable dictionary as cheap insurance',
    ],
    icon: 'Table2',
  },
  2: {
    throughLine:
      'Spreadsheet operations, written down as reproducible code — and the conceptual errors that hide inside correct-looking queries.',
    summary:
      "This chapter translates the spreadsheet moves a manager already knows into reproducible code: a pivot table becomes GROUP BY, a VLOOKUP becomes a JOIN, and the same Bean & Basket question runs identically across SQL, dplyr, and pandas. From there it works through the operations where business reality leaks in through table arithmetic — joins that silently double revenue, wide-versus-long reshaping, and transformations like logs and rolling averages that turn raw columns into governed metrics. The recurring lesson is that the dangerous errors are conceptual rather than syntactic: an inner join dropping 5–15% of transactions, an average-of-ratios that weights every store equally, hard-deletes that manufacture a fake retention trend. It ends with the Data Language Studio, where students assemble a reusable data-and-metric brief to carry forward.",
    topics: [
      'Excel → SQL → dplyr → pandas translation',
      'GROUP BY vs. WHERE vs. HAVING',
      'left, inner, anti, and full outer joins',
      'duplicate-explosion from one-to-many joins',
      'grain matching before aggregation',
      'wide vs. long reshaping (pivot/melt)',
      'log transforms and rolling averages',
      'metric definitions as governance contracts',
      'average-of-ratios vs. ratio-of-totals',
      'survivorship bias from hard deletes',
    ],
    icon: 'Database',
  },
  3: {
    throughLine:
      'Pick the chart from the question, not the question from the chart — and the definition underneath the metric matters more than the metric.',
    summary:
      "This chapter treats charts as answers to specific business questions rather than decoration, since the wrong chart quietly overclaims. It opens with the dashboard-as-memo idea — a six-step arc from executive question to KPI tile, trend, breakdown, drilldown, and recommended action — illustrated on the Bean & Basket revenue story. A chart atlas then maps each visual family (distribution, comparison, time, relationship, geography, uncertainty) to a real finding drawn from soup scanner data, county cross-sections, and Zillow housing series. The closing case measures advertising-voice concentration across $369B of ad spend with CR1, CR4, and HHI, and shows that the choice of market and firm boundary, not the metric, decides the answer.",
    topics: [
      'dashboard-as-memo six-step arc',
      'question-to-chart mapping',
      'indexed line charts',
      'KPI tiles with comparisons',
      'exploratory vs. confirmatory drilldown',
      'Herfindahl–Hirschman Index (HHI)',
      'CR1 / CR4 concentration ratios',
      'market-definition sensitivity',
      'firm-boundary (owner vs. brand) aggregation',
    ],
    icon: 'BarChart3',
  },
  4: {
    throughLine:
      'Every chart is a comparison — name the baseline, show the spread, and end on a decision, not a pattern.',
    summary:
      "This chapter argues that a chart's first decision is its baseline, not its color, working throughout with Progresso scanner data — monthly sales across two thousand-plus stores from 2001 to 2006. It moves from January-indexed seasonality to region-by-region small multiples, to confidence intervals that describe store-month variation rather than causal effects, to log-log scatterplots that preview an elasticity-style slope before any regression appears. The payoff is a discipline for dashboards — monitor, diagnose, decide — that ends on the next test to run rather than an attractive pattern. A Bean & Basket capstone then chains grain, joins, metrics, and reshaping into a one-page board memo with its causal limits stated out loud.",
    topics: [
      'baseline and index choice',
      'winter / non-winter seasonal splits',
      'small multiples with shared axes',
      'regional heterogeneity',
      'confidence intervals for managers',
      'panel coverage and unbalanced data',
      'log transforms and elasticity intuition',
      'monitor–diagnose–decide dashboards',
      'descriptive vs. causal claims',
    ],
    icon: 'LayoutDashboard',
  },
  5: {
    throughLine: 'Every metric worth acting on hides a counterfactual you must construct, not assume.',
    summary:
      "This chapter opens Part III by reframing every metric as a question about a missing counterfactual — the outcome the same units would have shown had the action never been taken. It introduces the Decision Question Card for naming the lever, unit, horizon, comparison, and threshold before any model is fit, then builds the potential-outcomes vocabulary (ATE, ATT, and the selection-bias decomposition) and shows why randomized tests dissolve that bias while bandits trade clean measurement for lower regret. Worked cases anchor each idea: a synthetic control around Colorado's 2014 cannabis legalization, a ~1,700-store milk-pricing quasi-experiment with balance and placebo checks, and Progresso elasticity that shifts from roughly −2.23 toward −3.21 once season is omitted.",
    topics: [
      'Decision Question Card',
      'potential outcomes (ATE vs. ATT)',
      'selection-bias decomposition',
      'synthetic control',
      'stratified randomization',
      'multi-armed bandits vs. stable A/B tests',
      'balance and placebo diagnostics',
      'omitted-variable-bias formula',
      'endogeneity and reverse causality',
    ],
    icon: 'Split',
  },
  6: {
    throughLine: 'A regression number is only as trustworthy as the comparison it secretly makes.',
    summary:
      'This chapter focuses on what "holding something constant" actually means and when a regression earns the word causal. It begins with multiple regression as effect isolation, using the Frisch–Waugh–Lovell theorem to show that controlling for a variable is really a two-stage residualization, then climbs a regression ladder on roughly 88,000 store-months of Progresso scanner data as the price elasticity settles from a naive −3.21 to a defensible −2.23. From there it separates identification from estimation, introduces DAGs and the fork–chain–collider patterns, and closes on panel fixed effects, where demeaning absorbs every stable store difference you could never measure. The discipline it leaves behind: insist on the identification memo and the diagnostics before reading the number, because a precise estimate of an unidentified quantity is precisely wrong.',
    topics: [
      'Frisch–Waugh–Lovell residualization',
      'omitted-variable bias',
      'bad controls and collider bias',
      'the regression ladder on scanner data',
      'identification vs. estimation',
      'directed acyclic graphs (fork, chain, collider)',
      'the identification memo',
      'panel fixed effects and the within transformation',
      'two-way fixed effects (TWFE)',
    ],
    icon: 'Filter',
  },
  7: {
    throughLine:
      'Build the missing counterfactual — then trust the effect only as far as the design that produced it.',
    summary:
      "This chapter covers how to recover causal effects from field data no one randomized — a feature that ships region by region, a store format that opens in one city, a policy that lands in a single state. It works through difference-in-differences and its parallel-trends assumption, synthetic control's optimizer-built weighted twin (illustrated on Colorado housing and the Zillow Home Value Index after 2014 cannabis legalization), and heterogeneous treatment effects, where a single average lift hides which segments actually pay. Worked cases — a Bean & Basket checkout rollout, a Denver store format, and an income-stratified milk-pricing experiment — show why the headline number is rarely the decision-relevant one, and why an effect is only as trustworthy as the design that produced it.",
    topics: [
      'difference-in-differences 2×2',
      'the parallel-trends assumption',
      'two-way fixed effects regression',
      'event-study pre-trend plots',
      "staggered adoption (Callaway–Sant'Anna, Sun–Abraham)",
      'synthetic control weighting',
      'placebo permutation tests',
      'heterogeneous treatment effects',
      'per-segment expected-profit targeting',
    ],
    icon: 'GitCompareArrows',
  },
  8: {
    throughLine: 'Turning an identified elasticity into a defensible price, then into a memo a committee can act on.',
    summary:
      "This chapter turns the causal machinery of Part III into an actual number on a shelf tag. Working the Progresso scanner-data case, it estimates own-price elasticity in log-log space, watches the coefficient walk from a confounded −3.21 to a within-store −2.23 as fixed effects are added, then extends to a regional cross-price matrix that exposes where Campbell's and private label steal volume. The payoff is the Lerner inverse-elasticity rule, which converts a single coefficient into an optimal markup and shows in dollars why feeding a naive elasticity into the formula returns the wrong price. A closing studio reconciles elasticity, heterogeneity, and synthetic control into a one-page strategic pricing memo a committee can act on.",
    topics: [
      'own-price elasticity',
      'log-log constant-elasticity demand',
      'elastic vs. inelastic zones',
      'store fixed-effects regression ladder',
      'cross-price elasticity matrix',
      'substitutes vs. complements',
      'asymmetric substitution',
      'the Lerner inverse-elasticity rule',
      'optimal markup over marginal cost',
    ],
    icon: 'DollarSign',
  },
  9: {
    throughLine:
      'Get the task contract and the features right, and the algorithm almost picks itself; get them wrong, and no model can save you.',
    summary:
      'This chapter opens Part IV by writing the prediction problem down honestly — the step where most production failures are born or avoided. It traces the ladder from manager intuition to hand-coded rule to statistical score to machine-learned model, then pins the supervised task to four decisions — target, features, unit, and label timing — condensed into a one-sentence Task Contract. From there it builds the generalization toolkit (random, time-based, and group splits, plus cross-validation) alongside a gallery of leakage traps, and closes on feature engineering, where a manager\'s domain knowledge actually enters the model. The Bean & Basket churn model runs throughout as a reminder that the human leverage has migrated from picking algorithms to defining the task.',
    topics: [
      'the rules-to-algorithms ladder',
      'the predictive-modeling lifecycle',
      'the Task Contract (unit, target, horizon, feature cut-off)',
      'label-timing rules and horizon leakage',
      'train/test splits (random, time-based, group)',
      'cross-validation and stable estimates',
      'the data-leakage gallery',
      'overfitting vs. underfitting',
      'RFM and engagement feature catalogs',
    ],
    icon: 'ListChecks',
  },
  10: {
    throughLine: "A model isn't evaluated until its scores meet the firm's cost matrix and ship with a card.",
    summary:
      "This chapter focuses on building, grading, and shipping the models that fill the predictive task. It opens with logistic regression as a defensible first churn scorer, then assembles the full grading toolkit — confusion matrix, ROC and PR curves, calibration, and lift — culminating in the chart a manager should read first: the threshold-profit curve that puts the firm's own cost matrix on the y-axis. From there it covers numeric prediction graded in business dollars, trees and ensembles for the interactions a linear model misses, and the AutoML-era reality that promotes the manager to task-definer and model-card author. A RentHop case ties it together, turning thousands of messy New York apartment listings into a ranked “Hot listings” queue.",
    topics: [
      'log-odds coefficients and odds ratios',
      'PR-AUC vs. ROC-AUC under class imbalance',
      'calibration and lift curves',
      'the threshold-profit curve',
      'MAE, RMSE, and R² for numeric error',
      'residual diagnostics and heteroskedasticity',
      'random forests and gradient boosting',
      'the bias-variance trade-off',
      'permutation importance, partial dependence, and SHAP',
      'model cards as deployment contracts',
    ],
    icon: 'Gauge',
  },
  11: {
    throughLine:
      "Unsupervised methods don't hand you answers — they hand you a lens, and a manager decides whether the structure is worth acting on.",
    summary:
      "This chapter covers what to do when a business question arrives without a target variable — which customers behave alike, which brands compete in the same mental space — where the algorithm's job shifts from confirming a pattern to proposing a lens. It pairs the two strands of unsupervised learning: clustering (K-means, hierarchical, DBSCAN, with elbow and silhouette diagnostics for choosing k) and dimensionality reduction (PCA, Factor Analysis, and perceptual maps), then pushes into the nonlinear maps t-SNE and UMAP that reveal neighborhoods at the cost of meaningless axes. A running discipline ties it together: a cluster becomes a segment only when a manager attaches a name, a different action, and a definition stable across reasonable choices. The capstone is a ZIP-level study of New York Lottery data, with demographics held out of the fit so they profile the segments rather than define them.",
    topics: [
      'K-means, hierarchical, and DBSCAN clustering',
      'elbow plots and silhouette scores',
      'feature standardization and distance metrics',
      'PCA scores, loadings, and the biplot',
      'Factor Analysis vs. PCA',
      'perceptual maps and white-space positioning',
      't-SNE and UMAP nonlinear embeddings',
      'neighborhoods-not-geometry interpretation',
      'ecological inference and ZIP-level segmentation',
    ],
    icon: 'Boxes',
  },
  12: {
    throughLine: 'Turning scores into audiences, rankings, and a monitored system that still works six months later.',
    summary:
      'This chapter focuses on the point where algorithmic ideas stop living in a notebook and start spending a media budget. It follows the bridge from a clustered segmentation to a targetable audience on an ad platform, reframes a lookalike audience as nearest-neighbour scoring run at platform scale, then turns scores into ranked lists through collaborative, content-based, and learned recommenders graded with precision@k and NDCG. It closes the lifecycle with the discipline that keeps a model alive — separating data drift from concept drift, designing a four-KPI monitoring dashboard, setting retraining cadences, and weaving everything into a single Bean & Basket Customer Intelligence loop. The recurring lesson: high conversion proves selection, not causation, and only an incrementality holdout separates real lift from customers who would have converted anyway.',
    topics: [
      'lookalike audiences as nearest-neighbour scoring',
      'the reach-vs-similarity dial',
      'retargeting funnels and incrementality holdouts',
      'collaborative vs. content-based recommenders',
      'market-basket analysis (support, confidence, lift)',
      'precision@k and NDCG ranking metrics',
      'cold start and feedback loops',
      'data drift vs. concept drift',
      'monitoring KPIs and retraining cadences',
    ],
    icon: 'Target',
  },
  13: {
    throughLine:
      'Turning reviews, tickets, and transcripts into evidence a model can act on — and knowing exactly where word counts stop working.',
    summary:
      'This chapter focuses on turning prose — reviews, tickets, transcripts, and social posts — into evidence a model can act on, using the classical NLP stack: tokens, document-term matrices, TF-IDF weighting, supervised classifiers for routing and sentiment, and LDA topic models surfaced as weekly text dashboards. Working the Bean & Basket coffee case, it shows where word counts earn their keep as a transparent baseline and where they quietly break. It closes with a gallery of failure modes — sarcasm, negation, polysemy, idiom, mixed and context-dependent sentiment — that motivates the move to embeddings in the next chapter. The recurring discipline: name the document, choose the representation, state the construct, then inspect what the method threw away.',
    topics: [
      'the document-term matrix',
      'TF-IDF weighting',
      'tokenization and n-grams',
      'stop-word and negation handling',
      'aspect-based sentiment',
      'ticket routing and confusion matrices',
      'LDA topic models',
      'topic-trend dashboards',
      'polysemy and context shift',
    ],
    icon: 'MessageSquareText',
  },
  14: {
    throughLine:
      'From counting words, to placing meaning in coordinates, to measuring the constructs a manager actually cares about.',
    summary:
      'This chapter moves from counting words to measuring meaning. Two real corpora open it: @realdonaldtrump tweets, where a transparent Naive Bayes model fingerprints Android-versus-iPhone source from tone, hashtags, mentions, and timing; and Goose Island acquisition chatter, where a lexicon shows that an event spike is mostly news links and anti-corporate vocabulary rather than collapsing sentiment. From there embeddings turn documents into vectors in a learned coordinate system, powering semantic search, clustering, brand maps, and drift detection. The payoff is GPT-as-measurement, where a language model scores named constructs a manager actually cares about — intent to return, evasiveness, a sense of betrayal — directly rather than through a sentiment proxy.',
    topics: [
      'Naive Bayes source classification',
      'authorship fingerprinting from metadata',
      'transparent sentiment lexicons',
      'pre / event / post event-study framing',
      'embeddings as a coordinate system for meaning',
      'cosine similarity and nearest-neighbour retrieval',
      'semantic search and vector databases',
      'survey-vs-text brand-map triangulation',
      'GPT construct measurement and debiasing',
    ],
    icon: 'Compass',
  },
  15: {
    throughLine:
      'One shared embedding space, four production patterns: ground the text, see the image, read the document, reason across all of them.',
    summary:
      "This chapter makes the embedding idea concrete as plumbing: facts pulled from a firm's own indexed documents, pixels turned into searchable vectors, scanned invoices flattened into database rows. It opens with Retrieval-Augmented Generation — the standard way to keep a model's language ability while replacing its factual knowledge with a re-indexable corpus — then moves through what a CNN learns, how Vision Transformers and CLIP extend it, and how layout-aware document AI lifts the easy 80 percent of invoices and contracts while routing the rest to a human. It closes on multimodal models, where text, image, audio, and video share one space. The recurring lesson: the model is rarely the differentiator — the boundary work of chunking, confidence thresholds, citation-required prompts, and bias audits decides whether anything ships.",
    topics: [
      'the Retrieval-Augmented Generation pipeline',
      'chunking and re-ranking trade-offs',
      'citation-required prompting and grounding failures',
      'CNN feature hierarchies and transfer learning',
      'Vision Transformers and CLIP',
      'the four vision output shapes (label, boxes, mask, embedding)',
      'layout-aware document extraction and OCR',
      'confidence-threshold workflow design',
      'shared-space multimodal search',
    ],
    icon: 'ScanEye',
  },
  16: {
    throughLine:
      'An LLM is a language interface for workflows — value lives in the wiring, the gates, and the governance, not the model.',
    summary:
      'This chapter reframes the language model as a programmable component in a workflow rather than a chatbot, then builds out the discipline that keeps it shippable. It opens with the language-shaped tasks an LLM does well and the six-slot prompt brief that specifies them — leaning on the GABRIEL finding that once a construct is clear, phrasing barely moves the answer. From there it forces machine-readable JSON behind a schema contract, wraps the model in tools and a human-approval gate to make an agent, and lays down a governance layer: an eight-dimension evaluation rubric, a risk-control map, and a one-page AI Workflow Card. The capstone wires every Part V method into the Bean & Basket Customer Voice Intelligence Studio as one monitored loop a sponsor can sign off on.',
    topics: [
      'the six-slot prompt brief',
      'the GABRIEL phrasing-invariance finding',
      'reasoning vs. fast models',
      'JSON schema as a contract',
      'per-field confidence thresholds',
      'tool use and the control loop',
      'the human-approval gate',
      'the eight-dimension evaluation rubric',
      'the risk-control map and AI Workflow Card',
    ],
    icon: 'Bot',
  },
  17: {
    throughLine: 'What changes when AI agents — not analysts — operate the data-to-decision loop.',
    summary:
      'This closing chapter is a grounded, citation-backed survey of agent-operated analytics as it stands in mid-2026. It defines what separates a genuine agent from a workflow and lays out the anatomy and autonomy dial of a data agent, then takes the four capabilities that make agentic analytics work: querying production databases in natural language through a governed semantic layer (and why text-to-SQL is near-solved on clean schemas yet fragile on real ones), running automated and agent-driven predictive workflows, connecting agents to the data stack through the Model Context Protocol and orchestration, and the evaluation, observability, security, and governance that make any of it safe to deploy. It ends on the horizon — bold forecasts beside sober failure rates — and the case that the discipline of data-driven decision-making matters more in the agentic era, not less.',
    topics: [
      'workflows vs. agents; the anatomy of a data agent',
      'the autonomy dial and human-in-the-loop',
      'text-to-SQL benchmarks (Spider, BIRD) and the semantic layer',
      'automated predictive workflows and data-science agents',
      'Model Context Protocol, A2A, and durable execution',
      'agent evaluation and OpenTelemetry observability',
      'the lethal trifecta, prompt injection, and guardrails',
      'NIST AI RMF, the EU AI Act, and ISO/IEC 42001',
    ],
    icon: 'Bot',
  },
};

export const articleBlurbs: Record<string, string> = {
  'ch00-foreword':
    "Lays out the book's wager, audience, reading paths, the Bean & Basket through-line, and the standalone cases that ground later parts.",
  'ch00-data-system':
    'The whole system map in one chapter: where business data comes from, how it is stored, how it is used, and how source, storage, evidence, action, and feedback close into one data-to-decision loop.',
  'ch01-reading-data':
    "Reads a business table on three levels — grain (what one row means), structure (cross-section, time-series, panel, geo, network), and variable type (what each column measures) — so the panel reveals where growth comes from and IDs, ZIPs, and ratings never get averaged.",
  'ch02-sql':
    'Maps nine everyday Excel actions to identical SQL, dplyr, and pandas code, then runs one revenue-by-city question four ways.',
  'ch02-joins':
    'Shows how left, inner, and anti-joins attach business context — and how a naive campaign join inflates revenue by nearly double.',
  'ch02-reshaping':
    'Contrasts wide and long shapes of the same nine numbers, arguing to store data long and pivot wide only for display.',
  'ch02-metrics':
    'Catalogs eight transformations and nine dashboard metrics, showing why every metric is a definition with hidden choices, not a raw column.',
  'ch02-data-quality':
    'Triages dirty transactions — returns, typos, sync gaps — into fix, investigate, or keep, warning against silent imputation and outlier deletion.',
  'ch02-studio-data-language':
    'A capstone studio building a reusable six-part data-and-metric brief that hands a trustworthy evidence layer forward to Part II.',
  'ch03-exploratory-viz':
    'Frames a dashboard as a sequenced memo, walking the Bean & Basket revenue story through executive question, KPI, trend, breakdown, drilldown, and action.',
  'ch03-chart-atlas':
    'A translation guide pairing each chart family with a real soup, county, or Zillow finding plus the misuse risk it carries.',
  'ch03-concentration-case':
    'Measures advertising-voice concentration across industries with CR1, CR4, and HHI, showing market and firm definitions drive the answer more than the metric.',
  'ch04-baselines':
    'Shows how baseline choice — January, a competitor, a region — decides which business pattern a soup-sales chart makes visible first.',
  'ch04-small-multiples':
    'Uses same-scale regional panels to test whether the national countercyclical pricing pattern is broad-based or driven by one market.',
  'ch04-uncertainty':
    'Teaches managers to ask what an interval varies over and which decision it changes, since precision is not identification.',
  'ch04-statistical-charts':
    'Bridges visuals to estimation: skewed volume motivates logs, a log-log scatter previews a −2.46 elasticity, seasonality reveals the confound.',
  'ch04-dashboards':
    'Redesigns the soup dashboard into a monitor–diagnose–decide system that ends by naming the next pricing test, not a verdict.',
  'ch04-studio-visual-brief':
    'Sequences the Progresso soup visuals — indexes, small multiples, uncertainty, dashboards — into a one-page executive pricing brief that ends in a decision and names its causal limits.',
  'ch05-metrics-to-decisions':
    'Introduces the six-line Decision Question Card that ties a metric to a lever, unit, horizon, counterfactual, and act-or-not threshold.',
  'ch05-counterfactual':
    'Builds the potential-outcomes framework, derives the ATT-plus-selection-bias split, and demonstrates a synthetic control on Colorado housing values.',
  'ch05-experiments':
    'Shows why randomization erases selection bias, why intervals beat point estimates, and how milk-pricing diagnostics rescue quasi-experiments.',
  'ch05-historical-data':
    'Explains the four sources of endogeneity and the omitted-variable-bias formula, visualized in Progresso soup elasticity confounded by season.',
  'ch06-regression':
    'Shows that multiple regression\'s "holding constant" is Frisch–Waugh–Lovell residualization, then climbs a Progresso price-elasticity ladder from −3.21 to −2.23.',
  'ch06-identification':
    'Separates identification from estimation, teaches DAGs and the fork–chain–collider patterns, and audits a milk-pricing quasi-experiment with balance and placebo checks.',
  'ch06-fixed-effects':
    'Derives the demeaning transformation behind panel fixed effects, showing how within-store variation absorbs unmeasured stable confounders to flip a misleading price slope.',
  'ch07-did':
    'Derives the difference-in-differences estimator as an interaction coefficient and shows why parallel trends, checked via event-study plots, is everything.',
  'ch07-synthetic-control':
    'Builds a weighted donor twin for a single treated market, demonstrated on Colorado housing prices after 2014 cannabis legalization.',
  'ch07-heterogeneous-effects':
    'Splits the average effect into per-segment lifts for targeting, warning against post-treatment colliders, p-hacking, and noisy-subgroup illusions.',
  'ch08-price-elasticity':
    'Defines own-price elasticity, motivates the log-log specification, and walks the Progresso estimate from a confounded −3.21 to a within-store −2.23.',
  'ch08-cross-price-elasticity':
    'Reads the sign of cross-price coefficients to separate substitutes from complements, using a regional Progresso-vs-Campbell\'s matrix that varies by market.',
  'ch08-pricing-decisions':
    'Derives the Lerner inverse-elasticity rule and prices out, in dollars, the cost of optimizing on a naive versus an identified elasticity.',
  'ch08-studio-pricing':
    'Capstone studio reconciling elasticity, heterogeneity, and synthetic control into a five-section strategic pricing and promotion memo.',
  'ch09-rules-to-algorithms':
    'Frames the ladder from manager intuition to machine-learned model and tests when a repeated, label-rich, actionable decision is worth algorithmizing.',
  'ch09-supervised-setup':
    'Fixes the supervised vocabulary — target, features, unit, label timing — into a one-sentence Task Contract that decides whether a project ships.',
  'ch09-generalization':
    'Explains train/test splits, cross-validation, and the leakage traps that let future information sneak into the past and inflate offline metrics.',
  'ch09-feature-engineering':
    'Turns warehouse columns into a leakage-safe feature catalog — RFM, engagement, encodings, and interactions — where managerial domain knowledge enters the model.',
  'ch10-logistic-churn':
    'Recasts logistic regression from causal estimator to a fast, inspectable customer-ranking scorer that reads coefficients in log-odds and outputs thresholdable probabilities.',
  'ch10-classification-eval':
    'Assembles the classifier grading toolkit — confusion matrix, ROC/PR, calibration, lift — and lands on the threshold-profit curve that picks the operating point.',
  'ch10-numeric-prediction':
    'Grades predict-a-number models in business units via MAE, RMSE, and R², actual-vs-predicted plots, and residual diagnostics against the decision flow.',
  'ch10-trees-ensembles':
    'Introduces decision trees, random forests, and gradient boosting for interactions a linear model misses, anchored by the bias-variance trade-off.',
  'ch10-automl-explainability':
    'Shows how AutoML automates the easy half while the manager defines the task, reads importance and SHAP, and writes the model card.',
  'ch10-renthop-case':
    "Turns RentHop's New York listings into a Hot-apartment ranking queue via location clustering, parsed amenities, and a narrow random-forest win.",
  'ch11-clustering':
    'Introduces K-means, hierarchical, and DBSCAN clustering, standardization, and choosing k — and why a cluster only becomes a segment when a manager names and acts on it.',
  'ch11-pca':
    'Explains how PCA and Factor Analysis compress dozens of correlated survey attributes into readable axes, and how to read a biplot and perceptual map without overstating it.',
  'ch11-tsne-umap':
    'Shows when nonlinear maps t-SNE and UMAP reveal cluster structure PCA misses, with a strict checklist for trusting neighborhoods but never distances, sizes, or axes.',
  'ch11-lottery-case':
    'A non-causal NY Lottery ZIP study where PCA and k-means recover four neighborhood lottery routines, profiled by demographics held out of the model fit.',
  'ch12-targeting':
    'Shows how segments become ad-platform audiences, recasting lookalikes as nearest-neighbour scoring and setting the reach-vs-similarity dial per campaign goal.',
  'ch12-recommenders':
    'Surveys collaborative, content-based, and learned recommenders, grading ranked lists with precision@k and NDCG while navigating cold-start and feedback-loop traps.',
  'ch12-deployment-monitoring':
    'Distinguishes data from concept drift and lays out the four-KPI dashboard, retraining cadences, and human-in-the-loop policies that keep models healthy.',
  'ch12-studio-customer-intel':
    'Weaves score, segment, target, act, and monitor into one Bean & Basket loop, with a one-page executive brief tracing every claim to an artefact.',
  'ch13-structured-to-unstructured':
    'Reframes unstructured text not as unusable but as data needing a representation layer, mapping six families of business text to their questions.',
  'ch13-text-as-data':
    'Installs the core vocabulary — document, corpus, token, vocabulary, n-gram, metadata — and shows how the document boundary reshapes the whole pipeline.',
  'ch13-preprocessing-tfidf':
    'Walks through honest preprocessing choices, the bag-of-words matrix, and TF-IDF weighting that lifts distinctive words above common ones.',
  'ch13-text-classification':
    'Covers supervised routing and sentiment, then aspect-based sentiment heatmaps that reveal which part of the experience is under stress, where.',
  'ch13-topic-models':
    'Explains LDA topic discovery, why humans name the topics, and the trend-over-time dashboard that drives an operating cadence.',
  'ch13-classical-nlp-limits':
    'Catalogues where bag-of-words fails — sarcasm, negation, polysemy, idiom, mixed and context-shifted sentiment — bridging to embeddings.',
  'ch14-trump-case':
    'A transparent Naive Bayes classifier fingerprints Android-versus-iPhone tweet source from tone, links, and timing, while keeping authorship caveats visible.',
  'ch14-goose-island-case':
    'A lexicon-based read of the Anheuser-Busch acquisition shows the negative spike was mostly news links and anti-corporate vocabulary, not collapsing product sentiment.',
  'ch14-embeddings':
    'Embeddings place documents in a learned meaning space, powering semantic search, clustering, brand-map triangulation, anomaly detection, and drift monitoring.',
  'ch14-gpt-measurement':
    'A language model measures named constructs like intent to return or executive evasiveness directly, replacing surface proxies at a fraction of annotation cost.',
  'ch15-rag':
    'Wires chunking, embeddings, and an LLM into a grounded Q&A system, and shows how to catch missing-context and ungrounded-generation failures.',
  'ch15-vision':
    'Explains what CNNs, ViTs, and CLIP learn, the four output shapes to choose from, and where vision already ships in industry.',
  'ch15-ocr-document-ai':
    'Walks the six-stage scan-to-database pipeline for invoices and contracts, with the confidence threshold as the central design decision.',
  'ch15-multimodal':
    'Surveys shared-space models that place text, image, audio, and video in one space for cross-modal search and joint reasoning.',
  'ch16-llm-capabilities':
    'Maps the eight language tasks LLMs do well, where they fail, and the six-slot prompt brief that specifies any of them.',
  'ch16-structured-outputs':
    'Turns messy text into validated JSON, treating the schema as a contract with confidence thresholds routing low-certainty records to humans.',
  'ch16-agents-tools':
    'Defines an agent as model plus tools plus a loop, with the human-approval gate as the central risk-control design choice.',
  'ch16-ai-governance':
    'Provides the eight-dimension evaluation rubric, risk-control map, and one-page AI Workflow Card that make a workflow auditable.',
  'ch16-studio-customer-voice':
    'Wires every Part V method into one monitored Bean & Basket customer-voice loop: classify, measure, cluster, retrieve, act, monitor.',
  'ch17-agentic-turn':
    'Defines what separates a genuine agent from a workflow, lays out the anatomy of a data agent and the autonomy dial, and surveys where enterprise adoption really stands.',
  'ch17-text-to-sql':
    'Surveys natural-language querying of production databases: what Spider and BIRD benchmarks really show, why it breaks on real schemas, and how the semantic layer becomes the contract that makes it trustworthy.',
  'ch17-predictive-workflows':
    'Measures how far data-science agents have come (MLE-bench, DSBench, GDPval), what ships today, and where the agent-driven monitor-and-retrain loop pays off on a durable-execution substrate.',
  'ch17-mcp-orchestration':
    'Maps the agentic stack from tool use up through the Model Context Protocol, the Agent2Agent protocol, orchestration frameworks, and the durable-execution engines that keep pipelines alive.',
  'ch17-agent-governance':
    'The discipline that makes data agents safe: outcome vs. trajectory evals, OpenTelemetry observability, the lethal trifecta and prompt injection, human approval gates, and the NIST / EU AI Act / ISO 42001 backdrop.',
  'ch17-horizon':
    'A grounded forward look — bold forecasts beside sober failure rates, why most deployments fail and which succeed, the semantic layer as the durable contract, and the analyst’s new job above the loop.',
};

export function getPartContent(numeral: string): PartContent | undefined {
  return partContent[numeral];
}

export function getChapterContent(num: number): ChapterContent | undefined {
  return chapterContent[num];
}

export function getArticleBlurb(slug: string): string | undefined {
  return articleBlurbs[slug];
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       