mkdir -p app/api/orchestrate app/api/research app/api/prd app/api/architect app/api/execution app/api/critic

cat << 'ROUTE' > app/api/orchestrate/route.ts
import { streamAgent } from "@/lib/claude";
import { orchestratorPrompt } from "@/lib/prompts/orchestrator";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { idea, constraints } = await req.json();
    let userMessage = \`Product Idea: \${idea}\`;
    if (constraints) {
      userMessage += \`\nConstraints: \${constraints}\`;
    }
    const stream = await streamAgent(orchestratorPrompt, userMessage);
    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
ROUTE

cat << 'ROUTE' > app/api/research/route.ts
import { streamAgent } from "@/lib/claude";
import { researcherPrompt } from "@/lib/prompts/researcher";
import { ForgeContext } from "@/types/forge";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const context: ForgeContext = await req.json();
    const userMessage = \`
Idea: \${context.userIdea}
Constraints: \${context.constraints || "None"}

Plan:
\${context.plan}
\`;
    const stream = await streamAgent(researcherPrompt, userMessage);
    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
ROUTE

cat << 'ROUTE' > app/api/prd/route.ts
import { streamAgent } from "@/lib/claude";
import { prdPrompt } from "@/lib/prompts/prd";
import { ForgeContext } from "@/types/forge";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const context: ForgeContext = await req.json();
    const userMessage = \`
Idea: \${context.userIdea}
Constraints: \${context.constraints || "None"}

Research:
\${context.research}
\`;
    const stream = await streamAgent(prdPrompt, userMessage);
    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
ROUTE

cat << 'ROUTE' > app/api/architect/route.ts
import { streamAgent } from "@/lib/claude";
import { architectPrompt } from "@/lib/prompts/architect";
import { ForgeContext } from "@/types/forge";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const context: ForgeContext = await req.json();
    const userMessage = \`
Idea: \${context.userIdea}

Research:
\${context.research}

PRD:
\${context.prd}
\`;
    const stream = await streamAgent(architectPrompt, userMessage);
    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
ROUTE

cat << 'ROUTE' > app/api/execution/route.ts
import { streamAgent } from "@/lib/claude";
import { executionPrompt } from "@/lib/prompts/execution";
import { ForgeContext } from "@/types/forge";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const context: ForgeContext = await req.json();
    const userMessage = \`
Idea: \${context.userIdea}

Research:
\${context.research}

PRD:
\${context.prd}

Architecture:
\${context.architecture}
\`;
    const stream = await streamAgent(executionPrompt, userMessage);
    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
ROUTE

cat << 'ROUTE' > app/api/critic/route.ts
import { streamAgent } from "@/lib/claude";
import { criticPrompt } from "@/lib/prompts/critic";
import { ForgeContext } from "@/types/forge";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const context: ForgeContext = await req.json();
    const userMessage = \`
Idea: \${context.userIdea}

PRD:
\${context.prd}

Architecture:
\${context.architecture}

Execution Prompt:
\${context.executionPrompt}
\`;
    const stream = await streamAgent(criticPrompt, userMessage);
    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
ROUTE
