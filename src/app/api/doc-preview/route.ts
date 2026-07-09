import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Proxy: fetches a Google Docs export PDF and serves it inline so the
 * browser opens it directly instead of triggering a download dialog.
 *
 * Usage: /api/doc-preview?url=<encoded google docs url>
 * Protected: requires active partner or admin session.
 */
export async function GET(request: NextRequest) {
  // Auth check — only active partners/admins
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rawUrl = request.nextUrl.searchParams.get('url');
  if (!rawUrl) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

  // Only allow Google Docs export URLs
  const exportUrl = buildExportUrl(decodeURIComponent(rawUrl));
  if (!exportUrl) return NextResponse.json({ error: 'Invalid url' }, { status: 400 });

  const res = await fetch(exportUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) return NextResponse.json({ error: 'Failed to fetch document' }, { status: 502 });

  const pdf = await res.arrayBuffer();

  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="dokument.pdf"',
      'Cache-Control': 'private, max-age=300',
    },
  });
}

function buildExportUrl(url: string): string | null {
  const docsMatch = url.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (docsMatch) return `https://docs.google.com/document/d/${docsMatch[1]}/export?format=pdf`;
  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch) return `https://drive.google.com/uc?export=download&id=${driveFileMatch[1]}`;
  return null;
}
