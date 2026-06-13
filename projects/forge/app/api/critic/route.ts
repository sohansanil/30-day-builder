import { streamAgent } from "@/lib/gemini";
import { safetyInspectorPrompt } from "@/lib/prompts/critic";
import { ForgeContext } from "@/types/forge";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const context: ForgeContext = await req.json();
    const userMessage = `
Idea: ${context.userIdea}

PRD:
${context.prd}

Architecture:
${context.architecture}

Execution Prompt:
${context.executionPrompt}
`;
    const stream = await streamAgent(safetyInspectorPrompt, userMessage);
    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (error: unknown) { return NextResponse.json({ error: (error as Error).message }, { status: 500 }); }
}
