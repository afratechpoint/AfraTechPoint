import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { syncUserToFirestore } from "@/app/actions/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp, type } = body;

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP code are required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    const otpDocRef = adminDb.collection("otps").doc(cleanEmail);
    const otpDocSnap = await otpDocRef.get();

    if (!otpDocSnap.exists) {
      return NextResponse.json(
        { error: "No active verification code found or it has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const otpData = otpDocSnap.data();

    // Check expiration
    if (Date.now() > otpData.expiresAt) {
      await otpDocRef.delete();
      return NextResponse.json(
        { error: "This verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check failed attempts
    if (otpData.attempts >= 5) {
      await otpDocRef.delete();
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new verification code." },
        { status: 400 }
      );
    }

    // Verify code
    if (otpData.otp !== cleanOtp) {
      await otpDocRef.update({
        attempts: (otpData.attempts || 0) + 1,
      });
      const remainingAttempts = 4 - (otpData.attempts || 0);
      return NextResponse.json(
        { 
          error: `Incorrect verification code. ${remainingAttempts > 0 ? `${remainingAttempts} attempt(s) remaining.` : "Please request a new code."}` 
        },
        { status: 400 }
      );
    }

    // ── OTP VERIFIED SUCCESSFULLY ───────────────────────────────────────────

    let customToken = "";

    if (type === "register") {
      const regData = otpData.registrationData;
      if (!regData || !regData.password) {
        return NextResponse.json({ error: "Missing registration payload. Please register again." }, { status: 400 });
      }

      // 1. Create User in Firebase Auth
      const userRecord = await adminAuth.createUser({
        email: cleanEmail,
        password: regData.password,
        displayName: regData.name,
        emailVerified: true,
      });

      // 2. Sync to Firestore database
      await syncUserToFirestore(userRecord.uid, cleanEmail, regData.name, "");

      // 3. Generate custom token for instant login
      customToken = await adminAuth.createCustomToken(userRecord.uid);
    } else if (type === "login") {
      const uid = otpData.uid;
      if (!uid) {
        const userRec = await adminAuth.getUserByEmail(cleanEmail);
        customToken = await adminAuth.createCustomToken(userRec.uid);
      } else {
        customToken = await adminAuth.createCustomToken(uid);
      }
    } else {
      return NextResponse.json({ error: "Invalid verification action" }, { status: 400 });
    }

    // Clean up OTP record
    await otpDocRef.delete();

    return NextResponse.json({
      success: true,
      customToken,
      message: type === "register" ? "Registration verified successfully!" : "Login verified successfully!",
    });
  } catch (err: any) {
    console.error("Verify OTP API Error:", err);
    return NextResponse.json({ error: err.message || "Failed to verify code" }, { status: 500 });
  }
}
