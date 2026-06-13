import React from 'react';

type AgentStatus = 'pending' | 'active' | 'done';

export const FULL_AGENTS = [
  { id: 'orchestrate', label: '🏗️ Site Foreman' },
  { id: 'research', label: '🔍 Surveyor' },
  { id: 'prd', label: '📐 Blueprint Engineer' },
  { id: 'architect', label: '🏛️ Structural Architect' },
  { id: 'execution', label: '🔨 Build Supervisor' },
  { id: 'critic', label: '🚧 Safety Inspector' },
];

export const QUICK_AGENTS = [
  { id: 'draftsman', label: '📐 Architectural Draftsman' },
  { id: 'execution', label: '🔨 Build Supervisor' },
];

export function AgentPipeline({ currentAgentIndex, isComplete, agents = FULL_AGENTS }: { currentAgentIndex: number, isComplete: boolean, agents?: { id: string, label: string }[] }) {
  return (
    <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700">
      {agents.map((agent, index) => {
        let status: AgentStatus = 'pending';
        if (isComplete) status = 'done';
        else if (index < currentAgentIndex) status = 'done';
        else if (index === currentAgentIndex) status = 'active';

        return (
          <div 
            key={agent.id} 
            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all uppercase tracking-wide
              ${status === 'active' ? 'bg-orange-600 text-white animate-pulse shadow-lg shadow-orange-900/30' : ''}
              ${status === 'done' ? 'bg-zinc-800 text-zinc-300 border border-zinc-700' : ''}
              ${status === 'pending' ? 'bg-zinc-900 text-zinc-600 border border-zinc-800 opacity-50' : ''}
            `}
          >
            {agent.label} {status === 'active' && '...'}
          </div>
        );
      })}
    </div>
  );
}
