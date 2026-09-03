"use client";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import Tabs from "@codegouvfr/react-dsfr/Tabs";
import { format } from "date-fns";
import Link from "next/link";
import { useMemo } from "react";

import { Panel } from "@/components/layout/Panel";

import {
  FeasibilityCompetenceBlocksModal,
  feasibilityCompetenceBlocksModal,
} from "./_components/FeasibilityCompetenceBlocksModal";
import { ResultatCard } from "./_components/ResultatCard";
import { ResultatCardWithBlocks } from "./_components/ResultatCardWithBlocks";
import { useJuryResult } from "./jury-results.hook";

export default function JuryResultsPage() {
  const { candidacy, certification, jury } = useJuryResult();

  const linkToOpenFeasibilityCompetenceBlocksModal = useMemo(() => {
    return (
      <>
        {candidacy?.feasibility?.dematerializedFeasibilityFile
          ?.blocsDeCompetences &&
          candidacy?.certification?.competenceBlocs && (
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                feasibilityCompetenceBlocksModal.open();
              }}
              className="fr-link"
            >
              Voir les détails de la recevabilité du candidat sur cette
              certification <i className="fr-icon-arrow-right-line" />
            </Link>
          )}
      </>
    );
  }, [candidacy]);

  if (!candidacy || !certification || !jury) return <div>Jury not found</div>;

  return (
    <Panel>
      <Breadcrumb
        currentPageLabel="Jury"
        className="mb-4 mt-0"
        segments={[
          {
            label: "Mes candidatures",
            linkProps: {
              href: "../../",
            },
          },
          {
            label: `RNCP ${certification.codeRncp} : ${certification.label}`,
            linkProps: {
              href: `../certification/${certification.id}`,
            },
          },
        ]}
      />
      <div className="flex flex-col gap-12">
        <h1 className="mb-0">Jury</h1>
        {(jury.result === "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION" ||
          jury.result === "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION") && (
          <Alert
            severity="info"
            title={`Vous n’avez pas validé la totalité de votre parcours VAE à la suite de votre passage devant le jury le ${format(jury.dateOfSession, "dd/MM/yyyy")}`}
            description="Suite à ce résultat, vous pouvez repasser devant le jury. Vous devrez, en amont, retravailler sur le dossier de validation. Pour le faire parvenir au certificateur, veuillez vous rendre dans la section dossier de validation."
            data-testid="partial-success-alert"
          />
        )}
        {(jury.result === "FAILURE" ||
          jury.result === "CANDIDATE_EXCUSED" ||
          jury.result === "CANDIDATE_ABSENT") && (
          <Alert
            severity="info"
            title={`Vous n’avez pas validé votre parcours VAE à la suite de votre passage devant le jury le ${format(jury.dateOfSession, "dd/MM/yyyy")}`}
            description="Suite à ce résultat, vous pouvez repasser devant le jury. Vous devrez, en amont, retravailler sur le dossier de validation. Pour le faire parvenir au certificateur, veuillez vous rendre dans la section dossier de validation."
            data-testid="failure-alert"
          />
        )}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="basis-3/4">
            {candidacy.historyJury && candidacy.historyJury.length > 0 && (
              <Tabs
                tabs={candidacy.historyJury
                  .map((pastJury) => {
                    // Les blocs validés précédemment (dans une session précédente) sont affichés séparément des blocs validés dans la session courante.
                    // On prend tous les blocs validés précédemment et on soustrait ceux qui sont présents dans la session courante.
                    // Chaque session ne contient que les blocs explicitements validés ou échoués pour ladite session.
                    const previouslyValidatedBlocksForThisSession =
                      candidacy.jury?.previouslyValidatedBlocks?.filter(
                        (previousBlock) =>
                          pastJury.juryResultByCompetenceBlocs?.every(
                            (result) =>
                              result.competenceBloc.id !== previousBlock.id,
                          ),
                      );
                    return {
                      label: format(pastJury.dateOfSession, "dd/MM/yyyy"),
                      content:
                        pastJury.juryResultByCompetenceBlocs &&
                        pastJury.juryResultByCompetenceBlocs.length > 0 ? (
                          <ResultatCardWithBlocks
                            jury={{
                              id: pastJury.id,
                              result: pastJury.result!,
                              informationOfResult: pastJury.informationOfResult,
                              juryResultByCompetenceBlocs:
                                pastJury.juryResultByCompetenceBlocs,
                            }}
                            previouslyValidatedBlocks={
                              previouslyValidatedBlocksForThisSession
                            }
                            additionalInformation={
                              linkToOpenFeasibilityCompetenceBlocksModal
                            }
                          />
                        ) : (
                          <ResultatCard
                            jury={{
                              id: pastJury.id,
                              result: pastJury.result!,
                              informationOfResult: pastJury.informationOfResult,
                            }}
                          />
                        ),
                    };
                  })
                  .concat([
                    {
                      label: format(jury.dateOfSession, "dd/MM/yyyy"),
                      // @ts-expect-error - isDefault is a valid prop for Tabs but React DSFR does not type it correctly
                      isDefault: true,
                      content: (
                        <ResultatCardWithBlocks
                          jury={{
                            id: jury.id,
                            result: jury.result!,
                            informationOfResult: jury.informationOfResult,
                            juryResultByCompetenceBlocs:
                              jury.juryResultByCompetenceBlocs,
                          }}
                          previouslyValidatedBlocks={
                            candidacy.jury?.previouslyValidatedBlocks
                          }
                          additionalInformation={
                            linkToOpenFeasibilityCompetenceBlocksModal
                          }
                        />
                      ),
                    },
                  ])}
              />
            )}
            {candidacy.historyJury && candidacy.historyJury.length === 0 && (
              <>
                {jury.juryResultByCompetenceBlocs &&
                jury.juryResultByCompetenceBlocs.length > 0 ? (
                  <ResultatCardWithBlocks
                    jury={{
                      id: jury.id,
                      dateOfSession: jury.dateOfSession,
                      result: jury.result!,
                      informationOfResult: jury.informationOfResult,
                      juryResultByCompetenceBlocs:
                        jury.juryResultByCompetenceBlocs,
                    }}
                    previouslyValidatedBlocks={jury.previouslyValidatedBlocks}
                    additionalInformation={
                      linkToOpenFeasibilityCompetenceBlocksModal
                    }
                  />
                ) : (
                  <ResultatCard
                    jury={{
                      id: jury.id,
                      dateOfSession: jury.dateOfSession,
                      result: jury.result!,
                      informationOfResult: jury.informationOfResult,
                    }}
                  />
                )}
              </>
            )}
          </div>
          <div className="basis-1/4 bg-dsfr-light-decisions-background-background-alt-blue-france p-4 pb-8">
            <div className="flex flex-col gap-6">
              <p className="text-xl font-bold mb-0">Ressources : </p>
              <p className="mb-0">
                Pour en savoir plus sur les résultats de jury :
              </p>
              <p className="mb-0">
                <Link
                  href="https://vae.gouv.fr/savoir-plus/articles/comment-se-deroule-un-jury-vae/"
                  className="fr-link"
                  target="_blank"
                >
                  Comment se déroule un jury
                </Link>
              </p>
              <p className="mb-0">
                <Link
                  href={`../certification/${certification.id}/`}
                  className="fr-link"
                  target="_blank"
                >
                  Consulter la fiche de la certification
                </Link>
              </p>
            </div>
          </div>
        </div>
        {candidacy?.feasibility?.dematerializedFeasibilityFile
          ?.blocsDeCompetences &&
          candidacy?.certification?.competenceBlocs && (
            <FeasibilityCompetenceBlocksModal
              receivableBlocks={candidacy?.feasibility?.dematerializedFeasibilityFile?.blocsDeCompetences.map(
                (block) => block.certificationCompetenceBloc,
              )}
              certificationBlocks={candidacy?.certification?.competenceBlocs}
            />
          )}
      </div>
    </Panel>
  );
}
