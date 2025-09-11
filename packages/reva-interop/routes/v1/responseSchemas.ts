import { FastifyInstance } from "fastify";

export const candidatureResponseSchema = {
  $id: "http://vae.gouv.fr/components/schemas/CandidatureResponse",
  type: "object",
  properties: {
    data: {
      $ref: "http://vae.gouv.fr/components/schemas/Candidature",
    },
  },
} as const;

export const pageInfoSchema = {
  $id: "http://vae.gouv.fr/components/schemas/InfoPagination",
  type: "object",
  required: ["totalElements", "totalPages", "pageCourante"],
  properties: {
    totalElements: {
      type: "integer",
      description: "Nombre total d'éléments",
      example: 100,
    },
    totalPages: {
      type: "integer",
      description: "Nombre total de pages",
      example: 10,
    },
    pageCourante: {
      type: "integer",
      description: "Page courante",
      example: 1,
    },
  },
} as const;

export const dossiersDeFaisabiliteResponseSchema = {
  $id: "http://vae.gouv.fr/components/schemas/DossiersDeFaisabiliteResponse",
  type: "object",
  required: ["data", "info"],
  properties: {
    data: {
      type: "array",
      items: {
        $ref: "http://vae.gouv.fr/components/schemas/DossierDeFaisabilite",
      },
    },
    info: {
      $ref: "http://vae.gouv.fr/components/schemas/InfoPagination",
    },
  },
} as const;

export const dossierDeFaisabiliteResponseSchema = {
  $id: "http://vae.gouv.fr/components/schemas/DossierDeFaisabiliteResponse",
  type: "object",
  properties: {
    data: {
      $ref: "http://vae.gouv.fr/components/schemas/DossierDeFaisabilite",
    },
  },
} as const;

export const dossierDeFaisabiliteDecisionsResponseSchema = {
  $id: "http://vae.gouv.fr/components/schemas/DossierDeFaisabiliteDecisionsResponse",
  type: "object",
  properties: {
    data: {
      type: "array",
      items: {
        $ref: "http://vae.gouv.fr/components/schemas/DossierDeFaisabiliteDecision",
      },
    },
  },
} as const;

export const dossierDeFaisabiliteDecisionResponseSchema = {
  $id: "http://vae.gouv.fr/components/schemas/DossierDeFaisabiliteDecisionResponse",
  type: "object",
  properties: {
    data: {
      $ref: "http://vae.gouv.fr/components/schemas/DossierDeFaisabiliteDecision",
    },
  },
} as const;

export const dossiersDeValidationResponseSchema = {
  $id: "http://vae.gouv.fr/components/schemas/DossiersDeValidationResponse",
  type: "object",
  properties: {
    data: {
      type: "array",
      items: {
        $ref: "http://vae.gouv.fr/components/schemas/DossierDeValidation",
      },
    },
    info: {
      $ref: "http://vae.gouv.fr/components/schemas/InfoPagination",
    },
  },
} as const;

export const dossierDeValidationResponseSchema = {
  $id: "http://vae.gouv.fr/components/schemas/DossierDeValidationResponse",
  type: "object",
  properties: {
    data: {
      $ref: "http://vae.gouv.fr/components/schemas/DossierDeValidation",
    },
  },
} as const;

export const dossierDeValidationDecisionsResponseSchema = {
  $id: "http://vae.gouv.fr/components/schemas/DossierDeValidationDecisionsResponse",
  type: "object",
  properties: {
    data: {
      type: "array",
      items: {
        $ref: "http://vae.gouv.fr/components/schemas/DossierDeValidationDecision",
      },
    },
  },
} as const;

export const dossierDeValidationDecisionResponseSchema = {
  $id: "http://vae.gouv.fr/components/schemas/DossierDeValidationDecisionResponse",
  type: "object",
  properties: {
    data: {
      $ref: "http://vae.gouv.fr/components/schemas/DossierDeValidationDecision",
    },
  },
} as const;

export const informationsJuryResponseSchema = {
  $id: "http://vae.gouv.fr/components/schemas/InformationsJuryResponse",
  type: "object",
  properties: {
    data: {
      type: "array",
      items: {
        $ref: "http://vae.gouv.fr/components/schemas/InformationJury",
      },
    },
    info: {
      $ref: "http://vae.gouv.fr/components/schemas/InfoPagination",
    },
  },
} as const;

export const informationJuryResponseSchema = {
  $id: "http://vae.gouv.fr/components/schemas/InformationJuryResponse",
  type: "object",
  properties: {
    data: {
      $ref: "http://vae.gouv.fr/components/schemas/InformationJury",
    },
  },
} as const;

export const sessionJuryResponseSchema = {
  $id: "http://vae.gouv.fr/components/schemas/SessionJuryResponse",
  type: "object",
  properties: {
    data: {
      $ref: "http://vae.gouv.fr/components/schemas/SessionJury",
    },
  },
} as const;

export const resultatSessionJuryResponseSchema = {
  $id: "http://vae.gouv.fr/components/schemas/ResultatSessionJuryResponse",
  type: "object",
  properties: {
    data: {
      $ref: "http://vae.gouv.fr/components/schemas/ResultatSessionJury",
    },
  },
} as const;

export const addResponseSchemas = (fastify: FastifyInstance) => {
  fastify.addSchema(dossiersDeFaisabiliteResponseSchema);

  fastify.addSchema(dossierDeFaisabiliteResponseSchema);

  fastify.addSchema(dossierDeFaisabiliteDecisionsResponseSchema);

  fastify.addSchema(dossierDeFaisabiliteDecisionResponseSchema);

  fastify.addSchema(dossiersDeValidationResponseSchema);

  fastify.addSchema(dossierDeValidationResponseSchema);

  fastify.addSchema(dossierDeValidationDecisionsResponseSchema);

  fastify.addSchema(dossierDeValidationDecisionResponseSchema);

  fastify.addSchema(informationsJuryResponseSchema);

  fastify.addSchema(informationJuryResponseSchema);

  fastify.addSchema(sessionJuryResponseSchema);

  fastify.addSchema(resultatSessionJuryResponseSchema);

  fastify.addSchema(candidatureResponseSchema);

  fastify.addSchema(pageInfoSchema);
};
