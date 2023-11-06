import "@gouvfr/dsfr/dist/dsfr/dsfr.module";
import { Crisp } from "crisp-sdk-web";

// @ts-ignore
import { Elm } from "../src/Main.elm";
import keycloakElement from "./custom-elements/keycloak";
import AuthenticatedLinkElement from "./custom-elements/authenticated-link";

customElements.define(keycloakElement.name, keycloakElement.clazz);
customElements.define(
  AuthenticatedLinkElement.name,
  AuthenticatedLinkElement.clazz,
);

const crispId = import.meta.env.VITE_CRISP_ID;
if (crispId) {
  Crisp.configure(crispId);
}

const app = Elm.Main.init({
  flags: {
    endpoint:
      import.meta.env.VITE_API_GRAPHQL || "http://localhost:8080/api/graphql",
    baseUrl: "admin",
    keycloakConfiguration: {
      realm: import.meta.env.VITE_KEYCLOAK_REALM || "REVA",
      url: import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8888/auth/",
      clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "reva-admin",
    },
    restApiEndpoint:
      import.meta.env.VITE_API_REST || "http://localhost:8080/api",

    franceVaeFinanceModuleFeatureEnabled:
      import.meta.env.VITE_FRANCE_VAE_FINANCE_MODULE_FEATURE_ENABLED == "true",
  },
});

// @ts-ignore
window.dsfr = {
  verbose: false,
  mode: "loaded",
};
