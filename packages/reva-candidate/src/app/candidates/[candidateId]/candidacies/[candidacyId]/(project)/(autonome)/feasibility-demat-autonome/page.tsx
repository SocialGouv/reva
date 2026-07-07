"use client";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { isBefore, toDate } from "date-fns";

import { Panel } from "@/components/layout/Panel";

import {
  Certification,
  CertificationCompetenceDetails,
  DematerializedFeasibilityFile,
  DffAttachment,
  DffCertificationCompetenceBloc,
  Prerequisite,
} from "@/graphql/generated/graphql";

import { AttachmentsSection } from "./_components/AttachmentsSection";
import { CertificationSection } from "./_components/CertificationSection";
import { CompetenciesBlocksSection } from "./_components/CompetenciesBlocksSection";
import { EligibilitySection } from "./_components/EligibilitySection";
import { PrerequisitesSection } from "./_components/PrerequisitesSection";
import { SendFileCertificationAuthoritySection } from "./_components/SendFileCertificateurSection";
import { SwornStatementSection } from "./_components/SwornStatementSection";
import { useFeasibilityDematAutonomePage } from "./feasibility-demat-autonome.hook";

const modalWhatIsTheFeasibilityFile = createModal({
  id: "what-is-the-feasibility-file",
  isOpenedByDefault: false,
});

const modalWhatToPayAttentionTo = createModal({
  id: "what-to-pay-attention-to",
  isOpenedByDefault: false,
});

