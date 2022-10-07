import { useActor } from "@xstate/react";
import { AnimatePresence, motion } from "framer-motion";
import { Interpreter } from "xstate";

import { Button } from "../components/atoms/Button";
import { Header } from "../components/atoms/Header";
import { Loader } from "../components/atoms/Icons";
import { BackButton } from "../components/molecules/BackButton";
import { ProgressTitle } from "../components/molecules/ProgressTitle";
import certificationImg from "../components/organisms/Card/certification.png";
import { Page } from "../components/organisms/Page";
import { Certification, Experience, duration } from "../interface";
import { MainContext, MainEvent } from "../machines/main.machine";
import { sortExperiences } from "../utils/experienceHelpers";
import { projectProgress } from "../utils/projectProgress";

interface ProjectHomeProps {
  isValidated: boolean;
  certification: Certification;
  mainService: Interpreter<MainContext, any, MainEvent, any, any>;
}

const durationToString: {
  [key in duration]: string;
} = {
  unknown: "Durée inconnue",
  lessThanOneYear: "Moins d'un an",
  betweenOneAndThreeYears: "Entre 1 et 3 ans",
  moreThanThreeYears: "Plus de 3 ans",
  moreThanFiveYears: "Plus de 5 ans",
  moreThanTenYears: "Plus de 10 ans",
};

const ExperienceSummary = (experience: Experience, index: number) => (
  <li
    key={index}
    className="shrink-0 h-[123px] w-[156px] flex flex-col justify-end rounded overflow-hidden bg-gray-50 px-4 py-3"
  >
    <p data-test="project-home-experience-duration" className="font-semibold">
      {durationToString[experience.duration]}
    </p>
    <p data-test="project-home-experience-title">{experience.title}</p>
  </li>
);

const SubmissionWarning = () => (
  <>
    <h3 className="my-10 text-center font-bold text-xl">Tout est prêt !</h3>
    <p className="text-red-800 leading-7 mb-10">
      Lorsque le projet est validé, il engage un financement automatique proposé
      dans le cadre de l'expérimentation à laquelle vous participez. Votre
      engagement à poursuivre est nécessaire et vous engage personnellement.
    </p>
  </>
);

