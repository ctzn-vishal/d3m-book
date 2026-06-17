/**
 * Canonical gallery topics. Keeping a controlled vocabulary (rather than
 * free-form per item) stops the topic filter from sprawling into near-duplicates
 * as the catalog grows. Studios map their `domain` → a topic via DOMAIN_TO_TOPIC;
 * anything you want to re-topic, override in content/gallery.json (`curate`).
 */
export const TOPICS = [
  'Politics & Elections',
  'Public Opinion',
  'Public Health',
  'Finance',
  'Pricing & CPG',
  'Markets & Industry',
  'Media & Advertising',
  'Demographics',
  'Mobility',
  'Trade',
  'AI & Data',
] as const;

export type Topic = (typeof TOPICS)[number];

const DOMAIN_TO_TOPIC: Record<string, string> = {
  'Global Media': 'Media & Advertising',
  Advertising: 'Media & Advertising',
  'Consumer Finance': 'Finance',
  'Household Finance': 'Finance',
  'Public Finance': 'Finance',
  'Public Safety': 'Politics & Elections',
  Politics: 'Politics & Elections',
  Elections: 'Politics & Elections',
  'Public Opinion': 'Public Opinion',
  'Public Health': 'Public Health',
  Demographics: 'Demographics',
  Mobility: 'Mobility',
  Marketplaces: 'Markets & Industry',
  'CPG & Pricing': 'Pricing & CPG',
  Airlines: 'Markets & Industry',
  Restaurants: 'Markets & Industry',
};

export function domainToTopic(domain?: string): string {
  if (!domain) return 'Other';
  return DOMAIN_TO_TOPIC[domain] ?? domain;
}
