/**
 * Research / CV data for the /research page, extracted from
 * research/singh_vita.docx. Plain data — the page renders it.
 *
 * Links: every `url` below is a DOI resolved and verified against Crossref
 * (title + author match) on 2026-06-22. Note that a few CV titles are the
 * author's shorthand and differ from the published title of record — e.g.
 * "Does Store Brand Create Store Loyalty?" appears as "Are Store-Brand Buyers
 * Store Loyal?", "The 80-20 Rule in Marketing" as "The Pareto rule for
 * frequently purchased packaged goods", "The Complex Consequences of
 * Counter-Marketing" as "The Unintended Consequences of Countermarketing
 * Strategies", and "Heterogeneous Price Effects of Mergers" as "...of
 * Consolidation". The links point to the correct papers regardless.
 */

export type Publication = {
  authors: string;
  year?: string;
  title: string;
  venue: string;
  detail?: string;
  note?: string;
  url?: string;
};

export const profile = {
  name: 'Vishal Singh',
  title: 'Professor of Marketing & Director, Stern Center of Research & Computing (SCRC)',
  affiliation: 'Stern School of Business, New York University',
  email: 'vsingh@stern.nyu.edu',
  links: [
    { label: 'vishalsingh.org', href: 'https://vishalsingh.org/' },
    { label: 'Teaching', href: 'https://www.vishalsingh.org/teaching' },
    { label: 'LinkedIn', href: 'http://www.linkedin.com/in/visualsingh' },
  ],
};

export const interests = [
  'Empirical IO',
  'Retail Competition',
  'Consumer Behavior',
  'Public Health',
  'Big Data & Psychology',
  'Political Science',
];

