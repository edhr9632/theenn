import { NextResponse } from "next/server";
import { buildAssistantReply, type AssistantContext } from "@/lib/ennAssistantBrain";
import { isDbConfigured } from "@/lib/db";
import { listPublishedNewsKnowledge } from "@/lib/newsDb";

type AssistantRequest = {
  message?: string;
  context?: AssistantContext;
};

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AssistantRequest;
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const knowledge =
      isDbConfigured() ? await listPublishedNewsKnowledge(80).catch(() => []) : [];

    const reply = buildAssistantReply(message, body.context, knowledge);
    return NextResponse.json({
      ...reply,
      poweredBy: "enn-local",
    });
  } catch {
    return NextResponse.json({ error: "Assistant could not process your request." }, { status: 500 });
  }
}
