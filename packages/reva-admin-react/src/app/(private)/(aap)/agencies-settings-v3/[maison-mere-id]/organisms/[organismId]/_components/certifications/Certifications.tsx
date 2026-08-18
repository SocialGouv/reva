"use client";

import Accordion from "@codegouvfr/react-dsfr/Accordion";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Pagination } from "@codegouvfr/react-dsfr/Pagination";
import SearchBar from "@codegouvfr/react-dsfr/SearchBar";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { useRouter, useSearchParams } from "next/navigation";

import { Formacode, useCertifications } from "./certifications.hook";

const getDomainFromSubDomains = (
  formacodes: Formacode[],
  subDomains: Formacode[],
): Formacode[] => {
  return subDomains.reduce((acc, subDomain) => {
    const domain = formacodes.find(
      (formacode) => formacode.code === subDomain.parentCode,
    );
    if (domain && !acc.some((formacode) => formacode.code === domain.code)) {
      acc.push(domain);
    }
    return acc;
  }, [] as Formacode[]);
};

export const Certifications = ({ organismId }: { organismId: string }) => {
  const router = useRouter();

  const {
    formacodes,
    degrees,
    organism,
    activeCertifications,
    organismAndReferentialStatus,
  } = useCertifications({ organismId });

  const searchParams = useSearchParams();

  // Pagination
  const searchParamsPage = searchParams.get("page");
  const currentPage = searchParamsPage ? Number(searchParamsPage) : 1;

  // View mode
  const searchParamsViewMode = searchParams.get("viewMode");

  const viewMode = searchParamsViewMode || "organism";
  const setViewMode = (viewMode: "reva" | "organism") => {
    const url = new URL(window.location.href);
    url.searchParams.set("page", "1");
    url.searchParams.set("viewMode", viewMode);
    router.push(url.toString());
  };

  // Levels filter
  const searchParamsLevelsFilter = searchParams.get("levelsFilter");
  const levelsFilter = searchParamsLevelsFilter
    ? searchParamsLevelsFilter.split(",").map(Number)
    : [];

  const setLevelsFilter = (levelsFilter: number[]) => {
    const url = new URL(window.location.href);
    url.searchParams.set("page", "1");
    url.searchParams.set("levelsFilter", levelsFilter.join(","));
    router.push(url.toString());
  };

  const toggleLevelFilter = (level: number) => {
    const filteredLevels = levelsFilter.includes(level)
      ? levelsFilter.filter((id) => id !== level)
      : [...levelsFilter, level];
    setLevelsFilter(filteredLevels);
  };

  // Certification search filter
  const searchParamsCertificationSearchFilter = searchParams.get(
    "certificationSearchFilter",
  );
  const certificationSearchFilter = searchParamsCertificationSearchFilter || "";
  const setCertificationSearchFilter = (certificationSearchFilter: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("page", "1");
    url.searchParams.set(
      "certificationSearchFilter",
      certificationSearchFilter,
    );
    router.push(url.toString());
  };

  const certificationSearchFilters = certificationSearchFilter
    .split(" ")
    .filter((filter) => filter.length > 0);

  // Formacode search filter
  const searchParamsFormacodeSearchFilter = searchParams.get(
    "formacodeSearchFilter",
  );
  const formacodeSearchFilter = searchParamsFormacodeSearchFilter || "";
  const setFormacodeSearchFilter = (formacodeSearchFilter: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("page", "1");
    url.searchParams.set("formacodeSearchFilter", formacodeSearchFilter);
    router.push(url.toString());
  };

  const formacodeSearchFilters = formacodeSearchFilter
    .split(" ")
    .filter((filter) => filter.length > 0);

  let certifications =
    (viewMode === "reva" ? activeCertifications : organism?.certifications) ||
    [];

  if (levelsFilter.length > 0) {
    certifications = certifications.filter((certification) =>
      levelsFilter.includes(certification.level),
    );
  }

  if (certificationSearchFilters.length > 0) {
    certifications = certifications.filter((certification) =>
      certificationSearchFilters.some(
        (filter) =>
          certification.codeRncp.toLowerCase().includes(filter.toLowerCase()) ||
          certification.label.toLowerCase().includes(filter.toLowerCase()),
      ),
    );
  }

  if (formacodeSearchFilters.length > 0) {
    certifications = certifications.filter((certification) =>
      getDomainFromSubDomains(formacodes, certification.formacodes).some(
        (formacode) =>
          formacodeSearchFilters.some(
            (filter) =>
              formacode.code.toLowerCase().includes(filter.toLowerCase()) ||
              formacode.label.toLowerCase().includes(filter.toLowerCase()),
          ),
      ),
    );
  }

  const totalCertifications = certifications.length;
  const totalPages = Math.ceil(totalCertifications / 10);

  certifications = certifications.slice(
    (currentPage - 1) * 10,
    currentPage * 10,
  );

  const isCertificationCovered = (certificationId: string) => {
    return organism?.certifications?.some((c) => c.id === certificationId);
  };

  return (
    <div className="flex flex-col flex-1">
      {organismAndReferentialStatus === "error" && (
        <Alert
          className="my-6"
          severity="error"
          title="Une erreur est survenue pendant la récupération des certifications."
        />
      )}

      {organismAndReferentialStatus === "success" && (
        <div className="flex flex-col gap-8 mt-6 flex-1">
          <SearchBar
            label="Rechercher code RNCP ou intitulé de certification"
            allowEmptySearch
            big
            onButtonClick={() =>
              setCertificationSearchFilter(certificationSearchFilter)
            }
            renderInput={({ className, id, placeholder, type }) => (
              <input
                className={className}
                id={id}
                placeholder={placeholder}
                type={type}
                defaultValue={certificationSearchFilter}
                onChange={(e) => setCertificationSearchFilter(e.target.value)}
              />
            )}
          />

          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-1">
              <div className="flex flex-col gap-4">
                <ToggleSwitch
                  label="Afficher les certifications couvertes uniquement"
                  labelPosition="left"
                  defaultChecked={viewMode === "organism"}
                  inputTitle="Activer"
                  onChange={(checked) =>
                    setViewMode(checked ? "organism" : "reva")
                  }
                />
                <hr className="p-1" />
                <Accordion label="Formacode" defaultExpanded={false}>
                  <Input
                    label="Champs sémantique"
                    nativeInputProps={{
                      defaultValue: formacodeSearchFilter,
                      onChange: (e) => setFormacodeSearchFilter(e.target.value),
                    }}
                  />
                </Accordion>
                <Accordion label="Niveau" defaultExpanded={false}>
                  <Checkbox
                    className="mt-0 mb-1 [&_.fr-label]:h-8"
                    orientation="vertical"
                    small
                    options={degrees.slice(2, degrees.length).map((od) => ({
                      label: od.level,
                      nativeInputProps: {
                        checked: levelsFilter.includes(od.level),
                        onChange: () => toggleLevelFilter(od.level),
                      },
                    }))}
                  />
                </Accordion>
                <Button
                  className="mx-auto"
                  type="button"
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set("page", "1");
                    url.searchParams.delete("levelsFilter");
                    url.searchParams.delete("formacodeSearchFilter");

                    router.push(url.toString());
                  }}
                  priority="tertiary"
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            </div>

            <div className="col-span-3 flex flex-col gap-4">
              <p className="m-0 text-sm text-light-text-mention-grey">{`Résultat : ${(currentPage - 1) * 10 + certifications.length} sur ${totalCertifications}`}</p>

              {certifications.map((certification) => (
                <div key={certification.id}>
                  <Card
                    classes={{
                      start: "pb-1 [&p]:p-0",
                      content: "pb-4",
                      desc: "mt-0",
                    }}
                    border
                    enlargeLink
                    horizontal
                    linkProps={{
                      href: `/certification-details/${certification.id}`,
                    }}
                    size="small"
                    title={certification.label}
                    titleAs="h3"
                    detail={<span>{`RNCP ${certification.codeRncp}`}</span>}
                    desc={
                      <span className="flex flex-col gap-2">
                        {certification.certificationAuthorityStructure?.label}

                        {!isCertificationCovered(certification.id) && (
                          <>
                            <span className="fr-text--sm m-0 text-light-text-mention-grey">
                              <span className="fr-icon-close-circle-fill fr-text--sm mr-2" />
                              Certification non couverte
                            </span>
                          </>
                        )}
                      </span>
                    }
                    start={
                      <ul className="fr-tags-group [&>li]:leading-none">
                        <li>
                          <Tag>Niveau {certification.level}</Tag>
                        </li>
                        {getDomainFromSubDomains(
                          formacodes,
                          certification.formacodes,
                        ).map((formacode) => (
                          <li key={formacode.id}>
                            <Tag>{`${formacode.code} ${formacode.label}`}</Tag>
                          </li>
                        ))}
                      </ul>
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              onClick={() => router.push("../")}
              priority="secondary"
            >
              Retour
            </Button>

            <Pagination
              count={totalPages}
              defaultPage={currentPage}
              getPageLinkProps={(pageNumber) => {
                return {
                  href: `./?page=${pageNumber}&viewMode=${viewMode}&formacodeSearchFilter=${formacodeSearchFilter}&levelsFilter=${levelsFilter.join(",")}&certificationSearchFilter=${certificationSearchFilter}`,
                };
              }}
              showFirstLast
            />

            <div />
          </div>
        </div>
      )}
    </div>
  );
};
