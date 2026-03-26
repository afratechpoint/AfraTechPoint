import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { sendEmail } from "@/lib/email/sendEmail";
import { PasswordResetEmail } from "@/emails/renderers/index";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Checking if user exists. This is better for security, 
    // but some apps always return success to prevent email enumeration. 
    // Here we will check if the user exists.
    try {
      const userRecord = await adminAuth.getUserByEmail(email);
      
      // 1. Generate a password reset link from Firebase Admin 
      // (This link contains the 'oobCode' we need)
      const firebaseLink = await adminAuth.generatePasswordResetLink(email);

      // 2. Extract the 'oobCode' from the Firebase link
      const url = new URL(firebaseLink);
      const oobCode = url.searchParams.get("oobCode");

      // 3. Construct our own branded URL on our website
      // Use the shop URL from env or fallback to localhost
      const shopUrl = process.env.NEXT_PUBLIC_SHOP_URL || "http://localhost:3000";
      const resetLink = `${shopUrl}/reset-password?oobCode=${oobCode}`;

      // Send the email using our verified Gmail SMTP
      const result = await sendEmail({
        to: email,
        subject: "Reset your Afra Tech Point password",
        template: PasswordResetEmail,
        props: { 
          customerName: userRecord.displayName || "Customer", 
          resetLink 
        }
      });

      if (result.success) {
        return NextResponse.json({ success: true, message: "Reset link sent to your inbox!" });
      } else {
        return NextResponse.json({ error: "Failed to send email. Please try again later." }, { status: 500 });
      }
    } catch (authError: any) {
      if (authError.code === "auth/user-not-found") {
        // Return success even if user not found to prevent user enumeration security risk
        return NextResponse.json({ success: true, message: "If an account exists for this email, a reset link has been sent." });
      }
      throw authError;
    }
  } catch (err: any) {
    console.error("Custom Reset Password API Error:", err);
    return NextResponse.json({ error: err.message || "Failed to process request" }, { status: 500 });
  }
}
