import { BookOpen, TrendingUp, TrendingDown, Users, Target, ShieldAlert, Zap, Globe } from "lucide-react";

export default function Academy() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500 font-mono pb-24">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-8">
        <h1 className="text-3xl font-bold tracking-widest uppercase flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-500" />
          Trading Academy
        </h1>
        <p className="text-zinc-400 mt-2 text-lg">Your 15-minute crash course to surviving (and thriving) in the markets.</p>
      </div>

      {/* Section 1: The Crash Course */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold tracking-widest uppercase text-emerald-400 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          1. The 15-Minute Crash Course
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <h3 className="text-lg font-bold text-zinc-100 mb-3 uppercase tracking-wide">What is the Stock Market?</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Think of it like a giant global farmer's market. But instead of buying apples or bread, you're buying tiny slices (shares) of real businesses. When the business makes money and grows, your tiny slice becomes more valuable. When they fail, it becomes worthless.
            </p>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <h3 className="text-lg font-bold text-zinc-100 mb-3 uppercase tracking-wide flex items-center gap-2">
              <Users className="w-4 h-4 text-zinc-500" />
              The Players
            </h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><strong className="text-zinc-200">Retail (You):</strong> Normal people buying stocks from their phones.</li>
              <li><strong className="text-zinc-200">Whales (Institutions):</strong> Hedge funds and banks moving billions. When they buy, the market moves.</li>
              <li><strong className="text-zinc-200">Algos:</strong> Computers executing thousands of trades a second based on math, not emotion.</li>
            </ul>
          </div>
        </div>

        {/* Bull vs Bear */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
          <div className="border border-emerald-900/50 bg-emerald-950/10 p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="w-32 h-32 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-emerald-400 mb-2 tracking-widest uppercase">The Bull Market</h3>
            <p className="text-zinc-300 text-sm relative z-10 leading-relaxed">
              Why a bull? Because a bull attacks by thrusting its horns <strong>UPWARD</strong>. 
              A Bull Market means prices are rising, people are optimistic, and the economy is doing well. "Being bullish" means you think a stock will go up.
            </p>
          </div>
          <div className="border border-rose-900/50 bg-rose-950/10 p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingDown className="w-32 h-32 text-rose-500" />
            </div>
            <h3 className="text-xl font-bold text-rose-400 mb-2 tracking-widest uppercase">The Bear Market</h3>
            <p className="text-zinc-300 text-sm relative z-10 leading-relaxed">
              Why a bear? Because a bear attacks by swiping its paws <strong>DOWNWARD</strong>.
              A Bear Market means prices are crashing, fear is high, and the economy is struggling. "Being bearish" means you think a stock is going to fall.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: The Action Glossary */}
      <section className="space-y-6 pt-8 border-t border-zinc-900">
        <h2 className="text-xl font-bold tracking-widest uppercase text-blue-400 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          2. The Action Glossary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-900/30 border border-zinc-800 p-5 hover:border-blue-500/30 transition-colors">
            <h4 className="text-blue-400 font-bold mb-2 uppercase text-sm tracking-widest">Buy the Dip</h4>
            <p className="text-zinc-400 text-sm leading-relaxed">
              When a good stock randomly crashes 10% because of temporary panic (a "dip"). Smart investors buy during the panic, essentially getting the stock on a discount before it bounces back.
            </p>
          </div>
          <div className="bg-zinc-900/30 border border-zinc-800 p-5 hover:border-blue-500/30 transition-colors">
            <h4 className="text-blue-400 font-bold mb-2 uppercase text-sm tracking-widest">Shorting (Selling Short)</h4>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Betting that a stock will CRASH. You borrow shares from a broker, sell them immediately at a high price, and hope to buy them back later at a much lower price to return them. You keep the difference as profit!
            </p>
          </div>
          <div className="bg-zinc-900/30 border border-zinc-800 p-5 hover:border-blue-500/30 transition-colors">
            <h4 className="text-blue-400 font-bold mb-2 uppercase text-sm tracking-widest flex items-center gap-2">
              <Target className="w-4 h-4" /> Limit vs Market Orders
            </h4>
            <p className="text-zinc-400 text-sm leading-relaxed">
              <strong>Market Order:</strong> "Buy this stock right NOW at whatever the current price is."<br/><br/>
              <strong>Limit Order:</strong> "Only buy this stock if the price drops to exactly $100. Otherwise, do nothing."
            </p>
          </div>
          <div className="bg-zinc-900/30 border border-zinc-800 p-5 hover:border-blue-500/30 transition-colors">
            <h4 className="text-blue-400 font-bold mb-2 uppercase text-sm tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Stop Loss
            </h4>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Your financial seatbelt. It's an automated rule you set: "If this stock falls 15%, automatically sell it immediately to prevent me from losing any more money."
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Geek Speak */}
      <section className="space-y-6 pt-8 border-t border-zinc-900">
        <h2 className="text-xl font-bold tracking-widest uppercase text-purple-400 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          3. The Geek Speak (Jargon Buster)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-950 border border-zinc-800 p-4">
            <h4 className="text-purple-400 font-bold text-sm mb-2">Volatility</h4>
            <p className="text-zinc-400 text-xs leading-relaxed">
              How wildly a stock's price swings up and down. A flat line has zero volatility. A crypto coin swinging 40% a day is highly volatile. High volatility = High Risk = High Reward.
            </p>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-4">
            <h4 className="text-purple-400 font-bold text-sm mb-2">Drawdown</h4>
            <p className="text-zinc-400 text-xs leading-relaxed">
              The percentage you lost from the very top. If your portfolio was at $10,000, and it drops to $8,000, you are in a 20% drawdown.
            </p>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-4">
            <h4 className="text-purple-400 font-bold text-sm mb-2">Momentum</h4>
            <p className="text-zinc-400 text-xs leading-relaxed">
              The herd mentality of Wall Street. A stock with high momentum is rocketing upwards simply because everyone else is buying it, creating a self-fulfilling prophecy.
            </p>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-4">
            <h4 className="text-purple-400 font-bold text-sm mb-2">13F Filings</h4>
            <p className="text-zinc-400 text-xs leading-relaxed">
              A mandatory form that billionaires and hedge funds must submit to the government every quarter showing exactly what stocks they bought. Retail traders use this to copy the whales.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
