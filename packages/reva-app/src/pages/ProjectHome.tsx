import { useActor } from "@xstate/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Interpreter } from "xstate";

import { Button } from "../components/atoms/Button";
import { Header } from "../components/atoms/Header";
import { Loader } from "../components/atoms/Icons";
import { TextResult } from "../components/atoms/TextResult";
import { Title } from "../components/atoms/Title";
import { BackButton } from "../components/molecules/BackButton";
import { ProgressTitle } from "../components/molecules/ProgressTitle";
import certificateImg from "../components/organisms/Card/certificate.png";
import { Direction, Page } from "../components/organisms/Page";
import { Certification } from "../interface";
import { MainContext, MainEvent } from "../machines/main.machine";

interface ProjectHomeProps {
  certification: Certification;
  mainService: Interpreter<MainContext, any, MainEvent, any, any>;
}

export const ProjectHome = ({
  certification,
  mainService,
}: ProjectHomeProps) => {
  const [state, send] = useActor(mainService);

  const projectProgress = 35;

  const editCertification = (
    <div className="bg-slate-900 rounded-xl overflow-hidden mt-6">
      <div className={`mt-5 mr-6 text-white text-right font-bold grow `}>
        {certification.codeRncp}
      </div>
      <img
        className=""
        style={{
          marginLeft: "-42px",
          marginTop: "-28px",
          height: "104px",
          width: "104px",
        }}
        src={certificateImg}
      />
      <div className="px-8 pb-6">
        <TextResult size="small" title={certification.label} color="light" />
        <Button
          size="tiny"
          label="Modifier"
          className="mt-4 text-slate-900 bg-white"
          onClick={() => send("CLOSE_SELECTED_CERTIFICATION")}
        />
      </div>
    </div>
  );

  const homeContent = (
    <div className="px-8">
      <ProgressTitle progress={projectProgress} size="large" title="Projet" />
      <div className="space-y-4">
        {editCertification}
        <div className="rounded-xl px-8 py-6 bg-purple-100">
          <p className="font-bold text-purple-800 text-xl mb-4">Mon objectif</p>
          <Button
            size="tiny"
            label="Choisir"
            className="text-white bg-purple-800"
            onClick={() => send("EDIT_GOALS")}
          />
        </div>
        <div className="rounded-xl px-8 py-6 bg-slate-100">
          <p className="font-bold text-slate-800 text-xl mb-4">
            Mes experiences
          </p>
          <div className="flex text-sm text-slate-400">
            <Button disabled={true} size="tiny" label="Ajouter" />
            <div className="ml-2">(bientôt)</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Page
      className="z-50 flex flex-col bg-white py-6"
      direction={state.context.direction}
    >
      <BackButton onClick={() => send("BACK")} />
      {homeContent}
    </Page>
  );
};
