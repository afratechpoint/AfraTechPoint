import { verifyAdmin } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';

const IMAGEKIT_PRIVATE_KEY = "private_/bOCaYv2iR0Z83fl32njT2mo+B4=";
const TOTAL_STORAGE_LIMIT_BYTES = 20 * 1024 * 1024 * 1024; // 20 GB

export async function GET(request: NextRequest) {
  try {
    const adminToken = await verifyAdmin(request);
    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ImageKit Usage API requires startDate and endDate
    // Difference must be < 90 days. We'll use the last 30 days.
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const authHeader = 'Basic ' + Buffer.from(IMAGEKIT_PRIVATE_KEY + ':').toString('base64');

    const res = await fetch(`https://api.imagekit.io/v1/accounts/usage?startDate=${startDate}&endDate=${endDate}`, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to fetch ImageKit usage');
    }

    const data = await res.json();

    // From ImageKit docs: mediaLibraryStorageBytes is the total storage used
    const usedBytes = data.mediaLibraryStorageBytes || 0;
    const availableBytes = Math.max(0, TOTAL_STORAGE_LIMIT_BYTES - usedBytes);

    return NextResponse.json({
      usedBytes,
      totalBytes: TOTAL_STORAGE_LIMIT_BYTES,
      availableBytes,
      percentUsed: (usedBytes / TOTAL_STORAGE_LIMIT_BYTES) * 100
    });
  } catch (error: any) {
    console.error('[Storage Usage API Error]', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
