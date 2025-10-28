import Badge from "@codegouvfr/react-dsfr/Badge";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import { format } from "date-fns";

import { DffEligibilityRequirement } from "@/graphql/generated/graphql";

const EligibiltyBadge = ({
  eligibilityRequirement,
}: {
  eligibilityRequirement: DffEligibilityRequirement | null;
}) => {
  if (eligibilityRequirement === "FULL_ELIGIBILITY_REQUIREMENT") {
    return (
      <Badge severity="info">Accès au dossier de faisabilité intégral</Badge>
    );
  }
  if (eligibilityRequirement === "PARTIAL_ELIGIBILITY_REQUIREMENT") {
    return <Badge severity="new">Accès au dossier de faisabilité adapté</Badge>;
  }
  return null;
};

export default function EligibilitySection({
  eligibilityRequirement,
  eligibilityValidUntil,
}: {
  eligibilityRequirement: DffEligibilityRequirement | null;
  eligibilityValidUntil: Date | null;
}) {
  return (
    <section>
      <div className="flex">
        <span className="ri-folder-check-fill fr-icon--lg mr-2" />
        <h2>Recevabilité du candidat</h2>
      </div>
      <EligibiltyBadge eligibilityRequirement={eligibilityRequirement} />
      {eligibilityValidUntil && (
        <>
          <dl className="my-4">
            <dt id="valid-until">Date de fin de validité</dt>
            <dd className="font-medium" aria-labelledby="valid-until">
              {format(eligibilityValidUntil, "dd/MM/yyyy")}
            </dd>
          </dl>
          <CallOut className="mb-0">
            Le candidat s&apos;engage à respecter le délai de fin de validité de
            la recevabilité
          </CallOut>
        </>
      )}
    </section>
  );
}
