import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { adminAuth } from "@/lib/firebase/admin";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Basic admin check - in a production app, use common utility
    if (decodedToken.role !== "admin") {
       // Check firestore as fallback
       const profile = await storage.getUserProfile(decodedToken.uid);
       if (profile?.role !== "admin") {
         return NextResponse.json({ error: "Forbidden" }, { status: 403 });
       }
    }

    const count = await storage.getCustomersCount();
    return NextResponse.json({ count });
  } catch (error: any) {
    console.error("[API Customer Count Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
