import { Button } from "@codegouvfr/react-dsfr/Button";
import { Highlight } from "@codegouvfr/react-dsfr/Highlight";
import { format, toDate } from "date-fns";
import { useRouter } from "next/navigation";

import { useEndAccompagnement } from "../end-accompagnement.hook";

export const EndAccompagnementUnavailable = () => {
  const { feasibility } = useEndAccompagnement();

  const router = useRouter();

  const navigateBack = () => {
    router.push("../summary");
  };

  return (
    <div>
      <p className="mt-12 mb-6">
        Un <strong>dossier de faisabilité</strong> a été envoyé le{" "}
        {feasibility?.feasibilityFileSentAt ? (
          <strong>
            {format(toDate(feasibility.feasibilityFileSentAt), "dd/MM/yyyy")}
          </strong>
        ) : (
          ""
        )}{" "}
        sur cette candidature.
      </p>

      <p className="mb-6 text-lg font-bold">
        Vous ne pouvez pas déclarer de fin d’accompagnement à cette étape.
      </p>

      <Highlight className="mb-12">
        Vous pourrez déclarer la fin d’accompagnement dès que le certificateur
        aura donné sa décision.
      </Highlight>

      <div className="flex justify-between">
        <Button
          priority="secondary"
          onClick={navigateBack}
          type="button"
          aria-label="Retour à la page précédente"
          data-testid="back-button"
        >
          Retour
        </Button>
      </div>
    </div>
  );
};
