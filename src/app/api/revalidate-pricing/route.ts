import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// Called by the backend after plan pricing changes. If REVALIDATE_SECRET is
// set, the caller must send `Authorization: Bearer <secret>`.
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ revalidated: false }, { status: 401 });
  }

  // The pricing section renders on both the pricing page and the home page.
  revalidatePath("/pricing");
  revalidatePath("/");
  return NextResponse.json({ revalidated: true });
}
