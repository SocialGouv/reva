"use server";

import { graphql } from "@/graphql/generated";

import { getGraphQlClient } from "@/utils/graphql-client-server";
import { redirect } from "next/navigation";

const UPDATE_CERTIFICATION = graphql(`
  mutation candidacy_updateCertification(
    $candidacyId: ID!
    $certificationId: ID!
    $departmentId: ID!
  ) {
    candidacy_updateCertification(
      candidacyId: $candidacyId
      certificationId: $certificationId
      departmentId: $departmentId
    ) {
      id
    }
  }
`);

export const updateCertification = async (formData: FormData) => {
  const graphqlClient = getGraphQlClient();

  const candidacyId = formData.get("candidacyId") as string;
  const certificationId = formData.get("certificationId") as string;
  const departmentId = formData.get("departmentId") as string;

  await graphqlClient.request(UPDATE_CERTIFICATION, {
    candidacyId,
    certificationId,
    departmentId,
  });

  redirect("/")
};
