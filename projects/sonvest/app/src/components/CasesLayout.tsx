import { Link } from "react-router";
import { Target } from "lucide-react";

export default function CasesLayout({ children }: { children: React.ReactNode }) {
  // In the real app, we would only show these after they earn them.
  // For the demo, we will show them but they'll start at 0 or unranked.
  
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-mono">
      {/* Top Navigation */}
      <nav className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-sm bg-zinc-900 flex items-center justify-center border border-zinc-800 transition-colors">
                <Target className="w-4.5 h-4.5 text-zinc-400" />
              </div>
              <span className="text-lg font-bold tracking-widest uppercase">
                SonVest
              </span>
            </Link>

            {/* Decision Rating (RPG Elements) */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm tracking-widest uppercase">
                <span className="text-zinc-500 font-medium">Decision Rating:</span>
                <span className="font-bold text-emerald-400">---</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
