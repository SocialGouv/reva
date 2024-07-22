import { redirect } from "next/navigation";
import { isFeatureActive } from "@/utils/getActiveFeatures";
import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";
import { getCandidacy } from "@/app/home.loaders";
import CertificationSearchBar from "./(components)/CertificationSearchBar";
import SelectCertificationDepartment from "./(components)/SelectCertificationDepartment";
import { getDepartments } from "@/components/select-department/SelectDepartment.loaders";
import CertificationResults from "./(components)/CertificationResults";
import { Suspense } from "react";
import CertificationsSkeleton from "./(components)/CertificationsSkeleton";

export default async function SetCertification({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const urlSearchParams = new URLSearchParams(searchParams);
  const searchFilter = urlSearchParams.get("search") || "";
  const selectedCertificationId = urlSearchParams.get("certificationId");

  const financementHorsPlateformeFeatureActive = await isFeatureActive(
    "FINANCEMENT_HORS_PLATEFORME",
  );
  const { canEditCandidacy, candidate } = await getCandidacy();

  if (!canEditCandidacy) {
    redirect("/");
  }

  const departments = await getDepartments();

  let searchParamsWithoutPage = {};
  urlSearchParams.forEach((value, key) => {
    if (key.toLowerCase() !== "page") {
      searchParamsWithoutPage = { ...searchParamsWithoutPage, [key]: value };
    }
  });

  const searchParamsWithoutCertification = new URLSearchParams(urlSearchParams);
  searchParamsWithoutCertification.delete("certificationId");

  return (
    <>
      {!selectedCertificationId && (
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
        </>
      )}

      <Suspense fallback={<CertificationsSkeleton />}>
        <CertificationResults
          candidateDepartmentId={candidate.department.id}
          candidacyId={candidate.candidacy.id}
          financementHorsPlateformeFeatureActive={
            financementHorsPlateformeFeatureActive
          }
          searchParams={searchParams}
        />
      </Suspense>
    </>
  );
}
