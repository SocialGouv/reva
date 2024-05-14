"use client";
import {
  CandidateExperienceForm,
  CandidateExperienceFormData,
} from "@/app/(aap)/candidacies/[candidacyId]/summary/candidate-experiences/_components/CandidateExperienceForm";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { graphql } from "@/graphql/generated";
import { ExperienceInput } from "@/graphql/generated/graphql";
import { useMutation } from "@tanstack/react-query";
import { parse } from "date-fns";
import { useParams, useRouter } from "next/navigation";

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

  const handleSubmit = async (formData: CandidateExperienceFormData) => {
    try {
      await addCandidacyExperience.mutateAsync({
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        startedAt: parse(
          formData.startedAt,
          "yyyy-MM-dd",
          new Date(),
        ).getTime(),
      });
      successToast("Expérience ajoutée");
      router.push(`/candidacies/${candidacyId}/summary`);
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  return <CandidateExperienceForm onSubmit={handleSubmit} />;
};

export default NewCandidateExperiencePage;
