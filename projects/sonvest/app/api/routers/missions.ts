import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
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
