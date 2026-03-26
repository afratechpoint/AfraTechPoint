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
  from = process.env.SMTP_FROM || `"Afra Tech Point" <${process.env.SMTP_USER}>`
}: SendEmailParams) {
  
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("sendEmail: Missing SMTP configurations (HOST, USER, or PASS). Aborting.");
    return { success: false, error: "Missing SMTP configuration" };
  }

  const port = Number(process.env.SMTP_PORT) || 587;
  // If port is 465, it usually must be secure (true). If 587, it usually must be false (STARTTLS).
  const isPort465 = port === 465;
  const secure = process.env.SMTP_SECURE === "true" || (process.env.SMTP_SECURE === undefined && isPort465);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: port,
    secure: secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Adding timeout and TLS options for better reliability
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    tls: {
      // Do not fail on invalid certs (common with some SMTP providers)
      rejectUnauthorized: false
    }
  });

  try {
    // 1. Render template
    const html = await render(template(props || {}));

    // 2. Prepare options
    const mailOptions = {
      from,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
    };

    // 3. Send
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId} (Recipient: ${mailOptions.to})`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("FATAL SMTP ERROR:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      stack: error.stack
    });
    throw new Error(`Email failed: ${error.message}${error.code ? ` (${error.code})` : ''}`);
  }
}
