import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import mercurius, { MercuriusOptions } from "mercurius";

import { graphqlConfiguration } from "../../modules";

const buildGqlContext = async (req: FastifyRequest, _reply: FastifyReply) => {
  return {
    auth: req.auth,
  };
};

type PromiseType<T> = T extends PromiseLike<infer U> ? U : T;

declare module "mercurius" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface MercuriusContext
    extends PromiseType<ReturnType<typeof buildGqlContext>> {}
}

export const mercuriusGraphQL = (
  server: FastifyInstance,
  _opts: unknown,
  done: () => void
) => {
  server.register(mercurius, {
    ...graphqlConfiguration,
    context: buildGqlContext,
  } as MercuriusOptions);
  done();
};
