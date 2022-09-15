import Keycloak from "keycloak-js";

class KeycloakElement extends HTMLElement {

  static get observedAttributes() { return ['logout']; }

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
    this._keycloak = Keycloak(this._configuration);
    const keycloak = this._keycloak;

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
        checkLoginIframe: true
      })
      .then((authenticated) => {
        console.log(authenticated ? "authenticated" : "not authenticated");
        if (!authenticated) {
          keycloak.login({
            redirectUri: window.location.href
          });
        } else {
          //@ts-ignore
          this.dispatchEvent(new CustomEvent("loggedIn", { detail: { token: keycloak.token } }));
        }
      });

    keycloak.onAuthRefreshSuccess = async () => {
      console.log("Token refresh success");
      this.dispatchEvent(new CustomEvent("tokenRefreshed", { detail: { token: keycloak.token } }));
    };
    keycloak.onTokenExpired = async () => {
      console.log("Token expired");
      await keycloak.updateToken(5);
    };
    keycloak.onAuthLogout = function () {
      console.log("Logged out");
      keycloak.login({
        redirectUri: window.location.href
      });
    };
  }
}

export default {
  name: "keycloak-element",
  clazz: KeycloakElement
};