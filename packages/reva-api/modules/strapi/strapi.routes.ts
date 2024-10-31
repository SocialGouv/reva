import { FastifyPluginAsync } from "fastify";
import { prismaClient } from "../../prisma/client";
import { isFeatureActiveForUser } from "../../modules/feature-flipping/feature-flipping.features";

type StrapiWebhookRequestBody = {
  event: string;
  model: string;
  uid: string;
  entry: {
    nom: string;
    nouvelleVersion: boolean;
  };
};

export const strapiWebhookRoute: FastifyPluginAsync = async (server) => {
  server.post<{
    Body: StrapiWebhookRequestBody;
  }>("/strapi/webhook", {
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
      if (
        !(await isFeatureActiveForUser({
          feature: "CGU_STRAPI_WEBHOOK",
        }))
      ) {
        console.log("Feature flag is disabled, ignoring webhook");
        reply.status(204).send();
        return;
      }

      const [_, apiKey] = (
        request.headers["x-strapi-authorization"] as string
      ).split("ApiKey ");

      if (!apiKey || apiKey !== process.env.STRAPI_WEBHOOK_KEY) {
        reply.status(401).send("Unauthorized");
        return;
      }

      const { event, model, entry } = request.body;
      if (
        event !== "entry.update" ||
        model !== "legal" ||
        entry.nom !== "CGU"
      ) {
        console.log("Ignoring event", event, model);
        reply.status(204).send();
        return;
      }
      const isNewversion = entry.nouvelleVersion;
      if (isNewversion) {
        console.log(
          "Creating CGU DB entry because nouvelleVersion is set to true",
        );
        await prismaClient.professionalCgu.create({});
        reply.status(201).send();
      } else {
        console.log(
          "No need to create CGU DB entry because nouvelleVersion is set to false",
        );
        reply.status(200).send();
      }
    },
  });
};
