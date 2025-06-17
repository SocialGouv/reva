import { FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";

async function routesApiV1(fastify: FastifyInstance) {
  await fastify.register(fastifySwagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: `France VAE Interoperability API (${process.env.NODE_ENV})`,
        description:
          "France VAE's interoperability API to interface with other official entities",
        version: "1.0.0",
      },
      servers: [
        {
          url: process.env.BASE_URL || "http://localhost:3005/",
          description: "Development server",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description:
              "Votre jeton d'authentification doit être placé dans le header 'Authorization: Bearer VOTRE_JWT'.",
          },
        },
      },
    },
  });

  fastify.addSchema({
    $id: "components/schemas/Certification",
    type: "object",
    properties: {
      codeRncp: {
        type: "string",
        maxLength: 255,
        example: "35830",
      },
      nom: {
        type: "string",
        maxLength: 255,
        example: "Diplôme d'Etat Aide soignant - DEAS",
      },
      estViseePartiellement: {
        type: "boolean",
        example: false,
      },
    },
  });

  fastify.addSchema({
    $id: "components/schemas/Candidature",
    type: "object",
    properties: {
      id: {
        type: "string",
        example: "123e4567-e89b-12d3-a456-426614174000",
      },
      certification: {
        $ref: "components/schemas/Certification",
      },
    },
  });

  fastify.addSchema({
    $id: "components/schemas/CandidatureResponse",
    type: "object",
    properties: {
      data: {
        $ref: "components/schemas/Candidature",
      },
    },
  });

  fastify.addHook("onRequest", (request, _reply, done) => {
    if (request.url === "/v1/docs" || request.url === "/v1/schema.json") {
      return done();
    }
    console.log("Validate Bearer token here");
    done();
  });

  // Declare a route
  fastify.get("/", {
    schema: {
      // request needs to have a querystring with a `name` parameter
      querystring: {
        type: "object",
        properties: {
          name: { type: "string" },
        },
        required: ["name"],
      },
      // the response needs to be an object with an `hello` property of type 'string'
      response: {
        200: {
          type: "object",
          properties: {
            hello: { type: "string" },
            other: { type: "string" },
          },
          required: ["hello"],
        },
      },
    },
    handler: async (_request, _reply) => {
      return { hello: "world" };
    },
  });

  fastify.route({
    method: "GET",
    url: "/candidatures/:candidatureId",
    schema: {
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: {
          candidatureId: {
            type: "string",
            format: "uuid",
            description: "ID de la candidature",
            example: "123e4567-e89b-12d3-a456-426614174000",
          },
        },
        required: ["candidatureId"],
      },
      response: {
        200: {
          $ref: "components/schemas/CandidatureResponse",
        },
      },
    },
    handler: () => {
      console.log("route handler");
    },
  });

  fastify.route({
    method: "GET",
    url: "/candidatures/:candidatureId/dossierDeFaisabilite",
    schema: {
      params: {
        type: "object",
        properties: {
          candidatureId: {
            type: "string",
            format: "uuid",
            description: "ID de la candidature",
            example: "123e4567-e89b-12d3-a456-426614174000",
          },
        },
        required: ["candidatureId"],
      },
    },
    handler: () => {
      console.log("route handler");
    },
  });

  fastify.route({
    method: "GET",
    url: "/candidatures/:candidatureId/dossierDeFaisabilite/decisions",
    schema: {
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: {
          candidatureId: {
            type: "string",
            format: "uuid",
            description: "ID de la candidature",
            example: "123e4567-e89b-12d3-a456-426614174000",
          },
        },
        required: ["candidatureId"],
      },
    },
    handler: () => {
      console.log("route handler");
    },
  });

  fastify.route({
    method: "POST",
    url: "/candidatures/:candidatureId/dossierDeFaisabilite/decisions",
    schema: {
      body: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                decision: {
                  type: "string",
                  enum: ["IRRECEVABLE", "RECEVABLE", "INCOMPLET", "COMPLET"],
                  description: "Décision sur le dossier de faisabilité.\n",
                  example: "INCOMPLET",
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
          },
        },
      },
      params: {
        type: "object",
        properties: {
          candidatureId: {
            type: "string",
            format: "uuid",
            description: "ID de la candidature",
            example: "123e4567-e89b-12d3-a456-426614174000",
          },
        },
        required: ["candidatureId"],
      },
    },
    handler: () => {
      console.log("route handler");
    },
  });

  fastify.route({
    method: "GET",
    url: "/dossiersDeFaisabilite",
    schema: {
      querystring: {
        type: "object",
        properties: {
          decalage: {
            type: "integer",
            example: 0,
            description: "Décalage pour la pagination",
          },
          limite: {
            type: "integer",
            example: 10,
            description: "Limite du nombre de résultats",
          },
          recherche: {
            type: "string",
            maxLength: 100,
            example: "Alice+Doe",
            description: "Recherche par mots-clés (nom, prénom, email...)",
          },
          statut: {
            type: "string",
            enum: [
              "EN_ATTENTE",
              "IRRECEVABLE",
              "RECEVABLE",
              "INCOMPLET",
              "COMPLET",
              "ARCHIVE",
              "ABANDONNE",
            ],
            description: "Filtre par statut du dossier de faisabilité",
            example: "EN_ATTENTE",
          },
        },
      },
    },
    handler: () => {
      console.log("route handler");
    },
  });

  fastify.route({
    method: "GET",
    url: "/dossiersDeValidation",
    schema: {
      querystring: {
        type: "object",
        properties: {
          decalage: {
            type: "integer",
            example: 0,
            description: "Décalage pour la pagination",
          },
          limite: {
            type: "integer",
            example: 10,
            description: "Limite du nombre de résultats",
          },
          recherche: {
            type: "string",
            maxLength: 100,
            example: "Alice+Doe",
            description: "Filtre de recherche",
          },
          statut: {
            type: "string",
            enum: ["EN_ATTENTE", "SIGNALE", "VERIFIE"],
            description: "Filtre par statut du dossier de validation",
            example: "VERIFIE",
          },
        },
      },
    },
    handler: () => {
      console.log("route handler");
    },
  });

  fastify.route({
    method: "GET",
    url: "/candidatures/:candidatureId/dossierDeValidation",
    schema: {
      params: {
        type: "object",
        properties: {
          candidatureId: {
            type: "string",
            format: "uuid",
            description: "ID de la candidature",
            example: "123e4567-e89b-12d3-a456-426614174000",
          },
        },
        required: ["candidatureId"],
      },
    },
    handler: () => {
      console.log("route handler");
    },
  });

  fastify.route({
    method: "GET",
    url: "/candidatures/:candidatureId/dossierDeValidation/decisions",
    schema: {
      params: {
        type: "object",
        properties: {
          candidatureId: {
            type: "string",
            format: "uuid",
            description: "ID de la candidature",
            example: "123e4567-e89b-12d3-a456-426614174000",
          },
        },
        required: ["candidatureId"],
      },
    },
    handler: () => {
      console.log("route handler");
    },
  });

  fastify.route({
    method: "POST",
    url: "/candidatures/:candidatureId/dossierDeValidation/decisions",
    schema: {
      body: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                decision: {
                  type: "string",
                  enum: ["SIGNALE", "VERIFIE"],
                  description: "Décision sur le dossier de validation.\n",
                  example: "SIGNALE",
                },
                commentaire: {
                  type: "string",
                  description: "Motifs de la décision",
                  example: "Le dossier n'est pas lisible.",
                },
              },
              required: ["decision"],
            },
          },
        },
      },
      params: {
        type: "object",
        properties: {
          candidatureId: {
            type: "string",
            format: "uuid",
            description: "ID de la candidature",
            example: "123e4567-e89b-12d3-a456-426614174000",
          },
        },
        required: ["candidatureId"],
      },
    },
    handler: () => {
      console.log("route handler");
    },
  });

  fastify.route({
    method: "GET",
    url: "/informationsJury",
    schema: {
      querystring: {
        type: "object",
        properties: {
          decalage: {
            type: "integer",
            example: 0,
            description: "Décalage pour la pagination",
          },
          limite: {
            type: "integer",
            example: 10,
            description: "Limite du nombre de résultats",
          },
          recherche: {
            type: "string",
            maxLength: 100,
            example: "Alice+Doe",
            description: "Filtre de recherche",
          },
          statut: {
            type: "string",
            enum: ["PROGRAMME", "PASSE"],
            description: "Filtre par statut de jury",
            example: "PROGRAMME",
          },
        },
      },
    },
    handler: () => {
      console.log("route handler");
    },
  });

  fastify.route({
    method: "GET",
    url: "/candidatures/:candidatureId/informationJury",
    schema: {
      params: {
        type: "object",
        properties: {
          candidatureId: {
            type: "string",
            format: "uuid",
            description: "ID de la candidature",
            example: "123e4567-e89b-12d3-a456-426614174000",
          },
        },
        required: ["candidatureId"],
      },
    },
    handler: () => {
      console.log("route handler");
    },
  });

  fastify.route({
    method: "GET",
    url: "/candidatures/:candidatureId/informationJury/session",
    schema: {
      params: {
        type: "object",
        properties: {
          candidatureId: {
            type: "string",
            format: "uuid",
            description: "ID de la candidature",
            example: "123e4567-e89b-12d3-a456-426614174000",
          },
        },
        required: ["candidatureId"],
      },
    },
    handler: () => {
      console.log("route handler");
    },
  });

  fastify.route({
    method: "PUT",
    url: "/candidatures/:candidatureId/informationJury/session",
    schema: {
      body: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                date: {
                  type: "string",
                  format: "date",
                  description: "Date de la session du jury",
                  example: "2023-12-15",
                },
                heure: {
                  type: "string",
                  format: "time",
                  description: "Heure de la session du jury",
                  example: "14:30",
                },
                adresseSession: {
                  type: "string",
                  description: "Adresse où se tient la session",
                  example: "876 rue de l'Université, 75007 Paris",
                },
                informationsSession: {
                  type: "string",
                  description: "Informations supplémentaires sur la session",
                  example:
                    "Se présenter 15 minutes avant le début de la session.",
                },
                document: {
                  type: "string",
                  format: "binary",
                  description: "La convocation officielle éventuelle",
                },
              },
            },
          },
        },
      },
      params: {
        type: "object",
        properties: {
          candidatureId: {
            type: "string",
            format: "uuid",
            description: "ID de la candidature",
            example: "123e4567-e89b-12d3-a456-426614174000",
          },
        },
        required: ["candidatureId"],
      },
    },
    handler: () => {
      console.log("route handler");
    },
  });

  fastify.route({
    method: "GET",
    url: "/candidatures/:candidatureId/informationJury/resultat",
    schema: {
      params: {
        type: "object",
        properties: {
          candidatureId: {
            type: "string",
            format: "uuid",
            description: "ID de la candidature",
            example: "123e4567-e89b-12d3-a456-426614174000",
          },
        },
        required: ["candidatureId"],
      },
    },
    handler: () => {
      console.log("route handler");
    },
  });

  fastify.route({
    method: "PUT",
    url: "/candidatures/:candidatureId/informationJury/resultat",
    schema: {
      body: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                resultat: {
                  type: "string",
                  enum: [
                    "SUCCES_TOTAL_CERTIFICATION_COMPLETE",
                    "SUCCES_TOTAL_CERTIFICATION_COMPLETE_SOUS_RESERVE",
                    "SUCCES_PARTIEL_CERTIFICATION_COMPLETE",
                    "SUCCES_TOTAL_CERTIFICATION_PARTIELLE",
                    "SUCCES_PARTIEL_CERTIFICATION_PARTIELLE",
                    "ECHEC",
                    "CANDIDAT_EXCUSE",
                    "CANDIDAT_ABSENT",
                  ],
                  description: "Résultat d'un jury.\n",
                  example: "SUCCES_TOTAL_CERTIFICATION_COMPLETE_SOUS_RESERVE",
                },
                commentaire: {
                  type: "string",
                  description: "Informations supplémentaires sur le résultat",
                  example:
                    "Validation totale sous réserve de présentation de l’AFGSU.",
                },
              },
              required: ["resultat"],
            },
          },
        },
      },
      params: {
        type: "object",
        properties: {
          candidatureId: {
            type: "string",
            format: "uuid",
            description: "ID de la candidature",
            example: "123e4567-e89b-12d3-a456-426614174000",
          },
        },
        required: ["candidatureId"],
      },
    },
    handler: () => {
      console.log("route handler");
    },
  });

  fastify.get("/schema.json", { schema: { hide: true } }, async () => {
    return fastify.swagger();
  });

  fastify.get("/docs", { schema: { hide: true } }, async (_request, reply) => {
    reply.type("html");
    return `<!DOCTYPE html>
<html>
  <head>
    <title>Documentation API intéropérabilité France VAE</title>
    <!-- needed for adaptive design -->
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">

    <!--
    Redoc doesn't change outer page styles
    -->
    <style>
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <redoc spec-url='${process.env.BASE_URL || "http://localhost:3005"}/v1/schema.json'></redoc>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"> </script>
  </body>
</html>`;
  });
}

export default routesApiV1;
