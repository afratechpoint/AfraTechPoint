import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { adminAuth } from '@/lib/firebase/admin';

async function getAuthenticatedUid(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken.uid;
  } catch (error) {
    console.warn("[Profile API] Invalid or expired token.");
    return null;
  }
}

export async function GET(request: Request) {
  const uid = await getAuthenticatedUid(request);
  
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const profile = await storage.getUserProfile(uid);
    return NextResponse.json(profile || {});
  } catch (err) {
    console.error("[Profile API GET] Error:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const uid = await getAuthenticatedUid(request);
  
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data } = await request.json();
    if (!data) return NextResponse.json({ error: 'Data is required' }, { status: 400 });

    console.log(`[Profile API] Updating profile for UID: ${uid} (Verified via token)`);
    await storage.updateUserProfile(uid, data);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Profile API POST] Error:", err);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
