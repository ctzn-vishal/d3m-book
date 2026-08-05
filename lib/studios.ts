import { findArticle } from '@/lib/book-toc';

export type StudioKind = 'dashboard' | 'exercise';
export type StudioCollection = 'teaching' | 'research' | 'blog';

export type StudioPreview = {
  /** Public image path for the gallery card preview. */
  src: string;
  /** Describes the actual chart/map/interface shown in the preview. */
  alt: string;
  /** Optional focal point for responsive object-fit cropping. */
  objectPosition?: string;
};

export type Studio = {
  /** URL slug → /studios/<slug> and public/studios/<slug>/index.html */
  slug: string;
  title: string;
  /** One-sentence hook shown on the gallery card. */
  blurb: string;
  /** Short domain tag, e.g. "Airlines", "Pricing". */
  domain: string;
  /** Publication collection; currently all studios are teaching assets. */
  collections: StudioCollection[];
  /** Broad gallery filter tags, separate from the more detailed method chips. */
  methodTags: string[];
  /** Skills/methods the studio exercises — rendered as chips. */
  methods: string[];
  /** Slug of the chapter this studio pairs with (cross-link both ways). */
  relatedSlug: string;
  /** "dashboard" = explore a live view; "exercise" = hands-on, do it yourself. */
  kind: StudioKind;
  /** Real screenshot-based gallery preview. */
  preview: StudioPreview;
  /** Accent hex for the card's top rule. Kept within the brand-adjacent palette. */
  accent: string;
};

/**
 * Registry of interactive case studios. Each entry is a self-contained static
 * HTML file living in public/studios/<slug>/index.html, framed by the
 * /studios/[slug] viewer and surfaced as a card in the /studios gallery.
 *
 * These are NOT MDX articles — they are standalone D3/Recharts dashboards and
 * exercises. The book cross-links to the relevant one from each paired chapter.
 */
