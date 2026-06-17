/**
 * Research / CV data for the /research page, extracted from
 * research/singh_vita.docx. Plain data — the page renders it.
 *
 * NOTE for the author to verify before publishing widely:
 *  - Pub #24 (Morisi/Jost/Singh, AJPS 2019) lists "vol 113" in the CV, which is
 *    anomalous for AJPS in 2019 — reproduced as written, flagged here.
 *  - A few entries are missing volume/page detail in the source (marked below).
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
  title: 'Professor of Marketing',
  affiliation: 'Stern School of Business, New York University',
  email: 'vsingh@stern.nyu.edu',
  links: [
    { label: 'vishalsingh.org', href: 'https://vishalsingh.org/' },
    { label: 'D3M teaching', href: 'https://www.vishalsingh.org/teaching/d3m/' },
    { label: 'LinkedIn', href: 'http://www.linkedin.com/in/visualsingh' },
  ],
};

export const interests = [
  'Data-Driven Business Strategies',
  'Public Health',
  'Big Data & Psychology',
  'Political Science',
];

/** Refereed publications, chronological (the page renders newest-first). */
export const published: Publication[] = [
  { authors: 'Chintagunta, P., J.P. Dube, V. Singh', year: '2002', title: 'Market Structure Across Stores: An Application of a Random Coefficients Model with Store-Level Data', venue: 'Advances in Econometrics: Econometric Models in Marketing (JAI Press)', detail: 'eds. P. H. Franses & A. Montgomery' },
  { authors: 'Chintagunta, P., J.P. Dube, V. Singh', year: '2003', title: 'Balancing Profitability and Customer Welfare in a Supermarket Chain', venue: 'Quantitative Marketing and Economics', detail: 'Inaugural Issue, 1(1)' },
  { authors: 'Singh, V., K. Hansen, S. Gupta', year: '2005', title: 'Modeling Preferences for Common Attributes in Multi-category Choice', venue: 'Journal of Marketing Research', detail: '42(2), 195–209', note: 'Nominated, Paul Green Award' },
  { authors: 'Hansen, K., V. Singh, P. Chintagunta', year: '2006', title: 'Understanding the Store-brand Purchase Behavior Across Categories', venue: 'Marketing Science', detail: '25(1), 75–90' },
  { authors: 'Lewis, M., V. Singh, S. Fay', year: '2006', title: 'Forecasting the Impact of Non-linear Shipping and Handling Fees', venue: 'Marketing Science', detail: '25(1), 51–64' },
  { authors: 'Singh, V., K. Hansen, R. Blattberg', year: '2006', title: 'Market Entry and Consumer Behavior: The Case of Wal-Mart Supercenter', venue: 'Marketing Science', detail: '25(5), 457–476' },
  { authors: 'Draganska, M., S. Misra, V. Singh, et al.', year: '2008', title: 'Discrete Choice Models of Firms’ Strategic Decisions', venue: 'Marketing Letters', detail: '19, 399–416' },
  { authors: 'Singh, V., T. Zhu', year: '2008', title: 'Pricing and Market Concentration in Oligopoly Markets', venue: 'Marketing Science', detail: '27(6), 1020–1035' },
  { authors: 'Hansen, K., V. Singh', year: '2008', title: 'Research Note: Does Store Brand Create Store Loyalty? An Empirical Investigation', venue: 'Management Science', detail: '54(10), 1828–1834' },
  { authors: 'Chen, T., B. Sun, V. Singh', year: '2009', title: 'Investigating Consumer Choice Dynamics Around Marlboro Friday', venue: 'Marketing Science', detail: '28(4), 740–758' },
  { authors: 'Hansen, K., V. Singh', year: '2009', title: 'Market Structure Across Retail Formats', venue: 'Marketing Science', detail: '28(4), 656–673' },
  { authors: 'Zhu, T., V. Singh, M. Manuszak', year: '2009', title: 'Market Structure and Competition in the Retail Discount Industry', venue: 'Journal of Marketing Research', detail: '46(4), 453–466', note: 'Nominated, Paul Green Award' },
  { authors: 'Zhu, T., V. Singh', year: '2009', title: 'Spatial Competition with Endogenous Location Choices — An Application to Discount Retailing', venue: 'Quantitative Marketing and Economics', detail: '7, 1–35' },
  { authors: 'Khan, R., M. Lewis, V. Singh', year: '2009', title: 'Dynamic Customer Management and the Value of One-to-One Marketing', venue: 'Marketing Science', detail: '28(6), 1063–1079' },
  { authors: 'Meyer, R.J., J. Vosgerau, V. Singh, et al.', year: '2010', title: 'Behavioral Research and Empirical Modeling of Marketing Channels: Implications for Both Fields and a Call for Future Research', venue: 'Marketing Letters', detail: '21(3), 301–315' },
  { authors: 'Zhu, T., V. Singh, A. Dukes', year: '2011', title: 'Local Competition, Entry, and Agglomeration', venue: 'Quantitative Marketing and Economics', detail: '9, 129–154' },
  { authors: 'Khan, R., K. Misra, V. Singh', year: '2013', title: 'Ideology and Brand Consumption', venue: 'Psychological Science', detail: '24(3), 326–333' },
  { authors: 'Hansen, K., R. Khan, V. Singh', year: '2014', title: 'Hierarchical Modeling of Choice Concentration of US Households', venue: 'Bayesian Inference in the Social Sciences (Wiley)', detail: 'eds. I. Jeliazkov & X. Yang, 249–268' },
  { authors: 'Khan, R., K. Misra, V. Singh', year: '2015', title: 'Will a Fat Tax Work?', venue: 'Marketing Science', detail: '35(1), 10–26', note: 'Finalist, Best Paper in Marketing Science' },
  { authors: 'Wang, Y., M. Lewis, V. Singh', year: '2015', title: 'The Complex Consequences of Counter-Marketing: The Case of Cigarettes', venue: 'Marketing Science', detail: '35(1), 52–73' },
  { authors: 'Kim, B.J., V. Singh, R.S. Winer', year: '2017', title: 'The 80-20 Rule in Marketing: An Empirical Generalization', venue: 'Marketing Letters', detail: '28 (December), 491–507' },
  { authors: 'Jost, J., M. Langer, V. Singh', year: '2017', title: 'The Politics of Buying, Boycotting, Complaining, and Disputing', venue: 'Journal of Consumer Research', detail: '44(3)' },
  { authors: 'Thomadsen, R., V. Singh, et al.', year: '2018', title: 'How Context Affects Choices', venue: 'Customer Needs and Solutions', detail: '5(1–2), 3–14', url: 'https://link.springer.com/journal/40547/5/1/page/1' },
  { authors: 'Morisi, D., J. Jost, V. Singh', year: '2019', title: 'An Asymmetrical President-in-Power Effect', venue: 'American Journal of Political Science', detail: '113(2), 614–620', note: 'Volume as listed in CV — verify' },
  { authors: 'Guler, U., K. Misra, V. Singh', year: '2019', title: 'Heterogeneous Price Effects of Mergers: Evidence from the Car Rental Industry', venue: 'Marketing Science', detail: '39(1)' },
  { authors: 'Ma, Y., P.B. Seethu Seetharaman, V. Singh', year: '2021', title: 'A Multi-category Demand Model Incorporating Inter-product Proximity', venue: 'Journal of Business Research', detail: '124, 152–162' },
  { authors: 'Wang, Y., M. Lewis, V. Singh', year: '2021', title: 'Investigating the Effects of Excise Taxes, Public Usage Restrictions, and Anti-smoking Ads Across Cigarette Brands', venue: 'Journal of Marketing', detail: '85(3), 150–167' },
  { authors: 'Casidy, R., et al. (incl. V. Singh)', year: '2021', title: 'Religious Belief, Religious Priming, and Negative Word of Mouth', venue: 'Journal of Marketing Research', detail: '58(4), 762–781' },
  { authors: 'Misra, K., V. Singh, Q. Zhang', year: '2022', title: 'Frontiers: Impact of Stay-at-Home Orders and Cost-of-Living on Stimulus Response — Evidence from the CARES Act', venue: 'Marketing Science', detail: '41(2), 211–229' },
  { authors: 'Guler, U., K. Misra, V. Singh', year: '2024', title: 'Local Market Reaction to Brand Acquisitions: Evidence from the Craft Beer Industry', venue: 'Marketing Science', detail: '43(5)' },
  { authors: 'Guler, U., V. Singh', year: '2026', title: 'Polarized Consumption', venue: 'Quantitative Marketing and Economics', detail: '24(1), No. 2, 32 pp.', url: 'https://econpapers.repec.org/article/kapqmktec/' },
];

