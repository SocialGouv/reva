"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { parseISO } from "date-fns";
import { useParams, useRouter } from "next/navigation";

import {
  CandidateExperienceForm,
  CandidateExperienceFormData,
} from "@/app/(private)/(aap)/candidacies/[candidacyId]/summary/candidate-experiences/_components/CandidateExperienceForm";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { canAAPEditExperiences } from "@/utils/canAAPEditExperiences";

import { graphql } from "@/graphql/generated";
import { ExperienceInput } from "@/graphql/generated/graphql";

const getCandidacyStatusForExperienceQuery = graphql(`
  query getCandidacyStatusForExperienceQuery($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      status
    }
  }
`);

const addCandidacyExperienceMutation = graphql(`
  mutation addCandidacyExperienceMutation(
    $candidacyId: ID!
    $experience: ExperienceInput
  ) {
    candidacy_addExperience(
      candidacyId: $candidacyId
      experience: $experience
    ) {
      id
    }
  }
`);

const NewCandidateExperiencePage = () => {
  const router = useRouter();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { graphqlClient } = useGraphQlClient();

  const addCandidacyExperience = useMutation({
    mutationFn: (experience: ExperienceInput) =>
      graphqlClient.request(addCandidacyExperienceMutation, {
        candidacyId,
        experience,
      }),
  });

  const { data } = useQuery({
    queryKey: [candidacyId, "getCandidacyStatusForExperienceQuery"],
    queryFn: () =>
      graphqlClient.request(getCandidacyStatusForExperienceQuery, {
        candidacyId,
      }),
  });

  const candidacyStatus = data?.getCandidacyById?.status;

  const canEditExperiences = canAAPEditExperiences(candidacyStatus);

  const handleSubmit = async (formData: CandidateExperienceFormData) => {
    try {
      await addCandidacyExperience.mutateAsync({
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        startedAt: parseISO(formData.startedAt).getTime(),
      });
      successToast("Expérience ajoutée");
      router.push(`/candidacies/${candidacyId}/summary`);
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  return (
    <CandidateExperienceForm
      onSubmit={handleSubmit}
      disabled={!canEditExperiences}
    />
  );
};

export default NewCandidateExperiencePage;
