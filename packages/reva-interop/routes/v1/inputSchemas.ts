import { FastifyInstance } from "fastify";

const dossierDeFaisabiliteDecisionInputSchema = {
  $id: "http://vae.gouv.fr/components/schemas/DossierDeFaisabiliteDecisionInput",
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
} as const;

export const dossierDeValidationDecisionInputSchema = {
  $id: "http://vae.gouv.fr/components/schemas/DossierDeValidationDecisionInput",
  type: "object",
  properties: {
    decision: {
      $ref: "http://vae.gouv.fr/components/schemas/DecisionDossierDeValidation",
    },
    commentaire: {
      type: "string",
      description: "Motifs de la décision",
      example: "Le dossier n'est pas lisible.",
    },
  },
  required: ["decision"],
} as const;

export const sessionJuryInputSchema = {
  $id: "http://vae.gouv.fr/components/schemas/SessionJuryInput",
  type: "object",
  properties: {
    date: {
      type: "object",
      properties: {
        value: {
          type: "string",
          format: "date",
          description: "Date de la session du jury",
          example: "2023-12-15",
        },
      },
    },
    heure: {
      type: "object",
      properties: {
        value: {
          type: "string",
          format: "time",
          description: "Heure de la session du jury",
          example: "14:30",
        },
      },
    },
    adresseSession: {
      type: "object",
      properties: {
        value: {
          type: "string",
          description: "Adresse où se tient la session",
          example: "876 rue de l'Université, 75007 Paris",
        },
      },
    },
    informationsSession: {
      type: "object",
      properties: {
        value: {
          type: "string",
          description: "Informations supplémentaires sur la session",
          example: "Se présenter 15 minutes avant le début de la session.",
        },
      },
    },
    document: {
      type: "object",
      description: "La convocation officielle éventuelle",
    },
  },
  required: ["date"],
} as const;

export const resultatJuryInputSchema = {
  $id: "http://vae.gouv.fr/components/schemas/ResultatJuryInput",
  type: "object",
  properties: {
    resultat: {
      $ref: "http://vae.gouv.fr/components/schemas/ResultatJury",
    },
    commentaire: {
      type: "string",
      description: "Informations supplémentaires sur le résultat",
      example: "Validation totale sous réserve de présentation de l’AFGSU.",
    },
  },
  required: ["resultat"],
} as const;

export const addInputSchemas = (fastify: FastifyInstance) => {
  fastify.addSchema(dossierDeFaisabiliteDecisionInputSchema);
  fastify.addSchema(dossierDeValidationDecisionInputSchema);
  fastify.addSchema(sessionJuryInputSchema);
  fastify.addSchema(resultatJuryInputSchema);
};
