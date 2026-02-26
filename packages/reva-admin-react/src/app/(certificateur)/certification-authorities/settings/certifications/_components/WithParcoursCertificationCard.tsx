"use client";

import Badge from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Card from "@codegouvfr/react-dsfr/Card";

export const WithParcoursCertificationCard = ({
  label,
  codeRncp,
  visible,
  isAttachedToAnotherStructure,
  detailsHref,
  parcoursSettingsHref,
}: {
  label: string;
  codeRncp: string;
  visible?: boolean;
  isAttachedToAnotherStructure?: boolean;
  detailsHref: string;
  parcoursSettingsHref: string;
}) => (
  <Card
    title={label}
    detail={`RNCP ${codeRncp}`}
    desc={
      isAttachedToAnotherStructure
        ? "Certification rattachée à une autre structure"
        : ""
    }
    start={
      visible !== undefined && (
        <>
          {visible ? (
            <Badge className="mb-2" noIcon severity="success">
              Visible
            </Badge>
          ) : (
            <Badge className="mb-2" noIcon severity="error">
              Invisible
            </Badge>
          )}
        </>
      )
    }
    endDetail={
      <span className="flex gap-4">
        <Button priority="primary" linkProps={{ href: parcoursSettingsHref }}>
          Paramétrer
        </Button>
        <Button priority="secondary" linkProps={{ href: detailsHref }}>
          Voir la fiche
        </Button>
      </span>
    }
  />
);
