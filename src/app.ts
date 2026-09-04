import Fastify, { type FastifyInstance } from "fastify";
import { DEFAULT_CONFIG, type Config } from "./config.js";
import { placeholderRoutes } from "./routes.js";

export interface AppOptions {
  config?: Partial<Config>;
  logger?: boolean;
}

export function createApp(opts: AppOptions = {}): FastifyInstance {
  const config: Config = { ...DEFAULT_CONFIG, ...opts.config };

  const app = Fastify({ logger: opts.logger ?? false });
  app.register((instance, _o, done) => {
    placeholderRoutes(instance);
    done();
  });
  void config;
  return app;
}
