"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ForgeContext } from "@/types/forge";
import { AgentPipeline, FULL_AGENTS, QUICK_AGENTS } from "@/components/AgentPipeline";
import { AgentStream } from "@/components/AgentStream";
import { OutputTabs } from "@/components/OutputTabs";
import { DownloadButton } from "@/components/DownloadButton";

export default function ForgeWorkspace() {
  const router = useRouter();
  const [context, setContext] = useState<ForgeContext>({ userIdea: "" });
  const [currentAgentIndex, setCurrentAgentIndex] = useState(-1);
  const [isComplete, setIsComplete] = useState(false);
  const [currentStream, setCurrentStream] = useState("");
  const [agentsList, setAgentsList] = useState(FULL_AGENTS);
  const [mode, setMode] = useState<"quick" | "full">(() => {
    if (typeof window !== "undefined") {
      return (sessionStorage.getItem("forge_mode") as "quick" | "full") || "quick";
    }
    return "quick";
  });
  const hasStarted = useRef(false);

  const runPipeline = async (initialContext: ForgeContext, agents: typeof FULL_AGENTS) => {
    const ctx = { ...initialContext };

    for (let i = 0; i < agents.length; i++) {
      setCurrentAgentIndex(i);
      setCurrentStream("");
      const agent = agents[i];
      
      try {
        if (i > 0) {
          // Add a 3-second delay between agents to avoid Gemini Free Tier RPM limits
          setCurrentStream("⏳ Waiting for API rate limit cooldown...");
          await new Promise(resolve => setTimeout(resolve, 3000));
          setCurrentStream("");
        }

        const response = await fetch(`/api/${agent.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ctx)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMsg = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
          throw new Error(errorMsg || `HTTP error! status: ${response.status}`);
        }

        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let result = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          result += chunk;
          setCurrentStream(result);
        }

        // Update context based on agent
        if (agent.id === "orchestrate") ctx.plan = result;
        if (agent.id === "research") ctx.research = result;
        if (agent.id === "prd") ctx.prd = result;
        if (agent.id === "architect") ctx.architecture = result;
        if (agent.id === "draftsman") {
          ctx.prd = "*(Combined with System Design)*\n\n" + result;
          ctx.architecture = result;
        }
        if (agent.id === "execution") ctx.executionPrompt = result;
        if (agent.id === "critic") ctx.critique = result;

        setContext({ ...ctx });
      } catch (error: unknown) {
        console.error(`Agent ${agent.label} failed:`, error);
        const err = error as Error;
        if (err.message?.includes("429") || err.message?.includes("quota")) {
          alert(`⚠️ Gemini API Quota Exceeded! Please wait a minute and try again. Or add billing to your GCP project to lift the free tier restrictions.`);
        } else {
          alert(`Pipeline failed at ${agent.label}. Please try again.\nError: ${err.message}`);
        }
        return;
      }
    }

    setCurrentAgentIndex(agents.length);
    setIsComplete(true);
  };

  useEffect(() => {
    const idea = sessionStorage.getItem("forge_idea");
    const constraints = sessionStorage.getItem("forge_constraints") || "";
    
    if (!idea) {
      router.push("/");
      return;
    }

    if (!hasStarted.current) {
      hasStarted.current = true;
      const agentsToRun = mode === "quick" ? QUICK_AGENTS : FULL_AGENTS;
      setAgentsList(agentsToRun);
      setContext({ userIdea: idea, constraints });
      runPipeline({ userIdea: idea, constraints }, agentsToRun);
    }
  }, [router, mode]);

  return (
    <main className="min-h-screen bg-zinc-950 p-8 font-sans text-zinc-100">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Forge Workshop</h1>
            <p className="text-zinc-500 mt-1 font-mono text-sm">Building: {context.userIdea}</p>
          </div>
          {isComplete && <DownloadButton context={context} />}
        </div>

        <AgentPipeline currentAgentIndex={currentAgentIndex} isComplete={isComplete} agents={agentsList} />

        {!isComplete && currentAgentIndex >= 0 && currentAgentIndex < agentsList.length && (
          <AgentStream 
            agentName={agentsList[currentAgentIndex].label} 
            content={currentStream} 
            isActive={true} 
          />
        )}

        {isComplete && <OutputTabs context={context} mode={mode} />}
      </div>
    </main>
  );
}
