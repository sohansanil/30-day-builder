import { z } from "zod";
import { createRouter, publicQuery } from "../middleware.js";
import { TRPCError } from "@trpc/server";

export const missionsRouter = createRouter({
  getMission: publicQuery
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      // Hardcoded mission for Phase 2 demonstration
      if (input.id === "netflix-2012") {
        return {
          id: "netflix-2012",
          title: "The Netflix Pivot",
          year: "2012",
          concept: "Focus vs Sentiment",
          difficulty: 3,
          hook: "Netflix just split DVDs and streaming into two separate services. Customers are furious. The stock has crashed 75% from its peak. Wall Street thinks the company has lost its mind.",
          signalEngine: {
            assessment: "High Volatility",
            confidence: 86,
            drivers: ["Momentum ↓", "Volatility ↑", "Breadth ↓"],
          },
          options: [
            { id: "buy", label: "Buy the dip", description: "This is a temporary overreaction." },
            { id: "hold", label: "Wait and see", description: "Let the dust settle before acting." },
            { id: "sell", label: "Sell / Short", description: "The brand is permanently damaged." }
          ],
          bull_thesis: "The market is reacting to short-term customer anger, but they are ignoring the long-term fundamentals. Netflix is making a painful but necessary pivot to streaming, which is the inevitable future of media. Their core infrastructure is strong, and this price crash represents a generational buying opportunity.",
          bear_thesis: "Management is completely disconnected from their user base. Splitting the services has destroyed the customer value proposition. Competitors are circling, and content acquisition costs will only go up. The stock has crashed 75% for a reason—momentum is dead, and the knife is still falling.",
          glossary: [
            { term: "Volatility", definition: "How wildly a stock's price swings up and down over time. High volatility means higher risk, but also higher potential reward." },
            { term: "Momentum", definition: "The tendency of winning stocks to keep winning, and losing stocks to keep losing. Wall Street often acts like a herd." },
            { term: "Shorting", definition: "Betting that a stock's price will go down. You borrow shares, sell them, and hope to buy them back cheaper later." }
          ]
        };
      }
      throw new TRPCError({ code: "NOT_FOUND", message: "Mission not found" });
    }),

  evaluateDecision: publicQuery
    .input(z.object({ 
      missionId: z.string(), 
      decisionId: z.string(),
      reasoningId: z.string() 
    }))
    .mutation(({ input }) => {
      // In a full implementation, this would hit an LLM or use complex logic.
      // For now, we mock the Signal Engine's Socratic Debrief.
      
      let debrief = "";
      let isCorrect = false;

      if (input.decisionId === "buy") {
        isCorrect = true;
        debrief = "Excellent judgment. While sentiment was terrible, the underlying shift to streaming was the future. By ignoring the noise and focusing on the secular trend, you would have bought at the exact bottom of one of the greatest decade-long rallies in history.";
      } else {
        isCorrect = false;
        debrief = "Understandable, but you let short-term sentiment cloud the long-term fundamentals. Netflix's transition to streaming was painful but necessary for survival. You missed a generational buying opportunity.";
      }

      return {
        isCorrect,
        debrief,
        lesson: "Markets reward patience and fundamental conviction more often than short-term sentiment reading.",
        xpAwarded: isCorrect ? 250 : 50,
      };
    }),
});
