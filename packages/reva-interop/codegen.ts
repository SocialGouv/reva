import path from "path";
import type { CodegenConfig } from "@graphql-codegen/cli";
import dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), "..", "..", ".env") });

const config: CodegenConfig = {
  overwrite: true,
  schema: ["../reva-api/modules/generated-graphql-schema.graphql"],
  documents: ["./routes/**/*.tsx", "./routes/**/*.ts"],
  emitLegacyCommonJSImports: false,
  generates: {
    "./graphql/generated/": {
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
