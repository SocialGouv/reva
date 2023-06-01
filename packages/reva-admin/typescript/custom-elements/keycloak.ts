import Keycloak from "../../vendor/keycloak-js/keycloak";

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
    
    const setTimeoutRefreshToken = () => {
      if (!keycloak.tokenParsed?.exp) {
        return undefined;
      }

      const delai = ((keycloak.tokenParsed.exp * 1000) - Date.now()) / 2

      return setTimeout(async () => {
        console.log("[KEYCLOAK] Refresh token manually")
        await keycloak.updateToken(delai);
      }, delai)
    }

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
          //@ts-ignore
          this.dispatchEvent(
            new CustomEvent("loggedIn", {
              detail: {
                isAdmin: keycloak.hasResourceRole("admin"),
                token: keycloak.token,
              },
            })
          );
          setTimeoutRefreshToken()
        }
      });

    
    let refreshTimeoutId: number | undefined = undefined;
    const DEFAULT_TIMEOUT_VALUE = 5000;
    const MAX_TIMEOUT_VALUE = 60000;
    
    let timeoutValue = DEFAULT_TIMEOUT_VALUE;

    window.addEventListener('online', async () => { 
      console.log("Browser online");
      if (refreshTimeoutId) {
        timeoutValue = DEFAULT_TIMEOUT_VALUE;
        clearTimeout(refreshTimeoutId)
      }
      await keycloak.updateToken(5);
    });

    keycloak.onAuthRefreshSuccess = async () => {
      if (refreshTimeoutId) {
        timeoutValue = DEFAULT_TIMEOUT_VALUE;
        clearTimeout(refreshTimeoutId)
      }
      console.log("Token refresh success");
      this.dispatchEvent(
        new CustomEvent("tokenRefreshed", {
          detail: {
            isAdmin: keycloak.hasResourceRole("admin"),
            token: keycloak.token,
          },
        })
      );
      setTimeoutRefreshToken()
    };

    keycloak.onAuthRefreshError = async () => {
      console.log("Token refresh failed");
      if (navigator.onLine) {
        console.log(`Next refresh token in ${timeoutValue}ms`)
        refreshTimeoutId = setTimeout(async () => {
          timeoutValue = timeoutValue * 2 >= MAX_TIMEOUT_VALUE ? MAX_TIMEOUT_VALUE : timeoutValue * 2
          await keycloak.updateToken(5);
        }, timeoutValue, "Refresh token");
      } else {
        console.log("Browser offline");
      }
    }

    keycloak.onTokenExpired = async () => {
      console.log("Token expired");
      await keycloak.updateToken(5);
    };

    keycloak.onAuthLogout = function () {
      console.log("Logged out");
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
