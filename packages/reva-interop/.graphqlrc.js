import dotenv from "dotenv";
dotenv.config();

export default {
  schema: ["../reva-api/modules/generated-graphql-schema.graphql"],
  documents: ["./**/*.{graphql,js,ts,jsx,tsx}"],
};
