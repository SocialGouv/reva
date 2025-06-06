import { GraphQLClient } from "graphql-request";
import { STRAPI_GRAPHQL_API_URL } from "@/config/config";

export const strapi = new GraphQLClient(STRAPI_GRAPHQL_API_URL);
