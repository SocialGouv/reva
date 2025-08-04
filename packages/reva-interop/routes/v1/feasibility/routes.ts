import {
  FastifyPluginAsyncJsonSchemaToTs,
  JsonSchemaToTsProvider,
} from "@fastify/type-provider-json-schema-to-ts";

import { mapFeasibilities } from "../../../utils/mappers/feasibility.js";
import { getFeasibilities } from "../features/feasibilities/getFeasibilities.js";
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
        tags: ["Dossier de faisabilité"],
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
      handler: (_request, response) => {
        return response.status(501).send("Not implemented");
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
        tags: ["Dossier de faisabilité"],
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
      handler: (_request, response) => {
        return response.status(501).send("Not implemented");
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
        tags: ["Dossier de faisabilité"],
        body: {
          type: "object",
          properties: {
            decision: {
              $ref: "http://vae.gouv.fr/components/schemas/DecisionDossierDeFaisabilite",
            },
            commentaire: {
              type: "string",
              description: "Motifs de la décision",
              example: "La pièce d'identité n'est pas lisible.",
            },
            document: {
              type: "string",
              format: "binary",
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
      handler: (_request, response) => {
        return response.status(501).send("Not implemented");
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
        tags: ["Dossier de faisabilité"],
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
              example: "Alice+Doe",
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
          reply.send(mapFeasibilities(dossiersDeFaisabilite));
        } else {
          reply.status(204).send();
        }
      },
    });
};

export default feasibilityRoutesApiV1;
