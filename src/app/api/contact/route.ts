import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { storage } from "@/lib/storage";
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
    const settings = await storage.getSettings();
    const adminEmail = settings?.adminEmail || process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    const logoUrl = settings?.logoUrl;
    const shopUrl = settings?.shopUrl;

    if (!adminEmail) {
      console.error("ADMIN_EMAIL or SMTP_USER env is not configured.");
      return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });
    }

    // 2. Dispatch Dual Emails concurrently
    const results = await Promise.allSettled([
      // Auto-reply to customer
      sendEmail({
        to: email,
        subject: "We've received your message!",
        template: ContactAutoReply,
        props: { name, logoUrl, shopUrl }
      }),
      
      // Alert to Administrator
      sendEmail({
        to: adminEmail,
        subject: `New Inquiry from ${name}`,
        template: ContactAdminNotification,
        props: { name, email, message, logoUrl, shopUrl }
      })
    ]);

    const failures = results.filter(r => r.status === 'rejected');
    
    if (failures.length > 0) {
      console.error("Some emails failed to send:", failures);
      // If all failed, return error. If some failed, we might still return success but log it.
      if (failures.length === results.length) {
        const errorMsg = (failures[0] as PromiseRejectedResult).reason?.message || "Email delivery failed";
        return NextResponse.json({ 
          error: "Message received but email delivery failed. Please check your SMTP settings.",
          details: errorMsg 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: "Message received successfully." });
    
  } catch (error: any) {
    console.error("Contact API Exception:", error);
    return NextResponse.json({ error: "An unexpected error occurred. Please try again later." }, { status: 500 });
  }
}
