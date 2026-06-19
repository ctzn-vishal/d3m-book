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
      "This opening Part builds the one capability every later technique depends on: seeing a business as a system that turns activity into data traces, holds them in fitted storage, and converts them into decisions someone owns. Rather than starting with a method, it draws the territory the whole book moves through — following a single Bean & Basket customer's morning to show why a search, an impression, a transaction, a review, and an AI log each capture behavior with a different blind spot — then sorts the storage stack and the workflow families that route evidence to action. It closes on the loop itself and the test that separates real data-driven work from its decorated imitation: an action, a counterfactual comparison, and a threshold. Finish here and you will read every later chapter as a move inside one system, not an isolated trick.",
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
      "Before a single regression or forecast, a manager has to trust the table the numbers came from — and most analytical disasters are settled at that layer, not in the model. This Part builds the foundational literacy for it: Chapter 1 teaches you to read a dataset the way you'd read a financial statement, recognizing how a row's grain, a table's shape, and a column's measurement type quietly cap what any analysis can honestly claim. Chapter 2 then puts that reading into motion, translating the spreadsheet moves you already know — pivots, lookups, filters — into the written GROUP BYs, JOINs, and reshapes that scale, while exposing where business reality leaks in: joins that double revenue, averages that secretly weight every store equally, deletes that fabricate a retention trend. Together they take you from passively receiving a dataset to actively governing one, leaving a reusable data-and-metric brief — the trustworthy evidence layer every later Part models on top of.",
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
      "Where Part I established how data becomes trustworthy, this Part makes it speak. The capability built here is visual argument: turning a clean dataset into a chart that answers a named business question without quietly overclaiming. Chapter 3 supplies the grammar — matching each visual family to the managerial decision it serves and treating a dashboard as a structured memo from executive question to recommended action. Chapter 4 then sharpens the craft, insisting that a chart's first choice is its baseline, that confidence intervals describe variation rather than cause, and that the honest endpoint of any dashboard is the next test to run. Together the chapters move the reader from picking a chart type to defending a one-page board memo with its limits stated out loud.",
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
      'Earlier parts taught you to describe data honestly; this part teaches you to act on it by asking what would have happened otherwise. Every chapter chases the same elusive object — the counterfactual — and the arc moves from naming it (Chapter 5 reframes any metric as a missing comparison and hands you the Decision Question Card) to identifying it (Chapter 6 makes regression earn the word "causal"), to recovering it from messy field data no one randomized (Chapter 7\'s difference-in-differences, synthetic control, and heterogeneous effects), to spending it on the firm\'s highest-leverage lever (Chapter 8 turns an elasticity into a price). A single thread of worked evidence — Progresso soup scanner data walking from a confounded −3.21 elasticity to a defensible −2.23, a 1,700-store milk experiment, the Zillow-and-cannabis synthetic control — runs through all four, so you watch the same number get more trustworthy as the design tightens. The discipline you leave with is refusing to read a coefficient until you know which counterfactual produced it.',
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
      'Parts I through III taught you to read data, see it, and isolate why something happened; this Part turns the question forward — what will happen next, to whom, and what should we do about it — and hands that work to algorithms operating at a scale no analyst could match by hand. The four chapters trace one honest arc: write the prediction problem down as a Task Contract and guard it against leakage (Ch. 9), build and grade supervised models on a threshold-profit curve rather than raw accuracy (Ch. 10), let the algorithm propose a lens when no target exists by clustering and mapping latent structure (Ch. 11), then push scores into a media budget through targeting, ranking, and the unglamorous monitoring that keeps a live model honest (Ch. 12). The recurring discipline is that in an AutoML world the human leverage has migrated from picking algorithms toward defining the task, crafting features, naming segments, and insisting on incrementality — because a high conversion rate proves selection, not causation. By the end you can stand up a full customer-intelligence loop, from a churn score to a targeted, monitored, holdout-tested campaign.',
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
      'Everything before this Part assumed the business already lived in rows and columns; here the data is the mess that never made it into a warehouse — reviews, tickets, transcripts, invoices, and images — and the job is to turn it into evidence a manager can act on. The arc climbs in four deliberate steps: Chapter 13 earns trust with transparent word-counting NLP and then catalogs exactly where it breaks; Chapter 14 answers those breaks by moving from words to meaning, using embeddings for semantic structure and a language model to score the specific constructs a manager actually cares about; Chapter 15 makes embeddings concrete as plumbing — retrieval over a firm\'s own documents, vision, and layout-aware extraction; and Chapter 16 reframes the model as a programmable, schema-bound, human-gated component wrapped in a real governance layer. The throughline is a refusal to treat any of this as magic: name the document, choose the representation, state the construct, and inspect what the method discarded.',
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
    tagline: 'Turning analyses into durable infrastructure',
    summary:
      'Every earlier Part produced something — a chart, a causal estimate, a churn score, an LLM extraction pipeline — but analyses left lying around quietly decay the moment their author moves on. This closing Part is about ownership rather than technique: it reframes every card, memo, dashboard, and case pack as a data product with a name, an owner role, a version, a contract, and a refresh cadence, then routes all of them into the one-page decision memo a sponsor can actually sign. From a single artefact it widens the lens to the whole portfolio, naming the monitoring gaps and learning failures that let a system censor its own evidence and silently rot. The Part — and the book — lands on the Bean & Basket expansion case, which runs one strategic question down the entire decision ladder so that the language of data, visual evidence, causal effects, algorithms, and AI all converge on a memo that ships.',
    whatYoullLearn: [
      'Repackage any analysis as a governed data product with an owner, version, contract, and refresh cadence',
      'Compress a body of evidence into a one-page decision memo a sponsor can read and sign',
      'Scale monitoring from a single model to a portfolio, catching drift and silent decay before stakeholders do',
      'Diagnose the learning-loop failures that let an analytics system censor its own training data',
      'Drive a real strategic question down the full decision ladder, integrating every prior Part into one shippable recommendation',
    ],
    icon: 'Recycle',
  },
};

