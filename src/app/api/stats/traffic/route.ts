import { storage } from "@/lib/storage";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const count = await storage.getTraffic();
    return NextResponse.json({ count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    await storage.incrementTraffic();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
