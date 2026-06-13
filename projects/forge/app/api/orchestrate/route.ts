import { streamAgent } from "@/lib/gemini";
import { siteForemanPrompt } from "@/lib/prompts/orchestrator";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { idea, constraints } = await req.json();
    let userMessage = `Product Idea: ${idea}`;
    if (constraints) {
      userMessage += `\nConstraints: ${constraints}`;
    }
    const stream = await streamAgent(siteForemanPrompt, userMessage);
    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
