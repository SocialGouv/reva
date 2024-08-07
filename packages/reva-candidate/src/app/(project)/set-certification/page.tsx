"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  redirect,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import Button from "@codegouvfr/react-dsfr/Button";

import { PageLayout } from "@/layouts/page.layout";

import { useCandidacy } from "@/components/candidacy/candidacy.context";

import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";
import {
  DepartmentType,
  SelectDepartment,
} from "@/components/select-department/SelectDepartment.component";
import { Pagination } from "@/components/pagination/Pagination";
import { SearchBar } from "@/components/legacy/molecules/SearchBar/SearchBar";
import { Results } from "@/components/legacy/organisms/Results";
import { Card, CardSkeleton } from "@/components/legacy/organisms/Card";

import { useSetCertification } from "./set-certification.hooks";

export default function SetCertification() {
  const router = useRouter();

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const searchFilter = searchParams.get("search") || "";
  const currentPage = page ? Number.parseInt(page) : 1;

  const searchParamsWithoutPage = useMemo(() => {
    let params = {};
    searchParams.forEach((value, key) => {
      if (key.toLowerCase() !== "page") {
        params = { ...params, [key]: value };
      }
    });
    return params;
  }, [searchParams]);

  const { canEditCandidacy, candidate, refetch } = useCandidacy();

  const [department, setDepartment] = useState<DepartmentType | undefined>(
    candidate.department,
  );

  const { searchCertificationsForCandidate, updateCertification } =
    useSetCertification({
      departmentId: department?.id || "",
      searchText: searchFilter,
      currentPage,
    });

  const [selectedCertificationId, setSelectedCertificationId] = useState<
    string | undefined
  >();

  if (!canEditCandidacy) {
    redirect("/");
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await updateCertification.mutateAsync({
        candidacyId: candidate.candidacy.id,
        certificationId: selectedCertificationId!,
      });
      if (response) {
        refetch();

        router.push("/");
      }
    } catch (error) {}
  };

  const info =
    searchCertificationsForCandidate.data?.searchCertificationsForCandidate
      .info;

  const rows =
    searchCertificationsForCandidate.data?.searchCertificationsForCandidate
      .rows;

  const selectedCertification = rows?.find(
    (certification) => certification.id == selectedCertificationId,
  );

  return (
    <PageLayout
      title="Choix du diplôme"
      data-test={`certificates`}
      displayBackToHome
    >
      {!selectedCertification && (
        <>
          <h2 className="mt-6 mb-2">Nouveau parcours VAE - Choix du diplôme</h2>
          <FormOptionalFieldsDisclaimer
            className="mb-4"
            label="Sélectionnez le diplôme que vous voulez valider"
          />

          <SelectDepartment
            required
            departmentId={department?.id}
            onSelectDepartment={(department) => {
              setDepartment(department);
            }}
          />

          <SearchBar
            label="Rechercher un diplôme"
            className="mb-8"
            searchFilter={searchFilter}
            onSearchFilterChange={(filter) => {
              const queryParams = new URLSearchParams(searchParams);
              if (filter && queryParams.get("page")) {
                queryParams.set("page", "1");
                queryParams.set("search", filter);
              } else if (filter) {
                queryParams.set("search", filter);
              } else {
                queryParams.delete("search");
              }

              const path = `${pathname}?${queryParams.toString()}`;
              router.push(path);
            }}
          />

          <p className="mb-0" role="status">
            {department
              ? `Nombre de diplômes disponibles pour le département ${
                  department.label
                } : ${info?.totalRows}`
              : null}
          </p>

          <div id="results" className="flex flex-col justify-center">
            <Results
              title=""
              listClassName="flex flex-wrap justify-center lg:justify-start items-center mb-4 gap-4"
            >
              {searchCertificationsForCandidate.isLoading ||
              searchCertificationsForCandidate.isFetching
                ? [1, 2, 3, 4, 5].map((i) => (
                    <CardSkeleton key={`skeleton-${i}`} />
                  ))
                : rows?.map((certification) => (
                    <Card
                      key={certification.id}
                      id={certification.id}
                      title={certification.label}
                      codeRncp={certification.codeRncp}
                      onClick={() => {
                        setSelectedCertificationId(certification.id);
                      }}
                    />
                  ))}
            </Results>

            {info && (
              <Pagination
                totalPages={info.totalPages}
                currentPage={currentPage}
                baseHref={pathname}
                className="mx-auto"
                baseParams={searchParamsWithoutPage}
              />
            )}
          </div>
        </>
      )}

      {selectedCertification && (
        <form onSubmit={onSubmit}>
          <h2
            data-test="certification-label"
            className="mt-6 mb-2 text-2xl font-bold text-black "
          >
            {selectedCertification.label}
          </h2>
          <p data-test="certification-code-rncp" className="text-xs mb-3">
            Code RNCP: {selectedCertification.codeRncp}
          </p>
          <p>
            <a
              data-test="certification-more-info-link"
              target="_blank"
              rel="noreferrer"
              href={`https://www.francecompetences.fr/recherche/rncp/${selectedCertification.codeRncp}/`}
            >
              Lire les détails de la fiche diplôme
            </a>
          </p>

          <div className="flex flex-col md:flex-row gap-6 mt-6">
            <Button
              data-test="submit-certification-button"
              className="justify-center w-[100%]  md:w-fit"
              onClick={() => {
                console.log("do something");
              }}
            >
              Choisir ce diplôme
            </Button>
            <Button
              priority="secondary"
              className="justify-center w-[100%]  md:w-fit"
              onClick={() => setSelectedCertificationId(undefined)}
            >
              Retour
            </Button>
          </div>
        </form>
      )}
    </PageLayout>
  );
}
