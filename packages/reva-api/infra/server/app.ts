import cors from "@fastify/cors";
import proxy from "@fastify/http-proxy";
import fastifyStatic from "@fastify/static";
import { setDefaultOptions } from "date-fns";
import { fr } from "date-fns/locale";
import fastify, {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginOptions,
  FastifyServerOptions,
} from "fastify";
import MercuriusGQLUpload from "mercurius-upload";
import path from "path";
import { accountRoute } from "../../modules/account/account.routes";
import { dossierDeValidationRoute } from "../../modules/dossier-de-validation/dossier-de-validation.routes";
import { feasibilityFileUploadRoute } from "../../modules/feasibility/feasibility.routes";
import paymentRequestFvaeFileUploadAndConfirmationRoute from "../../modules/finance/unifvae/finance.routes";
import proofUploadRoute from "../../modules/finance/unireva/finance.routes";
import { juryRoute } from "../../modules/jury/jury.routes";
import { organismRoutes } from "../../modules/organism/organism.routes";
import { FILE_PREVIEW_ROUTE_PATH, OOS_DOMAIN } from "../../modules/shared/file";
import { logger } from "../../modules/shared/logger";
import { mercuriusGraphQL } from "./mercurius";
import keycloakAdminPlugin from "./plugins/keycloak-admin-plugin";
import keycloakPlugin from "./plugins/keycloak-plugin";

const APP_ROUTE_PATH = "/app";
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
    const DIST_FOLDER = path.join(__dirname, "..", "..");
    const APP_FOLDER = path.join(DIST_FOLDER, "app");

    app.register(fastifyStatic, {
      root: APP_FOLDER,
      prefix: APP_ROUTE_PATH,
      // decorateReply: false,
    });

    // Deal with not found
    app.setNotFoundHandler((req, res) => {
      if (req.url.startsWith(APP_ROUTE_PATH)) {
        res.sendFile("index.html", APP_FOLDER);
      }
    });

    app.register(cors, {
      origin: (process.env.CORS_ORIGIN || "").split(","),
    });
  } else {
    app.register(proxy, {
      upstream: "http://localhost:3001/app",
      prefix: APP_ROUTE_PATH,
    });

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

  app.register(MercuriusGQLUpload, { prefix: "/api", maxFileSize: 10000000 });

  app.register(mercuriusGraphQL, {
    prefix: "/api",
  });

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

  logger.info("started");
  return app;
};
