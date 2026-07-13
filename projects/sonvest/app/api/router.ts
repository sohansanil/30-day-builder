import { createRouter, publicQuery } from "./middleware";
import { marketRouter } from "./routers/market";
import { modelsRouter } from "./routers/models";
import { missionsRouter } from "./routers/missions";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),

  market: marketRouter,
  models: modelsRouter,
  missions: missionsRouter,
});

export type AppRouter = typeof appRouter;
