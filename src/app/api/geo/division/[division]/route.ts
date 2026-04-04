import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ division: string }> }) {
  try {
    const { division } = await params;
    const res = await fetch(`https://bdapis.com/api/v1.2/division/${division.toLowerCase()}`, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error('API failed');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    // If external API fails, return a safe empty list so the app doesn't crash
    return NextResponse.json({ data: [] });
  }
}
