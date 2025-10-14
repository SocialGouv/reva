"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";

import { updateCertification } from "./actions";

export const SelectCertificationButton = ({
  commanditaireVaeCollectiveId,
  cohorteVaeCollectiveId,
  certificationId,
  className,
}: {
  commanditaireVaeCollectiveId: string;
  cohorteVaeCollectiveId: string;
  certificationId: string;
  className?: string;
}) => (
  <Button
    className={className}
    onClick={() =>
      updateCertification({
        commanditaireVaeCollectiveId,
        cohorteVaeCollectiveId,
        certificationId,
      })
    }
  >
    Choisir cette certification
  </Button>
);
