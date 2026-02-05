import { z } from "zod";

const envSchema = z.object({
  BACKEND_BASE_URL: z.url().min(1),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse({
  BACKEND_BASE_URL: import.meta.env.VITE_BACKEND_BASE_URL,
});
