import { FastifyInstance } from "fastify";

type GraqhqlRequestArguments = Record<string, unknown>;

type GraphqlRequestType = "query" | "mutation";

type GraphqlVariable = Record<string, any>;

interface GraphqlRequestParameters {
  operationName?: string;
  endpoint: string;
  arguments?: GraqhqlRequestArguments;
  variables?: GraphqlVariable;
  returnFields: string;
}

interface GraphqlRequest {
  operationName: string;
  query: string;
  variables: Record<string, any> | null;
}

interface InjectGraphqlParameters {
  fastify: FastifyInstance;
  authorization?: string;
  payload?: GraphqlRequest;
  gql?: GraphqlRequestParameters & { requestType: GraphqlRequestType };
}

export const injectGraphql = ({
  fastify,
  payload,
  authorization,
  gql,
}: InjectGraphqlParameters) => {
  if (!payload && !gql) {
    throw "injectGraphql: you must define either payload or gql";
  }
  return fastify.inject({
    method: "POST",
    url: "/graphql",
    payload: gql ? graphqlRequestPayload(gql.requestType)(gql) : payload,
    headers: {
      authorization: authorization ?? "",
    },
  });
};

export const graphqlQueryPayload = (args: GraphqlRequestParameters) =>
  graphqlRequestPayload("query")(args);

export const graphqlMutationPayload = (args: GraphqlRequestParameters) =>
  graphqlRequestPayload("mutation")(args);

const graphqlRequestPayload =
  (requestType: GraphqlRequestType) =>
  (args: GraphqlRequestParameters): GraphqlRequest => {
    const operationName = args.operationName ?? "noname";
    const argumentList = graphqlArgumentList(args.arguments);
    return {
      operationName,
      query: `${requestType} ${operationName} { ${args.endpoint} ${argumentList} ${args.returnFields} }`,
      variables: args.variables ?? null,
    };
  };

const graphqlArgumentList = (args?: GraqhqlRequestArguments): string => {
  const argumentList = args
    ? Object.entries(args)
        .map(([key, value]) => `${key}: "${value}"`)
        .join(",")
    : undefined;
  return argumentList ? `(${argumentList})` : "";
};
