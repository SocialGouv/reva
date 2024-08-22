import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getCertificationAuthorityStructure = graphql(`
  query getCertificationAuthorityStructureForCreateCertificationAuthorityAdminPage(
    $id: ID!
  ) {
    certification_authority_getCertificationAuthorityStructure(id: $id) {
      id
      label
    }
  }
`);

const createCertificationAuthorityMutation = graphql(`
  mutation createCertificationAuthority(
    $label: String!
    $certificationAuthorityStructureId: ID!
    $contactEmail: String!
    $contactFullName: String!
    $accountEmail: String!
    $accountFirstname: String!
    $accountLastname: String!
    $certificationIds: [ID!]!
    $departmentIds: [ID!]!
  ) {
    certification_authority_createCertificationAuthority(
      input: {
        label: $label
        certificationAuthorityStructureId: $certificationAuthorityStructureId
        contactEmail: $contactEmail
        contactFullName: $contactFullName
        accountEmail: $accountEmail
        accountFirstname: $accountFirstname
        accountLastname: $accountLastname
        certificationIds: $certificationIds
        departmentIds: $departmentIds
      }
    ) {
      id
    }
  }
`);

export const useCreateCertificationAuthorityPage = () => {
  const { graphqlClient } = useGraphQlClient();

  const { certificationAuthorityStructureId } = useParams<{
    certificationAuthorityStructureId: string;
  }>();

  const {
    data: getCertificationAuthorityStructureResponse,
    status: getCertificationAuthorityStructureStatus,
  } = useQuery({
    queryKey: [
      certificationAuthorityStructureId,
      "getCertificationAuthorityStructure",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityStructure, {
        id: certificationAuthorityStructureId,
      }),
  });

  const createCertificationAuthority = useMutation({
    mutationFn: (params: {
      label: string;
      firstname: string;
      lastname: string;
      email: string;
    }) =>
      graphqlClient.request(createCertificationAuthorityMutation, {
        accountEmail: params.email,
        accountFirstname: params.firstname,
        accountLastname: params.lastname,
        certificationAuthorityStructureId: certificationAuthorityStructureId,
        contactEmail: params.email,
        contactFullName: `${params.firstname} ${params.lastname}`,
        departmentIds: [],
        certificationIds: [],
        label: params.label,
      }),
  });

  const certificationAuthorityStructure =
    getCertificationAuthorityStructureResponse?.certification_authority_getCertificationAuthorityStructure;

  return {
    certificationAuthorityStructure,
    getCertificationAuthorityStructureStatus,
    createCertificationAuthority,
  };
};
