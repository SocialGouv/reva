import _Keycloak, { KeycloakInitOptions } from "keycloak-js";
import React, { useContext, useEffect, useState } from "react";

const storageKey = "tokens";

type KeycloakUser = {
  id: string;
  email: string | null;
};

const KeycloakContext = React.createContext<{
  authenticated: boolean;
  token: string | undefined;
  setTokens: (tokens: Tokens) => void;
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

interface Tokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
}

export const getTokens = (): Tokens | undefined => {
  try {
    const tokensData = localStorage.getItem(storageKey);
    if (tokensData) {
      const tokens = JSON.parse(tokensData);
      return tokens;
    }
  } catch (error) {
    // console.error(error);
  }

  return undefined;
};

const saveTokens = (tokens: Tokens): void => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(tokens));
  } catch (error) {
    // console.error(error);
  }
};

const removeTokens = (): void => {
  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    // console.error(error);
  }
};

export const KeycloakProvider = ({
  keycloakInstance,
  children,
}: KeycloakProviderProps) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [ready, setReady] = useState<boolean>(false);

  const logout = () => {
    removeTokens();

    setAuthenticated(false);

    keycloakInstance?.logout();
  };

  const initKeycloak = async (tokens?: Tokens) => {
    let config: KeycloakInitOptions = {
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
        const { token, refreshToken, idToken } = keycloakInstance;
        if (token && refreshToken && idToken) {
          saveTokens({
            accessToken: token,
            refreshToken,
            idToken,
          });
        }

        setToken(keycloakInstance.token);
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

  const setTokens = (tokens: Tokens) => {
    saveTokens(tokens);
    initKeycloak(tokens);
  };

  useEffect(() => {
    initKeycloak(getTokens());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keycloakInstance]);

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
      `useKeycloakContext must be used within a KeycloakProvider`,
    );
  }

  return context;
};
