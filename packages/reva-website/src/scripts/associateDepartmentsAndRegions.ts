import request from "graphql-request";

import { graphql } from "@/graphql/generated";

import regionsAndDeps from "./departements-region.json";

const STRAPI_GRAPHQL_API_URL = "http://127.0.0.1:1337/graphql";

const getDepartmentFromStrapiQuery = graphql(`
  query getDepartmentsByCodeQuery($code: String!) {
    departements(filters: { code: { eq: $code } }) {
      documentId
      nom
      code
      region {
        documentId
        nom
      }
    }
  }
`);

const getDepartmentFromStrapi = async (code: string) => {
  const { departements } = await request(
    STRAPI_GRAPHQL_API_URL,
    getDepartmentFromStrapiQuery,
    {
      code,
    },
    {
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
  );
  return departements;
};

const getRegionByNameQuery = graphql(`
  query getRegionByNameQuery($name: String!) {
    regions(filters: { nom: { eq: $name } }) {
      documentId
      nom
    }
  }
`);

const createRegionQuery = graphql(`
  mutation createRegion($data: RegionInput!) {
    createRegion(data: $data) {
      documentId
      nom
    }
  }
`);

const getOrCreateRegion = async (name: string) => {
  const { regions } = await request(
    STRAPI_GRAPHQL_API_URL,
    getRegionByNameQuery,
    {
      name,
    },
    {
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
  );
  if (regions?.length) {
    console.log("Found Strapi region", regions[0]?.nom);
    return regions[0];
  }
  console.log("Region not found, creating it", name);
  const { createRegion } = await request(
    STRAPI_GRAPHQL_API_URL,
    createRegionQuery,
    {
      data: {
        nom: name,
        slug: name.toLowerCase().replace(/ /g, "-"),
        vignette: "2", // Must be a Strapi media library file ID
      },
    },
    {
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
  );
  return createRegion;
};

const setDepartmentRegionQuery = graphql(`
  mutation setDepartmentRegion($id: ID!, $data: DepartementInput!) {
    updateDepartement(documentId: $id, data: $data) {
      documentId
      nom
      region {
        documentId
        nom
      }
    }
  }
`);

const setDepartmentRegion = async (
  departmentId: string,
  regionName: string,
) => {
  const region = await getOrCreateRegion(regionName);
  if (!region) {
    console.error("Region could not be found nor created", regionName);
    return;
  }
  const dept = await request(
    STRAPI_GRAPHQL_API_URL,
    setDepartmentRegionQuery,
    {
      id: departmentId,
      data: {
        region: region.documentId,
      },
    },
    {
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
  );
  console.log(
    "Set region for department ",
    dept?.updateDepartement?.nom,
    ": ",
    dept?.updateDepartement?.region?.nom,
  );
};

const main = async () => {
  for (const department of regionsAndDeps) {
    const strapiDepartment = await getDepartmentFromStrapi(
      department.num_dep.toString(),
    );
    if (!strapiDepartment?.[0] || !strapiDepartment?.[0]?.documentId) {
      console.error("Department not found or has no ID", department.num_dep);
      continue;
    }
    console.log("Setting region for", strapiDepartment?.[0]?.nom);
    await setDepartmentRegion(
      strapiDepartment?.[0]?.documentId,
      department.region_name,
    );
  }
};

main();
