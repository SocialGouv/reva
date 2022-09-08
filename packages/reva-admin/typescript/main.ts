// @ts-ignore
import { Elm } from "../src/Main.elm";
import keycloakElement from "./custom-elements/keycloak";
import Keycloak from "keycloak-js";

customElements.define(keycloakElement.name, keycloakElement.clazz);

const app = Elm.Main.init({
   flags: {
      // @ts-ignore
      endpoint: import.meta.env.VITE_API_GRAPHQL || "http://localhost:8080/graphql",
      baseUrl: 'admin',
      keycloakConfiguration: {
         realm: import.meta.env.VITE_KEYCLOAK_REALM || "REVA",
         url: import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8888/auth/",
         clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "reva-admin",
      }
   }
});
