import { NextResponse } from "next/server";
import { parseMessage } from "@/lib/bot-parser";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const parsedData = parseMessage(text);

    // We could extend this in the future by calling an LLM if the basic parser
    // doesn't find a brand or model, but for now regex is fast and covers most ads.

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("MAGIC_POST_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
