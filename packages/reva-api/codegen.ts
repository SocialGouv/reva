import path from "path";
import type { CodegenConfig } from "@graphql-codegen/cli";
import dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), "..", "..", ".env") });

const config: CodegenConfig = {
  overwrite: true,
  schema: ["./modules/generated-graphql-schema.graphql"],
  documents: ["modules/**/*test.ts"],
  generates: {
    "modules/graphql/generated/": {
      preset: "client",
      plugins: [],
      config: {
        enumsAsTypes: true,
      },
    },
  },
  config: { scalars: { Timestamp: "number" } },
};

export default config;