export const working: Publication[] = [
  { authors: 'Guler, U., V. Singh', title: 'The Ideological Geography of Brand Preference', venue: 'Working paper' },
  { authors: 'Hansen, K., K. Misra, V. Singh', title: 'Pricing a Participation-Dependent Product: Evidence from the Mega Millions Redesign', venue: 'Working paper' },
  { authors: 'Misra, K., U. Guler, V. Singh', title: 'Algorithmic Collusion Through Data Sharing', venue: 'Working paper' },
  { authors: 'Chen, M., M. Draganska, V. Singh', title: 'Risk Shocks and Preventive Demand: Evidence from Dobbs v. Jackson', venue: 'Working paper' },
  { authors: 'Hansman, C., H. Hong, A. De Paula, V. Singh', title: 'A Sticky-Price View of Hoarding', venue: 'Working paper' },
  { authors: 'Chen, M., V. Singh', title: 'Poverty & Mid-life Crises', venue: 'Working paper' },
  { authors: 'Kim, B.J., M. Ishihara, V. Singh', title: 'Peer Effects in Platform Adoption: The Case of US High School Teachers', venue: 'Working paper' },
  { authors: 'Amir, O., et al. (incl. V. Singh)', year: '2023', title: 'Using Large Datasets to Address Behavioral Research Questions', venue: 'Working paper' },
];

