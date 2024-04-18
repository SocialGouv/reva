import { Pagination } from "@codegouvfr/react-dsfr/Pagination";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { useActor } from "@xstate/react";
import { ErrorAlertFromState } from "components/molecules/ErrorAlertFromState/ErrorAlertFromState";
import { SearchBar } from "components/molecules/SearchBar/SearchBar";
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
          }) && send({ type: "SELECT_CERTIFICATION", certification })
        }
        key={certification.id}
        id={certification.id}
        title={certification.label}
        codeRncp={certification.codeRncp}
      />
    );
  };

  const displayCards = () => {
    if (state.matches("loadingCertifications")) {
      return [1, 2, 3, 4, 5].map((i) => <CardSkeleton key={`skeleton-${i}`} />);
    }
    return state.context.certificationPage.rows
      .map(CertificateCard)
      .map((el) => <li>{el}</li>);
  };
  return (
    <Page
      className="max-w-2xl"
      data-test="certificates"
      title="Choix du diplôme"
    >
      <BackToHomeButton />
      <ErrorAlertFromState />
      <NameBadge as="h1" className="mt-4" />
      <h2 className="text-lg text-dsfrGray-500 font-bold mt-6">
        Nouveau parcours VAE - Choix du diplôme
      </h2>
      <p className=" text-sm">
        Sélectionnez le diplôme que vous voulez valider
      </p>
      <Select
        className="my-4"
        data-test="certificates-select-department"
        label="Département"
        nativeSelectProps={{
          name: "select_department",
          defaultValue: state.context.selectedDepartment?.code || "unknown",
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
          Votre département
        </option>
        {selectsOptionsDepartments.map((d) => (
          <option key={d.value} value={d.value}>
            {d.label}
          </option>
        ))}
      </Select>
      <SearchBar
        label="Rechercher un diplôme"
        className="mb-8"
        nativeInputProps={{
          defaultValue: state.context.certificationSearchText,
          onChange: (e) => {
            send({
              type: "SET_CERTIFICATION_SEARCH_TEXT",
              certificationSearchText: e.target.value,
            });
          },
        }}
      />
      <p role="status">
        {chosenDepartmentCode !== UNKNOWN_DEPARTMENT ||
        !!state.context.selectedDepartment
          ? `Nombre de diplômes disponibles pour le département ${
              selectsOptionsDepartments.find(
                (o) => o.value === chosenDepartmentCode
              )?.label
            } : ${state.context.certificationPage.info.totalRows}`
          : null}
      </p>
      {(chosenDepartmentCode !== UNKNOWN_DEPARTMENT ||
        !!state.context.selectedDepartment) && (
        <div id="results">
          <Results
            title=""
            listClassName="flex flex-wrap justify-center lg:justify-start items-center mb-4 gap-4"
          >
            {displayCards()}
          </Results>
          <Pagination
            className="mt-8"
            count={state.context.certificationPage.info.totalPages}
            defaultPage={state.context.certificationPage.info.currentPage}
            getPageLinkProps={(page) => ({
              href: "#",
              "aria-label": `page ${page}`,
              onClick: () => {
                send({
                  type: "SET_CURRENT_CERTIFICATION_PAGE_NUMBER",
                  pageNumber: page,
                });
                document.getElementById("main-scroll")?.scrollTo({ top: 0 });
              },
            })}
          />
        </div>
      )}
    </Page>
  );
};
