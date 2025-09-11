import {
  FastifyPluginAsyncJsonSchemaToTs,
  JsonSchemaToTsProvider,
} from "@fastify/type-provider-json-schema-to-ts";

import { getJuries } from "../features/juries/getJuries.js";
import { mapGetJuries } from "../features/juries/getJuries.mapper.js";
import { getJuryByCandidacyId } from "../features/juries/getJuryByCandidacyId.js";
import { mapGetJuryByCandidacyId } from "../features/juries/getJuryByCandidacyId.mapper.js";
import { getJurySessionByCandidacyId } from "../features/juries/getJurySessionByCandidacyId.js";
import { mapGetSessionJuryByCandidacyId } from "../features/juries/getJurySessionByCandidacyId.mapper.js";
import {
  sessionJuryInputSchema,
  resultatJuryInputSchema,
} from "../inputSchemas.js";
import {
  statutJurySchema,
  candidacyIdSchema,
  resultatJurySchema,
} from "../schemas.js";

const juryRoutesApiV1: FastifyPluginAsyncJsonSchemaToTs = async (fastify) => {
  fastify
    .withTypeProvider<
      JsonSchemaToTsProvider<{
        ValidatorSchemaOptions: {
          references: [typeof statutJurySchema];
        };
      }>
    >()
    .route({
      method: "GET",
      url: "/informationsJury",
      schema: {
        summary: "Récupérer la liste des informations jury",
        // security: [{ bearerAuth: [] }],
        tags: ["Implémenté", "Informations jury"],
        querystring: {
          type: "object",
          properties: {
            decalage: {
              type: "integer",
              example: 0,
              default: 0,
              description: "Décalage pour la pagination",
            },
            limite: {
              type: "integer",
              example: 10,
              default: 10,
              description: "Limite du nombre de résultats",
            },
            recherche: {
              type: "string",
              maxLength: 100,
              example: "Alice Doe",
              description: "Filtre de recherche",
            },
            statut: {
              $ref: "http://vae.gouv.fr/components/schemas/StatutJury",
              description: "Filtre par statut de jury",
            },
          },
        },
        response: {
          200: {
            description: "Liste des candidats à l'étape jury",
            $ref: "http://vae.gouv.fr/components/schemas/InformationsJuryResponse",
          },
        },
      },
      handler: async (request, reply) => {
        const { decalage, limite, recherche, statut } = request.query;
        const dossiersDeValidation = await getJuries(
          request.graphqlClient,
          decalage,
          limite,
          statut,
          recherche,
        );
        if (dossiersDeValidation) {
          reply.send(mapGetJuries(dossiersDeValidation));
        } else {
          reply.status(204).send();
        }
      },
    });

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
      url: "/candidatures/:candidatureId/informationJury",
      schema: {
        summary: "Récupérer les informations du jury d'un candidat",
        // security: [{ bearerAuth: [] }],
        tags: ["Implémenté", "Informations jury"],
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
            description: "Informations du jury du candidat",
            $ref: "http://vae.gouv.fr/components/schemas/InformationJuryResponse",
          },
        },
      },
      handler: async (request, reply) => {
        const { candidatureId } = request.params;
        const candidacy = await getJuryByCandidacyId(
          request.graphqlClient,
          candidatureId,
        );
        if (candidacy) {
          reply.send(mapGetJuryByCandidacyId(candidacy));
        } else {
          reply.status(204).send();
        }
      },
    });

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
      url: "/candidatures/:candidatureId/informationJury/session",
      schema: {
        summary:
          "Récupérer les informations de la session du jury pour un candidat",
        // security: [{ bearerAuth: [] }],
        tags: ["Non implémenté", "Informations jury"],
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
            description: "Informations de la session du jury du candidat",
            $ref: "http://vae.gouv.fr/components/schemas/SessionJuryResponse",
          },
        },
      },
      handler: async (request, reply) => {
        const { candidatureId } = request.params;
        const candidacy = await getJurySessionByCandidacyId(
          request.graphqlClient,
          candidatureId,
        );
        if (candidacy) {
          reply.send(mapGetSessionJuryByCandidacyId(candidacy));
        } else {
          reply.status(204).send();
        }
      },
    });

  fastify
    .withTypeProvider<
      JsonSchemaToTsProvider<{
        ValidatorSchemaOptions: {
          references: [typeof candidacyIdSchema, typeof sessionJuryInputSchema];
        };
      }>
    >()
    .route({
      method: "PUT",
      url: "/candidatures/:candidatureId/informationJury/session",
      schema: {
        summary:
          "Mettre à jour les informations de la session du jury pour un candidat",
        consumes: ["multipart/form-data"],
        // security: [{ bearerAuth: [] }],
        tags: ["Non implémenté", "Informations jury"],
        body: {
          $ref: "http://vae.gouv.fr/components/schemas/SessionJuryInput",
        },
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
            description: "Informations de session mises à jour avec succès",
            $ref: "http://vae.gouv.fr/components/schemas/SessionJuryResponse",
          },
        },
      },
      handler: (_request, response) => {
        return response.status(501).send("Not implemented");
      },
    });

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
      url: "/candidatures/:candidatureId/informationJury/resultat",
      schema: {
        summary: "Récupérer le résultat du jury pour un candidat",
        // security: [{ bearerAuth: [] }],
        tags: ["Non implémenté", "Informations jury"],
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
            description: "Résultat du jury du candidat",
            $ref: "http://vae.gouv.fr/components/schemas/ResultatJuryResponse",
          },
        },
      },
      handler: (_request, response) => {
        return response.status(501).send("Not implemented");
      },
    });

  fastify
    .withTypeProvider<
      JsonSchemaToTsProvider<{
        ValidatorSchemaOptions: {
          references: [
            typeof candidacyIdSchema,
            typeof resultatJuryInputSchema,
            typeof resultatJurySchema,
          ];
        };
      }>
    >()
    .route({
      method: "PUT",
      url: "/candidatures/:candidatureId/informationJury/resultat",
      schema: {
        summary: "Mettre à jour le résultat du jury pour un candidat",
        // security: [{ bearerAuth: [] }],
        tags: ["Non implémenté", "Informations jury"],
        body: {
          $ref: "http://vae.gouv.fr/components/schemas/ResultatJuryInput",
        },
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
            description: "Résultat du jury mis à jour avec succès",
            $ref: "http://vae.gouv.fr/components/schemas/ResultatJuryResponse",
          },
        },
      },
      handler: (_request, response) => {
        return response.status(501).send("Not implemented");
      },
    });
};

export default juryRoutesApiV1;
