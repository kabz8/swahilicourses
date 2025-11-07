import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle, type NeonDatabase } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";

neonConfig.webSocketConstructor = ws;

const createUnavailableProxy = <T extends object>(message: string): T => {
  return new Proxy(
    {},
    {
      get() {
        throw new Error(message);
      },
    },
  ) as T;
};

export const isDatabaseAvailable = Boolean(process.env.DATABASE_URL);

export const pool: Pool = isDatabaseAvailable
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : createUnavailableProxy<Pool>(
      "DATABASE_URL must be set. Using fallback data instead of database.",
    );

export const db: NeonDatabase<typeof schema> = isDatabaseAvailable
  ? drizzle({ client: pool, schema })
  : createUnavailableProxy<NeonDatabase<typeof schema>>(
      "DATABASE_URL must be set. Database access is unavailable.",
    );