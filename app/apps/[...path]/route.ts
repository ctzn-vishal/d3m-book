import { contentResponse } from '@/lib/content-response';

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return contentResponse(request, ['apps', ...(await params).path]);
}

export const HEAD = GET;
