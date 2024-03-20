"use client";
import { useCertificationQueries } from "@/app/(admin)/certifications/[certificationId]/certificationQueries";
import { useParams, useRouter } from "next/navigation";
import { PageTitle } from "@/components/page/page-title/PageTitle";
import Link from "next/link";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import UpdateCompetenceBlocsForm from "@/app/(admin)/certifications/[certificationId]/_components/UpdateCompetenceBlocsForm";
import { CompetenceBlocInput } from "@/graphql/generated/graphql";

const UpdateCertificationPage = () => {
  const { certificationId } = useParams<{ certificationId: string }>();
  const router = useRouter();

  const { certification, updateCompetenceBlocsByCertificationId } =
    useCertificationQueries({
      certificationId,
    });

  const handleFormSubmit = async (blocs: CompetenceBlocInput[]) => {
    try {
      await updateCompetenceBlocsByCertificationId.mutateAsync({
        blocs,
      });

      successToast("Blocs enregistrés");
      router.push(`/certifications/${certificationId}`);
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {certification && (
        <>
          <Link
            href={`/certifications/${certificationId}`}
            className="fr-icon-arrow-left-line fr-link--icon-left text-blue-900 text-lg mr-auto mb-8"
          >
            Retour
          </Link>
          <PageTitle>Modifier les blocs de compétence</PageTitle>

          <br />
          <UpdateCompetenceBlocsForm
            blocs={certification.competenceBlocs}
            onSubmit={handleFormSubmit}
          />
        </>
      )}
    </div>
  );
};

export default UpdateCertificationPage;
