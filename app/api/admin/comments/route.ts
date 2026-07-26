import { NextResponse } from "next/server";
import { listCommentsAdmin } from "@/lib/commentsDb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const status =
      statusParam === "pending" ||
      statusParam === "approved" ||
      statusParam === "rejected" ||
      statusParam === "all"
        ? statusParam
        : "pending";

    const items = await listCommentsAdmin(status);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("[GET /api/admin/comments]", error);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
