import { redirect } from "next/navigation";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { PageLayout } from "@/layouts/page.layout";
import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";
import SubmitButton from "@/components/forms/SubmitButton";
import { getCandidacy } from "@/app/home.loaders";
import { getGoals } from "./set-goals.loaders";
import { updateGoals } from "./set-goals.actions";

export default async function SetGoals() {

  const { canEditCandidacy, candidacy } = await getCandidacy();

  const goals = await getGoals() || [];
  const candidacyGoaldIds = candidacy.goals.map((goal) => goal.id);


  if (!canEditCandidacy) {
    redirect("/");
  }

  return (
    <PageLayout title="Vos objectifs" displayBackToHome>
      <h2 className="mt-6 mb-2">Mes objectifs</h2>
      <FormOptionalFieldsDisclaimer
        className="mb-4"
        label="Plusieurs choix possibles"
      />

      <form action={updateGoals} className="flex flex-col">
        <input type="hidden" name="candidacyId" value={candidacy.id} />
        <Checkbox
          className="w-full"
          legend="Objectif"
          options={goals.map((goal) => ({
            label: goal.label,
            nativeInputProps: {
              defaultChecked: candidacyGoaldIds.indexOf(goal.id) != -1,
              name: goal.id,
            },
          }))}
        />
        <SubmitButton label="Valider mes objectifs" />
      </form>
    </PageLayout>
  );
}
