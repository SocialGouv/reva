import "./index.css";

import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
// import { inspect } from "@xstate/inspect";
import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { Keycloak } from "./contexts/keycloakContext";
import { KeycloakProvider } from "./contexts/keycloakContext";
import reportWebVitals from "./reportWebVitals";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const client = new ApolloClient({
  uri: process.env.REACT_APP_API_GRAPHQL || "http://localhost:8080/graphql",
  cache: new InMemoryCache(),
});

//// Uncomment to debug XState
// inspect({ iframe: false });

const keycloakInstance = Keycloak({
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID as string,
  realm: process.env.REACT_APP_KEYCLOAK_REALM as string,
  url: process.env.REACT_APP_KEYCLOAK_URL as string,
});

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <KeycloakProvider keycloakInstance={keycloakInstance}>
        <App />
      </KeycloakProvider>
    </ApolloProvider>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
