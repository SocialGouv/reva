import { graphql } from "@/graphql/generated";
import request from "graphql-request";

import regionsAndDeps from "./departements-region.json";

const STRAPI_GRAPHQL_API_URL = "http://127.0.0.1:1337/graphql";

const getDepartmentFromStrapiQuery = graphql(`
  query getDepartmentsByCodeQuery($code: String!) {
    departements(filters: { code: { eq: $code } }) {
      data {
        id
        attributes {
          nom
          code
          region {
            data {
              id
              attributes {
                nom
              }
            }
          }
        }
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
  return departements?.data;
};

const getRegionByNameQuery = graphql(`
  query getRegionByNameQuery($name: String!) {
    regions(filters: { nom: { eq: $name } }, publicationState: PREVIEW) {
      data {
        id
        attributes {
          nom
        }
      }
    }
  }
`);

const createRegionQuery = graphql(`
  mutation createRegion($data: RegionInput!) {
    createRegion(data: $data) {
      data {
        id
        attributes {
          nom
        }
      }
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
  if (regions?.data?.length) {
    console.log("Found Strapi region", regions?.data[0]?.attributes?.nom);
    return regions.data[0];
  }
  console.log("Region not found, creating it", name);
  const { createRegion } = await request(
    STRAPI_GRAPHQL_API_URL,
    createRegionQuery,
    {
      data: {
        nom: name,
        slug: name.toLowerCase().replace(/ /g, "-"),
        vignette: "3", // Must be a Strapi media library file ID
      },
    },
    {
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
  );
  return createRegion?.data;
};

const setDepartmentRegionQuery = graphql(`
  mutation setDepartmentRegion($id: ID!, $data: DepartementInput!) {
    updateDepartement(id: $id, data: $data) {
      data {
        id
        attributes {
          nom
          region {
            data {
              id
              attributes {
                nom
              }
            }
          }
        }
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
        region: region.id,
      },
    },
    {
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
  );
  console.log(
    "Set region for department ",
    dept?.updateDepartement?.data?.attributes?.nom,
    ": ",
    dept?.updateDepartement?.data?.attributes?.region?.data?.attributes?.nom,
  );
};

const main = async () => {
  for (const department of regionsAndDeps) {
    const strapiDepartment = await getDepartmentFromStrapi(
      department.num_dep.toString(),
    );
    if (!strapiDepartment?.[0] || !strapiDepartment?.[0]?.id) {
      console.error("Department not found or has no ID", department.num_dep);
      continue;
    }
    console.log("Setting region for", strapiDepartment?.[0]?.attributes?.nom);
    await setDepartmentRegion(
      strapiDepartment?.[0]?.id,
      department.region_name,
    );
  }
};

main();
