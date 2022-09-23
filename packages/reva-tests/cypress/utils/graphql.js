// Forked from https://docs.cypress.io/guides/end-to-end-testing/working-with-graphql#Alias-multiple-queries-or-mutations
// Add reply with fixtures

// Utility to match GraphQL mutation based on the operation name
export const hasOperationName = (req, operationName) => {
  const { body } = req;
  return (
    body.hasOwnProperty("operationName") && body.operationName === operationName
  );
};

// Alias query if operationName matches
export const stubQuery = (req, operationName) => {
  console.log(operationName);
  if (hasOperationName(req, operationName)) {
    console.log("yes!");
    console.log(operationName);
    req.alias = operationName;
    req.reply({
      fixture: `${operationName}.json`,
    });
  }
};

// Alias mutation if operationName matches
export const stubMutation = (req, operationName) => {
  if (hasOperationName(req, operationName)) {
    req.alias = operationName;
    req.reply({
      fixture: `${operationName}.json`,
    });
  }
};
