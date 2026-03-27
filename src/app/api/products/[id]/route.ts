import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { revalidatePath } from 'next/cache';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const products = await storage.getProducts();
  const product = products.find((p: any) => p.id === id);
  
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await request.json();
  
  await storage.updateProduct(id, data);

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/shop/${id}`);

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await storage.deleteProduct(id);

  revalidatePath("/");
  revalidatePath("/shop");

  return NextResponse.json({ success: true });
}
