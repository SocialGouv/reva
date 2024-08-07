"use client";
import UpdateCompetenceBlocsForm from "@/app/(admin)/certifications/[certificationId]/_components/UpdateCompetenceBlocsForm";
import { useCertificationQueries } from "@/app/(admin)/certifications/[certificationId]/certificationQueries";
import { BackButton } from "@/components/back-button/BackButton";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { CompetenceBlocInput } from "@/graphql/generated/graphql";
import { useParams, useRouter } from "next/navigation";

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
          <BackButton href={`/certifications/${certificationId}`}>
            Retour
          </BackButton>
          <h1>Modifier les blocs de compétence</h1>
          <UpdateCompetenceBlocsForm
            codeRncp={certification.codeRncp}
            blocs={certification.competenceBlocs}
            onSubmit={handleFormSubmit}
          />
        </>
      )}
    </div>
  );
};

export default UpdateCertificationPage;
