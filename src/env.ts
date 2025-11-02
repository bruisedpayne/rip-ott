import { config } from "dotenv";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

config();

export const env = createEnv({
  server: {
    BOT_TOKEN: z.string().min(1),
    RD_API_TOKEN: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});