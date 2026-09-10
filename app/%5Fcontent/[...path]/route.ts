import { contentResponse } from '@/lib/content-response';

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return contentResponse(request, (await params).path, true);
}

export const HEAD = GET;
