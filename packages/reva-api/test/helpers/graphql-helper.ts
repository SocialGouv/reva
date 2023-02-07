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

type GraphqlRequestDefinition = GraphqlRequestParameters & {requestType: GraphqlRequestType}
type InjectGraphqlParameters = {
  fastify: FastifyInstance;
  authorization?: string;
  payload: GraphqlRequest | GraphqlRequestDefinition;
}

function hasFormatedQuery(obj: GraphqlRequest|GraphqlRequestDefinition): obj is GraphqlRequest {
    return "query" in obj;
}

export const injectGraphql = ({
  fastify,
  authorization,
  payload,
}: InjectGraphqlParameters) => {
  return fastify.inject({
    method: "POST",
    url: "/graphql",
    payload: hasFormatedQuery(payload)
        ? payload
        : graphqlRequestPayload(payload.requestType)(payload),
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