export const ProjectHome = ({
  isValidated,
  certification,
  mainService,
}: ProjectHomeProps) => {
  const [state, send] = useActor(mainService);

  const selectedGoals = state.context.goals.filter((goal) => goal.checked);

  const isHomeReady =
    !state.matches({ projectHome: "loading" }) &&
    !state.matches({ projectHome: "retry" });

  const sortedExperiences = sortExperiences(state.context.experiences);

  const progress = projectProgress(state.context);
  const isProjectComplete = progress === 100;

  const projectButtonHandler = () =>
    isValidated
      ? send("SUBMIT_PROJECT")
      : progress === 100
      ? send("VALIDATE_PROJECT")
      : send("OPEN_HELP");

  const EditCertification = () => (
    <div className="bg-slate-900 rounded-xl overflow-hidden mt-6">
      <div className={`mt-5 mr-6 text-white text-right font-bold grow `}>
        {certification?.codeRncp}
      </div>
      {certification && (
        <img
          className=""
          alt=""
          role="presentation"
          style={{
            marginLeft: "-42px",
            marginTop: "-28px",
            height: "104px",
            width: "104px",
          }}
          src={certificationImg}
        />
      )}
      <div className="px-8 pb-6">
        <h2
          className={`font-medium text-white ${
            certification ? "text-2xl" : "mt-6 text-xl"
          }`}
          style={{ lineHeight: "1.1" }}
        >
          {certification?.label || "Mon diplôme"}
        </h2>
        {!isValidated && (
          <Button
            data-test="project-home-close-selected-certification"
            size="tiny"
            label={certification ? "Modifier" : "Choisir"}
            className="mt-4 text-slate-900 bg-white"
            onClick={() => send("CLOSE_SELECTED_CERTIFICATION")}
          />
        )}
      </div>
    </div>
  );

  const EditGoals = () => (
    <div className="rounded-xl pl-8 pr-6 py-6 bg-purple-100 text-purple-800">
      <h2 className="font-bold mb-2 text-xl">Mon objectif</h2>
      <ul className="mb-4 text-lg leading-tight">
        {selectedGoals.map((goal) => (
          <li className="mb-2" key={goal.id}>
            {goal.label}
          </li>
        ))}
      </ul>
      {!isValidated && (
        <Button
          data-test="project-home-edit-goals"
          size="tiny"
          label={selectedGoals.length > 0 ? "Modifier" : "Choisir"}
          className="text-white bg-purple-800"
          onClick={() => send("EDIT_GOALS")}
        />
      )}
    </div>
  );

  const EditExperiences = () => (
    <div className="rounded-xl px-8 py-6 bg-slate-100">
      <h2 className="font-bold text-slate-800 text-xl mb-4">Mes expériences</h2>
      {sortedExperiences.length > 0 && (
        <ul
          data-test="project-home-experiences"
          className="mb-2 pb-2 flex space-x-3 overflow-x-auto"
        >
          {sortedExperiences.map(ExperienceSummary)}
        </ul>
      )}
      <div className="text-sm text-slate-400">
        {!isValidated && (
          <Button
            data-test="project-home-edit-experiences"
            onClick={() => send("EDIT_EXPERIENCES")}
            size="tiny"
            label={sortedExperiences.length > 0 ? "Modifier" : "Ajouter"}
          />
        )}
      </div>
    </div>
  );

  const EditContact = () => (
    <div className="rounded-xl px-8 py-6 bg-neutral-100">
      <h2 className="font-bold text-slate-800 text-xl mb-4">Mon contact</h2>
      {state.context.contact?.phone && (
        <p data-test="project-home-contact-phone" className="mt-2">
          {state.context.contact?.phone}
        </p>
      )}
      {state.context.contact?.email && (
        <p data-test="project-home-contact-email" className="mt-2">
          {state.context.contact?.email}
        </p>
      )}
      <div className="mt-4 text-sm text-slate-400">
        {!isValidated && (
          <Button
            data-test="project-home-edit-contact"
            onClick={() => send("EDIT_CONTACT")}
            size="tiny"
            label={
              state.context.contact &&
              (state.context.contact?.phone !== "" ||
                state.context.contact?.email !== "")
                ? "Modifer"
                : "Ajouter"
            }
          />
        )}
      </div>
    </div>
  );

  const EditOrganism = () => (
    <div className="rounded-xl px-8 py-6 bg-neutral-100">
      <h2 className="font-bold text-slate-800 text-xl mb-4">
        Mon architecte de parcours
      </h2>
      {state.context.organism?.label && (
        <h3
          data-test="project-home-organism-label"
          className="font-bold text-slate-800 text-xl mb-4"
        >
          {state.context.organism?.label}
        </h3>
      )}
      <address className="text-gray-600 leading-relaxed">
        {state.context.organism?.address && (
          <p data-test="project-home-organism-address">
            {state.context.organism?.address}
          </p>
        )}
        {state.context.organism?.zip && state.context.organism?.city && (
          <p data-test="project-home-organism-address">
            {state.context.organism?.zip} {state.context.organism?.city}
          </p>
        )}
        {state.context.organism?.contactAdministrativeEmail && (
          <p data-test="project-home-organism-email">
            {state.context.organism?.contactAdministrativeEmail}
          </p>
        )}
      </address>
      <div className="mt-4 text-sm text-slate-400">
        {!isValidated && (
          <Button
            data-test="project-home-edit-organism"
            onClick={() => send("EDIT_ORGANISM")}
            size="tiny"
            label={state.context.organism ? "Modifer" : "Ajouter"}
          />
        )}
      </div>
    </div>
  );

  const retryErrorScreen = (
    <motion.div
      data-test="project-home-error"
      key="project-home-error"
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="absolute w-full flex flex-col bg-neutral-100 h-full"
    >
      <div className="grow flex flex-col text-center items-center justify-center px-10">
        <Header label="Oups..." size="small" />
        <p>{state.context.error}</p>
        <div className="mt-8">
          <Button
            data-test="submission-home-retry-candidate"
            size="small"
            label="Réessayer"
            onClick={() =>
              send({
                type: "SUBMIT_CERTIFICATION",
                certification,
              })
            }
          />
        </div>
      </div>
    </motion.div>
  );

  const loadingScreen = (
    <motion.div
      data-test="project-home-loading"
      key="project-home-loading"
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="absolute w-full h-full flex flex-col bg-neutral-100"
    >
      <div className="grow flex flex-col text-center items-center justify-center px-10">
        <Header label="Création de votre compte" size="small" />
        <div className="mt-8 w-8">
          <Loader />
        </div>
      </div>
    </motion.div>
  );

  const homeScreen = (
    <motion.div
      data-test="project-home-ready"
      key="project-home-ready"
      className="flex flex-col w-full h-full relative overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
    >
      <div className="px-8 grow overflow-y-auto py-8">
        <h1 className="text-center font-bold text-lg">Reva</h1>
        <Header label="Bienvenue" />
        <p className="my-4 pr-6 text-slate-600 text-lg">
          Reva est une expérimentation visant à simplifier la Validation des
          Acquis de l'Expérience (VAE). Vous avez une expérience dans les
          secteurs de la dépendance et de la santé ? Choisissez votre diplôme et
          laissez-vous accompagner !
        </p>
        {isValidated ? (
          <SubmissionWarning />
        ) : (
          <ProgressTitle progress={progress} size="large" title="Projet" />
        )}
        <div className="space-y-4">
          <EditCertification />
          <EditGoals />
          <EditExperiences />
          <EditContact />
          <EditOrganism />
        </div>
      </div>
      <div className="bg-white flex flex-col items-center pt-4 pb-12 sm:pb-4">
        <Button
          data-test={`project-home-${isValidated ? "submit" : "validate"}${
            !isProjectComplete ? "-locked" : ""
          }`}
          locked={!isProjectComplete}
          onClick={projectButtonHandler}
          type="submit"
          loading={state.matches("projectHome.submitting")}
          label={isValidated ? "Transmettre" : "Valider"}
          primary={isValidated}
          size="medium"
        />
      </div>
    </motion.div>
  );

  return (
    <Page
      className={`z-[${isValidated ? 70 : 60}] h-full flex flex-col bg-white`}
      direction={state.context.direction}
    >
      <AnimatePresence>
        {state.matches({ projectHome: "loading" }) && loadingScreen}
        {state.matches({ projectHome: "retry" }) && retryErrorScreen}
        {isHomeReady && homeScreen}
      </AnimatePresence>
    </Page>
  );
};
