import { FastifyPluginAsync } from "fastify";

import { impersonate } from "./features/impersonate";

export const accountRoute: FastifyPluginAsync = async (server) => {
  server.get<{ Params: { token: string } }>("/account/impersonate/:token", {
    schema: {
      params: {
        type: "object",
        properties: {
          token: { type: "string" },
        },
        required: ["token"],
      },
    },
    handler: async (request, reply) => {
      const { token } = request.params;

      const data = await impersonate(token);

      if (data) {
        const { headers, redirect } = data;

        for (const header of headers) {
          reply.header(header[0], header[1]);
        }

        reply.redirect(redirect);

        return;
      }

      reply.status(401).send();
    },
  });
};