export default function FeasibilityDematAutonomeResourcesPage() {
  const { candidacy } = useFeasibilityDematAutonomePage();

  if (!candidacy) {
    return null;
  }

  const certification = candidacy.certification;
  const feasibility = candidacy.feasibility;
  const dematerializedFeasibilityFile =
    feasibility?.dematerializedFeasibilityFile;

  const feasibilityFileSentAt = feasibility?.feasibilityFileSentAt;
  const hasCertificationRncpExpired =
    !!certification?.rncpExpiresAt &&
    isBefore(certification?.rncpExpiresAt, new Date());
  const feasibilityDecisionIsIncomplete =
    feasibility?.decision === "INCOMPLETE";

  const isFeasibilityEditable =
    (!feasibilityFileSentAt && !hasCertificationRncpExpired) ||
    feasibilityDecisionIsIncomplete;

  const isEligibilityRequirementPartial =
    dematerializedFeasibilityFile?.eligibilityRequirement ===
    "PARTIAL_ELIGIBILITY_REQUIREMENT";
  const certificationAuthorityStructureHasReducedRequirements =
    !!certification?.certificationAuthorityStructure?.hasReducedRequirements;

  return (
    <Panel>
      <div className="flex flex-col w-full">
        <Breadcrumb
          currentPageLabel="Dossier de faisabilité"
          className="mb-2"
          segments={[
            {
              label: "Ma candidature",
              linkProps: {
                href: "../",
              },
            },
          ]}
        />
        <h1 className="mb-6">Dossier de faisabilité</h1>
        <p className="text-xl mb-12">
          Complétez toutes les sections du dossier de faisabilité avant de
          l'envoyer au certificateur.
        </p>

        <div className="grid grid-cols-4">
          <div className="col-span-3 flex flex-col gap-8">
            <EligibilitySection
              eligibilityRequirement={
                dematerializedFeasibilityFile?.eligibilityRequirement
              }
              eligibilityValidUntil={
                dematerializedFeasibilityFile?.eligibilityValidUntil
                  ? toDate(dematerializedFeasibilityFile?.eligibilityValidUntil)
                  : null
              }
              isFeasibilityEditable={isFeasibilityEditable}
            />

            <CertificationSection
              isCertificationPartial={!!candidacy.isCertificationPartial}
              dematerializedFeasibilityFile={
                dematerializedFeasibilityFile as DematerializedFeasibilityFile
              }
              certification={certification as Certification}
              isFeasibilityEditable={isFeasibilityEditable}
            />

            <CompetenciesBlocksSection
              blocsDeCompetences={
                dematerializedFeasibilityFile?.blocsDeCompetences as DffCertificationCompetenceBloc[]
              }
              certificationCompetenceDetails={
                dematerializedFeasibilityFile?.certificationCompetenceDetails as CertificationCompetenceDetails[]
              }
              competenceBlocsPartCompletion={
                dematerializedFeasibilityFile?.competenceBlocsPartCompletion
              }
              disabled={
                !dematerializedFeasibilityFile?.certificationPartComplete ||
                isEligibilityRequirementPartial
              }
              hideCompleteBadge={isEligibilityRequirementPartial}
              disabledNoticeText={
                isEligibilityRequirementPartial
                  ? "Vous n'avez pas besoin de compléter cette catégorie car une recevabilité favorable est en cours."
                  : "Vous devez d'abord détailler la certification visée avant d'intégrer les blocs de compétences."
              }
              isEditable={isFeasibilityEditable}
              isEligibilityRequirementPartial={isEligibilityRequirementPartial}
              showComplementExperienceParcoursVise={
                certificationAuthorityStructureHasReducedRequirements
              }
              complementExperienceParcoursVise={
                dematerializedFeasibilityFile?.complementExperienceParcoursVise as string
              }
            />

            <PrerequisitesSection
              prerequisites={
                dematerializedFeasibilityFile?.prerequisites as Prerequisite[]
              }
              prerequisitesPartComplete={
                dematerializedFeasibilityFile?.prerequisitesPartComplete
              }
              disabled={
                !dematerializedFeasibilityFile?.certificationPartComplete
              }
              isEditable={isFeasibilityEditable}
            />

            <AttachmentsSection
              attachmentsPartComplete={
                dematerializedFeasibilityFile?.attachmentsPartComplete
              }
              isEditable={isFeasibilityEditable}
              attachments={
                dematerializedFeasibilityFile?.attachments as DffAttachment[]
              }
            />

            <SwornStatementSection
              isCompleted={!!dematerializedFeasibilityFile?.swornStatementFile}
              isEditable={isFeasibilityEditable}
            />

            <SendFileCertificationAuthoritySection
              sentToCertificationAuthorityAt={
                feasibilityFileSentAt ? toDate(feasibilityFileSentAt) : null
              }
              isReadyToBeSentToCertificationAuthority={
                !!dematerializedFeasibilityFile?.isReadyToBeSentToCertificationAuthority
              }
              disabled={candidacy.warningOnFeasibilitySubmission !== "NONE"}
              isIncomplete={feasibilityDecisionIsIncomplete}
            />
          </div>

          <div className="col-span-1 ml-6">
            <div className="flex flex-col px-4 pb-2 pt-6 bg-dsfr-light-decisions-background-background-alt-blue-france">
              <h6>Ressources :</h6>

              <div>
                <p className="font-medium mb-2">Besoin d'aide ?</p>
                <p>
                  Ces ressources vous guideront pour remplir au mieux le dossier
                  de faisabilité
                </p>

                <Button
                  type="button"
                  className="underline text-sm shadow-none m-0 p-0 mb-6 line-height-normal text-left font-normal underline-offset-4 hover:decoration-2 min-h-0"
                  priority="secondary"
                  onClick={modalWhatIsTheFeasibilityFile.open}
                >
                  En quoi consiste le dossier de faisabilité ?
                </Button>

                <Button
                  type="button"
                  className="underline text-sm shadow-none m-0 p-0 mb-6 line-height-normal text-left font-normal underline-offset-4 hover:decoration-2 min-h-0"
                  priority="secondary"
                  onClick={modalWhatToPayAttentionTo.open}
                >
                  À quoi faire attention ?
                </Button>

                <p>
                  <a
                    className="fr-link text-sm"
                    href={`https://vae.gouv.fr/savoir-plus/articles/comment-completer-votre-dossier-de-faisabilite/`}
                    target="_blank"
                  >
                    Comment compléter votre dossier de faisabilité ?
                  </a>
                </p>

                <p>
                  Informations liées à la certification :<br />
                  <a
                    className="fr-link text-sm"
                    href={`https://www.francecompetences.fr/recherche/rncp/${certification?.codeRncp}`}
                    target="_blank"
                  >
                    Fiche de la certification
                  </a>
                </p>

                <hr />
                <p>
                  <a
                    className="fr-link text-sm"
                    href="https://scribehow.com/viewer/Tutoriel__Candidat_sans_accompagnement_autonome__0NQyq175SDaI0Epy7bdyLA?referrer=documents&mode=edit"
                    target="_blank"
                  >
                    Consultez le guide pas à pas
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <modalWhatIsTheFeasibilityFile.Component
        title={
          <div>
            <span className="fr-icon-info-fill mr-2" aria-hidden="true"></span>
            En quoi consiste le dossier de faisabilité ?
          </div>
        }
        size="large"
      >
        <p>
          Votre parcours de VAE comprend trois étapes importantes avec le
          certificateur :
        </p>

        <ol>
          <li>le dossier de faisabilité</li>
          <li>le dossier de validation</li>
          <li>le passage devant le jury</li>
        </ol>

        <p>Vous êtes ici à la première étape : le dossier de faisabilité. </p>

        <p>
          Le dossier de faisabilité permet de mettre en parallèle les
          expériences réalisées et les blocs de compétences visés pour
          l’obtention de la certification. Vous allez notamment devoir décrire
          précisément les activités que vous avez réalisées.
        </p>

        <p>
          Votre parcours de VAE comprend trois étapes importantes avec le
          certificateur : le dossier de faisabilité le dossier de validation le
          passage devant le jury Vous êtes ici à la première étape : le dossier
          de faisabilité. Le dossier de faisabilité permet de mettre en
          parallèle les expériences réalisées et les blocs de compétences visés
          pour l’obtention de la certification. Vous allez notamment devoir
          décrire précisément les activités que vous avez réalisées. Le
          certificateur étudiera votre dossier et vérifiera que votre projet est
          réaliste au regard de la qualité et de la diversité de vos
          expériences. Si c’est le cas, vous recevrez un avis "recevable" : cela
          signifie que vous pourrez commencer votre parcours.
        </p>
      </modalWhatIsTheFeasibilityFile.Component>

      <modalWhatToPayAttentionTo.Component
        title={
          <div>
            <span className="fr-icon-info-fill mr-2" aria-hidden="true"></span>À
            quoi faire attention ?
          </div>
        }
        size="large"
      >
        <p>
          Il est important d’écrire des réponses précises et de faire attention
          à l’orthographe et à la grammaire.
        </p>

        <p>
          Toutes les étapes à compléter sont sur votre espace France VAE : vous
          devez répondre aux questions directement ici, sur la plateforme. Vous
          pouvez le faire en plusieurs fois. Prenez le temps de bien formuler
          vos réponses et utilisez les ressources disponibles pour vous aider.
        </p>
      </modalWhatToPayAttentionTo.Component>
    </Panel>
  );
}
