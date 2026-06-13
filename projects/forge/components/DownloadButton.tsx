import React from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ForgeContext } from '@/types/forge';

export function DownloadButton({ context }: { context: ForgeContext }) {
  const handleDownload = async () => {
    const zip = new JSZip();
    
    if (context.research) zip.file('1_market_intelligence.md', context.research);
    if (context.prd) zip.file('2_product_blueprint.md', context.prd);
    if (context.architecture) zip.file('3_system_design.md', context.architecture);
    if (context.executionPrompt) zip.file('4_execution_plan.md', context.executionPrompt);
    if (context.critique) zip.file('5_safety_review.md', context.critique);

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'forge-build-kit.zip');
  };

  return (
    <button
      onClick={handleDownload}
      className="bg-zinc-800 border-2 border-zinc-700 hover:border-orange-500 hover:text-orange-500 text-zinc-300 font-bold py-3 px-6 rounded-lg transition-all flex items-center gap-2 uppercase tracking-wide shadow-lg"
    >
      <span className="text-xl">📦</span> Generate Build Kit
    </button>
  );
}
