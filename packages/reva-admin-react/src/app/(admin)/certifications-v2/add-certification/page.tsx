"use client";
import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { Button } from "@codegouvfr/react-dsfr/Button";

export default function AddCertificationPage() {
  return (
    <div>
      <h1>Ajout d’une certification</h1>
      <p className="mb-12">
        Pour faciliter l’ajout, renseignez le code RNCP pour pré-remplir le
        document avec les informations de France compétences et du Formacode.
        Ensuite, vous pourrez renseigner une structure certificatrice et (à
        minima) un gestionnaire des candidatures.
      </p>
      <div className="flex flex-col gap-8">
        <EnhancedSectionCard
          title="Descriptif de la certification"
          status="TO_COMPLETE"
          titleIconClass="fr-icon-award-fill"
          isEditable
          buttonOnClickHref="/certifications-v2/add-certification/description"
        />
        <EnhancedSectionCard
          title="Blocs de compétences"
          titleIconClass="fr-icon-survey-fill"
        />
        <EnhancedSectionCard
          status="TO_COMPLETE"
          title="Structure certificatrice et gestionnaires"
          titleIconClass="fr-icon-group-fill"
          disabled
          isEditable
          customButtonTitle="Compléter"
          buttonOnClickHref="/certifications-v2/add-certification/structure"
        />
      </div>
      <hr className="mt-8" />
      <h2>Validation par le responsable des certifications</h2>
      <p>
        Lorsque la certification est prête, vous devez l’envoyer au responsable
        des certifications pour validation. Si aucun responsable des
        certifications n’existe pour le moment et qu’aucune validation n’est
        possible, elle pourra être visible des AAP mais pas encore des
        candidats.
      </p>
      <hr className="mb-6" />
      <Button
        priority="secondary"
        linkProps={{ href: "/certifications-v2", target: "_self" }}
      >
        Retour
      </Button>
    </div>
  );
}
