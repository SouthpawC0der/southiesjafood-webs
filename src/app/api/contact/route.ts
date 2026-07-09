import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const TO_EMAIL = "eats@southiesjafood.com";
// FROM must use a domain verified in your Resend dashboard.
// Go to resend.com → Domains → Add "southiesjafood.com" and add the DNS records.
const FROM_EMAIL = "Southie's Ja Foods <noreply@southiesjafood.com>";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = await checkRateLimit(`contact:${ip}`, "contact");
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  // In production, require requests to originate from the app URL.
  // Absent Origin (curl, Postman) is also rejected in production to prevent
  // automated abuse — rate limiting is the primary guard in development.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const origin = req.headers.get("origin");
  if (appUrl && origin !== appUrl) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("[contact] RESEND_API_KEY is not set.");
    return NextResponse.json({ error: "Email service not configured." }, { status: 503 });
  }

  // Instantiate per-request so missing key at build time doesn't crash the build
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const body = await req.json();

    // Input validation
    const name    = String(body.name    ?? "").trim().slice(0, 200);
    const email   = String(body.email   ?? "").trim().slice(0, 200);
    const phone   = String(body.phone   ?? "").trim().slice(0, 50);
    const eventType = String(body.eventType ?? "").trim().slice(0, 100);
    const date    = String(body.date    ?? "").trim().slice(0, 20);
    const guests  = String(body.guests  ?? "").trim().slice(0, 10);
    const message = String(body.message ?? "").trim().slice(0, 2000);

    if (!name || !email || !email.includes("@")) {
      return NextResponse.json({ error: "Name and a valid email are required." }, { status: 400 });
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject: `Catering Inquiry — ${name}${eventType ? ` (${eventType})` : ""}`,
      text: [
        `Name:       ${name}`,
        `Email:      ${email}`,
        `Phone:      ${phone  || "—"}`,
        `Event Type: ${eventType || "—"}`,
        `Date:       ${date   || "—"}`,
        `Guests:     ${guests || "—"}`,
        "",
        "Message:",
        message || "—",
      ].join("\n"),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] Failed to send inquiry:", err);
    return NextResponse.json(
      { error: "Failed to send. Please email us directly at eats@southiesjafood.com" },
      { status: 500 }
    );
  }
}
