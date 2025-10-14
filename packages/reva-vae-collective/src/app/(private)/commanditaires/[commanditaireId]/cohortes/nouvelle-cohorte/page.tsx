"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useParams } from "next/navigation";
import { useActionState } from "react";

import { createCohort } from "./actions";

export default function NouvelleCohortePage() {
  const [state, action, pending] = useActionState(createCohort, {});

  const { commanditaireId } = useParams<{ commanditaireId: string }>();
  return (
    <div className="flex flex-col w-full">
      <h1 className="mb-12">Nouvelle cohorte</h1>
      <form action={action} className="flex flex-col">
        <Input
          data-testid="cohort-name-input"
          label="Nom de la cohorte"
          nativeInputProps={{
            name: "name",
          }}
          state={state.errors?.name ? "error" : "default"}
          stateRelatedMessage={state.errors?.name?.message}
        />
        <input type="hidden" name="commanditaireId" value={commanditaireId} />
        <div className="flex justify-between mt-6">
          <Button
            priority="secondary"
            linkProps={{
              href: `/commanditaires/${commanditaireId}/cohortes/`,
            }}
          >
            Annuler
          </Button>
          <Button disabled={pending}>Créer</Button>
        </div>
      </form>
    </div>
  );
}
