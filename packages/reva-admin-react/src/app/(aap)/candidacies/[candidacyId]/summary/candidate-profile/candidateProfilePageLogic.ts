import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useForm, useController } from "react-hook-form";
import { z } from "zod";

export const schema = z.object({
  highestDegreeLevelId: z.string(),
});

type FormData = z.infer<typeof schema>;

const getCandidateProfileQuery = graphql(`
  query getCandidateProfile($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      candidate {
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

  const candidate = getCandidateProfileResponse?.getCandidacyById?.candidate;

  const degrees = getReferentialResponse?.getDegrees;

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { highestDegreeLevelId: candidate?.highestDegree?.id },
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const highestDegreeLevelController = useController({
    name: "highestDegreeLevelId",
    control,
  });

  const resetForm = useCallback(() => {
    reset({ highestDegreeLevelId: candidate?.highestDegree?.id });
  }, [reset, candidate]);

  useEffect(() => {
    resetForm();
  }, [resetForm]);

  const handleFormSubmit = handleSubmit((data) => {
    alert(JSON.stringify(data));
  });

  return {
    degrees,
    highestDegreeLevelController,
    handleFormSubmit,
    isSubmitting,
    resetForm,
  };
};
