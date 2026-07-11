export type { ActionResult } from '../types';

/** Platforms the social queue drafts for, in display order. */
export const PLATFORMS = ['x', 'linkedin', 'instagram'] as const;
export type SocialPlatform = (typeof PLATFORMS)[number];

export const SOCIAL_STATUSES = ['draft', 'approved', 'posted', 'rejected'] as const;
export type SocialStatus = (typeof SOCIAL_STATUSES)[number];

export const PLATFORM_LABEL: Record<SocialPlatform, string> = {
  x: 'X / Twitter',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
};

/** Soft character ceilings mirrored from scripts/social-drafts.ts (warn, don't block). */
export const PLATFORM_MAX: Record<SocialPlatform, number> = {
  x: 275,
  linkedin: 3000,
  instagram: 2200,
};

/** A social_queue row joined with its gallery item (serializable, server → client). */
export type SocialDraft = {
  id: string;
  itemId: string;
  platform: SocialPlatform;
  status: SocialStatus;
  text: string;
  linkUrl: string;
  imageUrl: string | null;
  hook: string | null;
  createdAt: string | null;
  postedAt: string | null;
  itemTitle: string;
  itemTopic: string | null;
};
