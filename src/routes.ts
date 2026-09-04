import type { FastifyInstance } from "fastify";
import { parseQuery, renderSvg } from "./svg.js";

export function placeholderRoutes(app: FastifyInstance): void {
  const errorResponse = {
    type: "object",
    properties: { error: { type: "string" } },
    required: ["error"],
  } as const;

  app.get(
    "/:size",
    {
      schema: { response: { 400: errorResponse } },
    },
    async (request, reply) => {
      const params = request.params as { size: string };
      const query = request.query as Record<string, string>;

      const { options, errors } = parseQuery({ size: params.size, ...query });
      if (errors.length > 0) {
        return reply.status(400).send({ error: errors.join("; ") });
      }

      const svg = renderSvg(options);
      return reply
        .header("content-type", "image/svg+xml")
        .header("cache-control", "public, max-age=86400")
        .send(svg);
    }
  );

  app.get("/health", async () => ({
    status: "ok",
    uptimeSec: Math.floor(process.uptime()),
  }));

  app.get("/", async () => ({
    service: "placeholder-service",
    version: "1.0.0",
    author: "v01dst",
    usage:
      "/640x360?text=Hello&bg=%231f2937&fg=%23f9fafb&font=sans-serif → image/svg+xml",
  }));
}
