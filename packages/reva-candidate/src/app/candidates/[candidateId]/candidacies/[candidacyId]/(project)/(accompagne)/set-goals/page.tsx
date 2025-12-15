"use client";

import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast } from "@/components/toast/toast";
import { PageLayout } from "@/layouts/page.layout";

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

  useEffect(() => {
    setSelectedGoalIds(candidacy?.goals.map((goal) => goal.id) || []);
  }, [candidacy?.goals]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

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
      setIsSubmitting(true);
      await updateGoals.mutateAsync({
        candidacyId: candidacy.id,
        goals: selectedGoalIds.map((goalId) => ({ goalId })),
      });
      router.push("../");
    } catch (error) {
      graphqlErrorToast(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout title="Vos objectifs">
      <Breadcrumb
        currentPageLabel="Mes objectifs"
        className="mb-0"
        segments={[
          {
            label: "Ma candidature",
            linkProps: {
              href: "../",
            },
          },
        ]}
      />
      <h2 className="mt-4 mb-2">Mes objectifs</h2>
      <FormOptionalFieldsDisclaimer
        className="mb-4"
        label="Plusieurs choix possibles"
      />
      <form onSubmit={onSubmit} className="flex flex-col">
        <Checkbox
          className="w-full"
          small
          legend="Objectif"
          disabled={formShouldBeDisabled}
          options={goals.map((goal) => ({
            label: goal.label,
            nativeInputProps: {
              checked: selectedGoalIds.indexOf(goal.id) != -1,
              onChange: () => {
                setIsDirty(true);
                toggle(goal.id);
              },
            },
          }))}
        />
        <FormButtons
          formState={{
            canSubmit: !formShouldBeDisabled,
            isSubmitting,
            isDirty,
          }}
          backUrl="../"
        />
      </form>
    </PageLayout>
  );
}
