import { streamAgent } from "@/lib/gemini";
import { researcherPrompt } from "@/lib/prompts/researcher";
import { ForgeContext } from "@/types/forge";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const context: ForgeContext = await req.json();
    const userMessage = `
Idea: ${context.userIdea}
Constraints: ${context.constraints || "None"}

Plan:
${context.plan}
`;
    const stream = await streamAgent(researcherPrompt, userMessage, true);
    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (error: unknown) { return NextResponse.json({ error: (error as Error).message }, { status: 500 }); }
}
