import Keycloak from "keycloak-js";

class KeycloakElement extends HTMLElement {
  private _configuration: any;
  constructor() {
    super();
    this._configuration = {};
  }

  get configuration() {
    return this._configuration;
  }

  set configuration(value) {
    this._configuration = value;
  }

  connectedCallback() {
    const keycloak = Keycloak(this._configuration);
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
          keycloak.login()
        } else {
          //@ts-ignore
          this.dispatchEvent(new CustomEvent("loggedIn", { detail: {token: keycloak.token}}));
        }
      });

    keycloak.onAuthLogout = function() {
      console.log("Logged out");
      keycloak.login()
    };
  }
}

export default {
  name: "keycloak-element",
  clazz: KeycloakElement
};