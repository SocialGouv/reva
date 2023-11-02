import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "../reva-api/modules/generated-graphql-schema.graphql",
  documents: "src/**/*.tsx",
  generates: {
    "src/graphql/generated": {
      preset: "client",
      plugins: [],
    },
  },
};

export default config;
