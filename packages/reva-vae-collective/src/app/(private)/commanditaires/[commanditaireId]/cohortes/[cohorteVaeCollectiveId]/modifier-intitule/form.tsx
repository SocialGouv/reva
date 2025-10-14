"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useActionState } from "react";

import { updateNomCohorteVaeCollective } from "./actions";

export const UpdateNomCohorteForm = ({
  commanditaireId,
  cohorteVaeCollectiveId,
  initialState,
}: {
  commanditaireId: string;
  cohorteVaeCollectiveId: string;
  initialState: { nom: string };
}) => {
  const [state, action, pending] = useActionState(
    updateNomCohorteVaeCollective,
    { name: initialState.nom },
  );
  return (
    <form action={action} className="flex flex-col">
      <Input
        data-testid="cohort-name-input"
        label="Nom de la cohorte"
        nativeInputProps={{
          name: "name",
          defaultValue: state.name,
        }}
        state={state.errors?.name ? "error" : "default"}
        stateRelatedMessage={state.errors?.name?.message}
      />
      <input type="hidden" name="commanditaireId" value={commanditaireId} />
      <input
        type="hidden"
        name="cohorteVaeCollectiveId"
        value={cohorteVaeCollectiveId}
      />
      <div className="flex justify-between mt-6">
        <Button
          priority="secondary"
          linkProps={{
            href: `/commanditaires/${commanditaireId}/cohortes/${cohorteVaeCollectiveId}`,
          }}
        >
          Annuler
        </Button>
        <Button disabled={pending}>Modifier</Button>
      </div>
    </form>
  );
};
