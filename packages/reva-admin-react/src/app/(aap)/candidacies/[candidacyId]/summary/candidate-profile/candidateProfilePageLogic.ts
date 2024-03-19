import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { graphql } from "@/graphql/generated";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useForm, useController } from "react-hook-form";
import { z } from "zod";

export const schema = z.object({
  highestDegreeId: z.string({
    required_error: "Ce champ est obligatoire",
  }),
});

type FormData = z.infer<typeof schema>;

const getCandidateProfileQuery = graphql(`
  query getCandidateProfile($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      candidate {
        id
        highestDegree {
          id
          longLabel
        }
      }
    }
  }
`);

const getReferentialQuery = graphql(`
  query getReferentialForCandidateProfile {
    getDegrees {
      id
      longLabel
    }
  }
`);

const updateCandidateProfileMutation = graphql(`
  mutation updateCandidateProfileMutation(
    $candidateProfile: CandidateProfileUpdateInput!
  ) {
    candidate_updateCandidateProfile(candidateProfile: $candidateProfile) {
      id
    }
  }
`);

export const useCandidateProfilePageLogic = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data: getCandidateProfileResponse } = useQuery({
    queryKey: ["getCandidateProfile", candidacyId],
    queryFn: () =>
      graphqlClient.request(getCandidateProfileQuery, {
        candidacyId,
      }),
  });

  const { data: getReferentialResponse } = useQuery({
    queryKey: ["getReferential"],
    queryFn: () => graphqlClient.request(getReferentialQuery),
  });

  const updateCandidateProfile = useMutation({
    mutationFn: (candidateProfile: {
      candidateId: string;
      highestDegreeId: string;
    }) =>
      graphqlClient.request(updateCandidateProfileMutation, {
        candidateProfile,
      }),
  });

  const candidate = getCandidateProfileResponse?.getCandidacyById?.candidate;

  const degrees = getReferentialResponse?.getDegrees;

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { highestDegreeId: candidate?.highestDegree?.id },
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = methods;

  const highestDegreeLevelController = useController({
    name: "highestDegreeId",
    control,
  });

  const resetForm = useCallback(() => {
    reset({ highestDegreeId: candidate?.highestDegree?.id });
  }, [reset, candidate]);

  useEffect(() => {
    resetForm();
  }, [resetForm]);

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      await updateCandidateProfile.mutateAsync({
        candidateId: candidate?.id,
        ...data,
      });
      successToast("Les modifications ont bien été enregistrées");
    } catch (e) {
      graphqlErrorToast(e);
    }
  });

  return {
    degrees,
    highestDegreeLevelController,
    handleFormSubmit,
    errors,
    isSubmitting,
    resetForm,
  };
};
