import { Link, useLocation } from "react-router";
import { Activity, BarChart3, Play, Brain, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const navItems = [
    { path: "/analytics", label: "Dashboard", icon: Activity },
    { path: "/analytics/models", label: "Models", icon: Brain },
    { path: "/analytics/replay", label: "Replay", icon: Play },
    { path: "/analytics/scanner", label: "Scanner", icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top Navigation */}
      <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link to="/analytics" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                  <BarChart3 className="w-4.5 h-4.5 text-emerald-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold tracking-tight leading-none">
                    SonVest
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium tracking-widest uppercase mt-0.5">
                    Infrastructure
                  </span>
                </div>
              </Link>

              {/* Nav Links */}
              <div className="flex items-center gap-1 hidden md:flex">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path || (item.path !== '/analytics' && location.pathname.startsWith(item.path));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-zinc-800 text-zinc-100"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Side / Challenge Hook */}
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" size="sm" className="hidden sm:flex border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors bg-emerald-500/5 font-mono">
                  <span className="mr-2 px-1.5 py-0.5 rounded bg-emerald-500/20 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                    Incoming Transmission
                  </span>
                  Open SonVest Hub
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-zinc-500 font-medium">LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between text-sm text-zinc-500">
            <p>SonVest — Market Intelligence Engine</p>
            <p>Built with HMM, GMM, KMeans on S&P 500 data</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
