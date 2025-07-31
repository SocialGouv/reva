"use client";
import request from "graphql-request";
import { useRouter } from "next/navigation";

import { GRAPHQL_API_URL } from "@/config/config";

import { graphql } from "@/graphql/generated";
import { Certification } from "@/graphql/generated/graphql";

import {
  CandidateFormData,
  CandidateRegistrationForm,
} from "./CandidateRegistrationForm";

const askForRegistrationMutation = graphql(`
  mutation candidate_askForRegistration($candidate: CandidateInput!) {
    candidate_askForRegistration(candidate: $candidate)
  }
`);

interface CandidateRegistrationContentProps {
  certification: Pick<
    Certification,
    "id" | "label" | "codeRncp" | "typeDiplome" | "isAapAvailable"
  > | null;
  certificationId: string;
}

export function CandidateRegistrationContent({
  certification,
  certificationId,
}: CandidateRegistrationContentProps) {
  const router = useRouter();

  const handleFormSubmit = async (form: CandidateFormData) => {
    await request(GRAPHQL_API_URL, askForRegistrationMutation, {
      candidate: {
        ...form,
        certificationId,
      },
    });
    router.push("/inscription-candidat/confirmation");
  };

  return (
    <CandidateRegistrationForm
      certification={certification}
      onSubmit={handleFormSubmit}
    />
  );
}
