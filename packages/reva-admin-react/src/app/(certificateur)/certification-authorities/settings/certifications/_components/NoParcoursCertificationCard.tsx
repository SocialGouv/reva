"use client";

import Badge from "@codegouvfr/react-dsfr/Badge";
import Card from "@codegouvfr/react-dsfr/Card";

export const NoParcoursCertificationCard = ({
  id,
  label,
  codeRncp,
  visible,
  isAttachedToAnotherStructure,
  detailsHref,
}: {
  id: string;
  label: string;
  codeRncp: string;
  visible?: boolean;
  isAttachedToAnotherStructure?: boolean;
  detailsHref: string;
}) => (
  <Card
    data-testid={`certification-card-${id}`}
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
    enlargeLink
    linkProps={{ href: detailsHref }}
  />
);
