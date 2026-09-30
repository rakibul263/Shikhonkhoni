import aj from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

const authHandlers = toNextJsHandler(auth);

export async function POST(req: NextRequest) {
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }
    if (decision.reason.isBot()) {
      return NextResponse.json(
        { error: "Automated requests are not allowed." },
        { status: 403 },
      );
    }
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  return authHandlers.POST(req);
}

export async function GET(req: NextRequest) {
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }
    if (decision.reason.isBot()) {
      return NextResponse.json(
        { error: "Automated requests are not allowed." },
        { status: 403 },
      );
    }
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  return authHandlers.GET(req);
}
