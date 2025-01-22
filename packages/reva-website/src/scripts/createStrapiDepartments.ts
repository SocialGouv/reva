// import { STRAPI_GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import request from "graphql-request";

import departments from "./departements.json";

const STRAPI_GRAPHQL_API_URL = "http://127.0.0.1:1337/graphql";

console.log("STRAPI_GRAPHQL_API_URL", STRAPI_GRAPHQL_API_URL);
console.log("process.env.STRAPI_API_TOKEN", process.env.STRAPI_API_TOKEN);

const createDepartmentMutation = graphql(`
  mutation createStrapiDepartment($data: DepartementInput!) {
    createDepartement(data: $data) {
      documentId
      nom
      code
    }
  }
`);

const createStrapiDepartments = async () => {
  for (const department of departments) {
    console.log("Creating departement", department.label);
    await request(
      STRAPI_GRAPHQL_API_URL,
      createDepartmentMutation,
      {
        data: {
          nom: department.label,
          code: department.code,
          publishedAt: new Date(),
        },
      },
      {
        Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
    );
  }
};

createStrapiDepartments();
