import _Keycloak from "keycloak-js";
import React, { useCallback, useContext, useEffect, useState } from "react";

const KeycloakContext = React.createContext<{
  authenticated: boolean;
  accessToken: string | undefined;
  logout: () => void;
}>({ authenticated: false, accessToken: "", logout: () => null });

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

const ACCESS_TOKEN_EXPIRATION_IN_SECONDS = 60;

export const KeycloakProvider = ({
  keycloakInstance,
  children,
}: KeycloakProviderProps) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const [ready, setReady] = useState<boolean>(false);

  const logout = () => {
    setAuthenticated(false);
    keycloakInstance.logout();
  };

  const setTimeoutRefreshToken = useCallback(() => {
    const delay = (ACCESS_TOKEN_EXPIRATION_IN_SECONDS * 1000) / 2;

    return setTimeout(async () => {
      console.log("[KEYCLOAK] Refresh token manually");
      await keycloakInstance.updateToken(delay);
    }, delay);
  }, [keycloakInstance]);

  useEffect(() => {
    const initKeycloak = async () => {
      let config: any = {
        enableLogging: process.env.NODE_ENV !== "production",
        onLoad: "check-sso",
        //@ts-ignore
        promiseType: "native",
        silentCheckSsoRedirectUri: `${window.location.origin}/admin2/silent-check-sso.html`,
        iframeTarget: this,
        checkLoginIframe: true,
      };

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
          setAccessToken(keycloakInstance.token);
          setTimeoutRefreshToken();
        };
        keycloakInstance.onTokenExpired = async () => {
          console.log("Token expired");
          await keycloakInstance.updateToken(
            ACCESS_TOKEN_EXPIRATION_IN_SECONDS,
          );
        };

        if (authenticated) {
          await keycloakInstance.updateToken(
            ACCESS_TOKEN_EXPIRATION_IN_SECONDS,
          );
          setAuthenticated(authenticated);
          setAccessToken(keycloakInstance.token);
          setTimeoutRefreshToken();
        } else {
          keycloakInstance.login({
            redirectUri: window.location.href,
          });
        }

        setReady(true);
      } catch (e: any) {
        console.log("Error keycloak", e);
        if (e.error === "login_required") {
          setReady(true);
        }
      }
    };
    initKeycloak();
  }, [keycloakInstance, setTimeoutRefreshToken]);

  return (
    <KeycloakContext.Provider
      value={{
        authenticated,
        accessToken,
        logout,
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
