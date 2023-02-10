import { FastifyInstance } from "fastify";
import { deleteCandidacyFromEmail, deleteCandidacyFromPhone } from "../database/postgres/candidacies";

export const restRoutes = (
  server: FastifyInstance,
  _opts: unknown,
  done: () => void,
) => {
  server.get("/ping", async function (_request, reply) {
    reply.send("pong");
  });

  server.post("/admin/candidacies/delete", async (request, reply) => {
    if (
      !process.env.ADMIN_TOKEN ||
      request.headers["admin_token"] !== process.env.ADMIN_TOKEN
    ) {
      return reply.status(403).send("Not authorized");
    }

    const { email, phone } = request.query as any;

    console.log({ email, phone });

    if (email) {
      await deleteCandidacyFromEmail(email);
    }
    if (phone) {
      await deleteCandidacyFromPhone(phone);
    }
    reply.send("deleted");
  });

  done();
};
