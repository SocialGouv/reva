import {
  FastifyPluginAsyncJsonSchemaToTs,
  JsonSchemaToTsProvider,
} from "@fastify/type-provider-json-schema-to-ts";

import { getCandidacyById } from "../features/candidacies/getCandidacyById.js";
import { mapGetCandidacyById } from "../features/candidacies/getCandidacyById.mapper.js";
import { candidacyIdSchema } from "../schemas.js";

const candidacyRoutesApiV1: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify,
) => {
  fastify
    .withTypeProvider<
      JsonSchemaToTsProvider<{
        ValidatorSchemaOptions: {
          references: [typeof candidacyIdSchema];
        };
      }>
    >()
    .route({
      method: "GET",
      url: "/candidatures/:candidatureId",
      schema: {
        summary: "Récupérer les détails d'une candidature",
        // security: [{ bearerAuth: [] }, { oauth: [] }],
        tags: ["Candidature", "Implémenté"],
        params: {
          type: "object",
          properties: {
            candidatureId: {
              $ref: "http://vae.gouv.fr/components/schemas/CandidatureId",
            },
          },
          required: ["candidatureId"],
        },
        response: {
          200: {
            description: "Détails de la candidature",
            $ref: "http://vae.gouv.fr/components/schemas/CandidatureResponse",
          },
        },
      },
      handler: async (request, reply) => {
        const r = await getCandidacyById(
          request.graphqlClient,
          request.params.candidatureId,
        );
        if (r) {
          reply.send({
            data: mapGetCandidacyById(r),
          });
        } else {
          reply.status(204).send();
        }
      },
    });
};

export default candidacyRoutesApiV1;
