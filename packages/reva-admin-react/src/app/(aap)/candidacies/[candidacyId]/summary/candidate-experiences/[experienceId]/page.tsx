"use client";
import {
  CandidateExperienceForm,
  CandidateExperienceFormData,
} from "@/app/(aap)/candidacies/[candidacyId]/summary/candidate-experiences/_components/CandidateExperienceForm";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { graphql } from "@/graphql/generated";
import { ExperienceInput } from "@/graphql/generated/graphql";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format, parse } from "date-fns";
import { useParams } from "next/navigation";

const getCandidadateExperiencesQuery = graphql(`
  query getCandidadateExperiencesQuery($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      experiences {
        id
        title
        startedAt
        duration
        description
      }
    }
  }
`);

const updateCandidacyExperienceMutation = graphql(`
  mutation updateCandidacyExperienceMutation(
    $candidacyId: ID!
    $experienceId: ID!
    $experience: ExperienceInput
  ) {
    candidacy_updateExperience(
      deviceId: $candidacyId
      candidacyId: $candidacyId
      experienceId: $experienceId
      experience: $experience
    ) {
      id
    }
  }
`);

const EditCandidateExperiencePage = () => {
  const { candidacyId, experienceId } = useParams<{
    candidacyId: string;
    experienceId: string;
  }>();
  const { graphqlClient } = useGraphQlClient();

  const { data: getCandidadateExperiencesResponse } = useQuery({
    queryKey: [candidacyId, getCandidadateExperiencesQuery],
    queryFn: () =>
      graphqlClient.request(getCandidadateExperiencesQuery, { candidacyId }),
  });

  const updateCandidacyExperience = useMutation({
    mutationFn: (experience: ExperienceInput) =>
      graphqlClient.request(updateCandidacyExperienceMutation, {
        candidacyId,
        experienceId,
        experience,
      }),
  });

  const experience =
    getCandidadateExperiencesResponse?.getCandidacyById?.experiences?.find(
      (e) => e.id === experienceId,
    );

  const handleSubmit = async (formData: CandidateExperienceFormData) => {
    try {
      await updateCandidacyExperience.mutateAsync({
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        startedAt: parse(
          formData.startedAt,
          "yyyy-MM-dd",
          new Date(),
        ).getTime(),
      });
      successToast("Expérience modifiée");
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  return (
    experience && (
      <CandidateExperienceForm
        onSubmit={handleSubmit}
        editedExperience={{
          ...experience,
          startedAt: format(new Date(experience.startedAt), "yyyy-MM-dd"),
        }}
      />
    )
  );
};

export default EditCandidateExperiencePage;
