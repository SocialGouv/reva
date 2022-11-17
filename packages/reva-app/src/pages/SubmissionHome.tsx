import { useActor } from "@xstate/react";
import { Interpreter } from "xstate";

import { Header } from "../components/atoms/Header";
import { ProgressTitle } from "../components/molecules/ProgressTitle";
import certificationImg from "../components/organisms/Card/certification.png";
import { Page } from "../components/organisms/Page";
import type { Certification } from "../interface";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";

interface SubmissionHomeProps {
  candidacyCreatedAt: Date;
  certification: Certification;
  mainService: Interpreter<MainContext, any, MainEvent, MainState, any>;
}

const CandidacyStatus = () => (
  <>
    <ProgressTitle
      progress={35}
      title={"Validation du projet"}
      theme={"dark"}
    />
    <p data-test="submission-home-project-submitted" className="mt-3">
      Statut : transmis à un architecte de parcours
    </p>
    <p className="text-blue-500">Délai de réponse moyen 48h</p>
  </>
);

export const SubmissionHome = ({
  candidacyCreatedAt,
  certification,
  mainService,
}: SubmissionHomeProps) => {
  const [state] = useActor(mainService);

  const candidacyCreatedAtFormatted =
    candidacyCreatedAt?.toLocaleDateString("fr-FR");

  const homeContent = (
    <>
      <Header color="dark" label={certification.label} level={2} size="small" />
      <div className="-mt-2 mb-2 font-bold">{certification.codeRncp}</div>
      <p className="text-sm text-gray-500">
        Démarré le {candidacyCreatedAtFormatted}
      </p>
      <p className="text-sm text-blue-500 font-medium">En attente de contact</p>

      <div
        className="mt-10 flex flex-col px-8 py-6 rounded-xl shadow-sm text-white bg-slate-900"
        style={{ height: "414px" }}
      >
        <CandidacyStatus />
      </div>
    </>
  );

  return (
    <Page
      className="z-[90] flex flex-col bg-neutral-100"
      direction={state.context.direction}
    >
      <div className="flex flex-col h-full relative overflow-hidden">
        <img
          className="pointer-events-none"
          alt=""
          role="presentation"
          style={{
            position: "absolute",
            left: "-53px",
            top: "58px",
            width: "106px",
          }}
          src={certificationImg}
        />
        <h1 className="mt-12 -mb-12 text-center font-bold">Reva</h1>
        <div className="grow overflow-y-auto mt-36 px-12 pb-8">
          {homeContent}
        </div>
      </div>
    </Page>
  );
};
