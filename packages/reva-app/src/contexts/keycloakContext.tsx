import _Keycloak from "keycloak-js";
import React, { useContext, useEffect, useState } from "react";

const storageKey = "tokens";

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
  const [tokens, setTokens] = useState(() => {
    const tokens_ = localStorage.getItem(storageKey);
    return tokens_ && JSON.parse(tokens_);
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(tokens));
    const initKeycloak = async (tokens: any) => {
      if (!tokens) {
        return;
      }
      let config: any = {
        enableLogging: process.env.NODE_ENV !== "production",
        onLoad: "check-sso",
        //@ts-ignore
        promiseType: "native",
        silentCheckSsoRedirectUri: `http://localhost:3001/app/silent-check-sso.html`,
        // iframeTarget: this,
        checkLoginIframe: false,
      };

      if (tokens) {
        config = {
          ...config,
          token: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          idToken: tokens.idToken,
        };
      }
      try {
        const authenticated = await keycloakInstance.init(config);
        keycloakInstance.onAuthSuccess = async () => {
          console.log("Auth success");
        };
        keycloakInstance.onAuthError = async () => {
          console.log("Auth error");
        };
        keycloakInstance.onAuthRefreshSuccess = async () => {
          console.log("Token refresh success");
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              accessToken: keycloakInstance.token,
              refreshToken: keycloakInstance.refreshToken,
              idToken: keycloakInstance.idToken,
            })
          );
        };
        keycloakInstance.onTokenExpired = async () => {
          console.log("Token expired");
          await keycloakInstance.updateToken(5);
        };

        if (authenticated) {
          setAuthenticated(authenticated);
          setToken(keycloakInstance.token);
        }
      } catch (e) {
        console.log("Error keycloak", e);
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
