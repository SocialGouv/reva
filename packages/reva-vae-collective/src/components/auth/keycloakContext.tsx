"use client";

import Keycloak, { KeycloakInitOptions } from "keycloak-js";
import React, { useContext, useEffect, useState } from "react";

import {
  KEYCLOAK_CLIENT_ID,
  KEYCLOAK_REALM,
  KEYCLOAK_URL,
} from "@/config/config";

import { AuthLoader } from "./AuthLoader";
import { Tokens, getTokens, removeTokens, saveTokens } from "./keycloak.utils";

type KeycloakUser = {
  id: string;
  email: string | null;
};

const KeycloakContext = React.createContext<{
  authenticated: boolean;
  accessToken: string | undefined;
  resetKeycloakInstance: (tokens: Tokens) => void;
  keycloakUser?: KeycloakUser;
  logout: ({ redirectUri }?: { redirectUri?: string }) => void;
} | null>(null);

interface KeycloakProviderProps {
  children: React.ReactNode;
}

export const KeycloakProvider = ({ children }: KeycloakProviderProps) => {
  const [keycloakInstance, setKeycloakInstance] = useState<Keycloak>(
    getKeycloakInstance(),
  );
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [tokens, setTokens] = useState<Tokens | undefined>();
  const [ready, setReady] = useState<boolean>(false);

  const logout = async ({
    redirectUri,
  }: {
    redirectUri?: string;
  } = {}) => {
    if (!keycloakInstance.authenticated) return;

    removeTokens();

    setTokens(undefined);

    await keycloakInstance?.logout({
      redirectUri:
        redirectUri ||
        window.location.origin + "/vae-collective/logout-confirmation",
    });
  };

  const resetKeycloakInstance = (tokens: Tokens) => {
    saveTokens(tokens);
    setTokens(tokens);

    setKeycloakInstance(getKeycloakInstance());
  };

  useEffect(() => {
    initKeycloak({
      keycloakInstance,
      onInit: (authenticated) => {
        setAuthenticated(authenticated);
        setReady(true);
      },
      tokens: getTokens(),
      onUpdateTokens: (tokens) => {
        saveTokens(tokens);
        setTokens(tokens);
      },
      onLogout: () => {
        removeTokens();
        setTokens(undefined);
        setAuthenticated(false);
      },
    });
  }, [keycloakInstance]);

  const getKeycloakUser = (): KeycloakUser | undefined => {
    if (keycloakInstance?.tokenParsed?.sub) {
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
        accessToken: tokens?.accessToken,
        resetKeycloakInstance,
        logout,
        keycloakUser: getKeycloakUser(),
      }}
    >
      {ready ? children : <AuthLoader />}
    </KeycloakContext.Provider>
  );
};

export const useKeycloakContext = () => {
  const context = useContext(KeycloakContext);

  if (!context) {
    throw new Error(
      `useKeycloakContext must be used within a KeycloakProvider`,
    );
  }

  return context;
};

const getKeycloakInstance = (): Keycloak => {
  const keycloakInstance =
    typeof window !== "undefined"
      ? new Keycloak({
          clientId: KEYCLOAK_CLIENT_ID || "",
          realm: KEYCLOAK_REALM || "",
          url: KEYCLOAK_URL || "",
        })
      : undefined;

  return keycloakInstance!;
};

type InitKeycloakParams = {
  keycloakInstance: Keycloak;
  onInit: (authenticated: boolean) => void;
  tokens?: Tokens;
  onUpdateTokens?: (tokens: Tokens) => void;
  onLogout?: () => void;
};

const initKeycloak = async (params: InitKeycloakParams) => {
  const { keycloakInstance, onInit, tokens, onUpdateTokens, onLogout } = params;

  let config: KeycloakInitOptions = {
    enableLogging: process.env.NODE_ENV !== "production",
    onLoad: "check-sso",
    silentCheckSsoRedirectUri: `${window.location.origin}/vae-collective/silent-check-sso.html`,
    checkLoginIframe: false,
    pkceMethod: "S256",
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
        const tokens: Tokens = {
          accessToken: token,
          refreshToken,
          idToken,
        };
        onUpdateTokens?.(tokens);
      }
    };
    keycloakInstance.onAuthRefreshError = async () => {
      console.log("Auth refresh error");

      onLogout?.();
    };
    keycloakInstance.onTokenExpired = async () => {
      console.log("Token expired");

      try {
        await keycloakInstance.updateToken(5);
      } catch (error) {
        console.log("error", error);
      }
    };

    if (authenticated) {
      await keycloakInstance.updateToken(60000);

      const { token, refreshToken, idToken } = keycloakInstance;
      if (token && refreshToken && idToken) {
        const tokens: Tokens = {
          accessToken: token,
          refreshToken,
          idToken,
        };
        onUpdateTokens?.(tokens);
      }
    }

    onInit(authenticated);
  } catch (e) {
    console.log("Error keycloak", e);
  }
};
