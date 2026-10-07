import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { sendEmail } from "@/lib/email/sendEmail";
import { OtpEmail } from "@/emails/renderers/index";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, type, name, password } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (type !== "register" && type !== "login") {
      return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
    }

    let resolvedName = name || "Customer";
    let uid = "";

    // ── 1. REGISTRATION VALIDATION ──────────────────────────────────────────
    if (type === "register") {
      if (!name || !password) {
        return NextResponse.json({ error: "Name and password are required" }, { status: 400 });
      }
      if (password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
      }

      // Check if user already exists
      try {
        const existingUser = await adminAuth.getUserByEmail(cleanEmail);
        if (existingUser) {
          return NextResponse.json({ 
            error: "An account with this email already exists. Please login instead." 
          }, { status: 400 });
        }
      } catch (err: any) {
        // auth/user-not-found means we can proceed with registration
        if (err.code !== "auth/user-not-found") {
          console.warn("User lookup check error:", err.message);
        }
      }
      resolvedName = name.trim();
    }

    // ── 2. LOGIN VALIDATION ────────────────────────────────────────────────
    if (type === "login") {
      if (!password) {
        return NextResponse.json({ error: "Password is required" }, { status: 400 });
      }

      // Verify email & password with Firebase Auth REST API
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      const verifyRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanEmail,
            password,
            returnSecureToken: true,
          }),
        }
      );

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        const errorMsg = verifyData?.error?.message;
        if (
          errorMsg === "EMAIL_NOT_FOUND" ||
          errorMsg === "INVALID_PASSWORD" ||
          errorMsg === "INVALID_LOGIN_CREDENTIALS"
        ) {
          return NextResponse.json(
            { error: "Incorrect email or password." },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { error: "Login failed. Please check your credentials." },
          { status: 400 }
        );
      }

      uid = verifyData.localId;

      // Try fetching displayName from user record
      try {
        const userRec = await adminAuth.getUser(uid);
        if (userRec.displayName) resolvedName = userRec.displayName;
      } catch {}
    }

    // ── 3. GENERATE 6-DIGIT OTP ───────────────────────────────────────────
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ── 4. SAVE OTP RECORD (10 MINUTE EXPIRATION) ─────────────────────────
    await adminDb.collection("otps").doc(cleanEmail).set({
      otp,
      type,
      email: cleanEmail,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0,
      createdAt: new Date(),
      ...(type === "register" ? { registrationData: { name: resolvedName, password } } : {}),
      ...(type === "login" ? { uid } : {}),
    });

    // ── 5. SEND BRANDED EMAIL ─────────────────────────────────────────────
    const emailResult = await sendEmail({
      to: cleanEmail,
      subject: `Your ${type === "register" ? "Registration" : "Login"} Verification Code: ${otp} — Afra Tech Point`,
      template: OtpEmail,
      props: {
        customerName: resolvedName,
        otp,
        actionType: type,
      },
    });

    if (!emailResult.success) {
      return NextResponse.json({ error: "Failed to dispatch OTP email. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `A 6-digit verification code has been sent to ${cleanEmail}.` 
    });
  } catch (err: any) {
    console.error("Send OTP API Error:", err);
    return NextResponse.json({ error: err.message || "Failed to send OTP" }, { status: 500 });
  }
}