export const chapterContent: Record<number, ChapterContent> = {
  0: {
    throughLine:
      'Treat data as a trace of business activity, then route the question through storage, evidence, and a decision someone can own.',
    summary:
      "Before the book teaches a single method, it draws the map. Singh argues the manager's missing skill is not another technique but an operating discipline that links a business question to the data trace that records it, the storage system that holds it, and the decision someone has to own. Following one Bean & Basket customer's Tuesday morning, the chapter shows how a search, an impression, a transaction, a four-star review, and an AI log are different slices of behavior with different blind spots, then sorts the storage stack — operational SQL, warehouses, DuckDB-style local analytics, vector and graph stores — and routes the workflow families that turn evidence into action. It closes with the loop itself, where data-driven work is separated from data-decorated work by three named ingredients: an action, a counterfactual comparison, and a threshold.",
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
      "Every analytical mistake a manager ever hears about — double-counted revenue, joins that explode, a 4.2-star average that misleads, a quarterly ranking that rewards a fading store — traces back to one of three reading errors made before any model runs. Through a single week, then eight weeks, at Bean & Basket Coffee, the chapter shows how the grain of a row, the shape of a table, and the measurement type of a column silently set the ceiling on what an analysis can honestly say. The payoff is a posture, not a formula: read the panel before you rank, keep the finest grain you can sustain, and write the one-page variable dictionary that catches type confusion at table-design time instead of slide-review time.",
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
      "Every spreadsheet move a manager already knows has a written-down equivalent, and this chapter makes the translation explicit: a pivot table becomes GROUP BY, a VLOOKUP becomes a JOIN, and the same Bean & Basket question runs identically across SQL, dplyr, and pandas. From there it works through the operations where business reality leaks in through table arithmetic — joins that silently explode revenue by a factor of two, wide-versus-long reshaping that decides whether a chart takes ten seconds or an hour, and transformations like log and rolling averages that turn raw columns into governed metrics. The recurring lesson is that the dangerous errors are conceptual, not syntactic: an inner join quietly dropping 5–15% of transactions, an average-of-ratios that weights every store equally, hard-deletes that manufacture a fake retention trend through survivorship bias. It closes with the Data Language Studio, where students compile a reusable data-and-metric brief that hands a trustworthy evidence layer forward to the rest of the book.",
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
      "Charts are not decoration here; they are answers to specific business questions, and the wrong chart quietly overclaims. The chapter opens with the dashboard-as-memo idea — a six-step arc from executive question to KPI tile, trend, breakdown, drilldown, and recommended action, illustrated on the Bean & Basket revenue story. A chart atlas then turns visualization choice into managerial choice, mapping each visual family (distribution, comparison, time, relationship, geography, uncertainty) to a real finding drawn from the soup scanner panel, county cross-sections, and Zillow housing series. The capstone case puts an analyst inside the FDA's drug-promotion office, measuring advertising-voice concentration across $369B of ad spend with CR1, CR4, HHI, and effective entities — and shows that the choice of market boundary and firm boundary, not the metric, decides the answer.",
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
      'Built on Progresso scanner data — monthly sales across two thousand-plus stores from 2001 to 2006, with Campbell\'s and private label in the same category — this chapter argues that a chart\'s first decision is the baseline, not the color. It moves from January-indexed seasonality to region-by-region small multiples, to confidence intervals that describe store-month variation (not causal effects), to log-log scatterplots that preview a −2.46 elasticity-style slope before any regression appears. The payoff is a discipline for dashboards: monitor, diagnose, decide — ending not at an attractive pattern but at the next test. A Bean & Basket capstone then chains grain, joins, metrics, and reshaping into a one-page board memo with its causal limits stated out loud.',
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
      "A dashboard tells a manager what happened; it stays silent on what to do next. This chapter opens Part III by reframing every metric as a question about a missing counterfactual — the outcome the same units would have shown had the action never been taken — and equips the reader with the Decision Question Card to name the lever, unit, horizon, comparison, and threshold before any model is fit. From there it builds the potential-outcomes vocabulary (ATE, ATT, the selection-bias decomposition), shows why randomized A/B tests dissolve that bias while bandits trade clean measurement for lower regret, and confronts why purposeful managerial choices make historical data endogenous. Worked cases anchor each idea: the Zillow synthetic control around Colorado's 2014 cannabis legalization, a ~1,700-store milk pricing quasi-experiment with balance and placebo diagnostics, and Progresso soup scanner data where omitting season biases elasticity from roughly −2.23 toward −3.21.",
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
      'Every regression coefficient quietly claims to hold something constant, and this chapter pries open what that phrase actually means and when it earns the word "causal." It starts with multiple regression as effect isolation, using the Frisch–Waugh–Lovell theorem to show that "controlling for" is really a two-stage residualization, then climbs a regression ladder on roughly 88,000 store-months of Progresso scanner data as the price elasticity settles from a naive −3.21 to a defensible −2.23. From there it separates identification from estimation, teaches DAGs and the fork–chain–collider patterns, and audits a milk-pricing quasi-experiment with balance and placebo checks before closing on panel fixed effects, where demeaning absorbs every stable store difference you could never measure. The payoff for a decision-maker is a discipline: insist on the identification memo and the diagnostics before reading the number, because a precise estimate of an unidentified quantity is precisely wrong.',
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
      'Most consequential business decisions are never randomized: a feature ships region by region, a store format opens in one city, a policy lands in a single state. This chapter equips the reader to recover causal effects from such observational field data, starting with difference-in-differences and its parallel-trends assumption, advancing to synthetic control\'s optimizer-built weighted twin (illustrated on Colorado housing and the Zillow Home Value Index after 2014 cannabis legalization), and closing with heterogeneous treatment effects, where a single average lift hides which customer segments actually pay. Worked cases — a Bean & Basket checkout rollout, a Denver store format, and an income-stratified milk-pricing quasi-experiment — show why the headline number is rarely the decision-relevant one. For a manager, the payoff is knowing which counterfactual to trust and refusing to read a coefficient until the design that produced it survives scrutiny.',
    topics: [
      'difference-in-differences 2×2',
      'the parallel-trends assumption',
      'two-way fixed effects regression',
      'event-study pre-trend plots',
      'staggered adoption (Callaway–Sant\'Anna, Sun–Abraham)',
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
      "Pricing is the most leveraged decision a firm makes, and this chapter turns the causal machinery of Part III into an actual number on a shelf tag. Working the Progresso scanner-data case, it estimates own-price elasticity in log-log space, watches the coefficient walk from a confounded −3.21 down to a within-store −2.23 as fixed effects are added, then extends to a regional cross-price matrix that exposes where Campbell's and private label steal volume. The payoff is the Lerner inverse-elasticity rule, which converts a single coefficient into an optimal markup and shows in dollars why feeding a naive elasticity into the formula can hand back the wrong price. A closing studio reconciles elasticity, heterogeneity, and synthetic control into a one-page strategic pricing memo that a committee can act on.",
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
      'Before any algorithm gets chosen, a prediction problem has to be written down honestly — and that writing is where most production failures are born or avoided. This chapter opens Part IV by tracing the ladder from manager intuition to hand-coded rule to statistical score to machine-learned model, then pins the supervised task to four decisions: target, features, unit of analysis, and label timing, all condensed into a one-sentence Task Contract ("for unit U, predict Y over horizon H, using features known by time T"). It then builds the generalization toolkit — random, time-based, and group train/test splits, cross-validation, and a full gallery of leakage traps (outcome-derived fields, target-encoding bleed, future joins, the notorious avg_spend_last_30_days that ends on the churn date) — and closes on feature engineering, where a manager\'s domain knowledge actually enters the model. Running through it all is the Bean & Basket churn model, the reminder that in an AutoML world the human leverage has migrated from picking algorithms to defining the task and crafting features.',
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
      'Having framed the predictive task in Chapter 9, this chapter teaches you to build, grade, and ship the models that fill it. It opens with logistic regression as the defensible first churn scorer, then assembles the full grading toolkit — confusion matrix, ROC and PR curves, calibration, and lift — culminating in the one chart a manager should read first: the threshold-profit curve that puts the firm\'s own cost matrix on the y-axis. From there it covers numeric prediction graded in business dollars, trees and ensembles for the interactions a linear model misses, and the AutoML-era reality that promotes the manager to task-definer and model-card author. A worked RentHop case ties it together, turning thousands of messy New York apartment rows into a ranked "Hot listings" queue.',
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
      'When a business question arrives without a target variable — which customers behave alike, which brands compete in the same mental space — the algorithm\'s job shifts from confirming a pattern to proposing a lens. This chapter pairs the two great strands of unsupervised learning: clustering (K-means, hierarchical, DBSCAN, plus the elbow and silhouette diagnostics for choosing k) and dimensionality reduction (PCA, Factor Analysis, and the perceptual maps marketers have leaned on for decades), then pushes into the nonlinear maps t-SNE and UMAP that reveal neighborhoods at the cost of axes that mean nothing. A running discipline ties it together: clusters become segments only when a manager attaches a name, a different action, and a definition stable across reasonable choices. The capstone is a non-causal ZIP-level study of New York Lottery data, where PCA and k-means recover four neighborhood routines and demographics are held out of the fit so they can profile the segments rather than define them.',
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
      'By Chapter 12 the algorithmic ideas of Part IV stop living in a notebook and start spending a media budget. The chapter follows the bridge from a clustered segmentation to a targetable audience on an ad platform, reframes a lookalike audience as k-nearest-neighbour scoring run at platform scale against features the firm cannot see, then turns scores into ranked lists through collaborative filtering, content-based, and learned recommenders graded with precision@k and NDCG rather than a confusion matrix. It closes the lifecycle with the unglamorous discipline that keeps a model alive — distinguishing data drift from concept drift, designing a four-KPI monitoring dashboard, setting retraining cadences, and weaving every artefact into a single Bean & Basket Customer Intelligence Studio loop. The recurring lesson is that high conversion proves selection, not causation: only an incrementality test against a holdout separates real lift from users who would have converted anyway.',
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
      'Most of what a firm knows about its customers lives not in warehouse columns but in reviews, tickets, transcripts, and social posts. This chapter teaches the classical NLP stack that turns that prose into evidence: tokens, document-term matrices, TF-IDF weighting, supervised classifiers for routing and sentiment, and LDA topic models surfaced as weekly text dashboards. Working the through-line Bean & Basket coffee case, it shows where word counts earn their keep as a transparent baseline and where they quietly break, closing with a gallery of failure modes — sarcasm, negation, polysemy, idiom, mixed and context-dependent sentiment — that motivates the move to embeddings in Chapter 14. The recurring discipline for a decision-maker: name the document, choose the representation, state the construct, then inspect what the method threw away.',
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
      'Two messy real-world corpora open the chapter: @realdonaldtrump tweets, where a transparent Naive Bayes model fingerprints Android-versus-iPhone source from tone words, hashtags, mentions, and timing; and Goose Island acquisition chatter, where a transparent lexicon shows that an "event spike" is mostly news links and anti-corporate vocabulary, not collapsing customer sentiment. From there the chapter shifts from words to meaning: embeddings turn documents into vectors in a learned coordinate system, powering semantic search, clustering, brand maps, and drift detection. The payoff is GPT-as-measurement, where a language model scores named constructs a manager actually cares about — intent to return, evasiveness, sense of betrayal — directly rather than through a sentiment proxy, at a fraction of human-annotation cost.',
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
      'By Chapter 15 the embedding idea from earlier in Part V stops being abstract and becomes plumbing: facts pulled from a firm\'s own indexed documents, pixels turned into searchable vectors, scanned invoices flattened into database rows. The chapter opens with Retrieval-Augmented Generation, the standard way to keep a model\'s language ability while replacing its factual ability with a re-indexable corpus, then moves through what a CNN actually learns, how Vision Transformers and CLIP extend it, and how layout-aware document AI lifts the easy 80 percent of invoices and contracts off a team while routing the rest to a human. It closes on multimodal foundation models, where text, image, audio, and video finally share one space. The recurring lesson is that the model is rarely the differentiator; the boundary work is — chunking, confidence thresholds, citation-required prompts, and subgroup bias audits decide whether any of this ships.',
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
      'Chapter 16 reframes the language model as a programmable component in a workflow rather than a chatbot, then builds outward to the discipline that keeps it shippable. It opens with the eight language-shaped tasks an LLM does well (summarize, classify, extract, draft, reason, narrate) and the six-slot prompt brief that specifies them — leaning on the GABRIEL finding that once a construct is clear, phrasing barely moves the answer. From there it forces machine-readable JSON behind a schema contract, wraps the model in tools and a human-approval gate to make an agent, and lays down a governance layer: an eight-dimension evaluation rubric, a risk-control map, and a one-page AI Workflow Card. The capstone wires every Part V method into the Bean & Basket Customer Voice Intelligence Studio, where classification, construct measurement, embedding clusters, RAG, and an insights agent run as one monitored loop a sponsor can sign off on.',
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
    throughLine: 'Turning a stack of analyses into an operating system that compounds instead of decays.',
    summary:
      'Analytics work leaves behind artefacts whether or not anyone manages them, and most quietly rot the moment the analyst rotates off. This closing chapter turns that wreckage into infrastructure: it treats every card, memo, dashboard, and case pack as a data product with a name, owner role, version, contract, and refresh cadence, then funnels them all into the one-page decision memo a sponsor can actually sign. From there it scales monitoring up to the whole portfolio, names the learning failures that censor an analytics system\'s own training data, and closes with a full Bean & Basket expansion case that walks the entire decision ladder against a single question: which fifty new cities, in what sequence, on what conditions.',
    topics: [
      'the data product view (name, owner, version, contract, cadence)',
      'the artefact catalog and case-pack architecture',
      'the eleven-section decision memo',
      'counterfactual and reversal thresholds',
      'portfolio monitoring and status roll-ups',
      'drift, decay, and re-investment cadences',
      'closed-loop targeting and exploration budgets',
      'decision retrospectives and kill switches',
    ],
    icon: 'Workflow',
  },
};

export const articleBlurbs: Record<string, string> = {
  'ch00-foreword':
    "Lays out the book's wager, audience, reading paths, the Bean & Basket through-line, and the standalone cases that ground later parts.",
  'ch00-data-origins':
    'Reframes every dataset as a trace of specific business activity, with a customer-morning example and three generation traps to guard against.',
  'ch00-data-storage':
    'Maps the storage stack by job, separating transactional from analytical systems and matching data freshness to the cadence of the decision.',
  'ch00-data-uses':
    'Sorts data work into recurring workflow families and routes a business question to monitoring, diagnosis, causal, prediction, or AI evidence.',
  'ch00-decision-loop':
    'Connects source, storage, evidence, action, and feedback into one loop, distinguishing data-driven decisions from merely data-decorated ones.',
  'ch01-dataset':
    "Defines a dataset's grain — what one row means — and shows how transaction- vs. store-week views answer different questions and break joins.",
  'ch01-data-structures':
    'Distinguishes cross-section, time-series, panel, geo-spatial, and network shapes, proving the panel is the only view that reveals where growth comes from.',
  'ch01-variable-types':
    'Separates storage type from measurement type across seven variable kinds, showing why averaging IDs, ZIPs, or 1-to-5 ratings misleads.',
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
    'Bean & Basket capstone chaining grain, joins, metrics, and reshaping into a board memo that states its causal limits.',
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
  'ch17-data-product':
    'Reframes every analytics artefact as a product with a name, owner role, version, contract, and refresh cadence, indexed in a shared catalog.',
  'ch17-decision-memos':
    'Builds the one-page, eleven-section decision memo that fuses all evidence into a signable recommendation, with a worked Bean & Basket retention example.',
  'ch17-learning-loops':
    'Scales monitoring to the portfolio and exposes learning failures like closed-loop targeting, fixed by exploration budgets, retrospectives, and kill switches.',
  'ch17-studio-final-case':
    'An integrative Bean & Basket expansion case walking the full ladder to recommend which fifty markets to enter, in what phased sequence.',
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
