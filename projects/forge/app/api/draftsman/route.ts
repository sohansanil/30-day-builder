import { NextResponse } from "next/server";
import { streamAgent } from "@/lib/gemini";
import { draftsmanPrompt } from "@/lib/prompts/draftsman";
import { ForgeContext } from "@/types/forge";

export async function POST(req: Request) {
  try {
    const context: ForgeContext = await req.json();

    const userMessage = `
User Idea: ${context.userIdea}
Constraints: ${context.constraints || 'None'}
`;

    const stream = await streamAgent(draftsmanPrompt, userMessage, false);
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: unknown) {
    console.error("Draftsman Error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to process request" },
      { status: 500 }
    );
  }
}
