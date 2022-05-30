import fs from "fs";
import path from "path";
import { loadFilesSync  } from "@graphql-tools/load-files";
import { mergeTypeDefs, mergeResolvers,  } from "@graphql-tools/merge";
import { GraphQLScalarType, print } from "graphql"

const typeDefs = loadFilesSync(path.join(__dirname, "."), {
  extensions: ["graphql"],
  recursive: true,
});

fs.writeFileSync(path.join(__dirname, "generated-graphql-schema.graphql"), print(mergeTypeDefs(typeDefs)), "utf8")