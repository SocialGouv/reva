import { useActor } from "@xstate/react";
import parse from "html-react-parser";
import { Interpreter } from "xstate";

import { Button } from "../components/atoms/Button";
import { BackButton } from "../components/molecules/BackButton";
import { Direction, Page } from "../components/organisms/Page";
import { demoDescription } from "../fixtures/certificates";
import { Certificate, Certification } from "../interface";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";

interface Props {
  certification: Certificate;
  mainService: Interpreter<MainContext, any, MainEvent, MainState, any>;
}

const section = ({ title, content }: { title: string; content: string }) => {
  return (
    <div>
      <h2>{title}</h2>
      <p>{parse(content)}</p>
    </div>
  );
};

export const CertificateDetails = ({ certification, mainService }: Props) => {
  const [state, send] = useActor(mainService);

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
          {certification.summary && <p>{certification.summary}</p>}

          {certification.activities &&
            section({ title: "Activités", content: certification.activities })}

          {certification.abilities &&
            section({ title: "Compétences", content: certification.abilities })}

          {certification.activityArea &&
            section({
              title: "Secteurs d'activités",
              content: certification.activityArea,
            })}

          {certification.accessibleJobType &&
            section({
              title: "Types d'emplois accessibles",
              content: certification.accessibleJobType,
            })}

          <Button
            onClick={() =>
              send({
                type: "CANDIDATE",
                certification,
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
