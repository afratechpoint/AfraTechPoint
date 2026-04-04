import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-server";
import { steadfast } from "@/lib/courier/steadfast";
import { getFraudCheckFromFirestore, saveFraudCheckInFirestore } from "@/lib/firebase/server_firestore";

/**
 * GET /api/admin/courier/steadfast/fraud-check/[phone]
 * Authenticated Admin Route to check for customer fraud history.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  const decodedToken = await verifyAdmin(request);
  if (!decodedToken) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
     const { phone: rawPhone } = await params;
    if (!rawPhone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // Normalize phone (strip +88 if present, or non-numeric)
    const phone = rawPhone.replace(/\D/g, '').slice(-11);

    // 1. Check Firestore Cache
    const cached = await getFraudCheckFromFirestore(phone);
    const CACHE_HOURS = 48;
    const now = new Date();
    
    if (cached && (now.getTime() - cached.lastChecked.getTime()) < (CACHE_HOURS * 60 * 60 * 1000)) {
      console.log(`[Fraud Check] Cache hit for ${phone}`);
      return NextResponse.json({
        success: true,
        isCached: true,
        lastChecked: cached.lastChecked,
        data: cached.data,
      });
    }

    // 2. Fetch from Steadfast API
    console.log(`[Fraud Check] Cache miss for ${phone}, fetching from API...`);
    const result = await steadfast.checkFraud(phone);
    
    // Steadfast's actual API payload does not always have a status field and uses plural keys with stringified numbers.
    if (result.status === 200 || typeof result.total_parcels !== 'undefined' || typeof result.total_parcel !== 'undefined') {
      const total = Number(result.total_parcels ?? result.total_parcel ?? 0);
      const delivered = Number(result.total_delivered ?? result.delivered_parcel ?? result.success_parcel ?? 0);
      const cancelled = Number(result.total_cancelled ?? result.cancelled_parcel ?? 0);
      
      const rawReports = result.total_fraud_reports ?? result.fraud_report;
      const reports = Array.isArray(rawReports) ? rawReports.length : (Number(rawReports) || 0);
      
      const fraudData = {
        totalParcels: total,
        delivered: delivered,
        cancelled: cancelled,
        fraudReports: reports,
        successRate: total > 0 
          ? Math.round((delivered / total) * 100) 
          : 0
      };

      // 3. Save to Firestore Cache (caches for 48 hours to avoid hitting API rate limits)
      await saveFraudCheckInFirestore(phone, { data: fraudData });
      
      return NextResponse.json({
        success: true,
        isCached: false,
        data: fraudData,
        raw: result
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message || result.error || "Failed to check fraud status. Provided number could be invalid.",
        raw: result
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("[Steadfast Fraud Check API] Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
