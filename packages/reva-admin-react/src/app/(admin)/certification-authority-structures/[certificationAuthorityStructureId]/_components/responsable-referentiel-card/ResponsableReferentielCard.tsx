import { Button } from "@codegouvfr/react-dsfr/Button";

import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";

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
      <EnhancedSectionCard
        title="Responsable de certifications"
        titleIconClass="fr-icon-medal-fill"
        isEditable
        status="TO_COMPLETE"
        buttonOnClickHref={editUrl}
      >
        <p className="pl-10 md:pr-48 mb-0">
          Il ajoute, modifie ou supprime des certifications proposées par la
          structure certificatrice. L’ajout d’un responsable de certifications
          est obligatoire pour la gestion des certifications.
        </p>
      </EnhancedSectionCard>
    );
  }

  const account = certificationRegistryManager.account;

  return (
    <EnhancedSectionCard
      title="Responsable de certifications "
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
            Modifier
          </Button>
        </div>
      </p>
    </EnhancedSectionCard>
  );
}
