import { verifyAdmin } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

import { revalidatePath } from 'next/cache';

export async function GET() {
  const products = await storage.getProducts();
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const adminToken = await verifyAdmin(request);
  if (!adminToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();
  const newProduct = await storage.createProduct(data);
  
  revalidatePath("/");
  revalidatePath("/shop");
  
  return NextResponse.json(newProduct);
}
