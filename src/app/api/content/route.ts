import { NextResponse } from "next/server";
import {
  getSiteContent,
  isValidSiteContent,
  saveSiteContent,
} from "@/lib/content";

export async function GET() {
  const content = await getSiteContent();
  return NextResponse.json(content);
}

export async function PUT(request: Request) {
  const body = await request.json();
  if (!isValidSiteContent(body)) {
    return NextResponse.json({ error: "Invalid content payload." }, { status: 400 });
  }

  await saveSiteContent(body);
  return NextResponse.json({ ok: true });
}
