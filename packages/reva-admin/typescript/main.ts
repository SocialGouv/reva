import "@gouvfr/dsfr/dist/dsfr/dsfr.module";
import { Crisp } from "crisp-sdk-web";

// @ts-ignore
import { Elm } from "../src/Main.elm";
import keycloakElement from "./custom-elements/keycloak";

customElements.define(keycloakElement.name, keycloakElement.clazz);

const crispId = import.meta.env.VITE_CRISP_ID;
if (crispId) {
   Crisp.configure(crispId);
}

const app = Elm.Main.init({
   flags: {
      endpoint: import.meta.env.VITE_API_GRAPHQL || "http://localhost:8080/api/graphql",
      baseUrl: 'admin',
      keycloakConfiguration: {
         realm: import.meta.env.VITE_KEYCLOAK_REALM || "REVA",
         url: import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8888/auth/",
         clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "reva-admin",
      },
      uploadEndpoint: import.meta.env.VITE_API_UPLOAD || "http://localhost:8080/api/payment-request/proof",
   },
});

// @ts-ignore
window.dsfr = {
   verbose: false,
   mode: "loaded",
};
