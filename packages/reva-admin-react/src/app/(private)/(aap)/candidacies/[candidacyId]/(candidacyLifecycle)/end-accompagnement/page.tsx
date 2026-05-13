"use client";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";

import { EndAccompagnementForm } from "./_components/EndAccompagnementForm";
import { EndAccompagnementReadOnly } from "./_components/EndAccompagnementReadOnly";
import { EndAccompagnementUnavailable } from "./_components/EndAccompagnementUnavailable";
import { useEndAccompagnement } from "./end-accompagnement.hook";

export default function EndAccompagnementPage() {
  const { candidacy, feasibility } = useEndAccompagnement();

  const isFeasibilityDecisionPending =
    feasibility?.decision === "PENDING" && feasibility?.feasibilityFileSentAt;

  const endAccompagnementNotRequested =
    candidacy?.endAccompagnementStatus === "NOT_REQUESTED";

  return (
    <div>
      <h1>Fin d'accompagnement</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="mb-12 text-xl">
        Le candidat aura toujours accès à sa candidature pour la finaliser mais
        vous ne pourrez plus l’accompagner.
      </p>

      {isFeasibilityDecisionPending ? (
        <EndAccompagnementUnavailable />
      ) : (
        <>
          {endAccompagnementNotRequested ? (
            <EndAccompagnementForm />
          ) : (
            <EndAccompagnementReadOnly />
          )}
        </>
      )}
    </div>
  );
}
