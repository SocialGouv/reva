"use client";

import Badge from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Card from "@codegouvfr/react-dsfr/Card";
import { Tag } from "@codegouvfr/react-dsfr/Tag";

export const WithParcoursCertificationCard = ({
  id,
  label,
  codeRncp,
  visible,
  isAttachedToAnotherStructure,
  parcoursSelectedForCertificationCount,
  detailsHref,
  parcoursSettingsHref,
}: {
  id: string;
  label: string;
  codeRncp: string;
  visible?: boolean;
  isAttachedToAnotherStructure?: boolean;
  parcoursSelectedForCertificationCount: number;
  detailsHref: string;
  parcoursSettingsHref: string;
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
      <span className="flex gap-2">
        {visible !== undefined && (
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
        )}
        {parcoursSelectedForCertificationCount > 0 && (
          <Tag className="mb-2 rounded-[4px] text-[#6E445A] bg-[#FEE7FC] font-bold">
            {parcoursSelectedForCertificationCount} PARCOURS
          </Tag>
        )}
      </span>
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
