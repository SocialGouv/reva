"use client";

import { redirect, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import Button from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";

import { PageLayout } from "@/layouts/page.layout";

import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";

import { graphqlErrorToast } from "@/components/toast/toast";
import { useSetGoals } from "./set-goals.hooks";

export default function SetGoals() {
  const router = useRouter();

  const {
    getGoals,
    updateGoals,
    canEditCandidacy,
    candidacyAlreadySubmitted,
    candidacy,
  } = useSetGoals();

  const formShouldBeDisabled = !canEditCandidacy || candidacyAlreadySubmitted;
  const goals = getGoals.data?.getReferential.goals || [];

  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>(
    candidacy?.goals.map((goal) => goal.id) || [],
  );

  if (!canEditCandidacy) {
    redirect("/");
  }

  const toggle = (goalId: string) => {
    const filteredGoals = selectedGoalIds.filter((id) => id != goalId);

    if (filteredGoals.length == selectedGoalIds.length) {
      setSelectedGoalIds([...selectedGoalIds, goalId]);
    } else {
      setSelectedGoalIds(filteredGoals);
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!candidacy?.id) {
      return;
    }

    try {
      await updateGoals.mutateAsync({
        candidacyId: candidacy.id,
        goals: selectedGoalIds.map((goalId) => ({ goalId })),
      });
      router.push("/");
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  return (
    <PageLayout title="Vos objectifs" displayBackToHome>
      <h2 className="mt-6 mb-2">Mes objectifs</h2>
      <FormOptionalFieldsDisclaimer
        className="mb-4"
        label="Plusieurs choix possibles"
      />

      <form onSubmit={onSubmit} className="flex flex-col">
        <Checkbox
          className="w-full"
          legend="Objectif"
          disabled={formShouldBeDisabled}
          options={goals.map((goal) => ({
            label: goal.label,
            nativeInputProps: {
              checked: selectedGoalIds.indexOf(goal.id) != -1,
              onChange: () => toggle(goal.id),
            },
          }))}
        />

        <Button
          className="mb-4 justify-center w-[100%]  md:w-fit"
          data-test="project-goals-submit-goals"
          disabled={formShouldBeDisabled}
        >
          Valider mes objectifs
        </Button>
      </form>
    </PageLayout>
  );
}
