import { Client } from "@urql/core";

import { graphql } from "../../../../graphql/generated/index.js";

const getCandidacyWithFeasibilityQuery = graphql(`
  query getCandidacyWithFeasibilityQuery($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      status
      feasibilityFormat
      typology
      organism {
        label
        nomPublic
        emailContact
        siteInternet
        telephone
        contactAdministrativeEmail
        contactAdministrativePhone
      }
      certification {
        label
        codeRncp
      }
      isCertificationPartial
      candidate {
        firstname
        firstname2
        firstname3
        givenName
        birthCity
        birthDepartment {
          label
          code
        }
        birthdate
        nationality
        niveauDeFormationLePlusEleve {
          code
          level
          label
          longLabel
        }
        highestDegree {
          code
          level
          label
          longLabel
        }
        highestDegreeLabel
        lastname
        gender
        email
        phone
        city
        zip
        street
        addressComplement
        country {
          label
        }
        department {
          code
          label
        }
      }
    }
  }
`);

export const getCandidacyById = async (
  graphqlClient: Client,
  candidacyId: string,
) => {
  const r = await graphqlClient.query(getCandidacyWithFeasibilityQuery, {
    candidacyId: candidacyId,
  });
  if (r.error) {
    throw r.error;
  }
  return r.data?.getCandidacyById;
};
