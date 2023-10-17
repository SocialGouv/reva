import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: [
    "../reva-api/modules/generated-graphql-schema.graphql",
    process.env.NEXT_PUBLIC_WEBSITE_STRAPI_BASE_URL + "/graphql" ||
      "http://localhost:1337/graphql",
  ],
  documents: ["src/**/*.tsx"],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    "./src/graphql/generated/": {
      preset: "client",
    },
  },
};

export default config;
