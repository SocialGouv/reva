import Link from "next/link";
import { redirect } from "next/navigation";
import Button from "@codegouvfr/react-dsfr/Button";
import { Notice } from "@codegouvfr/react-dsfr/Notice";
import { PageLayout } from "@/layouts/page.layout";
import { isFeatureActive } from "@/utils/getActiveFeatures";
import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";
import { Pagination } from "@/components/pagination/Pagination";
import { Results } from "@/components/legacy/organisms/Results";
import { getCandidacy } from "@/app/home.loaders";
import { searchCertifications } from "./set-certification.loaders";
import CertificationSearchBar from "./(components)/CertificationSearchBar";
import CertificationResultCard from "./(components)/CertificationResultCard";
import SelectCertificationDepartment from "./(components)/SelectCertificationDepartment";
import { getDepartments } from "@/components/select-department/SelectDepartment.loaders";
import { updateCertification } from "./set-certification.actions";
import SubmitButton from "@/components/forms/SubmitButton";

export default async function SetCertification({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const urlSearchParams = new URLSearchParams(searchParams);
  const page = urlSearchParams.get("page");
  const departmentId = urlSearchParams.get("departmentId");
  const searchFilter = urlSearchParams.get("search") || "";
  const selectedCertificationId = urlSearchParams.get("certificationId");
  const currentPage = page ? Number.parseInt(page) : 1;

  const financementHorsPlateformeFeatureActive = await isFeatureActive(
    "FINANCEMENT_HORS_PLATEFORME",
  );
  const { canEditCandidacy, candidate } = await getCandidacy();

  if (!canEditCandidacy) {
    redirect("/");
  }

  const departments = await getDepartments();
  const searchCertificationsForCandidate = await searchCertifications({
    departmentId: departmentId || candidate.department.id || "",
    searchText: searchFilter,
    currentPage,
  });

  let searchParamsWithoutPage = {};
  urlSearchParams.forEach((value, key) => {
    if (key.toLowerCase() !== "page") {
      searchParamsWithoutPage = { ...searchParamsWithoutPage, [key]: value };
    }
  });

  const searchParamsWithoutCertification = new URLSearchParams(urlSearchParams);
  searchParamsWithoutCertification.delete("certificationId")

  const info = searchCertificationsForCandidate.info;
  const rows = searchCertificationsForCandidate.rows;
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

          <SelectCertificationDepartment
            departments={departments}
            defaultValue={candidate.department.id}
          />
          <CertificationSearchBar searchFilter={searchFilter} />

          <div id="results" className="flex flex-col justify-center">
            <Results
              title=""
              listClassName="flex flex-wrap justify-center lg:justify-start items-center mb-4 gap-4"
            >
              <CertificationResultCard rows={rows} />
            </Results>

            {info && (
              <Pagination
                totalPages={info.totalPages}
                currentPage={currentPage}
                baseHref={"/set-certification/"}
                className="mx-auto"
                baseParams={searchParamsWithoutPage}
              />
            )}
          </div>
        </>
      )}

      {selectedCertification && (
        <form action={updateCertification}>
          <input
            type="hidden"
            name="certificationId"
            value={selectedCertification.id}
          />
          <input
            type="hidden"
            name="candidacyId"
            value={candidate.candidacy.id}
          />
          <input
            type="hidden"
            name="departmentId"
            value={departmentId || candidate.department.id}
          />
          <h2
            data-test="certification-label"
            className="mt-6 mb-2 text-2xl font-bold text-black "
          >
            {selectedCertification.label}
          </h2>
          <p data-test="certification-code-rncp" className="text-xs mb-3">
            Code RNCP: {selectedCertification.codeRncp}
          </p>

          {financementHorsPlateformeFeatureActive &&
            selectedCertification.financeModule === "hors_plateforme" && (
              <Notice
                className="mt-2 mb-3"
                title={
                  <span>
                    <p className="mb-4">
                      Ce diplôme peut être financé par les dispositifs comme Mon
                      Compte Formation, l’aide des régions, l’aide de France
                      Travail.
                    </p>
                    <p className="mb-4">
                      Votre accompagnateur explorera avec vous les dispositifs
                      de financement dont vous pouvez bénéficier. Il vous
                      indiquera les démarches nécessaires et, le cas échéant,
                      vous accompagnera pour les réaliser.
                    </p>
                    <p>
                      Pour information, le coût moyen constaté d’un parcours est
                      de 2516€.
                    </p>
                  </span>
                }
              />
            )}
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
            <SubmitButton
              className="justify-center w-[100%]  md:w-fit"
              data-test="submit-certification-button"
              label="Choisir ce diplôme"
            />
            <Button
              priority="secondary"
              className="justify-center w-[100%] p-0 md:w-fit"
            >
              <Link
                className="px-4 py-2"
                href={`/set-certification/?${searchParamsWithoutCertification.toString()}`}
              >
                Retour
              </Link>
            </Button>
          </div>
        </form>
      )}
    </PageLayout>
  );
}
