import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET() {
  const products = await storage.getProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const data = await request.json();
  const newProduct = await storage.createProduct(data);
  return NextResponse.json(newProduct);
}
