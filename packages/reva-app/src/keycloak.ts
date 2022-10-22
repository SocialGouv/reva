import Keycloak from "keycloak-js";

export const initKeycloak = async () => {
  const keycloak = Keycloak({
    clientId: "reva-admin", //process.env.REACT_APP_KEYCLOAK_CLIENT_ID as string,
    realm: "reva", //process.env.REACT_APP_KEYCLOAK_REALM as string,
    url: process.env.REACT_APP_KEYCLOAK_URL as string,
  });

  // debug purpose
  // @ts-ignore
  window.keycloak = keycloak;
  console.log("init keycloak", keycloak);
  keycloak
    .init({
      enableLogging: true,
      onLoad: "check-sso",
      token:
        "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJjZ0k2SldEQWhTSWduMlBnVnVvRGhjTGRMVkxBcVhPaVBSc0RLYTZ0dHQ0In0.eyJleHAiOjE2NjYzOTc1MzcsImlhdCI6MTY2NjM5NzQ3NywiYXV0aF90aW1lIjoxNjY2Mzk1MzIwLCJqdGkiOiJkMjkxM2ZmYy0xYzhkLTQxNzYtODZlMy1hMTYyNjRkZmZjYTgiLCJpc3MiOiJodHRwczovL2F1dGgucmV2YS5pbmN1YmF0ZXVyLm5ldC9yZWFsbXMvcmV2YSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiI5YWFkNGZmZS1hODdmLTRiNmMtYmVmZi04NzM3YzI2MmIzMDAiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJyZXZhLWFkbWluIiwibm9uY2UiOiJlMjEyMzMzOS02ZTVlLTQzYWYtOTEyOS05YTliZmRkNzM2YzQiLCJzZXNzaW9uX3N0YXRlIjoiNmRkZDMyNGMtNGUxZi00ODgyLWI3M2YtYmE4MDRkMTZhNDdmIiwiYWNyIjoiMCIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL3JldmEuaW5jdWJhdGV1ci5uZXQiLCJodHRwOi8vbG9jYWxob3N0OjMwMDEiLCJodHRwOi8vbG9jYWxob3N0OjMwMDAiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtcmV2YSIsIm1hbmFnZV9hY2NvdW50Iiwib2ZmbGluZV9hY2Nlc3MiLCJtYW5hZ2VfY2FuZGlkYWN5IiwiYWRtaW4iLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7InJldmEtYWRtaW4iOnsicm9sZXMiOlsibWFuYWdlX2FjY291bnQiLCJtYW5hZ2VfY2FuZGlkYWN5IiwiYWRtaW4iXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIGVtYWlsIHByb2ZpbGUiLCJzaWQiOiI2ZGRkMzI0Yy00ZTFmLTQ4ODItYjczZi1iYTgwNGQxNmE0N2YiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IkFudGhvbm55IFF1w6lyb3VpbCIsInByZWZlcnJlZF91c2VybmFtZSI6ImFudGhvbm55IiwiZ2l2ZW5fbmFtZSI6IkFudGhvbm55IiwiZmFtaWx5X25hbWUiOiJRdcOpcm91aWwiLCJlbWFpbCI6ImFudGhvbm55LnF1ZXJvdWlsQGJldGEuZ291di5mciJ9.QQ-SOxclNDSGJyPjKr1F5yvp9yvboIFQZoXb2_VFr3MayiAhHQP_mzAfKeHsT998A2dnf_kiRZFXiqvVoMarI9cgW1xmwRGeokVLxWA8SiAtpFdKIMZS74KueemjC9BqNOb-Maqjpv8Ae_tIunWK2hR138xQ8-5bzb1pPwXwkwXJhOH42SIfbvnfqzGCXg8tc2d5HXHvrxBT-DZ9HcLG6lvKWCBXJaKKOSCuC-Spylyrdyd5_tPQ_lcJzgqFhWUuF62k9S7f7VKCAEYeDQjXmhv2h6pCUrIqm_P1xFc32xNHltIVaXjpJEtnW3u9ot1GuZhwWu9-7w43tBoId9kVBA",
      refreshToken:
        "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJjYjEwNzQ1ZS1hZTE3LTQyY2YtODlmZS1iODYxMTRiNzQ2NmIifQ.eyJleHAiOjE2NjYzOTkyNzcsImlhdCI6MTY2NjM5NzQ3NywianRpIjoiNWE2NGI2MmEtNTk3Mi00ZjkwLWI2ZmYtNGI4NjMzNDFjZWZjIiwiaXNzIjoiaHR0cHM6Ly9hdXRoLnJldmEuaW5jdWJhdGV1ci5uZXQvcmVhbG1zL3JldmEiLCJhdWQiOiJodHRwczovL2F1dGgucmV2YS5pbmN1YmF0ZXVyLm5ldC9yZWFsbXMvcmV2YSIsInN1YiI6IjlhYWQ0ZmZlLWE4N2YtNGI2Yy1iZWZmLTg3MzdjMjYyYjMwMCIsInR5cCI6IlJlZnJlc2giLCJhenAiOiJyZXZhLWFkbWluIiwibm9uY2UiOiJlMjEyMzMzOS02ZTVlLTQzYWYtOTEyOS05YTliZmRkNzM2YzQiLCJzZXNzaW9uX3N0YXRlIjoiNmRkZDMyNGMtNGUxZi00ODgyLWI3M2YtYmE4MDRkMTZhNDdmIiwic2NvcGUiOiJvcGVuaWQgZW1haWwgcHJvZmlsZSIsInNpZCI6IjZkZGQzMjRjLTRlMWYtNDg4Mi1iNzNmLWJhODA0ZDE2YTQ3ZiJ9.BrXiGw_FW6g5OCgKL5u5BF-DQackU-cWZ2HIgYDY-7A",
      //@ts-ignore
      promiseType: "native",
      silentCheckSsoRedirectUri: `http://localhost:3001/app/silent-check-sso.html`,
      // iframeTarget: this,
      checkLoginIframe: false,
    })
    .then((authenticated) => {
      console.log("then keycloak", authenticated);
      console.log(authenticated ? "authenticated" : "not authenticated");
      if (!authenticated) {
        // keycloak.login({
        //   prompt: "none",
        //   redirectUri: window.location.href,
        // });
      }
      // else {
      //   //@ts-ignore
      //   this.dispatchEvent(
      //     new CustomEvent("loggedIn", { detail: { token: keycloak.token } })
      //   );
      // }
    })
    .catch(console.log)
    .finally(() => console.log("finally"));

  keycloak.onAuthSuccess = async () => {
    console.log("Auth success");
  };
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
