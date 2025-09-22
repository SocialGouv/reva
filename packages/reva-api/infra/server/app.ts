import cors from "@fastify/cors";
import proxy from "@fastify/http-proxy";
import { setDefaultOptions } from "date-fns";
import { fr } from "date-fns/locale";
import fastify, {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginOptions,
  FastifyServerOptions,
} from "fastify";

import { accountRoute } from "@/modules/account/account.routes";
import { dossierDeValidationRoute } from "@/modules/dossier-de-validation/dossier-de-validation.routes";
import { feasibilityFileUploadRoute } from "@/modules/feasibility/feasibility.routes";
import paymentRequestFvaeFileUploadAndConfirmationRoute from "@/modules/finance/unifvae/finance.routes";
import proofUploadRoute from "@/modules/finance/unireva/finance.routes";
import { juryRoute } from "@/modules/jury/jury.routes";
import { organismRoutes } from "@/modules/organism/organism.routes";
import {
  FILE_PREVIEW_ROUTE_PATH,
  OOS_DOMAIN,
} from "@/modules/shared/file/preview";
import { logger } from "@/modules/shared/logger/logger";
import { strapiWebhookRoute } from "@/modules/strapi/strapi.routes";

import { mercuriusGraphQL } from "./mercurius";
import MercuriusGQLUpload from "./mercurius-upload";
import keycloakAdminPlugin from "./plugins/keycloak-admin-plugin";
import keycloakPlugin from "./plugins/keycloak-plugin";

const ADMIN_REACT_ROUTE_PATH = "/admin2";
const CANDIDATE_ROUTE_PATH = "/candidat";

type BuilAppOptions = FastifyServerOptions & {
  keycloakPluginMock?: FastifyPluginAsync<FastifyPluginOptions>;
};

export const buildApp = async (
  opts: BuilAppOptions = {},
): Promise<FastifyInstance> => {
  //Date-fns default locale
  setDefaultOptions({ locale: fr });

  const app = await fastify(opts);

  if (process.env.NODE_ENV === "production") {
    app.register(cors, {
      origin: (process.env.CORS_ORIGIN || "").split(","),
    });
  } else {
    app.register(proxy, {
      upstream: "http://localhost:3003/admin2",
      prefix: ADMIN_REACT_ROUTE_PATH,
    });

    app.register(proxy, {
      upstream: "http://localhost:3004/candidat",
      prefix: CANDIDATE_ROUTE_PATH,
    });

    app.register(cors, {
      origin: true,
    });
  }

  if (opts.keycloakPluginMock) {
    app.register(opts.keycloakPluginMock);
  } else {
    app.register(keycloakPlugin, {
      config: {
        clientId: process.env.KEYCLOAK_ADMIN_CLIENTID_REVA || "reva-admin",
        "bearer-only": true,
        "auth-server-url":
          process.env.KEYCLOAK_ADMIN_URL || "http://localhost:8888/auth/",
        realm: process.env.KEYCLOAK_ADMIN_REALM_REVA || "reva",
      } as any,
    });

    app.register(keycloakPlugin, {
      config: {
        clientId:
          process.env.KEYCLOAK_ADMIN_CLIENTID_REVA_COLLECTIVE ||
          "reva-vae-collective",
        "bearer-only": true,
        "auth-server-url":
          process.env.KEYCLOAK_ADMIN_URL || "http://localhost:8888/auth/",
        realm: process.env.KEYCLOAK_ADMIN_REALM_REVA || "reva",
      } as any,
    });
  }

  app.register(keycloakPlugin, {
    config: {
      clientId: process.env.KEYCLOAK_APP_REVA_APP || "reva-app",
      "bearer-only": true,
      "auth-server-url":
        process.env.KEYCLOAK_ADMIN_URL || "http://localhost:8888/auth/",
      realm: process.env.KEYCLOAK_APP_REALM || "reva-app",
    } as any,
  });

  app.register(keycloakAdminPlugin);

  if (OOS_DOMAIN !== "") {
    app.register(proxy, {
      upstream: OOS_DOMAIN,
      prefix: FILE_PREVIEW_ROUTE_PATH,
    });
  }

  app.register(proofUploadRoute, {
    prefix: "/api",
  });
  app.register(paymentRequestFvaeFileUploadAndConfirmationRoute, {
    prefix: "/api",
  });
  app.register(accountRoute, { prefix: "/api" });
  app.register(feasibilityFileUploadRoute, { prefix: "/api" });
  app.register(dossierDeValidationRoute, { prefix: "/api" });
  app.register(juryRoute, { prefix: "/api" });
  app.register(organismRoutes, { prefix: "/api" });
  app.register(strapiWebhookRoute, { prefix: "/api" });

  // keep MercuriusGQLUpload at the end to handle conflict with fastify.addContentTypeParser("multipart/form-data", ...)
  app.register(MercuriusGQLUpload, { prefix: "/api", maxFileSize: 20971520 });
  app.register(mercuriusGraphQL, {
    prefix: "/api",
  });

  logger.info("started");
  return app;
};
