import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');

  if (!uid) {
    return NextResponse.json({ error: 'UID is required' }, { status: 400 });
  }

  const profile = await storage.getUserProfile(uid);
  return NextResponse.json(profile || {});
}

export async function POST(request: Request) {
  try {
    const { uid, data } = await request.json();

    if (!uid) {
      console.warn("[Profile API] Missing UID in request.");
      return NextResponse.json({ error: 'UID is required' }, { status: 400 });
    }

    console.log(`[Profile API] Updating profile for UID: ${uid}`, data);
    await storage.updateUserProfile(uid, data);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
