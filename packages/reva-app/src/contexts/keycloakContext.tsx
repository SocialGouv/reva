import _Keycloak from "keycloak-js";
import React, { useContext, useEffect, useState } from "react";

const KeycloakContext = React.createContext<{
  authenticated: boolean;
  token: string | undefined;
  setTokens: any;
} | null>(null);

interface KeycloakProviderProps {
  keycloakInstance: any; //_Keycloak;
  children: JSX.Element | JSX.Element[];
}

export const Keycloak = (config: {
  clientId: string;
  realm: string;
  url: string;
}) => {
  console.log(config);
  const keycloak = new _Keycloak(config);
  //@ts-ignore
  window.keycloak = keycloak;
  return keycloak;
};

export const KeycloakProvider = ({
  keycloakInstance,
  children,
}: KeycloakProviderProps) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [tokens, setTokens] = useState(undefined);

  useEffect(() => {
    const initKeycloak = async (tokens: any) => {
      if (!tokens) {
        return;
      }
      try {
        const authenticated = await keycloakInstance.init({
          enableLogging: true,
          onLoad: "check-sso",
          // token: tokens.accessToken,
          // refreshToken: tokens.refreshToken,
          //@ts-ignore
          promiseType: "native",
          silentCheckSsoRedirectUri: `https://reva.incubateur.net/admin/silent-check-sso.html`,
          // iframeTarget: this,
          checkLoginIframe: false,
        });
        // keycloakInstance.login({
        //   prompt: "none",
        //   // redirectUri: window.location.href,
        // });
        console.log(authenticated);
        keycloakInstance.onAuthSuccess = async () => {
          console.log("Auth success");
        };
        keycloakInstance.onAuthRefreshSuccess = async () => {
          console.log("Token refresh success");
        };
        keycloakInstance.onTokenExpired = async () => {
          console.log("Token expired");
          await keycloakInstance.updateToken(5);
        };
        keycloakInstance.onAuthLogout = function () {
          console.log("Logged out");
          // keycloak.login({
          //   redirectUri: window.location.href,
          // });
        };

        if (authenticated) {
          setAuthenticated(authenticated);
          setToken(keycloakInstance.token);
        }
      } catch (e) {
        console.log(e);
      }
    };
    initKeycloak(tokens);
  }, [tokens]);

  return (
    <KeycloakContext.Provider
      value={{
        authenticated,
        token,
        setTokens,
      }}
    >
      {children}
    </KeycloakContext.Provider>
  );
};

export const useKeycloakContext = () => {
  const context = useContext(KeycloakContext);

  if (context === undefined) {
    throw new Error(
      `useKeycloakContext must be used within a KeycloakProvider`
    );
  }

  return context;
};
