import { NextResponse } from "next/server";
import { adminAuth, adminDb, getAdminRtDb } from "@/lib/firebase/admin";
import { storage } from "@/lib/storage";

export async function GET() {
  const results: any[] = [];

  // 1. Firebase Admin Init Check
  try {
    results.push({
      name: "Firebase Admin Initialization",
      status: !!adminDb ? "success" : "error",
      message: !!adminDb ? "Initialized" : "Failed to initialize Firebase Admin",
    });
  } catch (e: any) {
    results.push({ name: "Firebase Admin Initialization", status: "error", message: e.message });
  }

  // 2. Firestore Connectivity (Fetch Settings)
  try {
    const settings = await storage.getSettings();
    results.push({
      name: "Firestore / Settings Load",
      status: "success",
      message: `Successfully loaded settings. Object keys: ${Object.keys(settings || {}).length}`,
    });
  } catch (e: any) {
    let status = "error";
    let msg = e.message;
    if (msg.includes("RESOURCE_EXHAUSTED") || msg.includes("Quota exceeded")) {
      status = "warning";
      msg = "QUOTA EXCEEDED: Your Firebase daily free tier limit has been reached.";
    }
    results.push({ name: "Firestore Connectivity", status, message: msg });
  }

  // 3. RTDB Connectivity (Optional)
  try {
    const rtdb = getAdminRtDb();
    const snap = await rtdb.ref(".info/connected").get();
    results.push({
      name: "Realtime Database Connectivity",
      status: snap.exists() ? "success" : "warning",
      message: snap.exists() ? "Connected to RTDB" : "Could not verify RTDB info",
    });
  } catch (e: any) {
    results.push({ name: "Realtime Database", status: "warning", message: e.message });
  }

  // 4. Env Vars Check (Sensitive keys masked)
  const envs = [
    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
    "IMGBB_API_KEY",
    "ADMIN_EMAIL"
  ];
  
  const envCheck = envs.map(key => ({
    key,
    exists: !!process.env[key],
    length: process.env[key]?.length || 0
  }));

  results.push({
    name: "Environment Variables Check",
    status: envCheck.every(e => e.exists) ? "success" : "error",
    message: envCheck.map(e => `${e.key}: ${e.exists ? 'OK (' + e.length + ' chars)' : 'MISSING'}`).join(", ")
  });

  // 5. Products Fetch Check
  try {
    const products = await storage.getProducts();
    results.push({
      name: "Products Fetching API",
      status: products.length > 0 ? "success" : "warning",
      message: `Found ${products.length} products total (includes local fallback).`,
    });
  } catch (e: any) {
    results.push({ name: "Products Fetching API", status: "error", message: e.message });
  }

  return NextResponse.json({ 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    results 
  });
}
