import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { sendEmail } from "@/lib/email/sendEmail";
import { EmailVerificationEmail } from "@/emails/renderers/index";

export async function POST(req: Request) {
  try {
    const { email, displayName } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 1. Generate an email verification link from Firebase Admin 
    // This creates an OOB code for email verification
    const firebaseLink = await adminAuth.generateEmailVerificationLink(email);

    // 2. Extract the 'oobCode'
    const url = new URL(firebaseLink);
    const oobCode = url.searchParams.get("oobCode");

    // 3. Construct our branded URL
    const shopUrl = process.env.NEXT_PUBLIC_SHOP_URL || "http://localhost:3000";
    const verificationLink = `${shopUrl}/verify-email?oobCode=${oobCode}`;

    // 4. Send the branded email
    const result = await sendEmail({
      to: email,
      subject: "Activate your Afra Tech Point account",
      template: EmailVerificationEmail,
      props: { 
        customerName: displayName || "Customer", 
        verificationLink 
      }
    });

    if (result.success) {
      return NextResponse.json({ success: true, message: "Verification link sent!" });
    } else {
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 });
    }
  } catch (err: any) {
    console.error("Verification Email API Error:", err);
    return NextResponse.json({ error: err.message || "Failed to process request" }, { status: 500 });
  }
}
