import Image from "next/image";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { useCandidacyForDashboard } from "./dashboard.hooks";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import IconTitleWidget from "./widgets/IconTitleWidget";
import { format, isAfter } from "date-fns";

const Dashboard = () => {
  const router = useRouter();
  const { candidate, candidacy, candidacyAlreadySubmitted } =
    useCandidacyForDashboard();

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

  const canSendCandidacy = useMemo(
    () =>
      hasSelectedCertification &&
      hasCompletedGoals &&
      hasSelectedOrganism &&
      hasCompletedExperience &&
      candidate.firstname &&
      candidate.lastname &&
      candidate.birthdate &&
      candidate.birthCity &&
      candidate.birthDepartment &&
      candidate.nationality &&
      candidate.phone &&
      candidate.email &&
      !candidacyAlreadySubmitted,
    [
      hasSelectedCertification,
      hasCompletedGoals,
      hasSelectedOrganism,
      hasCompletedExperience,
      candidacyAlreadySubmitted,
      candidate,
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
            {canSendCandidacy ? (
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
                href: "/search-certification",
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
                    <Badge className="bg-[#fee7fc] text-[#6e445a]">
                      {candidacy.experiences.length === 0 ? (
                        <Badge severity="warning">À compléter</Badge>
                      ) : (
                        <>
                          {candidacy.experiences.length}{" "}
                          {candidacy.experiences.length === 1
                            ? "renseignée"
                            : "renseignées"}
                        </>
                      )}
                    </Badge>
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
                  disabled={!canSendCandidacy}
                  title="Envoi de la candidature"
                  desc="Compléter toutes les sections"
                  small
                  buttonProps={{
                    disabled: !canSendCandidacy,
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
            <span className="align-middle inline-block ml-2">
              {candidacyAlreadySubmitted ? (
                <Badge severity="success">Candidature envoyée</Badge>
              ) : (
                <Badge severity="warning">Candidature non envoyée</Badge>
              )}
            </span>
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
          <IconTitleWidget
            icon="fr-icon-calendar-2-line"
            title="Mes prochains
              rendez-vous"
          >
            {candidacy.firstAppointmentOccuredAt &&
            isAfter(candidacy.firstAppointmentOccuredAt, new Date()) ? (
              <>
                <Badge severity="info" small>
                  Rendez-vous pédagogique
                </Badge>
                <p className="mb-0 mt-2 font-bold">
                  {format(
                    candidacy.firstAppointmentOccuredAt,
                    "dd/MM/yyyy - HH:mm",
                  )}
                </p>
              </>
            ) : (
              <p className="mb-0 font-bold">
                Pas de rendez-vous pour le moment
              </p>
            )}
          </IconTitleWidget>
          <IconTitleWidget icon="fr-icon-team-line" title="Mes contacts">
            {candidacy.organism ? (
              <div className="font-bold">
                <p className="mb-1">
                  {candidacy.organism.nomPublic || candidacy.organism.label}
                </p>
                {candidacy.organism.adresseVille && (
                  <p className="mb-0 text-sm leading-normal text-dsfrGray-700">
                    {candidacy.organism.adresseNumeroEtNomDeRue} <br />
                    {candidacy.organism.adresseInformationsComplementaires && (
                      <>
                        {candidacy.organism.adresseInformationsComplementaires}
                        <br />
                      </>
                    )}
                    {candidacy.organism.adresseCodePostal}{" "}
                    {candidacy.organism.adresseVille}
                  </p>
                )}
                <p className="mb-0 text-sm leading-normal text-dsfrGray-700">
                  {candidacy.organism.emailContact ||
                    candidacy.organism.contactAdministrativeEmail}
                  <br />
                  {candidacy.organism.telephone ||
                    candidacy.organism.contactAdministrativePhone}
                </p>
              </div>
            ) : (
              <p className="mb-0 font-bold">Aucun contact pour le moment</p>
            )}
          </IconTitleWidget>
        </div>
      </div>
    </div>
  );
};

const CompleteIncompleteBadge = ({ isComplete }: { isComplete: boolean }) => {
  return (
    <Badge severity={isComplete ? "success" : "warning"}>
      {isComplete ? "complété" : "à compléter"}
    </Badge>
  );
};

export default Dashboard;
