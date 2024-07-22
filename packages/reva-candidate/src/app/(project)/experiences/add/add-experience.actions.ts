"use server";
import { graphql } from "@/graphql/generated";
import { Duration } from "@/graphql/generated/graphql";

import { getGraphQlClient } from "@/utils/graphql-client-server";
import { getTime, parseISO } from "date-fns";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const ADD_EXPERIENCE = graphql(`
  mutation add_experience($candidacyId: ID!, $experience: ExperienceInput) {
    candidacy_addExperience(
      candidacyId: $candidacyId
      experience: $experience
    ) {
      id
      title
      startedAt
      duration
      description
    }
  }
`);

export const addExperience = async (formData: FormData) => {
  const graphqlClient = getGraphQlClient();

  const candidacyId = formData.get("candidacyId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const duration = formData.get("duration") as Duration;
  const startedAt = formData.get("startedAt") as string;

  await graphqlClient.request(ADD_EXPERIENCE, {
    candidacyId,
    experience: {
      title,
      description,
      duration,
      startedAt: getTime(parseISO(`${startedAt}T00:00:00.000Z`)),
    },
  });

  revalidatePath("/");
  redirect("/");
};
