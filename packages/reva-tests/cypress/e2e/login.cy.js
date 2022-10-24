import { stubMutation, stubQuery } from "../utils/graphql";

const email = "email@example.com";

context("Login", () => {
  it.only("submit email", function () {
    cy.intercept("POST", "/graphql", (req) => {
      stubQuery(req, "candidate_askForLogin", "login.json");
    });
    cy.intercept(
      "**/realms/reva-app/protocol/openid-connect/3p-cookies/step1.html",
      {
        fixture: "auth-step1.html",
      }
    );

    cy.intercept("GET", "**/realms/reva-app/protocol/openid-connect/auth*", {
      headers: {
        //  Location:          "http://localhost:3001/app/silent-check-sso.html#state=244bc4cd-2d70-4432-87e3-9056ca5a7e93&session_state=c1f6ba3e-9d46-4863-84f1-64efc79bea56&code=c6bc1812-f412-4f33-90f4-44b708477963.c1f6ba3e-9d46-4863-84f1-64efc79bea56.f2724e6a-553c-43d3-a54a-ce63fa92474a",
        Location:
          "http://localhost:3001/app/silent-check-sso.html#error=login_required&state=6a5b9f5c-c131-421c-86e0-5b1d6d5bf44a",

        "Set-Cookie":
          "AUTH_SESSION_ID=9e64bad6-c8cf-4790-b9ea-fae479662702.auth-reva-incubateur-net-web-1-47013; Version=1; Path=/realms/reva-app/; SameSite=None; Secure; HttpOnly",
        //"Set-Cookie":          "AUTH_SESSION_ID_LEGACY=9e64bad6-c8cf-4790-b9ea-fae479662702.auth-reva-incubateur-net-web-1-47013; Version=1; Path=/realms/reva-app/; Secure; HttpOnly",
        //   "Set-Cookie":          "KC_RESTART=; Version=1; Expires=Thu, 01-Jan-1970 00:00:10 GMT; Max-Age=0; Path=/realms/reva-app/; Secure; HttpOnly",
      },
      statusCode: 302,
    });

    cy.intercept(
      "POST",
      "**/realms/reva-app/protocol/openid-connect/token*",
      (req) =>
        req.reply({
          fixture: "connect.json",
        })
    );

    cy.visit("/");

    cy.get('[data-test="project-contact-login"]').click();

    cy.get('[data-test="login-home"] #email').type(email);

    cy.get('[data-test="login-home-submit"]').click();
    cy.wait("@candidate_askForLogin");

    cy.get('[data-test="login-confirmation"]');
  });

  it("use an expired token", function () {
    cy.intercept("POST", "/graphql", (req) => {
      stubMutation(req, "candidate_login", "login-expired.json", 500);
      stubQuery(req, "getReferential", "referential.json");
    });
    cy.visit("/login?token=abc");
    cy.wait("@candidate_login");
    cy.wait("@getReferential");

    cy.get('[data-test="project-contact-invalid-token"]');
  });
});