/** Refereed publications, chronological (the page renders newest-first). */
export const published: Publication[] = [
  { authors: 'Chintagunta, P., J.P. Dube, V. Singh', year: '2002', title: 'Market Structure Across Stores: An Application of a Random Coefficients Model with Store-Level Data', venue: 'Advances in Econometrics: Econometric Models in Marketing (JAI Press)', detail: 'eds. P. H. Franses & A. Montgomery', url: 'https://doi.org/10.1016/S0731-9053(02)16009-9' },
  { authors: 'Chintagunta, P., J.P. Dube, V. Singh', year: '2003', title: 'Balancing Profitability and Customer Welfare in a Supermarket Chain', venue: 'Quantitative Marketing and Economics', detail: 'Inaugural Issue, 1(1)', url: 'https://doi.org/10.1023/A:1023534028314' },
  { authors: 'Singh, V., K. Hansen, S. Gupta', year: '2005', title: 'Modeling Preferences for Common Attributes in Multi-category Choice', venue: 'Journal of Marketing Research', detail: '42(2), 195–209', note: 'Nominated, Paul Green Award', url: 'https://doi.org/10.1509/jmkr.42.2.195.62282' },
  { authors: 'Hansen, K., V. Singh, P. Chintagunta', year: '2006', title: 'Understanding the Store-brand Purchase Behavior Across Categories', venue: 'Marketing Science', detail: '25(1), 75–90', url: 'https://doi.org/10.1287/mksc.1050.0151' },
  { authors: 'Lewis, M., V. Singh, S. Fay', year: '2006', title: 'Forecasting the Impact of Non-linear Shipping and Handling Fees', venue: 'Marketing Science', detail: '25(1), 51–64', url: 'https://doi.org/10.1287/mksc.1050.0150' },
  { authors: 'Singh, V., K. Hansen, R. Blattberg', year: '2006', title: 'Market Entry and Consumer Behavior: The Case of Wal-Mart Supercenter', venue: 'Marketing Science', detail: '25(5), 457–476', url: 'https://doi.org/10.1287/mksc.1050.0176' },
  { authors: 'Draganska, M., S. Misra, V. Singh, et al.', year: '2008', title: 'Discrete Choice Models of Firms’ Strategic Decisions', venue: 'Marketing Letters', detail: '19, 399–416', url: 'https://doi.org/10.1007/s11002-008-9060-3' },
  { authors: 'Singh, V., T. Zhu', year: '2008', title: 'Pricing and Market Concentration in Oligopoly Markets', venue: 'Marketing Science', detail: '27(6), 1020–1035', url: 'https://doi.org/10.1287/mksc.1070.0357' },
  { authors: 'Hansen, K., V. Singh', year: '2008', title: 'Research Note: Does Store Brand Create Store Loyalty? An Empirical Investigation', venue: 'Management Science', detail: '54(10), 1828–1834', url: 'https://doi.org/10.1287/mnsc.1080.0861' },
  { authors: 'Chen, T., B. Sun, V. Singh', year: '2009', title: 'Investigating Consumer Choice Dynamics Around Marlboro Friday', venue: 'Marketing Science', detail: '28(4), 740–758', url: 'https://doi.org/10.1287/mksc.1080.0446' },
  { authors: 'Hansen, K., V. Singh', year: '2009', title: 'Market Structure Across Retail Formats', venue: 'Marketing Science', detail: '28(4), 656–673', url: 'https://doi.org/10.1287/mksc.1080.0432' },
  { authors: 'Zhu, T., V. Singh, M. Manuszak', year: '2009', title: 'Market Structure and Competition in the Retail Discount Industry', venue: 'Journal of Marketing Research', detail: '46(4), 453–466', note: 'Nominated, Paul Green Award', url: 'https://doi.org/10.1509/jmkr.46.4.453' },
  { authors: 'Zhu, T., V. Singh', year: '2009', title: 'Spatial Competition with Endogenous Location Choices — An Application to Discount Retailing', venue: 'Quantitative Marketing and Economics', detail: '7, 1–35', url: 'https://doi.org/10.1007/s11129-008-9048-6' },
  { authors: 'Khan, R., M. Lewis, V. Singh', year: '2009', title: 'Dynamic Customer Management and the Value of One-to-One Marketing', venue: 'Marketing Science', detail: '28(6), 1063–1079', url: 'https://doi.org/10.1287/mksc.1090.0497' },
  { authors: 'Meyer, R.J., J. Vosgerau, V. Singh, et al.', year: '2010', title: 'Behavioral Research and Empirical Modeling of Marketing Channels: Implications for Both Fields and a Call for Future Research', venue: 'Marketing Letters', detail: '21(3), 301–315', url: 'https://doi.org/10.1007/s11002-010-9109-y' },
  { authors: 'Zhu, T., V. Singh, A. Dukes', year: '2011', title: 'Local Competition, Entry, and Agglomeration', venue: 'Quantitative Marketing and Economics', detail: '9, 129–154', url: 'https://doi.org/10.1007/s11129-011-9097-0' },
  { authors: 'Khan, R., K. Misra, V. Singh', year: '2013', title: 'Ideology and Brand Consumption', venue: 'Psychological Science', detail: '24(3), 326–333', url: 'https://doi.org/10.1177/0956797612457379' },
  { authors: 'Hansen, K., R. Khan, V. Singh', year: '2014', title: 'Hierarchical Modeling of Choice Concentration of US Households', venue: 'Bayesian Inference in the Social Sciences (Wiley)', detail: 'eds. I. Jeliazkov & X. Yang, 249–268', url: 'https://doi.org/10.1002/9781118771051.ch10' },
  { authors: 'Khan, R., K. Misra, V. Singh', year: '2015', title: 'Will a Fat Tax Work?', venue: 'Marketing Science', detail: '35(1), 10–26', note: 'Finalist, Best Paper in Marketing Science', url: 'https://doi.org/10.1287/mksc.2015.0917' },
  { authors: 'Wang, Y., M. Lewis, V. Singh', year: '2015', title: 'The Complex Consequences of Counter-Marketing: The Case of Cigarettes', venue: 'Marketing Science', detail: '35(1), 52–73', url: 'https://doi.org/10.1287/mksc.2015.0910' },
  { authors: 'Kim, B.J., V. Singh, R.S. Winer', year: '2017', title: 'The 80-20 Rule in Marketing: An Empirical Generalization', venue: 'Marketing Letters', detail: '28 (December), 491–507', url: 'https://doi.org/10.1007/s11002-017-9442-5' },
  { authors: 'Jost, J., M. Langer, V. Singh', year: '2017', title: 'The Politics of Buying, Boycotting, Complaining, and Disputing', venue: 'Journal of Consumer Research', detail: '44(3)', url: 'https://doi.org/10.1093/jcr/ucx084' },
  { authors: 'Thomadsen, R., V. Singh, et al.', year: '2018', title: 'How Context Affects Choices', venue: 'Customer Needs and Solutions', detail: '5(1–2), 3–14', url: 'https://doi.org/10.1007/s40547-017-0084-9' },
  { authors: 'Morisi, D., J. Jost, V. Singh', year: '2019', title: 'An Asymmetrical President-in-Power Effect', venue: 'American Political Science Review', detail: '113(2), 614–620', url: 'https://doi.org/10.1017/S0003055418000850' },
  { authors: 'Guler, U., K. Misra, V. Singh', year: '2019', title: 'Heterogeneous Price Effects of Mergers: Evidence from the Car Rental Industry', venue: 'Marketing Science', detail: '39(1)', url: 'https://doi.org/10.1287/mksc.2018.1103' },
  { authors: 'Ma, Y., P.B. Seethu Seetharaman, V. Singh', year: '2021', title: 'A Multi-category Demand Model Incorporating Inter-product Proximity', venue: 'Journal of Business Research', detail: '124, 152–162', url: 'https://doi.org/10.1016/j.jbusres.2020.11.036' },
  { authors: 'Wang, Y., M. Lewis, V. Singh', year: '2021', title: 'Investigating the Effects of Excise Taxes, Public Usage Restrictions, and Anti-smoking Ads Across Cigarette Brands', venue: 'Journal of Marketing', detail: '85(3), 150–167', url: 'https://doi.org/10.1177/0022242921994566' },
  { authors: 'Casidy, R., et al. (incl. V. Singh)', year: '2021', title: 'Religious Belief, Religious Priming, and Negative Word of Mouth', venue: 'Journal of Marketing Research', detail: '58(4), 762–781', url: 'https://doi.org/10.1177/00222437211011196' },
  { authors: 'Misra, K., V. Singh, Q. Zhang', year: '2022', title: 'Frontiers: Impact of Stay-at-Home Orders and Cost-of-Living on Stimulus Response — Evidence from the CARES Act', venue: 'Marketing Science', detail: '41(2), 211–229', url: 'https://doi.org/10.1287/mksc.2021.1329' },
  { authors: 'Guler, U., K. Misra, V. Singh', year: '2024', title: 'Local Market Reaction to Brand Acquisitions: Evidence from the Craft Beer Industry', venue: 'Marketing Science', detail: '43(5)', url: 'https://doi.org/10.1287/mksc.2022.0383' },
  { authors: 'Guler, U., V. Singh', year: '2026', title: 'Polarized Consumption', venue: 'Quantitative Marketing and Economics', detail: '24(1), No. 2, 32 pp.', url: 'https://doi.org/10.1007/s11129-026-09308-y' },
];

