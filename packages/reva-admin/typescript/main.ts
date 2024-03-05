import "@gouvfr/dsfr/dist/dsfr/dsfr.module";

// @ts-ignore
import { Elm } from "../src/Main.elm";
import keycloakElement from "./custom-elements/keycloak";
import AuthenticatedLinkElement from "./custom-elements/authenticated-link";
import { CrispElm } from "./crisp";
import { initUserguiding } from "./userguiding";
import { initProduktly } from "./produktly";

customElements.define(keycloakElement.name, keycloakElement.clazz);
customElements.define(
  AuthenticatedLinkElement.name,
  AuthenticatedLinkElement.clazz,
);

// Init Crisp
CrispElm.getInstance();

// Init Elm app
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
    adminReactUrl:
      import.meta.env.VITE_ADMIN_REACT_URL || "http://localhost:3003/admin2",
  },
});

// @ts-ignore
window.dsfr = {
  verbose: false,
  mode: "loaded",
};

// Init Help bubble
if (import.meta.env.VITE_HELP_BUBBLE_URL) {
  const helpBubble = document.createElement("script");
  helpBubble.setAttribute("src", import.meta.env.VITE_HELP_BUBBLE_URL);
  document.head.appendChild(helpBubble);
}
initUserguiding(import.meta.env.VITE_USERGUIDING_ID);
initProduktly(import.meta.env.VITE_PRODUKTLY_CLIENT_TOKEN);
