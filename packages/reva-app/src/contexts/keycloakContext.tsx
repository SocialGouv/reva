import _Keycloak from "keycloak-js";
import React, { useContext, useEffect, useState } from "react";

const storageKey = "tokens";

type KeycloakUser = {
  id: string;
  email: string | null;
};

const KeycloakContext = React.createContext<{
  authenticated: boolean;
  token: string | undefined;
  setTokens: any;
  keycloakUser?: KeycloakUser;
  logout: () => void;
} | null>(null);

interface KeycloakProviderProps {
  keycloakInstance: _Keycloak;
  children: JSX.Element | JSX.Element[];
}

export const Keycloak = (config: {
  clientId: string;
  realm: string;
  url: string;
}) => {
  const keycloak = new _Keycloak(config);
  //@ts-ignore
  window.keycloak = keycloak;
  return keycloak;
};

export const getTokens = () => {
  const tokens_ = localStorage.getItem(storageKey);
  return tokens_ && JSON.parse(tokens_);
};

export const KeycloakProvider = ({
  keycloakInstance,
  children,
}: KeycloakProviderProps) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [ready, setReady] = useState<boolean>(false);
  const [tokens, setTokens] = useState(getTokens);

  const logout = () => {
    localStorage.removeItem(storageKey);

    setAuthenticated(false);
    setTokens([]);
  };

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(tokens));
    const initKeycloak = async (tokens: any) => {
      let config: any = {
        enableLogging: process.env.NODE_ENV !== "production",
        onLoad: "check-sso",
        //@ts-ignore
        promiseType: "native",
        silentCheckSsoRedirectUri: `${window.location.origin}/app/silent-check-sso.html`,
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
          await keycloakInstance.updateToken(60000);
          setAuthenticated(authenticated);
          setToken(keycloakInstance.token);
        }

        setReady(true);
      } catch (e: any) {
        console.log("Error keycloak", e);
        if (e.error === "login_required") {
          setReady(true);
        }
      }
    };
    initKeycloak(tokens);
  }, [tokens, keycloakInstance]);

  const getKeycloakUser = (): KeycloakUser | undefined => {
    if (keycloakInstance.tokenParsed?.sub) {
      const { sub: id, email } = keycloakInstance.tokenParsed;
      return {
        id,
        email,
      };
    }

    return undefined;
  };

  return (
    <KeycloakContext.Provider
      value={{
        authenticated,
        token,
        setTokens,
        logout,
        keycloakUser: getKeycloakUser(),
      }}
    >
      {ready && children}
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
