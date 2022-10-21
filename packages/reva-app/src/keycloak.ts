import Keycloak from "keycloak-js";

export const initKeycloak = async () => {
  const keycloak = Keycloak({
    clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID as string,
    realm: process.env.REACT_APP_KEYCLOAK_REALM as string,
    url: process.env.REACT_APP_KEYCLOAK_URL as string,
  });

  // debug purpose
  // @ts-ignore
  window.keycloak = keycloak;
  console.log("init keycloak");
  keycloak
    .init({
      enableLogging: true,
      onLoad: "check-sso",
      token:
        "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJjZ0k2SldEQWhTSWduMlBnVnVvRGhjTGRMVkxBcVhPaVBSc0RLYTZ0dHQ0In0.eyJleHAiOjE2NjUwNjIzNDQsImlhdCI6MTY2NTA2MjI4NCwiYXV0aF90aW1lIjoxNjY1MDYyMjgzLCJqdGkiOiI4OThmMTEzMy1kOWM4LTRlMTctYTVhNS1kZDc4OTkyYmMyNzgiLCJpc3MiOiJodHRwczovL2F1dGgucmV2YS5pbmN1YmF0ZXVyLm5ldC9yZWFsbXMvcmV2YSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiI5YWFkNGZmZS1hODdmLTRiNmMtYmVmZi04NzM3YzI2MmIzMDAiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJyZXZhLWFkbWluIiwibm9uY2UiOiJlODMyNmI1NS1lZTFkLTQ0ZWItYTRmNy1iOTU0ZjBhYmZhMzIiLCJzZXNzaW9uX3N0YXRlIjoiY2YwZmUwNWMtZjJjMC00NjgwLWE0OGQtOTJiOGI2MWY0ZTRiIiwiYWNyIjoiMCIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL3JldmEuaW5jdWJhdGV1ci5uZXQiLCJodHRwOi8vbG9jYWxob3N0OjMwMDEiLCJodHRwOi8vbG9jYWxob3N0OjMwMDAiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtcmV2YSIsIm1hbmFnZV9hY2NvdW50Iiwib2ZmbGluZV9hY2Nlc3MiLCJtYW5hZ2VfY2FuZGlkYWN5IiwiYWRtaW4iLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7InJldmEtYWRtaW4iOnsicm9sZXMiOlsibWFuYWdlX2FjY291bnQiLCJtYW5hZ2VfY2FuZGlkYWN5IiwiYWRtaW4iXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIGVtYWlsIHByb2ZpbGUiLCJzaWQiOiJjZjBmZTA1Yy1mMmMwLTQ2ODAtYTQ4ZC05MmI4YjYxZjRlNGIiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IkFudGhvbm55IFF1w6lyb3VpbCIsInByZWZlcnJlZF91c2VybmFtZSI6ImFudGhvbm55IiwiZ2l2ZW5fbmFtZSI6IkFudGhvbm55IiwiZmFtaWx5X25hbWUiOiJRdcOpcm91aWwiLCJlbWFpbCI6ImFudGhvbm55LnF1ZXJvdWlsQGJldGEuZ291di5mciJ9.DIUEtNhQJAOMC_KveMA4W-apSi7HOIOTLf-dN3cp1XfOcU7I14tjiRQVq1bEYIBqh7e2zhrBBmuKSvjUXrqCj1dRPAlaQIT5iJZt7ramKqzdDI5zrPvGeOwZOriJROlxawDvPYJuodJ77NFHKLVpGy6NbLW6vr6qj-Yjp4WhJfrScG1Tpu1PA2ciJDR3Gb4qo5OHx5sn4vBpJ_YZsE26AcLdzRunpgUzUQepelXZRi-x3uac7AVjrqFNA2mK4J2zOM-NckaVJ3gFm4pg45xnYb7WRo2xI9x-DI-TiEIgqR6iooCXSzrOpO6G7hJVHYc0WmvNt64NCze2T4vUcoGsFA",
      //@ts-ignore
      promiseType: "native",
      silentCheckSsoRedirectUri: `https://reva.incubateur.net/admin/silent-check-sso.html`,
      // iframeTarget: this,
      checkLoginIframe: true,
    })
    .then((authenticated) => {
      console.log("then keycloak");
      console.log(authenticated ? "authenticated" : "not authenticated");
      // if (!authenticated) {
      //   keycloak.login({
      //     // prompt: "none",
      //     redirectUri: window.location.href,
      //   });
      // } else {
      //   //@ts-ignore
      //   this.dispatchEvent(
      //     new CustomEvent("loggedIn", { detail: { token: keycloak.token } })
      //   );
      // }
    })
    .catch(console.log)
    .finally(() => console.log("finally"));

  keycloak.onAuthRefreshSuccess = async () => {
    console.log("Token refresh success");
  };
  keycloak.onTokenExpired = async () => {
    console.log("Token expired");
    await keycloak.updateToken(5);
  };
  keycloak.onAuthLogout = function () {
    console.log("Logged out");
    // keycloak.login({
    //   redirectUri: window.location.href,
    // });
  };
};
