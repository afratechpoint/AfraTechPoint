import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/sendEmail";
import { WelcomeEmail } from "@/emails/renderers/index";

export async function GET() {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

  if (!adminEmail || adminEmail.includes("your-email")) {
    return NextResponse.json({ 
      error: "SMTP not configured. Please update SMTP_USER and SMTP_PASS in .env.local first." 
    }, { status: 400 });
  }

  try {
    const result = await sendEmail({
      to: adminEmail,
      subject: "🚀 SMTP Verification Test - Afra Tech Point",
      template: WelcomeEmail,
      props: { customerName: "Administrator" }
    });

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: `Test email sent to ${adminEmail}. Check your inbox!` 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json({ 
      error: err.message || "Unknown SMTP error" 
    }, { status: 500 });
  }
}
