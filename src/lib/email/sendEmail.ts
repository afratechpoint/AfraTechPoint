import nodemailer from "nodemailer";
import { render } from "@react-email/render";

interface SendEmailParams {
  to: string | string[];
  subject: string;
  template: (props: any) => React.ReactElement;
  props?: any;
  from?: string;
}

/**
 * Common utility to send responsive HTML emails safely wrapped over NodeMailer's SMTP.
 * Make sure process.env variables are structured properly.
 */
export async function sendEmail({
  to,
  subject,
  template,
  props,
  from = process.env.SMTP_FROM || '"Nitec Ecosystem" <noreply@pitec.com>'
}: SendEmailParams) {
  
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("sendEmail: Missing SMTP configurations. Aborting email send.");
    return { success: false, error: "Missing SMTP configuration" };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Dynamically parse the React component into an HTML string payload
  const html = await render(template(props || {}));

  const mailOptions = {
    from,
    to: Array.isArray(to) ? to.join(", ") : to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email transmitted successfully [Message ID: ${info.messageId}]`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email transmission failure:", error);
    throw error;
  }
}
