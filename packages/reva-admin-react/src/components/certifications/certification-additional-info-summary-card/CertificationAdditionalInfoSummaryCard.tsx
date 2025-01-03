import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { FancyPreview } from "@/components/fancy-preview/FancyPreview";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import Link from "next/link";

export const CertificationAdditionalInfoSummaryCard = ({
  isEditable,
  updateButtonHref,
  certificationAdditionalInfo,
}: {
  isEditable: boolean;
  updateButtonHref: string;
  certificationAdditionalInfo?: {
    linkToReferential: string;
    linkToCorrespondenceTable?: string | null;
    linkToJuryGuide?: string | null;
    certificationExpertContactDetails?: string | null;
    usefulResources?: string | null;
    commentsForAAP?: string | null;
    dossierDeValidationTemplate: {
      name: string;
      previewUrl?: string | null;
    };
  } | null;
}) => (
  <EnhancedSectionCard
    data-test="additional-info-summary-card"
    isEditable={isEditable}
    title="Ressources complémentaires"
    titleIconClass="fr-icon-info-fill"
    status={certificationAdditionalInfo ? "COMPLETED" : "TO_COMPLETE"}
    buttonOnClickHref={updateButtonHref}
  >
    {certificationAdditionalInfo ? (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-4">
          <h3 className="mb-0">Documentation sur la certification :</h3>
          {certificationAdditionalInfo.linkToReferential && (
            <Link
              href={certificationAdditionalInfo.linkToReferential}
              className="fr-link mr-auto"
              target="_blank"
            >
              Référentiels d’activités
            </Link>
          )}
          {certificationAdditionalInfo.linkToCorrespondenceTable && (
            <Link
              href={certificationAdditionalInfo.linkToCorrespondenceTable}
              className="fr-link mr-auto"
              target="_blank"
            >
              Tableau des correspondances et dispense de blocs
            </Link>
          )}
        </section>
        <section className="flex flex-col gap-4">
          <h3 className="mb-0">
            Documentation sur le dossier de validation et le jury :
          </h3>
          {certificationAdditionalInfo.dossierDeValidationTemplate
            .previewUrl && (
            <FancyPreview
              src={
                certificationAdditionalInfo.dossierDeValidationTemplate
                  .previewUrl
              }
              title={"Trame du dossier de validation"}
              name={
                certificationAdditionalInfo.dossierDeValidationTemplate.name
              }
              defaultDisplay={false}
            />
          )}
          {certificationAdditionalInfo.linkToJuryGuide && (
            <Link
              href={certificationAdditionalInfo.linkToJuryGuide}
              className="fr-link mr-auto"
              target="_blank"
            >
              Guide du jury
            </Link>
          )}
        </section>
        <section className="flex flex-col gap-4">
          <h3 className="mb-0">Contact d’un expert de la certification :</h3>
          {certificationAdditionalInfo.certificationExpertContactDetails && (
            <p className="mb-0 font-medium">
              {certificationAdditionalInfo.certificationExpertContactDetails}
            </p>
          )}
        </section>
        <section className="flex flex-col gap-4">
          <h3 className="mb-0">Informations complémentaires :</h3>
          <dl>
            <dt>Ressources pour aider au parcours VAE :</dt>
            <dd className="font-medium mb-4">
              {certificationAdditionalInfo.usefulResources}
            </dd>
            <dt>Remarques à transmettre à l’AAP :</dt>
            <dd className="font-medium mb-4">
              {certificationAdditionalInfo.commentsForAAP}
            </dd>
          </dl>
        </section>
      </div>
    ) : (
      <SmallNotice className="mt-1">
        Transmettez aux AAP et aux candidats des ressources qui faciliteront le
        déroulé de l’accompagnement et du parcours VAE.
      </SmallNotice>
    )}
  </EnhancedSectionCard>
);
