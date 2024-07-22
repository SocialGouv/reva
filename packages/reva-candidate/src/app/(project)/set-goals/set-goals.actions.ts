"use server";
import { graphql } from "@/graphql/generated";

import { getGraphQlClient } from "@/utils/graphql-client-server";
import { CandidateGoalInput } from "@/graphql/generated/graphql";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const UPDATE_GOALS = graphql(`
  mutation update_goals($candidacyId: ID!, $goals: [CandidateGoalInput!]!) {
    candidacy_updateGoals(candidacyId: $candidacyId, goals: $goals)
  }
`);

export const updateGoals = async (formData: FormData) => {
  const candidacyId = formData.get("candidacyId") as string;
  const goals = Array.from(formData)
    .map(([key, value]) => {
      if (value === "on")
        return {
          goalId: key,
        };
    })
    .filter(Boolean) as CandidateGoalInput[];

  await getGraphQlClient().request(
    UPDATE_GOALS,
    {
      candidacyId,
      goals,
    },
  );
  revalidatePath("/");
  redirect("/");
};
