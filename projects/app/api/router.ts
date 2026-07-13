import { createRouter, publicQuery } from "./middleware";
import { marketRouter } from "./routers/market";
import { modelsRouter } from "./routers/models";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),

  market: marketRouter,
  models: modelsRouter,
});

export type AppRouter = typeof appRouter;
