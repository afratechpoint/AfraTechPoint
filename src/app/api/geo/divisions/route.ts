import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://bdapis.com/api/v1.2/divisions', { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error('API failed');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    // Basic fallback if API is completely down
    return NextResponse.json({
      data: [
        { division: "Dhaka" },
        { division: "Chattogram" },
        { division: "Rajshahi" },
        { division: "Khulna" },
        { division: "Barishal" },
        { division: "Sylhet" },
        { division: "Rangpur" },
        { division: "Mymensingh" }
      ]
    });
  }
}
