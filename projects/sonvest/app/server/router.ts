import { createRouter, publicQuery } from "./middleware.js";
import { marketRouter } from "./routers/market.js";
import { modelsRouter } from "./routers/models.js";
import { missionsRouter } from "./routers/missions.js";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),

  market: marketRouter,
  models: modelsRouter,
  missions: missionsRouter,
});

export type AppRouter = typeof appRouter;
