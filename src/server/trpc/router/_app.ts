import { router } from "../trpc";
import { videoRouter } from "./video";

export const appRouter = router({
  video: videoRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
