// Forked from https://docs.cypress.io/guides/end-to-end-testing/working-with-graphql#Alias-multiple-queries-or-mutations
// Add reply with fixtures

import { CyHttpMessages } from "cypress/types/net-stubbing";

// Utility to match GraphQL mutation based on the operation name
export const hasOperationName = (
  req: CyHttpMessages.IncomingHttpRequest,
  operationName: string
) => {
  const { body } = req;
  return (
    body.hasOwnProperty("operationName") && body.operationName === operationName
  );
};

// Alias query if operationName matches
export const stubQuery = (
  req: CyHttpMessages.IncomingHttpRequest,
  operationName: string,
  fixture: string,
  statusCode = 200
) => {
  if (hasOperationName(req, operationName)) {
    req.alias = operationName;
    fixture && req.reply({ statusCode, fixture });
  }
};

// Alias mutation if operationName matches
export const stubMutation = (
  req: CyHttpMessages.IncomingHttpRequest,
  operationName: string,
  fixture: string,
  statusCode = 200
) => {
  if (hasOperationName(req, operationName)) {
    req.alias = operationName;
    fixture && req.reply({ statusCode, fixture });
  }
};
