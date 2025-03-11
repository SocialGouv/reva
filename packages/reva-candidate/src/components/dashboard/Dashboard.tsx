import { candidateCanSubmitCandidacyToAap } from "@/utils/candidateCanSubmitCandidacyToAap.util";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { format, isAfter } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useCandidacyForDashboard } from "./dashboard.hooks";
import TileGroup from "./widgets/TileGroup";

const Dashboard = () => {
  const router = useRouter();
  const { candidacy, candidacyAlreadySubmitted } = useCandidacyForDashboard();

  const hasSelectedCertification = useMemo(
    () => candidacy?.certification?.id !== undefined,
    [candidacy],
  );

  const hasCompletedGoals = useMemo(
    () => candidacy?.goals?.length > 0,
    [candidacy],
  );

  const hasCompletedExperience = useMemo(
    () => candidacy?.experiences?.length > 0,
    [candidacy],
  );

  const hasSelectedOrganism = useMemo(
    () => candidacy?.organism?.id !== undefined,
    [candidacy],
  );

  const canSubmitCandidacy = useMemo(
    () =>
      candidateCanSubmitCandidacyToAap(
        hasSelectedCertification,
        hasCompletedGoals,
        hasSelectedOrganism,
        hasCompletedExperience,
        candidacyAlreadySubmitted,
      ),
    [
      hasSelectedCertification,
      hasCompletedGoals,
      hasSelectedOrganism,
      hasCompletedExperience,
      candidacyAlreadySubmitted,
    ],
  );
  return (
    <div>
      <p className="text-xl">
        RNCP {candidacy.certification?.codeRncp} :{" "}
        {candidacy.certification?.label}
      </p>
      <div className="flex flex-col bg-white lg:flex-row items-center relative text-start border-b-[4px] border-b-[#FFA180] shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)] py-8 px-8 pl-0 w-full mt-32 lg:mt-16 lg:h-[110px]">
        <Image
          src="/candidat/images/image-home-character-young-man-glasses.png"
          width={167}
          height={168}
          alt="Homme portant des lunettes"
          className="relative -top-28 lg:top-0 lg:-left-3"
        />
        <div className="pt-8 mt-[-120px] lg:mt-0 lg:p-0 text-justify">
          <p className="my-0 pl-8">
            {canSubmitCandidacy ? (
              <>
                Votre candidature est correctement complétée ? Vous pouvez
                l’envoyer sans plus tarder !{" "}
              </>
            ) : (
              <>
                Pour envoyer votre candidature, vous devez avoir complété, vos
                informations dans <b>“Mon profil”</b> et toutes les catégories
                de la section <b>“Compléter ma candidature”</b>.
              </>
            )}
          </p>
        </div>
      </div>
      <div className="grid grid-flow-row lg:grid-flow-col grid-cols-1 lg:grid-cols-3 grid-rows-2 gap-x-6 gap-y-8 mx-auto mt-20">
        <div className="col-span-1 lg:col-span-2 row-span-1 h-fit shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)]">
          <div className="bg-white p-4 pl-6 border-b-2">
            <p className="text-xl font-bold my-0 leading-loose">
              <span className="fr-icon-ball-pen-line" /> Compléter ma
              candidature
            </p>
          </div>
          <div
            className={`grid ${
              candidacy.typeAccompagnement === "ACCOMPAGNE"
                ? "md:grid-cols-3 grid-rows-2"
                : "md:grid-cols-2 grid-rows-1"
            }`}
          >
            <Tile
              start={
                <CompleteIncompleteBadge
                  isComplete={hasSelectedCertification}
                />
              }
              title="Diplôme visé"
              small
              linkProps={{
                href: hasSelectedCertification
                  ? `/certification/${candidacy.certification?.id}`
                  : "/search-certification",
              }}
              imageUrl="/candidat/images/pictograms/search.svg"
            />
            <Tile
              start={
                <Tag small>
                  {candidacy.typeAccompagnement === "ACCOMPAGNE"
                    ? "Accompagné"
                    : "Autonome"}
                </Tag>
              }
              title="Modalité de parcours"
              small
              linkProps={{
                href: "/type-accompagnement",
              }}
              imageUrl="/candidat/images/pictograms/human-cooperation.svg"
            />
            {candidacy.typeAccompagnement === "ACCOMPAGNE" && (
              <>
                <Tile
                  start={
                    <CompleteIncompleteBadge isComplete={hasCompletedGoals} />
                  }
                  title="Objectifs"
                  small
                  linkProps={{
                    href: "/set-goals",
                  }}
                  imageUrl="/candidat/images/pictograms/conclusion.svg"
                />
                <Tile
                  start={
                    <>
                      {candidacy.experiences.length === 0 ? (
                        <Badge severity="warning">À compléter</Badge>
                      ) : (
                        <Badge className="bg-[#fee7fc] text-[#6e445a]">
                          {candidacy.experiences.length}{" "}
                          {candidacy.experiences.length === 1
                            ? "renseignée"
                            : "renseignées"}
                        </Badge>
                      )}
                    </>
                  }
                  title="Expériences"
                  small
                  linkProps={{
                    href: "/experiences",
                  }}
                  imageUrl="/candidat/images/pictograms/culture.svg"
                />
                <Tile
                  start={
                    <CompleteIncompleteBadge isComplete={hasSelectedOrganism} />
                  }
                  title="Accompagnateur"
                  small
                  linkProps={{
                    href: "/set-organism",
                  }}
                  imageUrl="/candidat/images/pictograms/avatar.svg"
                />
                <Tile
                  start={
                    <SentToSendBadge isComplete={candidacyAlreadySubmitted} />
                  }
                  disabled={!canSubmitCandidacy}
                  title="Envoi de la candidature"
                  small
                  buttonProps={{
                    onClick: () => {
                      router.push("/submit-candidacy");
                    },
                  }}
                  imageUrl="/candidat/images/pictograms/mail-send.svg"
                />
              </>
            )}
          </div>
        </div>
        <div className="col-span-1 lg:col-span-2 row-span-1 h-fit shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)]">
          <div className="bg-white p-4 pl-6 border-b-2">
            <p className="text-xl font-bold my-0 leading-loose inline-block">
              <span className="fr-icon-award-line" /> Suivre mon parcours
            </p>
            {candidacy.typeAccompagnement === "ACCOMPAGNE" && (
              <span className="align-middle inline-block ml-2">
                {candidacyAlreadySubmitted ? (
                  <Badge severity="success">Candidature envoyée</Badge>
                ) : (
                  <Badge severity="warning">Candidature non envoyée</Badge>
                )}
              </span>
            )}
          </div>
          <div className="grid grid-flow-row md:grid-flow-col grid-rows-1">
            {candidacy.typeAccompagnement === "ACCOMPAGNE" && (
              <Tile
                disabled={
                  candidacy.status == "PROJET" ||
                  candidacy.status == "VALIDATION" ||
                  candidacy.status == "PRISE_EN_CHARGE"
                }
                title="Parcours et financement"
                small
                buttonProps={{
                  onClick: () => {
                    router.push("/validate-training");
                  },
                }}
                imageUrl="/candidat/images/pictograms/in-progress.svg"
              />
            )}
            <Tile
              disabled={!candidacy.feasibility}
              title="Dossier de faisabilité"
              small
              buttonProps={{
                onClick: () => {
                  router.push("/validate-feasibility");
                },
              }}
              imageUrl="/candidat/images/pictograms/contract.svg"
            />
            <Tile
              disabled
              title="Dossier de validation"
              small
              buttonProps={{
                onClick: () => {
                  router.push("/dossier-de-validation");
                },
              }}
              imageUrl="/candidat/images/pictograms/binders.svg"
            />
          </div>
        </div>
        <div className="flex flex-col col-span-1 row-span-2 row-start-1 gap-y-8">
          <TileGroup
            icon="fr-icon-calendar-2-line"
            title="Mes prochains rendez-vous"
          >
            {candidacy.firstAppointmentOccuredAt &&
            isAfter(candidacy.firstAppointmentOccuredAt, new Date()) ? (
              <Tile
                small
                orientation="horizontal"
                classes={{
                  content: "pb-0",
                }}
                start={
                  <Badge severity="info" small>
                    Rendez-vous pédagogique
                  </Badge>
                }
                title={format(
                  candidacy.firstAppointmentOccuredAt,
                  "dd/MM/yyyy - HH:mm",
                )}
              />
            ) : (
              <Tile title="Aucun rendez-vous pour le moment" />
            )}
          </TileGroup>
          <TileGroup icon="fr-icon-team-line" title="Mes contacts">
            {!candidacy.organism &&
              !candidacy.feasibility?.certificationAuthority && (
                <p className="mb-0 font-bold">Aucun contact pour le moment</p>
              )}
            {candidacy.organism && (
              <Tile
                title="Mon accompagnateur"
                small
                orientation="horizontal"
                classes={{
                  content: "pb-0",
                }}
                desc={
                  <>
                    <p className="mb-1 text-sm">
                      {candidacy.organism.nomPublic || candidacy.organism.label}
                    </p>
                    {candidacy.organism.adresseVille && (
                      <p className="mb-0 leading-normal text-sm">
                        {candidacy.organism.adresseNumeroEtNomDeRue} <br />
                        {candidacy.organism
                          .adresseInformationsComplementaires && (
                          <>
                            {
                              candidacy.organism
                                .adresseInformationsComplementaires
                            }
                            <br />
                          </>
                        )}
                        {candidacy.organism.adresseCodePostal}{" "}
                        {candidacy.organism.adresseVille}
                      </p>
                    )}
                    <p className="mb-0 leading-normal text-sm">
                      {candidacy.organism.emailContact ||
                        candidacy.organism.contactAdministrativeEmail}
                      <br />
                      {candidacy.organism.telephone ||
                        candidacy.organism.contactAdministrativePhone}
                    </p>
                  </>
                }
              />
            )}
            {candidacy.feasibility?.certificationAuthority && (
              <Tile
                title="Mon certificateur"
                small
                orientation="horizontal"
                classes={{
                  content: "pb-0",
                }}
                desc={
                  <>
                    <p className="mb-1 font-bold">Mon certificateur</p>
                    {candidacy.feasibility?.certificationAuthority.label}
                    <p className="mb-0 text-sm leading-normal">
                      {
                        candidacy.feasibility?.certificationAuthority
                          .contactFullName
                      }
                      <br />
                      {
                        candidacy.feasibility?.certificationAuthority
                          .contactEmail
                      }
                    </p>
                  </>
                }
              />
            )}
          </TileGroup>
        </div>
      </div>
    </div>
  );
};

const CompleteIncompleteBadge = ({ isComplete }: { isComplete: boolean }) => (
  <Badge severity={isComplete ? "success" : "warning"}>
    {isComplete ? "complété" : "à compléter"}
  </Badge>
);

const SentToSendBadge = ({ isComplete }: { isComplete: boolean }) => (
  <Badge severity={isComplete ? "success" : "warning"}>
    {isComplete ? "Envoyée" : "à envoyer"}
  </Badge>
);

export default Dashboard;