export const studios: Studio[] = [
  {
    slug: 'gdelt-media-agenda-lab',
    title: 'GDELT Media Agenda Lab',
    blurb:
      'Search global news and television coverage as an agenda-setting lab: compare attention, tone, source geography, station airtime, and evidence cards from live GDELT APIs.',
    domain: 'Global Media',
    collections: ['teaching'],
    methodTags: ['Dashboard', 'Text analysis', 'Live API'],
    methods: ['Live API', 'Tone analysis', 'Media agenda'],
    relatedSlug: 'ch13-text-as-data',
    kind: 'dashboard',
    preview: {
      src: '/studios/gdelt-media-agenda-lab/preview.jpg',
      alt: 'GDELT media agenda dashboard with global news attention, tone, and coverage charts',
      objectPosition: 'center',
    },
    accent: '#187C78',
  },
  {
    slug: 'cfpb-crisis-monitor',
    title: 'CFPB Crisis Monitor',
    blurb:
      'Use public consumer complaints as a crisis early-warning system: pin incident spikes, inspect consented narratives, and separate product mix shifts from real operational improvement.',
    domain: 'Consumer Finance',
    collections: ['teaching'],
    methodTags: ['Dashboard', 'Text analysis', 'Shock analysis'],
    methods: ['Text as data', 'Spike detection', 'Structural shift'],
    relatedSlug: 'ch13-text-as-data',
    kind: 'dashboard',
    preview: {
      src: '/studios/cfpb-crisis-monitor/preview.jpg',
      alt: 'CFPB complaints dashboard with crisis-monitoring charts and product mix views',
      objectPosition: 'center',
    },
    accent: '#28527A',
  },
  {
    slug: 'doing-okay-shed',
    title: 'Doing Okay: American Financial Wellbeing',
    blurb:
      'Follow a decade of Federal Reserve SHED survey indicators: financial comfort, inflation-era strain, emergency savings, $400 expense readiness, and education gaps.',
    domain: 'Household Finance',
    collections: ['teaching'],
    methodTags: ['Dashboard', 'Time series', 'Survey data'],
    methods: ['Survey trends', 'Financial resilience', 'Group comparison'],
    relatedSlug: 'ch04-dashboards',
    kind: 'dashboard',
    preview: {
      src: '/studios/doing-okay-shed/preview.jpg',
      alt: 'Federal Reserve SHED financial wellbeing dashboard with trend charts, resilience measures, and group comparison views',
      objectPosition: 'center',
    },
    accent: '#8A5A44',
  },
  {
    slug: 'regulation-demand-guns',
    title: 'Regulation & Demand for Guns',
    blurb:
      'Analyze FBI background-check data to see how regulatory changes, major events, seasonality, and COVID-era shocks changed U.S. firearm demand across states.',
    domain: 'Public Safety',
    collections: ['teaching'],
    methodTags: ['Dashboard', 'Time series', 'Regression'],
    methods: ['Event study', 'Pre/post comparison', 'State variation'],
    relatedSlug: 'ch07-did',
    kind: 'dashboard',
    preview: {
      src: '/studios/regulation-demand-guns/preview.jpg',
      alt: 'Gun-demand dashboard with FBI background-check time series, regulatory event annotations, and state comparison charts',
      objectPosition: 'center',
    },
    accent: '#6F5D4B',
  },
  {
    slug: 'presidential-election-atlas',
    title: 'Presidential Election Atlas: 1976-2024',
    blurb:
      'A state-by-state presidential election dashboard: move across 1976-2024, compare national outcomes, read the hex map, and inspect which states shifted most from the prior election.',
    domain: 'Politics',
    collections: ['teaching'],
    methodTags: ['Dashboard', 'Maps', 'Exploratory viz'],
    methods: ['Dashboard sequencing', 'Geospatial comparison', 'State shifts'],
    relatedSlug: 'ch04-dashboards',
    kind: 'dashboard',
    preview: {
      src: '/studios/presidential-election-atlas/preview.jpg',
      alt: 'Presidential election atlas with state map and election result panels',
      objectPosition: 'center',
    },
    accent: '#287D67',
  },
  {
    slug: 'political-identity-divergence',
    title: 'The Great Divergence: Teen Political Identity',
    blurb:
      'Track how U.S. high school seniors describe their political identity from 1976-2023, with gender gaps, ideological spectrum shifts, and post-2016 decomposition views.',
    domain: 'Public Opinion',
    collections: ['teaching'],
    methodTags: ['Dashboard', 'Time series', 'Exploratory viz'],
    methods: ['Survey trends', 'Group comparison', 'Cohort shifts'],
    relatedSlug: 'ch04-dashboards',
    kind: 'dashboard',
    preview: {
      src: '/studios/political-identity-divergence/preview.jpg',
      alt: 'Political identity dashboard with trend lines, gender gap views, and spectrum decomposition charts',
      objectPosition: 'center',
    },
    accent: '#B08935',
  },
  {
    slug: 'political-identification-us',
    title: 'The Great Sorting: How Americans Re-Sorted Into Two Parties',
    blurb:
      'Follow ANES party-identification data from 1952-2024 to see how education, race, class, and religion reshaped the Democratic and Republican coalitions.',
    domain: 'Public Opinion',
    collections: ['teaching'],
    methodTags: ['Dashboard', 'Time series', 'Survey data'],
    methods: ['Survey trends', 'Coalition sorting', 'Group comparison'],
    relatedSlug: 'ch04-dashboards',
    kind: 'dashboard',
    preview: {
      src: '/studios/political-identification-us/preview.jpg',
      alt: 'Political identification dashboard with ANES party identification trends and coalition sorting charts',
      objectPosition: 'center',
    },
    accent: '#9F4A4A',
  },
  {
    slug: 'negative-partisanship-anes',
    title: 'Americans Didn’t Fall in Love With Their Party. They Learned to Despise the Other One.',
    blurb:
      'Use ANES feeling thermometers from 1978-2024 to separate in-party warmth from out-party dislike, distributional zeros, and affective polarization.',
    domain: 'Public Opinion',
    collections: ['teaching'],
    methodTags: ['Dashboard', 'Time series', 'Survey data'],
    methods: ['Affective polarization', 'Feeling thermometers', 'Distribution shifts'],
    relatedSlug: 'ch04-dashboards',
    kind: 'dashboard',
    preview: {
      src: '/studios/negative-partisanship-anes/preview.jpg',
      alt: 'ANES affective polarization dashboard with feeling thermometer trends and out-party dislike charts',
      objectPosition: 'center',
    },
    accent: '#A35F3D',
  },
  {
    slug: 'partisans-finally-got-constraint',
    title: 'Partisans Finally Got Constraint',
    blurb:
      'Revisit the partisans-without-constraint thesis with ANES issue-scale correlations, party-identification alignment, heatmaps, and sorting decompositions from 1970-2024.',
    domain: 'Public Opinion',
    collections: ['teaching'],
    methodTags: ['Dashboard', 'Correlation', 'Survey data'],
    methods: ['Correlation matrices', 'Issue constraint', 'Sorting decomposition'],
    relatedSlug: 'ch04-dashboards',
    kind: 'dashboard',
    preview: {
      src: '/studios/partisans-finally-got-constraint/preview.jpg',
      alt: 'Issue constraint dashboard with ANES correlation heatmaps, party identification alignment, and trend charts',
      objectPosition: 'center',
    },
    accent: '#5E548E',
  },
  {
    slug: 'unsorted-voters-switched',
    title: 'America Didn’t Wait for the Unsorted to Die — They Switched',
    blurb:
      'Track ANES cross-pressured voters from 1972-2024 to test whether partisan sorting came from generational replacement or switching among existing cohorts.',
    domain: 'Public Opinion',
    collections: ['teaching'],
    methodTags: ['Dashboard', 'Time series', 'Survey data'],
    methods: ['Cohort analysis', 'Cross-pressure', 'Coalition sorting'],
    relatedSlug: 'ch04-dashboards',
    kind: 'dashboard',
    preview: {
      src: '/studios/unsorted-voters-switched/preview.jpg',
      alt: 'ANES sorting dashboard with cross-pressured voter trends, education ladder views, and cohort switching charts',
      objectPosition: 'center',
    },
    accent: '#6B7F3A',
  },
  {
    slug: 'gen-z-gender-war-overstated',
    title: 'The Gen Z Gender War Is Real, New — and Half the Size You’ve Heard',
    blurb:
      'Use CES 2008-2024 data to size the under-30 gender gap, compare it with older voters, and separate the headline from the racial composition underneath it.',
    domain: 'Public Opinion',
    collections: ['teaching'],
    methodTags: ['Dashboard', 'Survey data', 'Group comparison'],
    methods: ['Youth politics', 'Gender gaps', 'Diverging dot plots'],
    relatedSlug: 'ch04-dashboards',
    kind: 'dashboard',
    preview: {
      src: '/studios/gen-z-gender-war-overstated/preview.png',
      alt: 'Gen Z gender-gap dashboard with under-30 men and women shown in diverging dot plots by race and year',
      objectPosition: 'center',
    },
    accent: '#2E7D8A',
  },
  {
    slug: 'income-ladder-flipped',
    title: 'The Income Ladder Flipped',
    blurb:
      'Trace CES presidential-vote reports from 2008-2024 to see how the classic income gradient inverted and why the richest voters became the most Democratic income group.',
    domain: 'Public Opinion',
    collections: ['teaching'],
    methodTags: ['Dashboard', 'Survey data', 'Realignment'],
    methods: ['Income voting', 'Coalition realignment', 'Slope charts'],
    relatedSlug: 'ch04-dashboards',
    kind: 'dashboard',
    preview: {
      src: '/studios/income-ladder-flipped/preview.png',
      alt: 'Income realignment dashboard with income brackets crossing in slope charts from 2008 to 2024',
      objectPosition: 'center',
    },
    accent: '#7C6A3D',
  },
  {
    slug: 'party-beats-place-seven-to-one',
    title: 'Your County Can’t Change Your Mind: Party Beats Place 8-to-1',
    blurb:
      'Pool CES interviews by county context to compare party identity with local red-blue environment across policy issues, showing how little place moves views once party is known.',
    domain: 'Public Opinion',
    collections: ['teaching'],
    methodTags: ['Dashboard', 'Survey data', 'Group comparison'],
    methods: ['Policy attitudes', 'County context', 'Diverging dot plots'],
    relatedSlug: 'ch04-dashboards',
    kind: 'dashboard',
    preview: {
      src: '/studios/party-beats-place-seven-to-one/preview.png',
      alt: 'Party versus place dashboard with policy dot plots showing party clusters much farther apart than county-context clusters',
      objectPosition: 'center',
    },
    accent: '#4E7A58',
  },
  {
    slug: 'one-national-election-county-swing-uniformity',
    title: 'America Now Holds One Election, Not 3,100',
    blurb:
      'Analyze county presidential returns from 1972-2024 to show the nationalization of county swing, the collapse of local variance, and the shrinking count of flipped counties.',
    domain: 'Elections',
    collections: ['teaching'],
    methodTags: ['Dashboard', 'Maps', 'Time series'],
    methods: ['County swing', 'Election nationalization', 'Small-multiple histograms'],
    relatedSlug: 'ch04-dashboards',
    kind: 'dashboard',
    preview: {
      src: '/studios/one-national-election-county-swing-uniformity/preview.png',
      alt: 'County swing nationalization dashboard with swing histograms and a county choropleth map',
      objectPosition: 'center',
    },
    accent: '#445E88',
  },
  {
    slug: 'merchant-right-county-residuals',
    title: 'Rich Counties Still Lean Republican Once You Control for Diplomas',
    blurb:
      'Combine county returns with ACS and rural-urban measures to show where income, education, ethnicity, and immigration explain the Trump-era county shift.',
    domain: 'Elections',
    collections: ['teaching'],
    methodTags: ['Dashboard', 'Maps', 'Regression'],
    methods: ['County residuals', 'Education controls', 'Geospatial diagnostics'],
    relatedSlug: 'ch04-dashboards',
    kind: 'dashboard',
    preview: {
      src: '/studios/merchant-right-county-residuals/preview.png',
      alt: 'County residuals dashboard with model residual maps and scatterplots of income, education, and Trump-era shifts',
      objectPosition: 'center',
    },
    accent: '#9C4F3B',
  },
  {
    slug: 'drug-availability-teens',
    title: 'Within Reach: Teen Drug Availability',
    blurb:
      'Read four decades of Monitoring the Future survey data on how available teens think drugs are, comparing substances, grade levels, long-run declines, and 2024 levels.',
    domain: 'Public Health',
    collections: ['teaching'],
    methodTags: ['Dashboard', 'Time series', 'Survey data'],
    methods: ['Survey trends', 'Long-run comparison', 'Small multiples'],
    relatedSlug: 'ch04-dashboards',
    kind: 'dashboard',
    preview: {
      src: '/studios/drug-availability-teens/preview.jpg',
      alt: 'Teen drug availability dashboard with substance trend lines, latest-year rankings, and small multiple charts',
      objectPosition: 'center',
    },
    accent: '#C47A2C',
  },
  {
    slug: 'religious-composition-dashboard',
    title: 'The Shape of Belief: World Religious Composition',
    blurb:
      'Explore how global religious composition changes from 2010-2050 across regions, faith groups, population shares, and projected growth patterns.',
    domain: 'Demographics',
    collections: ['teaching'],
    methodTags: ['Dashboard', 'Demographics', 'Forecasts'],
    methods: ['Composition analysis', 'Regional comparison', 'Projection reading'],
    relatedSlug: 'ch04-dashboards',
    kind: 'dashboard',
    preview: {
      src: '/studios/religious-composition-dashboard/preview.jpg',
      alt: 'World religious composition dashboard with global share charts, regional composition, and projection panels',
      objectPosition: 'center',
    },
    accent: '#6F6B2F',
  },
  {
    slug: 'ad-spend-explorer',
    title: 'Industry Ad Spend Explorer',
    blurb:
      'Explore 2018-2022 advertising spend by industry group, advertiser, and media type, with a Covid-era lens on budget shocks, recovery, and media mix shifts.',
    domain: 'Advertising',
    collections: ['teaching'],
    methodTags: ['Dashboard', 'Time series', 'Shock analysis'],
    methods: ['Dashboard sequencing', 'Media mix', 'Shock analysis'],
    relatedSlug: 'ch04-concentration-case',
    kind: 'dashboard',
    preview: {
      src: '/studios/ad-spend-explorer/preview.jpg',
      alt: 'Advertising spend dashboard with industry, media mix, and time-series charts',
      objectPosition: 'center',
    },
    accent: '#2F8F7B',
  },
  {
    slug: 'nyc-taxi-covid-emergency',
    title: 'NYC Taxi/Ride-Hail: Uber & Lyft at the COVID Emergency',
    blurb:
      'Trace Uber and Lyft rides across NYC pickup zones as demand breaks around the March 2020 emergency declaration, then compare the late-April floor by borough and zone.',
    domain: 'Mobility',
    collections: ['teaching'],
    methodTags: ['Dashboard', 'Maps', 'Shock analysis'],
    methods: ['Shock analysis', 'Time series', 'Spatial ranking'],
    relatedSlug: 'ch04-dashboards',
    kind: 'dashboard',
    preview: {
      src: '/studios/nyc-taxi-covid-emergency/preview.jpg',
      alt: 'NYC taxi and ride-hail COVID dashboard with demand shock charts and zone rankings',
      objectPosition: 'center',
    },
    accent: '#2563A6',
  },
  {
    slug: 'nyc-airbnb-atlas',
    title: 'NYC Airbnb: A Listings Atlas',
    blurb:
      'Explore tens of thousands of NYC listings by neighborhood, room type, and price — a worked example of how exploratory views turn a raw marketplace dump into a map of where supply and money actually sit.',
    domain: 'Marketplaces',
    collections: ['teaching'],
    methodTags: ['Dashboard', 'Maps', 'Exploratory viz'],
    methods: ['Exploratory viz', 'Geospatial mapping', 'Distributions'],
    relatedSlug: 'ch04-dashboards',
    kind: 'dashboard',
    preview: {
      src: '/studios/nyc-airbnb-atlas/preview.jpg',
      alt: 'NYC Airbnb atlas with map, listing distribution, and neighborhood views',
      objectPosition: 'center',
    },
    accent: '#0EA5E9',
  },
  {
    slug: 'progresso-dashboard',
    title: 'Countercyclical Pricing: Progresso Soup',
    blurb:
      'When demand is seasonal and a recession hits, when should a soup brand cut price and when should it hold? Trace promotion, volume, and competitive response across the cycle.',
    domain: 'CPG & Pricing',
    collections: ['teaching'],
    methodTags: ['Dashboard', 'Pricing', 'Time series'],
    methods: ['Pricing strategy', 'Demand seasonality', 'Time series'],
    relatedSlug: 'ch08-studio-pricing',
    kind: 'dashboard',
    preview: {
      src: '/studios/progresso-dashboard/preview.jpg',
      alt: 'Progresso soup pricing dashboard with seasonality and price-volume charts',
      objectPosition: 'center',
    },
    accent: '#F97316',
  },
  {
    slug: 'southwest-regression',
    title: 'The Southwest Effect',
    blurb:
      'Does a low-cost carrier entering a route really pull fares down — and by how much, once you hold distance and demand fixed? A visual walk through the classic regression.',
    domain: 'Airlines',
    collections: ['teaching'],
    methodTags: ['Regression', 'Dashboard', 'Controls'],
    methods: ['Regression', 'Effect isolation', 'Controls'],
    relatedSlug: 'ch06-regression-review',
    kind: 'dashboard',
    preview: {
      src: '/studios/southwest-regression/preview.jpg',
      alt: 'Southwest regression studio with fare comparison and regression visualizations',
      objectPosition: 'center',
    },
    accent: '#10B981',
  },
  {
    slug: 'southwest-regression-exercise',
    title: 'Regression Exercise: Did Southwest Lower Airfares?',
    blurb:
      'The hands-on companion: download the route data, run the regression yourself, and read the coefficients the way a manager would. Built for a live class session.',
    domain: 'Airlines',
    collections: ['teaching'],
    methodTags: ['Regression', 'Exercise', 'Data workflow'],
    methods: ['Hands-on regression', 'Coefficient reading', 'Data download'],
    relatedSlug: 'ch06-regression-review',
    kind: 'exercise',
    preview: {
      src: '/studios/southwest-regression-exercise/preview.jpg',
      alt: 'Regression exercise interface for estimating the Southwest airfare effect',
      objectPosition: 'center',
    },
    accent: '#8B5CF6',
  },
  {
    slug: 'share-of-wallet',
    title: 'Fast-Food Share of Wallet: COVID Impact',
    blurb:
      'How did the pandemic redraw where consumers spent their fast-food dollars? A share-of-wallet dashboard that benchmarks chains against the category through the shock and recovery.',
    domain: 'Restaurants',
    collections: ['teaching'],
    methodTags: ['Dashboard', 'Benchmarking', 'Shock analysis'],
    methods: ['Share of wallet', 'Benchmarking', 'Shock analysis'],
    relatedSlug: 'ch04-dashboards',
    kind: 'dashboard',
    preview: {
      src: '/studios/share-of-wallet/preview.jpg',
      alt: 'Fast-food share-of-wallet dashboard with chain benchmarks and COVID impact charts',
      objectPosition: 'center',
    },
    accent: '#F43F5E',
  },
  {
    slug: 'fast-food-perceptual-map',
    title: 'Fast-Food Brand Perceptual Map',
    blurb:
      'Reduce 48 BAV brand attributes into factor-map axes, inspect loadings, cluster fast-food brands, and test how much Brand Asset follows from the latent perception scores.',
    domain: 'Restaurants',
    collections: ['teaching'],
    methodTags: ['PCA / clustering', 'Dashboard', 'Perceptual maps'],
    methods: ['PCA', 'Factor analysis', 'Brand clustering'],
    relatedSlug: 'ch11-pca',
    kind: 'dashboard',
    preview: {
      src: '/studios/fast-food-perceptual-map/preview.jpg',
      alt: 'Fast-food perceptual map with brand positions and clustering controls',
      objectPosition: 'center',
    },
    accent: '#2A9D8F',
  },
  {
    slug: 'nyc-zip-health-segments',
    title: 'NYC Metro ZIP Health Segments',
    blurb:
      'Use health prevalence measures to build factor scores, cluster ZIP codes, and interpret the segments by correlating scores with income, age, college share, and deprivation.',
    domain: 'Public Health',
    collections: ['teaching'],
    methodTags: ['PCA / clustering', 'Dashboard', 'Segmentation'],
    methods: ['Factor scores', 'K-means clustering', 'Segment profiling'],
    relatedSlug: 'ch11-clustering',
    kind: 'dashboard',
    preview: {
      src: '/studios/nyc-zip-health-segments/preview.jpg',
      alt: 'NYC ZIP health segmentation dashboard with cluster and profile charts',
      objectPosition: 'center',
    },
    accent: '#4E79A7',
  },
  {
    slug: 'lottery-zip-psychographics',
    title: 'Lottery ZIP Psychographics: How Neighborhoods Play',
    blurb:
      'Segment active NYC ZIP codes from NY Lottery behavior signals, then interpret the PCA/factor score space with borough, income, retailer availability, and product-mix profiles.',
    domain: 'Public Finance',
    collections: ['teaching'],
    methodTags: ['PCA / clustering', 'Dashboard', 'Segmentation'],
    methods: ['PCA', 'Factor analysis', 'K-means clustering'],
    relatedSlug: 'ch11-clustering',
    kind: 'dashboard',
    preview: {
      src: '/studios/lottery-zip-psychographics/preview.jpg',
      alt: 'Lottery ZIP psychographics dashboard with PCA and cluster segmentation charts',
      objectPosition: 'center',
    },
    accent: '#C85B47',
  },
];

export function findStudio(slug: string): Studio | null {
  return studios.find(s => s.slug === slug) ?? null;
}

export function getStudioSlugs(): string[] {
  return studios.map(s => s.slug);
}

/**
 * Resolve a studio's paired chapter into display fields for cross-linking.
 * Returns null if the related slug is missing or unpublished, so callers can
 * gracefully omit the link rather than render a dead reference.
 */
export function relatedChapter(studio: Studio): { slug: string; number: string; title: string } | null {
  const found = findArticle(studio.relatedSlug);
  if (!found || found.article.status !== 'published') return null;
  return {
    slug: found.article.slug,
    number: found.article.number,
    title: found.article.title,
  };
}
