import {
  FastifyPluginAsyncJsonSchemaToTs,
  JsonSchemaToTsProvider,
} from "@fastify/type-provider-json-schema-to-ts";

import { UploadedFile } from "../../../utils/types.js";
import { createFeasibilityDecisionByCandidacyId } from "../features/feasibilities/createFeasibilityDecisionByCandidacyId.js";
import { mapCreateFeasibilityDecisionByCandidacyId } from "../features/feasibilities/createFeasibilityDecisionByCandidacyId.mapper.js";
import { getFeasibilities } from "../features/feasibilities/getFeasibilities.js";
import { mapGetFeasibilities } from "../features/feasibilities/getFeasibilities.mapper.js";
import { getFeasibilityByCandidacyId } from "../features/feasibilities/getFeasibilityByCandidacyId.js";
import { mapGetFeasibilityByCandidacyId } from "../features/feasibilities/getFeasibilityByCandidacyId.mapper.js";
import { getFeasibilityHistoryByCandidacyId } from "../features/feasibilities/getFeasibilityHistoryByCandidacyId.js";
import { mapGetFeasibilityHistoryByCandidacyId } from "../features/feasibilities/getFeasibilityHistoryByCandidacyId.mapper.js";
import {
  dossiersDeFaisabiliteResponseSchema,
  pageInfoSchema,
} from "../responseSchemas.js";
import {
  candidacyIdSchema,
  decisionDossierDeFaisabiliteSchema,
  dossierDeFaisabiliteDecisionSchema,
  statutDossierDeFaisabiliteSchema,
  fichierSchema,
  dureeExperienceSchema,
  experienceSchema,
  dossierDeFaisabiliteSchema,
} from "../schemas.js";

