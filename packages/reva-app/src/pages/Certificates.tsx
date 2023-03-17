import { Select } from "@codegouvfr/react-dsfr/Select";
import { useActor } from "@xstate/react";
import { ErrorAlertFromState } from "components/molecules/ErrorAlertFromState/ErrorAlertFromState";
import { useState } from "react";
import { Interpreter } from "xstate";

import { BackToHomeButton } from "../components/molecules/BackToHomeButton/BackToHomeButton";
import { NameBadge } from "../components/molecules/NameBadge/NameBadge";
import { Card, CardSkeleton } from "../components/organisms/Card";
import { Page } from "../components/organisms/Page";
import { Results } from "../components/organisms/Results";
import { Certification } from "../interface";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";

interface Props {
  mainService: Interpreter<MainContext, any, MainEvent, MainState, any>;
}

export const Certificates = ({ mainService }: Props) => {
  const [state, send] = useActor(mainService);
  const UNKNOWN_DEPARTMENT = "unknown";

  const [chosenDepartmentCode, setChosenDepartmentCode] = useState(
    state.context.selectedDepartment?.code || UNKNOWN_DEPARTMENT
  );

  const selectsOptionsDepartments: { label: string; value: string }[] =
    state.context.departments
      .map((r) => ({
        label: r.label,
        value: r.code,
      }))
      .sort((a, b) => new Intl.Collator("fr").compare(a.label, b.label));

  const CertificateCard = (certification: Certification) => {
    return (
      <Card
        onClick={() =>
          !state.matches({
            certificateSummary: "submittingSelectedCertification",
          }) && send({ type: "SUBMIT_CERTIFICATION", certification })
        }
        key={certification.id}
        // isSelectable={state.matches("searchResults")}
        id={certification.id}
        title={certification.label}
        codeRncp={certification.codeRncp}
      />
    );
  };

  const displayCards = () => {
    if (state.matches("searchResultsError")) {
      return <ErrorAlertFromState />;
    }
    if (state.matches("loadingCertifications")) {
      return [1, 2, 3, 4, 5].map((i) => <CardSkeleton key={`skeleton-${i}`} />);
    }
    return state.context.certifications
      .filter((certif) => certif.status !== "INACTIVE")
      .map(CertificateCard)
      .map((el) => <li>{el}</li>);
  };

  return (
    <Page
      data-test="certificates"
      title="choix de votre diplôme"
      direction={state.context.direction}
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
          defaultValue: state.context.selectedDepartment?.code,
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
        <option value="unknown" disabled={true} hidden={true}>
          Mon département
        </option>
        {selectsOptionsDepartments.map((d) => (
          <option key={d.value} value={d.value}>
            {d.label}
          </option>
        ))}
      </Select>
      {(chosenDepartmentCode !== UNKNOWN_DEPARTMENT ||
        !!state.context.selectedDepartment) && (
        <div>
          <Results
            title=""
            listClassName="flex flex-wrap justify-center lg:justify-start items-center mb-4 gap-4"
          >
            {displayCards()}
          </Results>
        </div>
      )}
    </Page>
  );
};
