import { revalidatePath, revalidateTag } from "next/cache";
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
  // Expire immediately so editors see Spanish/updated copy on the next request.
  revalidateTag("site-content", { expire: 0 });
  revalidatePath("/", "layout");
  revalidatePath("/edit");
  return NextResponse.json({ ok: true });
}