const feasibilityRoutesApiV1: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify,
) => {
  fastify
    .withTypeProvider<
      JsonSchemaToTsProvider<{
        ValidatorSchemaOptions: { references: [typeof candidacyIdSchema] };
      }>
    >()
    .route({
      method: "GET",
      url: "/candidatures/:candidatureId/dossierDeFaisabilite",
      schema: {
        summary:
          "Récupérer le dernier dossier de faisabilité d'une candidature",
        // security: [{ bearerAuth: [] }],
        tags: ["Implémenté", "Dossier de faisabilité"],
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
            desciption: "Dossier de faisabilité",
            $ref: "http://vae.gouv.fr/components/schemas/DossierDeFaisabiliteResponse",
          },
        },
      },
      handler: async (request, reply) => {
        const { candidatureId } = request.params;
        const candidacy = await getFeasibilityByCandidacyId(
          request.graphqlClient,
          candidatureId,
        );
        if (candidacy) {
          reply.send(mapGetFeasibilityByCandidacyId(candidacy));
        } else {
          reply.status(204).send();
        }
      },
    });

  fastify
    .withTypeProvider<
      JsonSchemaToTsProvider<{
        ValidatorSchemaOptions: { references: [typeof candidacyIdSchema] };
      }>
    >()
    .route({
      method: "GET",
      url: "/candidatures/:candidatureId/dossierDeFaisabilite/decisions",
      schema: {
        summary: "Récupérer la liste des décisions du dossier de faisabilité",
        // security: [{ bearerAuth: [] }],
        tags: ["Implémenté", "Dossier de faisabilité"],
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
            description: "Liste des décisions sur le dossier de faisabilité",
            $ref: "http://vae.gouv.fr/components/schemas/DossierDeFaisabiliteDecisionsResponse",
          },
        },
      },
      handler: async (request, reply) => {
        const { candidatureId } = request.params;
        const candidacy = await getFeasibilityHistoryByCandidacyId(
          request.graphqlClient,
          candidatureId,
        );
        if (candidacy) {
          reply.send(mapGetFeasibilityHistoryByCandidacyId(candidacy));
        } else {
          reply.status(204).send();
        }
      },
    });

  fastify
    .withTypeProvider<
      JsonSchemaToTsProvider<{
        ValidatorSchemaOptions: {
          references: [
            typeof decisionDossierDeFaisabiliteSchema,
            typeof dossierDeFaisabiliteDecisionSchema,
            typeof candidacyIdSchema,
          ];
        };
      }>
    >()
    .route({
      method: "POST",
      url: "/candidatures/:candidatureId/dossierDeFaisabilite/decisions",
      schema: {
        summary: "Créer une nouvelle décision sur le dossier de faisabilité",
        consumes: ["multipart/form-data"],
        // security: [{ bearerAuth: [] }],
        tags: ["Implémenté", "Dossier de faisabilité"],
        body: {
          type: "object",
          properties: {
            decision: {
              type: "object",
              properties: {
                value: {
                  $ref: "http://vae.gouv.fr/components/schemas/DecisionDossierDeFaisabilite",
                },
              },
            },
            commentaire: {
              type: "object",
              properties: {
                value: {
                  type: "string",
                  description: "Motifs de la décision",
                  example: "La pièce d'identité n'est pas lisible.",
                },
              },
            },
            document: {
              type: "object",
              description: "Le courrier de recevabilité éventuel",
            },
          },
          required: ["decision"],
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
          201: {
            description: "Nouvelle décision créée avec succès",
            $ref: "http://vae.gouv.fr/components/schemas/DossierDeFaisabiliteDecisionResponse",
          },
        },
      },
      handler: async (request, reply) => {
        const { candidatureId } = request.params;
        const { decision, commentaire, document } = request.body;

        const candidacy = await createFeasibilityDecisionByCandidacyId(
          request.graphqlClient,
          request.keycloakJwt,
          candidatureId,
          {
            decision: decision.value!,
            commentaire: commentaire?.value,
            document: document as UploadedFile,
          },
        );

        if (candidacy) {
          reply.send(mapCreateFeasibilityDecisionByCandidacyId(candidacy));
        } else {
          reply.status(204).send();
        }
      },
    });

  fastify
    .withTypeProvider<
      JsonSchemaToTsProvider<{
        ValidatorSchemaOptions: {
          references: [typeof statutDossierDeFaisabiliteSchema];
        };
        SerializerSchemaOptions: {
          references: [
            typeof dossiersDeFaisabiliteResponseSchema,
            typeof pageInfoSchema,
            typeof candidacyIdSchema,
            typeof fichierSchema,
            typeof dureeExperienceSchema,
            typeof experienceSchema,
            typeof dossierDeFaisabiliteSchema,
            typeof statutDossierDeFaisabiliteSchema,
          ];
        };
      }>
    >()
    .route({
      method: "GET",
      url: "/dossiersDeFaisabilite",
      schema: {
        summary: "Récupérer la liste des dossiers de faisabilité",
        // security: [{ bearerAuth: [] }],
        tags: ["Implémenté", "Dossier de faisabilité"],
        querystring: {
          type: "object",
          properties: {
            decalage: {
              type: "integer",
              example: 0,
              description: "Décalage pour la pagination",
              default: 0,
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
              description: "Recherche par mots-clés (nom, prénom, email...)",
            },
            statut: {
              $ref: "http://vae.gouv.fr/components/schemas/StatutDossierDeFaisabilite",
              description: "Filtre par statut du dossier de faisabilité",
            },
          },
        },
        response: {
          200: {
            description: "Liste des dossiers de faisabilité",
            $ref: "http://vae.gouv.fr/components/schemas/DossiersDeFaisabiliteResponse",
          },
        },
      },
      handler: async (request, reply) => {
        const { decalage, limite, recherche, statut } = request.query;
        const dossiersDeFaisabilite = await getFeasibilities(
          request.graphqlClient,
          decalage,
          limite,
          statut,
          recherche,
        );
        if (dossiersDeFaisabilite) {
          reply.send(mapGetFeasibilities(dossiersDeFaisabilite));
        } else {
          reply.status(204).send();
        }
      },
    });
};

export default feasibilityRoutesApiV1;
