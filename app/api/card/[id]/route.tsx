import { getRegistryItem } from '@/lib/registry';
import { renderGalleryThumb } from '@/lib/og-card';

/**
 * Generated gallery-card image for a registry item that has no real preview —
 * used as the `thumbnail` for datasets (set in scripts/sync-registry.ts). Clean
 * branded card (title + type + accent). GET /api/card/<id> → PNG.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = getRegistryItem(id);
  return renderGalleryThumb({
    type: item?.type ?? 'Dataset',
    title: item?.title ?? id,
    accent: item?.accent || '#287D67',
    topic: item?.topic,
  });
}
