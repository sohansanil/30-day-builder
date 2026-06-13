import { streamAgent } from "@/lib/gemini";
import { prdPrompt } from "@/lib/prompts/prd";
import { ForgeContext } from "@/types/forge";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const context: ForgeContext = await req.json();
    const userMessage = `
Idea: ${context.userIdea}
Constraints: ${context.constraints || "None"}

Research:
${context.research}
`;
    const stream = await streamAgent(prdPrompt, userMessage);
    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (error: unknown) { return NextResponse.json({ error: (error as Error).message }, { status: 500 }); }
}
