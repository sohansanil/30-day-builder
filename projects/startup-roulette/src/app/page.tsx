import { SlotMachine } from "@/components/SlotMachine";
import { TechBroMatrix } from "@/components/TechBroMatrix";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <TechBroMatrix />
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-casino-gold/10 blur-[120px] rounded-full pointer-events-none z-[-1]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-casino-red/10 blur-[120px] rounded-full pointer-events-none z-[-1]" />
      
      <div className="z-10 text-center space-y-4 mb-8">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-casino-gold via-yellow-200 to-casino-gold-dark drop-shadow-sm pb-2">
          🎰 Startup Roulette
        </h1>
        <p className="text-lg md:text-xl text-gray-400 font-medium max-w-xl mx-auto italic">
          "The Dumbest Startup Generator on the Internet"
        </p>
      </div>

      <SlotMachine />
      
    </main>
  );
}