export const working: Publication[] = [
  { authors: 'Hansen, K., K. Misra, V. Singh', title: 'Pricing a Participation-Dependent Product: Evidence from the Mega Millions Redesign', venue: 'Working paper', url: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6760160' },
  { authors: 'Misra, K., U. Guler, V. Singh', title: 'Algorithmic Collusion Through Data Sharing', venue: 'Working paper', url: 'https://www.dropbox.com/scl/fi/pgl60b6fva7qeoxzm7bfo/algorithmic_pricing.pdf?rlkey=c8x2m1hv5fmcjowil83j3vujt&dl=1' },
  { authors: 'Guler, U., V. Singh', title: 'The Ideological Geography of Brand Preference', venue: 'Working paper', url: 'https://www.dropbox.com/scl/fi/zwo3ebj9kfz2f7x42mmu8/Brand_origins.pdf?rlkey=zjn3zxisx8cxbpve93eia66kz&dl=1' },
  { authors: 'Chen, M., M. Draganska, V. Singh', title: 'Risk Shocks and Preventive Demand: Evidence from Dobbs v. Jackson', venue: 'Working paper', url: 'https://www.dropbox.com/scl/fi/upy0etbyetp34keszk4as/Dobbs_and_Contraceptives.pdf?rlkey=r26woo2loywgyibj4q76tan5k&dl=1' },
  { authors: 'Hansman, C., H. Hong, A. De Paula, V. Singh', title: 'A Sticky-Price View of Hoarding', venue: 'Working paper', url: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3594264' },
  { authors: 'Chen, M., V. Singh', title: 'Poverty & Consumption', venue: 'Working paper' },
  { authors: 'Kim, J.Y., M. Ishihara, V. Singh', title: 'Health Insurance and Dynamics of Patient Decision Making', venue: 'Working paper', url: 'https://www.dropbox.com/scl/fi/uo1emdb3j4gx6zg8lfij2/Health_Insurance_Project.pdf?rlkey=eohsktsq6lj4r9l79wefk8mm3&dl=1' },
  { authors: 'Duhachek, A., V. Singh', title: 'The Midlife Mental-Health Trough Is Concentrated Among Lower-Income Adults', venue: 'Working paper', url: 'https://www.dropbox.com/scl/fi/insgl0ds86ltypnh340x2/happy_midlife.pdf?rlkey=nyrusef0s5hughorws2gwxvae&dl=1' },
];

export const otherWriting: Publication[] = [
  { authors: 'Khan, R., K. Misra, V. Singh', year: '2016', title: 'Even a 14-Cent Food Tax Could Lead to Healthier Choices', venue: 'Harvard Business Review' },
  { authors: 'Singh, V., K.T. Hansen, R.C. Blattberg', year: '2010', title: 'Market Entry & Consumer Behavior', venue: 'Perspectives on Promotion and Database Marketing: The Collected Works of Robert C. Blattberg (World Scientific)', detail: 'p. 297' },
  { authors: 'Singh, V.', year: '2010', title: 'Contributions Using Micro Consumer Models to Address Macro Marketing Problems', venue: 'Perspectives on Promotion and Database Marketing (World Scientific)', detail: '261–264' },
  { authors: 'Singh, V.P., J.-P. Gervais, C.P. Baumel', year: '1998', title: 'Consumer Willingness to Purchase Factory-Production Ethanol Cars: A Contingent Valuation Approach', venue: 'Journal of the Transportation Research Forum', detail: '37(2)' },
];


