import { Results } from "@/components/legacy/organisms/Results";
import { Pagination } from "@/components/pagination/Pagination";
import CertificationResultCard from "./CertificationResultCard";
import { searchCertifications } from "../set-certification.loaders";
import SubmitButton from "@/components/forms/SubmitButton";
import Button from "@codegouvfr/react-dsfr/Button";
import Link from "next/link";
import { updateCertification } from "../set-certification.actions";

export default async function CertificationResults({
  searchParams,
  candidateDepartmentId,
  candidacyId,
}: {
  searchParams: Record<string, string>;
  candidateDepartmentId: string;
  candidacyId: string;
}) {
  const urlSearchParams = new URLSearchParams(searchParams);
  const page = urlSearchParams.get("page");
  const searchFilter = urlSearchParams.get("search") || "";
  const departmentId = urlSearchParams.get("departmentId");
  const selectedCertificationId = urlSearchParams.get("certificationId");
  const currentPage = page ? Number.parseInt(page) : 1;

  const searchCertificationsForCandidate = await searchCertifications({
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
  searchParamsWithoutCertification.delete("certificationId");

  const info = searchCertificationsForCandidate.info;
  const rows = searchCertificationsForCandidate.rows;

  const selectedCertification = rows?.find(
    (certification) => certification.id == selectedCertificationId,
  );

  return (
    <>
      {!selectedCertification && (
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
      )}
      {selectedCertification && (
        <form action={updateCertification}>
          <input
            type="hidden"
            name="certificationId"
            value={selectedCertification.id}
          />
          <input type="hidden" name="candidacyId" value={candidacyId} />
          <input
            type="hidden"
            name="departmentId"
            value={departmentId || candidateDepartmentId}
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
    </>
  );
}
