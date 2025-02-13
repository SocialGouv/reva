import { graphql } from "@/graphql/generated";
import request from "graphql-request";

import prcs from "./liste_prcs.json";

const STRAPI_GRAPHQL_API_URL = "http://127.0.0.1:1337/graphql";

const getDepartmentsQuery = graphql(`
  query getDepartmentsQuery {
    departements(pagination: { page: 1, pageSize: 200 }) {
      documentId
      nom
      code
    }
  }
`);
const getDepartments = async () => {
  const { departements } = await request(
    STRAPI_GRAPHQL_API_URL,
    getDepartmentsQuery,
    {},
    {
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
  );
  return departements;
};

const createPrcsMutation = graphql(`
  mutation createPrcs($data: PrcInput!) {
    createPrc(data: $data) {
      documentId
      nom
      departement {
        documentId
        nom
      }
    }
  }
`);

const createPrcs = async () => {
  const departments = await getDepartments();
  for (const prc of prcs) {
    const departement = departments?.find(
      (department) => department?.code === prc["Département"].toString(),
    );
    console.log(
      "Creating PRC",
      prc["Nom du PRC"],
      "in departement",
      prc["Département"],
      departement?.nom,
    );
    if (!departement) {
      console.error("Departement not found", prc["Département"]);
    }
    await request(
      STRAPI_GRAPHQL_API_URL,
      createPrcsMutation,
      {
        data: {
          nom: prc["Nom du PRC"],
          email: prc["Email"],
          adresse: prc["Adresse"],
          telephone: prc["Téléphone"].toString(),
          region: prc["Région"],
          mandataire: prc["Mandataire"],
          departement: departement?.documentId,
          publishedAt: new Date(),
        },
      },
      {
        Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
    );
    console.log(
      "Created PRC",
      prc["Nom du PRC"],
      "in departement",
      prc["Département"],
      departement?.documentId,
    );
  }
};

const main = async () => {
  await createPrcs();
};

main();
