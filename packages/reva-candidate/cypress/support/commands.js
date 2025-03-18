import { stubMutation } from "../utils/graphql";

Cypress.Commands.add("auth", () => {
  cy.intercept(
    "**/realms/reva-app/protocol/openid-connect/3p-cookies/step1.html",
    {
      fixture: "auth/step1.html",
    },
  );
  cy.intercept("GET", "**/candidate/silent-check-sso.html", {
    fixture: "auth/silent-check-sso.html",
  });

  cy.intercept("POST", "**/realms/reva-app/protocol/openid-connect/token", {
    fixture: "auth/candidate-token.json",
  });

  cy.intercept("GET", "**/realms/reva-app/protocol/openid-connect/auth*", {
    headers: {
      Location: `${
        Cypress.config().baseUrl
      }silent-check-sso.html#error=login_required&state=e4d54c2f-0eaa-490a-bce2-3fbad7ee5780&iss=https%3A%2F%2Fauth.reva.incubateur.net%2Frealms%2Freva-app`,
    },
    statusCode: 302,
  });

  cy.intercept("POST", "/api/graphql", (req) => {
    stubMutation(
      req,
      "candidate_loginWithToken",
      "candidate_loginWithToken.json",
    );
  });
});

Cypress.Commands.add("login", (config = { token: "abc" }, options) => {
  cy.setCookie(
    "tokens",
    "%7B%22accessToken%22%3A%22eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c%22%2C%22idToken%22%3A%22eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c%22%2C%22refreshToken%22%3A%22eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c%22%7D", //mock token
  );

  cy.auth();
  if (config.token) {
    cy.visit(`/login?token=${config.token}`, options);
    cy.wait("@candidate_loginWithToken");
  } else {
    cy.visit(`/login`, options);
  }
});
