"use client";

import { FormEvent, useState } from "react";
import { redirect, useRouter } from "next/navigation";

import Button from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";

import { PageLayout } from "@/layouts/page.layout";

import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";

import { useSetGoals } from "./set-goals.hooks";
import { useCandidacy } from "@/components/candidacy/candidacy.context";

export default function SetGoals() {
  const router = useRouter();

  const { canEditCandidacy, candidacy, refetch } = useCandidacy();
  const { getGoals, updateGoals } = useSetGoals();

  const goals = getGoals.data?.getReferential.goals || [];

  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>(
    candidacy.goals.map((goal) => goal.id),
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

    try {
      const response = await updateGoals.mutateAsync({
        candidacyId: candidacy.id,
        goals: selectedGoalIds.map((goalId) => ({ goalId })),
      });
      if (response) {
        refetch();
        router.push("/");
      }
    } catch (error) {}
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
          disabled={!canEditCandidacy}
        >
          Valider mes objectifs
        </Button>
      </form>
    </PageLayout>
  );
}
