import { useActor } from "@xstate/react";
import parse from "html-react-parser";
import { Interpreter } from "xstate";

import { Button } from "../components/atoms/Button";
import { BackButton } from "../components/molecules/BackButton";
import { Direction, Page } from "../components/organisms/Page";
import { demoDescription } from "../fixtures/certificates";
import { Certificate } from "../interface";
import {
  CertificateDetailsState,
  MainContext,
  MainEvent,
} from "../machines/main.machine";

interface Props {
  mainService: Interpreter<MainContext, any, MainEvent, any, any>;
}

const section = ({ title, content }: { title: string; content: string }) => {
  return (
    <div>
      <h2>{title}</h2>
      <p>{parse(content)}</p>
    </div>
  );
};

export const CertificateDetails = ({ mainService }: Props) => {
  const [state, send] = useActor(mainService);
  const certificate = (state.context.currentPage as CertificateDetailsState)
    .certification;

  console.log(state.context.direction);

  return (
    <Page
      className="flex flex-col z-50 bg-slate-900 pt-6"
      direction={state.context.direction}
    >
      <BackButton
        color="light"
        // onClick={() => setNavigationPrevious("search/results")}
        onClick={() => send("BACK")}
      />
      <div className="grow overflow-y-scroll">
        <div className="prose prose-invert prose-h2:my-1 mt-8 text-slate-400 text-base leading-normal px-8 pb-8">
          {certificate.summary && <p>{certificate.summary}</p>}

          {certificate.activities &&
            section({ title: "Activités", content: certificate.activities })}

          {certificate.abilities &&
            section({ title: "Compétences", content: certificate.abilities })}

          {certificate.activityArea &&
            section({
              title: "Secteurs d'activités",
              content: certificate.activityArea,
            })}

          {certificate.accessibleJobType &&
            section({
              title: "Types d'emplois accessibles",
              content: certificate.accessibleJobType,
            })}

          <Button
            // onClick={() => setNavigationNext("project/home")}
            onClick={() =>
              send({
                type: "CANDIDATE",
                certification: certificate,
              })
            }
            label="Candidater"
            className="mt-8 w-full"
            primary
            size="large"
          />
        </div>
      </div>
    </Page>
  );
};
