"use client";
import React from 'react';
import ReactMarkdown from 'react-markdown';

export function AgentStream({ agentName, content, isActive }: { agentName: string, content: string, isActive: boolean }) {
  return (
    <div className="border-2 border-blue-900 rounded-lg overflow-hidden bg-blueprint shadow-inner">
      <div className="bg-blue-950 border-b-2 border-blue-900 px-4 py-2 flex items-center justify-between">
        <div className="text-blue-300 font-mono text-xs font-bold tracking-widest uppercase flex items-center gap-2">
          {isActive ? <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span> : null}
          🚧 CURRENTLY CONSTRUCTING: {agentName}
        </div>
        <div className="text-blue-500 font-mono text-xs">
          V-1.0.0 // AUTO-DRAFT
        </div>
      </div>
      <div className="p-6 h-[500px] overflow-y-auto font-mono text-blue-100 text-sm leading-relaxed prose prose-invert max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
        {isActive && <span className="inline-block w-2 h-4 bg-orange-500 ml-1 animate-pulse"></span>}
      </div>
    </div>
  );
}
