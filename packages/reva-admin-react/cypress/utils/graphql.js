// Forked from https://docs.cypress.io/guides/end-to-end-testing/working-with-graphql#Alias-multiple-queries-or-mutations
// Add reply with fixtures

// Utility to match GraphQL mutation based on the operation name
const hasOperationName = (req, operationName) => {
  const { body } = req;
  return (
    body.hasOwnProperty("operationName") && body.operationName === operationName
  );
};

// Alias query if operationName matches
export const stubQuery = (req, operationName, fixture, statusCode = 200) => {
  if (hasOperationName(req, operationName)) {
    req.alias = operationName;

    if (typeof fixture == "string" && fixture.endsWith(".json")) {
      req.reply({ statusCode, fixture });
    } else {
      req.reply(statusCode, fixture);
    }
  }
};

export const CERTIFICATION_AUTHORITY_STRUCTURE_CGU_QUERY_NAMES = [
  "getCertificationAuthorityStructureCGUQueryForCertificationAuthority",
  "getCertificationAuthorityStructureCGUQueryForCertificationRegistryManager",
  "getCertificationAuthorityStructureCGUQueryForCertificationAuthorityLocalAccount",
];

/** Stub all persona-specific layout CGU queries with the same fixture payload. */
export const stubCertificationAuthorityStructureCGUQueries = (
  req,
  fixture,
  statusCode = 200,
) => {
  for (const operationName of CERTIFICATION_AUTHORITY_STRUCTURE_CGU_QUERY_NAMES) {
    stubQuery(req, operationName, fixture, statusCode);
  }
};

// Alias mutation if operationName matches
export const stubMutation = (req, operationName, fixture, statusCode = 200) => {
  if (hasOperationName(req, operationName)) {
    req.alias = operationName;

    if (typeof fixture == "string" && fixture.endsWith(".json")) {
      req.reply({ statusCode, fixture });
    } else {
      req.reply(statusCode, fixture);
    }
  }
};
