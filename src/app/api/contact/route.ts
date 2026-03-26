import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email/sendEmail";
import { ContactAutoReply, ContactAdminNotification } from "@/emails/renderers/index";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  message: z.string().min(10, "Message must be at least 10 characters.").max(2000, "Message is too long."),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 1. Validate Input
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, email, message } = parsed.data;
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

    if (!adminEmail) {
      console.error("ADMIN_EMAIL or SMTP_USER env is not configured.");
      return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });
    }

    // 2. Dispatch Dual Emails concurrently
    await Promise.all([
      // Auto-reply to customer
      sendEmail({
        to: email,
        subject: "We've received your message!",
        template: ContactAutoReply,
        props: { name }
      }),
      
      // Alert to Administrator
      sendEmail({
        to: adminEmail,
        subject: `New Inquiry from ${name}`,
        template: ContactAdminNotification,
        props: { name, email, message }
      })
    ]);

    return NextResponse.json({ success: true, message: "Emails dispatched successfully." });
    
  } catch (error: any) {
    console.error("Contact API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
