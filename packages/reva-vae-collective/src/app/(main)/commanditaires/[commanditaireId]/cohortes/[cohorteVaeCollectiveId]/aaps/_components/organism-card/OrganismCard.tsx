"use client";

import { Card } from "@codegouvfr/react-dsfr/Card";
import { Tag } from "@codegouvfr/react-dsfr/Tag";

import { updateCohorteVAECollectiveOrganism } from "../../actions";

export const OrganismCard = ({
  organism,
  commanditaireId,
  cohorteVaeCollectiveId,
}: {
  commanditaireId: string;
  cohorteVaeCollectiveId: string;
  organism: {
    id: string;
    label: string;
    nomPublic?: string | null;
    isMaisonMereMCFCompatible?: boolean | null;
    modaliteAccompagnement: "LIEU_ACCUEIL" | "A_DISTANCE";
    conformeNormesAccessibilite?:
      | "CONFORME"
      | "NON_CONFORME"
      | "ETABLISSEMENT_NE_RECOIT_PAS_DE_PUBLIC"
      | null;
    adresseNumeroEtNomDeRue?: string | null;
    adresseInformationsComplementaires?: string | null;
    adresseVille?: string | null;
    adresseCodePostal?: string | null;
  };
}) => (
  <Card
    data-testid="organism-card"
    title={organism.nomPublic || organism.label}
    start={
      <div className="flex gap-2">
        {organism.isMaisonMereMCFCompatible && <Tag small>MCF</Tag>}
        {organism.modaliteAccompagnement === "A_DISTANCE" && (
          <Tag iconId="fr-icon-customer-service-fill" small>
            À distance
          </Tag>
        )}
        {organism.modaliteAccompagnement === "LIEU_ACCUEIL" && (
          <Tag iconId="fr-icon-home-4-fill" small>
            Sur site
          </Tag>
        )}
      </div>
    }
    desc={
      <>
        <span>
          {[
            [
              organism.adresseNumeroEtNomDeRue,
              organism.adresseInformationsComplementaires,
            ]
              .filter(Boolean)
              .join(" "),
            [organism.adresseCodePostal, organism.adresseVille]
              .filter(Boolean)
              .join(" "),
          ]
            .filter(Boolean)
            .join(", ")}
        </span>
        {organism.conformeNormesAccessibilite !== "CONFORME" && (
          <span className="flex items-center gap-1">
            <span className="fr-icon-wheelchair-fill fr-icon--sm" />
            Accessibilité PMR
          </span>
        )}
      </>
    }
    endDetail="choisir"
    size="small"
    enlargeLink
    linkProps={{
      href: `/commanditaires/${commanditaireId}/cohortes/${cohorteVaeCollectiveId}/aaps/${organism.id}`,
      onClick: (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateCohorteVAECollectiveOrganism({
          commanditaireVaeCollectiveId: commanditaireId,
          cohorteVaeCollectiveId,
          organismId: organism.id,
        });
      },
    }}
  />
);
