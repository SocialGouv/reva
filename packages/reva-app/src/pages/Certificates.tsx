import { Select } from "@codegouvfr/react-dsfr/Select";
import { useActor } from "@xstate/react";
import { useEffect, useRef, useState } from "react";
import { Interpreter } from "xstate";

import { Button } from "../components/atoms/Button";
import { BackToHomeButton } from "../components/molecules/BackToHomeButton/BackToHomeButton";
import { NameBadge } from "../components/molecules/NameBadge/NameBadge";
import { Card } from "../components/organisms/Card";
import { CardSkeleton } from "../components/organisms/CardSkeleton";
import { Page } from "../components/organisms/Page";
import { Results } from "../components/organisms/Results";
import { Certification } from "../interface";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";

interface Props {
  mainService: Interpreter<MainContext, any, MainEvent, MainState, any>;
}

export const Certificates = ({ mainService }: Props) => {
  const [state, send] = useActor(mainService);

  const resultsElement = useRef<HTMLDivElement | null>(null);
  const currentCertificateElement = useRef<HTMLLIElement | null>(null);

  const [chosenDepartmentCode, setChosenDepartmentCode] = useState(
    state.context.selectedDepartment?.code
  );

  useEffect(() => {
    if (resultsElement.current && currentCertificateElement.current) {
      resultsElement.current.scrollTo(
        0,
        currentCertificateElement.current.offsetTop - 200
      );
    }
  }, []);

  const selectsOptionsDepartments: { label: string; value: string }[] =
    state.context.departments
      .map((r) => ({
        label: r.label,
        value: r.code,
      }))
      .sort((a, b) => new Intl.Collator("fr").compare(a.label, b.label));

  const CertificateCard = (certification: Certification) => {
    const isSelected =
      state.matches("certificateSummary") &&
      (state.context.certification as Certification).id === certification.id;

    return (
      <Card
        ref={isSelected ? currentCertificateElement : null}
        initialSize={
          isSelected && state.context.direction === "previous"
            ? "open"
            : "reduced"
        }
        onOpen={() => send({ type: "SELECT_CERTIFICATION", certification })}
        onLearnMore={() =>
          send({ type: "SHOW_CERTIFICATION_DETAILS", certification })
        }
        onClose={() => send("CLOSE_SELECTED_CERTIFICATION")}
        key={certification.id}
        isSelectable={state.matches("searchResults")}
        id={certification.id}
        title={certification.label}
        label={certification.codeRncp}
        summary={certification.summary}
        status={certification.status}
      />
    );
  };

  function candidateButton() {
    const isVisible = state.matches("certificateSummary");
    const certification = state.context.certification as Certification;
    return (
      <div
        className={`absolute bottom-0 z-50 inset-x-0 p-12 ${
          isVisible ? "bg-slate-900" : "transparent"
        }`}
      >
        {isVisible && (
          <Button
            data-test="certification-save"
            onClick={() =>
              send({
                type: "SUBMIT_CERTIFICATION",
                certification,
              })
            }
            loading={state.matches({ certificateSummary: "submittingChange" })}
            label={"Valider"}
            primary
            size="large"
          />
        )}
      </div>
    );
  }

  const displayCards = () => {
    if (state.matches("searchResultsError")) {
      return (
        <p key="error" className="text-red-600 mt-4 text-sm">
          {state.context.error}
        </p>
      );
    }
    if (state.matches("loadingCertifications")) {
      return [1, 2, 3, 4, 5].map((i) => (
        <CardSkeleton key={`skeleton-${i}`} size="small" />
      ));
    }

    return state.context.certifications
      .filter((certif) => certif.status !== "INACTIVE")
      .map(CertificateCard);
  };

  return (
    <Page
      data-test="certificates"
      direction={state.context.direction}
      className={
        state.matches("certificateSummary")
          ? "max-h-[800px] overflow-hidden"
          : ""
      }
    >
      <BackToHomeButton />
      <NameBadge className="mt-4" />
      <h1 className="text-lg text-dsfrGray-500 font-bold mt-6">
        Nouveau parcours VAE
      </h1>
      <Select
        className="my-4"
        data-test="certificates-select-department"
        label="Choix du diplôme"
        hint="Sélectionnez le diplôme que vous voulez valider"
        nativeSelectProps={{
          name: "select_department",
          defaultValue: chosenDepartmentCode,
          onChange: (e) => {
            const departmentCode = e.target.value;
            setChosenDepartmentCode(departmentCode);
            send({
              type: "SELECT_DEPARTMENT",
              departmentCode,
            });
          },
        }}
      >
        <option value="unknown" disabled={true} hidden={true} selected>
          Mon département
        </option>
        {selectsOptionsDepartments.map((d) => (
          <option key={d.value} value={d.value}>
            {d.label}
          </option>
        ))}
      </Select>
      {(!!chosenDepartmentCode || !!state.context.selectedDepartment) && (
        <div>
          <Results title="" listClassName="mb-4 space-y-8">
            {displayCards()}
          </Results>
        </div>
      )}
      {candidateButton()}
    </Page>
  );
};
