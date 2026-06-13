"use client";
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ForgeContext } from '@/types/forge';

export function OutputTabs({ context, mode }: { context: ForgeContext, mode: "quick" | "full" }) {
  const [activeTab, setActiveTab] = useState<'research' | 'prd' | 'architecture' | 'execution'>('execution');

  const allTabs = [
    { id: 'research', label: 'Market Intelligence', content: context.research },
    { id: 'prd', label: 'Product Blueprint', content: context.prd },
    { id: 'architecture', label: 'System Design', content: context.architecture, isBlueprint: true },
    { id: 'execution', label: 'Execution Plan', content: context.executionPrompt, isBlueprint: true },
  ];

  const tabs = mode === 'quick' 
    ? allTabs.filter(t => t.id === 'architecture' || t.id === 'execution')
    : allTabs;

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div className="mt-12 border-2 border-zinc-700 rounded-lg overflow-hidden bg-zinc-900 shadow-xl">
      <div className="flex border-b-2 border-zinc-700 bg-zinc-800 overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-600">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'research' | 'prd' | 'architecture' | 'execution')}
            className={`px-6 py-4 text-sm font-bold whitespace-nowrap uppercase tracking-wider transition-colors
              ${activeTab === tab.id 
                ? 'border-b-4 border-orange-500 text-orange-500 bg-zinc-900' 
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700 border-b-4 border-transparent'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={`p-8 min-h-[400px] overflow-y-auto ${currentTab?.isBlueprint ? 'bg-blueprint text-blue-100 font-mono prose-invert' : 'bg-zinc-900 text-zinc-300'} prose max-w-none`}>
        <ReactMarkdown>{currentTab?.content || '*Waiting for output...*'}</ReactMarkdown>
      </div>
      
      {mode === 'full' && context.critique && (
        <div className="border-t-2 border-zinc-700 bg-zinc-900 relative">
          <div className="h-2 w-full bg-caution-tape"></div>
          <div className="p-8">
            <h3 className="text-xl font-black mb-4 text-yellow-500 uppercase flex items-center gap-2 tracking-widest">
              <span className="text-2xl">🚧</span> Safety Inspector Review
            </h3>
            <div className="prose prose-invert max-w-none text-zinc-300 prose-headings:text-yellow-500 prose-strong:text-yellow-400">
              <ReactMarkdown>{context.critique}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
