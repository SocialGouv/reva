import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { sanitizedText } from "@/utils/input-sanitization";

import { graphql } from "@/graphql/generated";

const schema = z.object({
  highestDegreeId: sanitizedText(),
  highestDegreeLabel: z.string(),
  niveauDeFormationLePlusEleveDegreeId: sanitizedText(),
});

type FormData = z.infer<typeof schema>;

const getCandidateProfileQuery = graphql(`
  query getCandidateProfile($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      candidate {
        id
        highestDegree {
          id
          level
        }
        highestDegreeLabel
        niveauDeFormationLePlusEleve {
          id
        }
      }
    }
  }
`);

const getReferentialQuery = graphql(`
  query getReferentialForCandidateProfile {
    getDegrees {
      id
      level
    }
  }
`);

const updateCandidateProfileMutation = graphql(`
  mutation updateCandidateProfileMutation(
    $candidacyId: String!
    $candidateProfile: CandidateProfileUpdateInput!
  ) {
    candidate_updateCandidateProfile(
      candidacyId: $candidacyId
      candidateProfile: $candidateProfile
    ) {
      id
    }
  }
`);

export const useCandidateProfilePageLogic = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();
  const router = useRouter();

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
      niveauDeFormationLePlusEleveDegreeId: string;
      highestDegreeLabel?: string;
    }) =>
      graphqlClient.request(updateCandidateProfileMutation, {
        candidacyId,
        candidateProfile,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [candidacyId] });
    },
  });

  const candidate = getCandidateProfileResponse?.getCandidacyById?.candidate;

  const degrees = getReferentialResponse?.getDegrees;

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const {
    register,
    watch,
    handleSubmit,
    reset,
    formState,
    formState: { errors },
    setError,
  } = methods;

  const resetForm = useCallback(() => {
    reset({
      highestDegreeId: candidate?.highestDegree?.id || "",
      highestDegreeLabel: candidate?.highestDegreeLabel || "",
      niveauDeFormationLePlusEleveDegreeId:
        candidate?.niveauDeFormationLePlusEleve?.id || "",
    });
  }, [reset, candidate]);

  useEffect(() => {
    resetForm();
  }, [resetForm]);

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      const { highestDegreeId, highestDegreeLabel } = data;
      const highestDegreeLevel = degrees?.find(
        (d) => d.id === highestDegreeId,
      )?.level;
      if (
        !highestDegreeLevel ||
        (highestDegreeLevel > 1 && !highestDegreeLabel)
      ) {
        setError("highestDegreeLabel", {
          message: "Merci de remplir ce champ",
        });
      } else {
        await updateCandidateProfile.mutateAsync({
          candidateId: candidate?.id,
          ...data,
        });
        successToast("Les modifications ont bien été enregistrées");
        router.push(`/candidacies/${candidacyId}/summary`);
      }
    } catch (e) {
      graphqlErrorToast(e);
    }
  });

  return {
    candidacyId,
    degrees,
    register,
    handleFormSubmit,
    formState,
    errors,
    resetForm,
    watch,
  };
};