export const otherWriting: Publication[] = [
  { authors: 'Khan, R., K. Misra, V. Singh', year: '2016', title: 'Even a 14-Cent Food Tax Could Lead to Healthier Choices', venue: 'Harvard Business Review' },
  { authors: 'Singh, V., K.T. Hansen, R.C. Blattberg', year: '2010', title: 'Market Entry & Consumer Behavior', venue: 'Perspectives on Promotion and Database Marketing: The Collected Works of Robert C. Blattberg (World Scientific)', detail: 'p. 297' },
  { authors: 'Singh, V.', year: '2010', title: 'Contributions Using Micro Consumer Models to Address Macro Marketing Problems', venue: 'Perspectives on Promotion and Database Marketing (World Scientific)', detail: '261–264' },
  { authors: 'Singh, V.P., J.-P. Gervais, C.P. Baumel', year: '1998', title: 'Consumer Willingness to Purchase Factory-Production Ethanol Cars: A Contingent Valuation Approach', venue: 'Journal of the Transportation Research Forum', detail: '37(2)' },
];

export const education = [
  { degree: 'Ph.D., Marketing', school: 'Kellogg School of Management, Northwestern University', year: '2003' },
  { degree: 'M.S., Economics', school: 'Iowa State University' },
  { degree: 'B.A. (Hons), Economics', school: 'University of Delhi', year: '1992' },
];

export const honors = [
  'Finalist, Best Paper — Marketing Science (“Will a Fat Tax Work?”)',
  'Nominated, Paul Green Award (×2), Journal of Marketing Research',
  'Finalist, John D. C. Little Award',
  'Xerox Junior Faculty Chair',
  'MSI Young Scholar',
];

export const service = [
  'Associate Editor, Marketing Science (2014–2018)',
  'Editorial Board, Journal of Retailing',
  'Ad-hoc reviewer for ~10 journals and the NIH',
];
