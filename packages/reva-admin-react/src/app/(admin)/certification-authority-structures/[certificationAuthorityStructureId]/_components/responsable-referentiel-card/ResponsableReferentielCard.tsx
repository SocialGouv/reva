import { DefaultCandidacySectionCard } from "@/components/card/candidacy-section-card/DefaultCandidacySectionCard";
import { Button } from "@codegouvfr/react-dsfr/Button";

export default function ResponsableReferentielCard({
  certificationAuthorityStructureId,
  certificationRegistryManager,
}: {
  certificationAuthorityStructureId: string;
  certificationRegistryManager?: {
    account: {
      firstname?: string | null;
      lastname?: string | null;
      email: string;
    };
  } | null;
}) {
  const editUrl = `/certification-authority-structures/${certificationAuthorityStructureId}/responsable-referentiel`;

  if (!certificationRegistryManager) {
    return (
      <DefaultCandidacySectionCard
        title="Responsable du référentiel "
        titleIconClass="fr-icon-medal-fill"
        isEditable
        status="TO_COMPLETE"
        buttonOnClickHref={editUrl}
      >
        <p className="pl-10 md:pr-48 mb-0">
          Il ajoute, modifie ou supprime des certifications proposées par la
          structure certificatrice. L’ajout d’un responsable du référentiel est
          obligatoire pour la gestion des certifications.
        </p>
      </DefaultCandidacySectionCard>
    );
  }

  const account = certificationRegistryManager.account;

  return (
    <DefaultCandidacySectionCard
      title="Responsable du référentiel "
      titleIconClass="fr-icon-medal-fill"
      isEditable
      status="COMPLETED"
    >
      <p className="flex justify-between items-center border-t border-b border-neutral-300 py-2 ml-10 mb-0">
        <div>
          <div className="font-semibold">{`${account.firstname} ${account.lastname}`}</div>
          {account.email}
        </div>
        <div>
          <Button
            linkProps={{ href: editUrl }}
            priority="tertiary no outline"
            size="small"
          >
            Consulter
          </Button>
        </div>
      </p>
    </DefaultCandidacySectionCard>
  );
}