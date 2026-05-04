/**
 * Per-article data manifests for The Great Sorting. Each entry tells
 * `scripts/fetch-book-data.mjs` which Tigris JSONs to pull.
 */
export const articles = [
  {
    slug: 'ch01-introduction',
    files: [
      // Lead: confidence in the executive branch by party — the partisan-flip
      // chart that opens the chapter.
      {
        graphId: 'gss_confed_high_year_polparty_percent_timetrend_demo',
        filename: 'confed-by-party.json',
      },
      // Topline executive-confidence trend (no demographic) for context.
      {
        graphId: 'gss_confed_high_year_percent_timetrend',
        filename: 'confed-topline.json',
      },
      // Bipartisan collapse: confidence in Congress.
      {
        graphId: 'gss_conlegis_high_year_percent_timetrend',
        filename: 'congress-topline.json',
      },
      // Cultural sorting preview: abortion-any-reason by party.
      {
        graphId: 'gss_abany_rec_year_polparty_percent_timetrend_demo',
        filename: 'abany-by-party.json',
      },
      // Lived-experience teaser: happiness by ideology.
      {
        graphId: 'gss_happy_rec_year_ideology_percent_timetrend_demo',
        filename: 'happy-by-ideology.json',
      },
    ],
  },
  {
    slug: 'ch02-media',
    files: [
      // Lead: press confidence by party — the credibility chasm.
      { graphId: 'gss_conpress_high_year_polparty_percent_timetrend_demo', filename: 'press-by-party.json' },
      // Topline press confidence (no demo) for backdrop.
      { graphId: 'gss_conpress_high_year_percent_timetrend', filename: 'press-topline.json' },
      // Press × education — does the diploma divide structure media trust?
      { graphId: 'gss_conpress_high_year_college_percent_timetrend_demo', filename: 'press-by-college.json' },
      // Press × age — generational lens.
      { graphId: 'gss_conpress_high_year_age_percent_timetrend_demo', filename: 'press-by-age.json' },
      // Active distrust: press low by party.
      { graphId: 'gss_conpress_low_year_polparty_percent_timetrend_demo', filename: 'press-low-by-party.json' },
      // Press low (overall topline).
      { graphId: 'gss_conpress_low_year_percent_timetrend', filename: 'press-low-topline.json' },
      // TV by party — softer version of same story?
      { graphId: 'gss_contv_high_year_polparty_percent_timetrend_demo', filename: 'tv-by-party.json' },
      // TV topline.
      { graphId: 'gss_contv_high_year_percent_timetrend', filename: 'tv-topline.json' },
    ],
  },
  {
    slug: 'ch02-economic-institutions',
    files: [
      // Big-three economic institutions, all by party + topline.
      { graphId: 'gss_conbus_high_year_percent_timetrend', filename: 'business-topline.json' },
      { graphId: 'gss_conbus_high_year_polparty_percent_timetrend_demo', filename: 'business-by-party.json' },
      { graphId: 'gss_conbus_high_year_income_percent_timetrend_demo', filename: 'business-by-income.json' },
      { graphId: 'gss_confinan_high_year_percent_timetrend', filename: 'banks-topline.json' },
      { graphId: 'gss_confinan_high_year_polparty_percent_timetrend_demo', filename: 'banks-by-party.json' },
      { graphId: 'gss_confinan_high_year_income_percent_timetrend_demo', filename: 'banks-by-income.json' },
      { graphId: 'gss_conlabor_high_year_percent_timetrend', filename: 'labor-topline.json' },
      { graphId: 'gss_conlabor_high_year_polparty_percent_timetrend_demo', filename: 'labor-by-party.json' },
      { graphId: 'gss_conlabor_high_year_age_percent_timetrend_demo', filename: 'labor-by-age.json' },
      { graphId: 'gss_conlabor_high_year_college_percent_timetrend_demo', filename: 'labor-by-college.json' },
    ],
  },
  {
    slug: 'ch02-social-cultural-institutions',
    files: [
      // Religion
      { graphId: 'gss_conclerg_high_year_percent_timetrend', filename: 'religion-topline.json' },
      { graphId: 'gss_conclerg_high_year_polparty_percent_timetrend_demo', filename: 'religion-by-party.json' },
      { graphId: 'gss_conclerg_high_year_churchattendance_percent_timetrend_demo', filename: 'religion-by-attendance.json' },
      { graphId: 'gss_conclerg_high_year_age_percent_timetrend_demo', filename: 'religion-by-age.json' },
      // Military
      { graphId: 'gss_conarmy_high_year_percent_timetrend', filename: 'military-topline.json' },
      { graphId: 'gss_conarmy_high_year_polparty_percent_timetrend_demo', filename: 'military-by-party.json' },
      { graphId: 'gss_conarmy_high_year_ideology_percent_timetrend_demo', filename: 'military-by-ideology.json' },
      { graphId: 'gss_conarmy_high_year_age_percent_timetrend_demo', filename: 'military-by-age.json' },
    ],
  },
  {
    slug: 'ch03-social-welfare',
    files: [
      // Education
      { graphId: 'gss_nateduc_toolittle_year_percent_timetrend', filename: 'education-topline.json' },
      { graphId: 'gss_nateduc_toolittle_year_polparty_percent_timetrend_demo', filename: 'education-by-party.json' },
      // Health
      { graphId: 'gss_natheal_toolittle_year_percent_timetrend', filename: 'health-topline.json' },
      { graphId: 'gss_natheal_toolittle_year_polparty_percent_timetrend_demo', filename: 'health-by-party.json' },
      // Social Security
      { graphId: 'gss_natsoc_toolittle_year_percent_timetrend', filename: 'socsec-topline.json' },
      { graphId: 'gss_natsoc_toolittle_year_polparty_percent_timetrend_demo', filename: 'socsec-by-party.json' },
      // Welfare ("too little")
      { graphId: 'gss_natfare_toolittle_year_percent_timetrend', filename: 'welfare-topline.json' },
      { graphId: 'gss_natfare_toolittle_year_polparty_percent_timetrend_demo', filename: 'welfare-by-party.json' },
      // Welfare ("too much") — the asymmetry the proposal flags
      { graphId: 'gss_natfare_toomuch_year_polparty_percent_timetrend_demo', filename: 'welfare-toomuch-by-party.json' },
      // Welfare by race — the racialization point
      { graphId: 'gss_natfare_toolittle_year_race_percent_timetrend_demo', filename: 'welfare-by-race.json' },
      // Childcare
      { graphId: 'gss_natchld_toolittle_year_polparty_percent_timetrend_demo', filename: 'childcare-by-party.json' },
      // Race programs
      { graphId: 'gss_natrace_toolittle_year_polparty_percent_timetrend_demo', filename: 'racial-by-party.json' },
    ],
  },
  {
    slug: 'ch06-social-trust',
    files: [
      // Topline: trust over time, no demographic.
      {
        graphId: 'gss_trust_rec_year_percent_timetrend',
        filename: 'trust-topline.json',
      },
      // Trust × Age (4 buckets: 18-34, 35-49, 50-64, 65+).
      // The catalog's age-period view; the closest the catalog gets to a cohort lens.
      {
        graphId: 'gss_trust_rec_year_age_percent_timetrend_demo',
        filename: 'trust-by-age.json',
      },
      // Trust × Education (the "diploma divide" satellite).
      {
        graphId: 'gss_trust_rec_year_education_percent_timetrend_demo',
        filename: 'trust-by-education.json',
      },
      // Trust × Political Party (party arrives late; smallest gap).
      {
        graphId: 'gss_trust_rec_year_polparty_percent_timetrend_demo',
        filename: 'trust-by-party.json',
      },
      // Trust × Race (the largest, most stable gap).
      {
        graphId: 'gss_trust_rec_year_race_percent_timetrend_demo',
        filename: 'trust-by-race.json',
      },
      // Trust × Income — the proposal's primary explanatory axis.
      {
        graphId: 'gss_trust_rec_year_income_percent_timetrend_demo',
        filename: 'trust-by-income.json',
      },
      // Multi-measure triangulation: belief-people-are-fair (fair_rec).
      {
        graphId: 'gss_fair_rec_year_percent_timetrend',
        filename: 'fair-topline.json',
      },
      {
        graphId: 'gss_fair_rec_year_income_percent_timetrend_demo',
        filename: 'fair-by-income.json',
      },
      {
        graphId: 'gss_fair_rec_year_polparty_percent_timetrend_demo',
        filename: 'fair-by-party.json',
      },
      // Multi-measure triangulation: belief-people-are-helpful (helpful_rec).
      {
        graphId: 'gss_helpful_rec_year_percent_timetrend',
        filename: 'helpful-topline.json',
      },
      {
        graphId: 'gss_helpful_rec_year_income_percent_timetrend_demo',
        filename: 'helpful-by-income.json',
      },
      {
        graphId: 'gss_helpful_rec_year_polparty_percent_timetrend_demo',
        filename: 'helpful-by-party.json',
      },
      // Meritocracy belief (getahead_rec) — chapter's connection to values.
      {
        graphId: 'gss_getahead_rec_year_percent_timetrend',
        filename: 'getahead-topline.json',
      },
      {
        graphId: 'gss_getahead_rec_year_income_percent_timetrend_demo',
        filename: 'getahead-by-income.json',
      },
      {
        graphId: 'gss_getahead_rec_year_polparty_percent_timetrend_demo',
        filename: 'getahead-by-party.json',
      },
      // (Trust × Political Era was inspected but dropped — the catalog's
      //  Political_Era column tags rows by survey year's president, not
      //  by the respondent's cohort, so it doesn't give the cohort lens
      //  we wanted. The age breakdown above carries that argument instead.)
    ],
  },
  {
    slug: 'ch07-anxious-liberal',
    files: [
      // Topline: % "very happy" over time, no demographic.
      {
        graphId: 'gss_happy_rec_year_percent_timetrend',
        filename: 'happy-topline.json',
      },
      // Happy × Ideology — the chapter's lead axis.
      {
        graphId: 'gss_happy_rec_year_ideology_percent_timetrend_demo',
        filename: 'happy-by-ideology.json',
      },
      // Happy × Age — the chapter's second axis.
      {
        graphId: 'gss_happy_rec_year_age_percent_timetrend_demo',
        filename: 'happy-by-age.json',
      },
      // Happy × Political Party — supplementary triangulation against ideology.
      {
        graphId: 'gss_happy_rec_year_polparty_percent_timetrend_demo',
        filename: 'happy-by-party.json',
      },
      // Happy × College — does the diploma divide show up here too?
      {
        graphId: 'gss_happy_rec_year_college_percent_timetrend_demo',
        filename: 'happy-by-college.json',
      },
      // SATFIN (financial satisfaction) — well-being measure #2 for triangulation.
      {
        graphId: 'gss_satfin_rec_year_percent_timetrend',
        filename: 'satfin-topline.json',
      },
      {
        graphId: 'gss_satfin_rec_year_ideology_percent_timetrend_demo',
        filename: 'satfin-by-ideology.json',
      },
      {
        graphId: 'gss_satfin_rec_year_age_percent_timetrend_demo',
        filename: 'satfin-by-age.json',
      },
      // HEALTH (self-reported "poor health") — well-being measure #3.
      // Note: catalog labels this "Prevalence of 'Poor Health'", so an UP
      // movement = worse health. We flip the framing in prose.
      {
        graphId: 'gss_health_rec_year_percent_timetrend',
        filename: 'health-topline.json',
      },
      {
        graphId: 'gss_health_rec_year_ideology_percent_timetrend_demo',
        filename: 'health-by-ideology.json',
      },
      {
        graphId: 'gss_health_rec_year_age_percent_timetrend_demo',
        filename: 'health-by-age.json',
      },
      // LIFE ("life is exciting" vs dull) — well-being measure #4.
      {
        graphId: 'gss_life_rec_year_percent_timetrend',
        filename: 'life-topline.json',
      },
      {
        graphId: 'gss_life_rec_year_ideology_percent_timetrend_demo',
        filename: 'life-by-ideology.json',
      },
      {
        graphId: 'gss_life_rec_year_age_percent_timetrend_demo',
        filename: 'life-by-age.json',
      },
    ],
  },
];
