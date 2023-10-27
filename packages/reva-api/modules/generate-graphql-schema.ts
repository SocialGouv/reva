import fs from "fs";
import path from "path";

import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeTypeDefs } from "@graphql-tools/merge";
import { print } from "graphql";

const typeDefs = loadFilesSync(
  path.join(__dirname, "./**/!(generated-graphql-schema).graphql")
);

fs.writeFileSync(
  path.join(__dirname, "generated-graphql-schema.graphql"),
  print(mergeTypeDefs(typeDefs)),
  "utf8"
);
