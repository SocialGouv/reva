"use client";

import Badge from "@codegouvfr/react-dsfr/Badge";
import Card from "@codegouvfr/react-dsfr/Card";

export const NoParcoursCertificationCard = ({
  label,
  codeRncp,
  visible,
  isAttachedToAnotherStructure,
  detailsHref,
}: {
  label: string;
  codeRncp: string;
  visible?: boolean;
  isAttachedToAnotherStructure?: boolean;
  detailsHref: string;
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
    enlargeLink
    linkProps={{ href: detailsHref }}
  />
);
