import { contentResponse } from '@/lib/content-response';

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return contentResponse(request, ['read', ...(await params).path]);
}

export const HEAD = GET;
