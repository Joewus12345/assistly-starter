import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Signs an external_id using the Chatwoot HMAC token (if provided).
 * If CHATWOOT_HMAC_TOKEN is empty, we return 204 to indicate no secure mode.
 */
export async function GET(req: NextRequest) {
  const token = process.env.CHATWOOT_HMAC_TOKEN;
  const { searchParams } = new URL(req.url);
  const externalId = searchParams.get('external_id') || '';

  if (!token || !externalId) {
    return new NextResponse(null, { status: 204 });
  }

  const signature = crypto
    .createHmac('sha256', token)
    .update(externalId)
    .digest('hex');

  return NextResponse.json({ signature });
}
