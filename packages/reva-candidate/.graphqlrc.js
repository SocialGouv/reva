const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  schema: [
    "../reva-api/modules/generated-graphql-schema.graphql",
     `${process.env.NEXT_PUBLIC_WEBSITE_STRAPI_BASE_URL}/graphql`,
  ],
  documents: ["src/**/*.{graphql,js,ts,jsx,tsx}"],
};
