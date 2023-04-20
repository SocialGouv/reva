import { FastifyInstance } from "fastify";

type GraqhqlRequestArguments = Record<string, unknown>;

type GraphqlRequestType = "query" | "mutation";

type GraphqlVariables = Record<string, unknown>;

interface GraphqlRequestParameters {
  operationName?: string;
  endpoint: string;
  arguments?: GraqhqlRequestArguments;
  enumFields?: string[];
  variables?: GraphqlVariables;
  returnFields: string;
}

interface GraphqlRequest {
  operationName: string;
  query: string;
  variables: GraphqlVariables | null;
}

type GraphqlRequestDefinition = GraphqlRequestParameters & {
  requestType: GraphqlRequestType;
};
type InjectGraphqlParameters = {
  fastify: FastifyInstance;
  authorization?: string;
  payload: GraphqlRequest | GraphqlRequestDefinition;
};

function hasFormatedQuery(
  obj: GraphqlRequest | GraphqlRequestDefinition
): obj is GraphqlRequest {
  return "query" in obj;
}

export const injectGraphql = ({
  fastify,
  authorization,
  payload,
}: InjectGraphqlParameters) => {
  return fastify.inject({
    method: "POST",
    url: "/api/graphql",
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
    const argumentList = graphqlArgumentList(args.arguments, args.enumFields);
    return {
      operationName,
      query: `${requestType} ${operationName} { ${args.endpoint} ${argumentList} ${args.returnFields} }`,
      variables: args.variables ?? null,
    };
  };

const graphqlArgumentValue = (
  key: string,
  val: unknown,
  enumFields?: string[]
): string => {
  switch (typeof val) {
    case "string":
      return enumFields?.includes(key) ? val : `"${val}"`;
    case "number":
      return val.toString();
    case "boolean":
      return val ? "true" : "false";
    default:
      return graphqlArgumentList(
        val as GraqhqlRequestArguments,
        enumFields,
        true
      );
  }
};

const graphqlArgumentList = (
  args?: GraqhqlRequestArguments,
  enumFields?: string[],
  nested?: boolean
): string => {
  if (Array.isArray(args)) {
    const argumentList = args
      .map((value) => graphqlArgumentValue("", value, enumFields))
      .join(",");
    return `[${argumentList}]`;
  }
  const argumentList = args
    ? Object.entries(args)
        .map(
          ([key, value]) =>
            `${key}: ` + graphqlArgumentValue(key, value, enumFields)
        )
        .join(",")
    : undefined;
  const wrapOpen = nested ? "{" : "(";
  const wrapClose = nested ? "}" : ")";
  return argumentList ? `${wrapOpen}${argumentList}${wrapClose}` : "";
};
