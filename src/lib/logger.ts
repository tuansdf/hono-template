import { env } from "@/lib/config/env";
import { getContext } from "hono/context-storage";
import pino from "pino";

const destination = pino.destination({ sync: false });

export const logger = pino(
  {
    level: env.NODE_ENV === "development" ? "debug" : "info",
    mixin: () => {
      try {
        const context = getContext();
        return {
          requestId: context?.var?.requestId,
        };
      } catch {
        return {};
      }
    },
  },
  destination,
);
