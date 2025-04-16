import { FastifyPluginAsync } from "fastify";
import { isFeatureActiveForUser } from "../../modules/feature-flipping/feature-flipping.features";
import { prismaClient } from "../../prisma/client";

interface CguEntry {
  nom: string;
  nouvelleVersion: boolean;
}

interface StrapiWebhookRequestBody {
  event: string;
  model: string;
  uid: string;
  entry: CguEntry;
}

const CGU_TYPES = {
  MAISON_MERE: "CGU",
  CERTIFICATEUR: "CGU_CERTIFICATEUR",
} as const;

const validateApiKey = (authHeader: string): boolean => {
  const [_, apiKey] = authHeader.split("ApiKey ");
  return apiKey === process.env.STRAPI_WEBHOOK_KEY;
};

// Webhook Strapi pour la gestion des Conditions Générales d'Utilisation (CGU)
// Traite les CGU pour les Maisons Mères AAP ("CGU") et les Certificateurs ("CGU_CERTIFICATEUR")
// Lorsqu'une nouvelle version est publiée (nouvelleVersion = true), une entrée est créée dans la base de données
// Cette entrée servira de référence pour vérifier si l'utilisateur a accepté la dernière version des CGU
const handleCguUpdate = async (entry: CguEntry) => {
  if (!entry.nouvelleVersion) {
    console.log(
      `No need to create ${entry.nom} DB entry because nouvelleVersion is false`,
    );
    return { status: 200 };
  }

  console.log(`Creating ${entry.nom} DB entry because nouvelleVersion is true`);
  if (entry.nom === CGU_TYPES.MAISON_MERE) {
    await prismaClient.professionalCgu.create({});
  } else if (entry.nom === CGU_TYPES.CERTIFICATEUR) {
    await prismaClient.professionalCguCertificateur.create({});
  }
  return { status: 201 };
};

export const strapiWebhookRoute: FastifyPluginAsync = async (server) => {
  server.post<{ Body: StrapiWebhookRequestBody }>("/strapi/webhook", {
    schema: {
      headers: {
        type: "object",
        properties: {
          "X-Strapi-Authorization": { type: "string" },
        },
        required: ["X-Strapi-Authorization"],
      },
      body: {
        type: "object",
        properties: {
          event: { type: "string" },
          model: { type: "string" },
          uid: { type: "string" },
          entry: { type: "object" },
        },
        required: ["event", "model", "uid", "entry"],
      },
    },
    handler: async (request, reply) => {
      // Check feature flag
      const isFeatureActive = await isFeatureActiveForUser({
        feature: "CGU_STRAPI_WEBHOOK",
      });

      if (!isFeatureActive) {
        console.log("Feature flag is disabled, ignoring webhook");
        return reply.status(204).send();
      }

      // Validate API key
      const isApiKeyValid = validateApiKey(
        request.headers["x-strapi-authorization"] as string,
      );
      if (!isApiKeyValid) {
        return reply.status(401).send("Unauthorized");
      }

      const { event, model, entry } = request.body as StrapiWebhookRequestBody;

      const isCguUpdate =
        event === "entry.update" &&
        model === "legal" &&
        (entry.nom === CGU_TYPES.MAISON_MERE ||
          entry.nom === CGU_TYPES.CERTIFICATEUR);

      // Handle CGU updates
      if (isCguUpdate) {
        const { status } = await handleCguUpdate(entry);
        return reply.status(status).send();
      }

      console.log("Ignoring event", event, model);
      return reply.status(204).send();
    },
  });
};
