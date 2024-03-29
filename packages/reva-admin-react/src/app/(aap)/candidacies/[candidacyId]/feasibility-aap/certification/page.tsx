"use client";
import { useCertificationPageLogic } from "@/app/(aap)/candidacies/[candidacyId]/feasibility-aap/certification/certificationPageLogic";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";

const CertificationPage = () => {
  const { certification } = useCertificationPageLogic();
  return (
    <div className="flex flex-col">
      <h1>Descriptif de la certification</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="text-xl mb-10">
        Choisissez les blocs de compétences sur lesquels le candidat souhaite se
        positionner
      </p>
      <div className="flex gap-2">
        <span className="fr-icon fr-icon--lg fr-icon-award-fill" />
        <div className="flex flex-col">
          <p className="text-xl font-bold mb-0">{certification?.label}</p>
          <p className="text-sm text-dsfr-light-text-mention-grey">
            RNCP {certification?.codeRncp}
          </p>
        </div>
      </div>
      <a
        href={`https://www.francecompetences.fr/recherche/rncp/${certification?.codeRncp}/`}
        target="_blank"
        className="fr-link mr-auto"
      >
        Lire les détails de la fiche diplôme
      </a>
    </div>
  );
};

export default CertificationPage;
