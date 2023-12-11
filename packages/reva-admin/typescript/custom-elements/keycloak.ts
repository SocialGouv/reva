import Keycloak from "keycloak-js";
import { CrispElm } from "../crisp";

type KeycloakUser = {
  id: string;
  email: string | null;
};

function getKeycloakUser(keycloak: Keycloak): KeycloakUser | undefined {
  if (keycloak.tokenParsed?.sub) {
    const { sub: id, email } = keycloak.tokenParsed;
    return {
      id,
      email,
    };
  }

  return undefined;
}

class KeycloakElement extends HTMLElement {
  static get observedAttributes() {
    return ["logout"];
  }

  private _configuration: any;
  private _keycloak: Keycloak | undefined;

  constructor() {
    super();
    this._configuration = {};
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "logout" && oldValue !== newValue && newValue !== null) {
      this._keycloak?.logout();
    }
  }

  get configuration() {
    return this._configuration;
  }

  set configuration(value) {
    this._configuration = value;
  }

  connectedCallback() {
    this._keycloak = new Keycloak(this._configuration);
    const keycloak = this._keycloak;

    const dispatchEventWithDetail = (eventName: string) => {
      const keycloakUser = getKeycloakUser(keycloak);
      if (keycloakUser) {
        CrispElm.getInstance().configureUser(keycloakUser);
      }

      this.dispatchEvent(
        new CustomEvent(eventName, {
          detail: {
            isAdmin: keycloak.hasResourceRole("admin"),
            isCertificationAuthority:
              keycloak.hasResourceRole("manage_feasibility"),
            isOrganism: keycloak.hasResourceRole("manage_candidacy"),
            isGestionnaireMaisonMereAAP: keycloak.hasResourceRole(
              "gestion_maison_mere_aap",
            ),
            token: keycloak.token,
            email: keycloak?.tokenParsed?.email,
          },
        }),
      );
    };

    const setTimeoutRefreshToken = () => {
      if (!keycloak.tokenParsed?.exp) {
        return undefined;
      }

      const delai = (keycloak.tokenParsed.exp * 1000 - Date.now()) / 2;

      return setTimeout(async () => {
        console.log("[KEYCLOAK] Refresh token manually");
        await keycloak.updateToken(delai);
      }, delai);
    };

    // debug purpose
    // @ts-ignore
    window.keycloak = keycloak;
    keycloak
      .init({
        enableLogging: true,
        onLoad: "check-sso",
        //@ts-ignore
        promiseType: "native",
        silentCheckSsoRedirectUri: `${window.location.origin}/admin/silent-check-sso.html`,
        iframeTarget: this,
        checkLoginIframe: true,
      })
      .then((authenticated) => {
        console.log(authenticated ? "authenticated" : "not authenticated");
        if (!authenticated) {
          keycloak.login({
            redirectUri: window.location.href,
          });
        } else {
          dispatchEventWithDetail("loggedIn");
          setTimeoutRefreshToken();
        }
      });

    let refreshTimeoutId: number | undefined = undefined;
    const DEFAULT_TIMEOUT_VALUE = 5000;
    const MAX_TIMEOUT_VALUE = 60000;

    let timeoutValue = DEFAULT_TIMEOUT_VALUE;

    window.addEventListener("online", async () => {
      console.log("Browser online");
      if (refreshTimeoutId) {
        timeoutValue = DEFAULT_TIMEOUT_VALUE;
        clearTimeout(refreshTimeoutId);
      }
      await keycloak.updateToken(5);
    });

    keycloak.onAuthRefreshSuccess = async () => {
      if (refreshTimeoutId) {
        timeoutValue = DEFAULT_TIMEOUT_VALUE;
        clearTimeout(refreshTimeoutId);
      }
      console.log("Token refresh success");
      dispatchEventWithDetail("tokenRefreshed");
      setTimeoutRefreshToken();
    };

    keycloak.onAuthRefreshError = async () => {
      console.log("Token refresh failed");
      if (navigator.onLine) {
        console.log(`Next refresh token in ${timeoutValue}ms`);
        refreshTimeoutId = setTimeout(
          async () => {
            timeoutValue =
              timeoutValue * 2 >= MAX_TIMEOUT_VALUE
                ? MAX_TIMEOUT_VALUE
                : timeoutValue * 2;
            await keycloak.updateToken(5);
          },
          timeoutValue,
          "Refresh token",
        );
      } else {
        console.log("Browser offline");
      }
    };

    keycloak.onTokenExpired = async () => {
      console.log("Token expired");
      await keycloak.updateToken(5);
    };

    keycloak.onAuthLogout = function () {
      console.log("Logged out");

      CrispElm.getInstance().resetUser();

      keycloak.login({
        redirectUri: window.location.href,
      });
    };
  }
}

export default {
  name: "keycloak-element",
  clazz: KeycloakElement,
};
