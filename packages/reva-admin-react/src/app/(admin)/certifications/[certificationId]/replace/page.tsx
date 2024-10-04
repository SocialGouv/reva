"use client";
import UpdateOrReplaceCertificationForm, {
  UpdateOrReplaceCertificationFormData,
} from "@/app/(admin)/certifications/[certificationId]/_components/UpdateOrReplaceCertificationForm";
import { useCertificationQueries } from "@/app/(admin)/certifications/[certificationId]/certificationQueries";
import { BackButton } from "@/components/back-button/BackButton";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { Certification } from "@/graphql/generated/graphql";
import { parse } from "date-fns";
import { useParams, useRouter } from "next/navigation";

const ReplaceCertificationPage = () => {
  const { certificationId } = useParams<{ certificationId: string }>();
  const router = useRouter();
  const {
    certification,
    typeDiplomes,
    degrees,
    domaines,
    conventionCollectives,
    replaceCertification,
  } = useCertificationQueries({
    certificationId,
  });

  const handleFormSubmit = async (
    data: UpdateOrReplaceCertificationFormData,
  ) => {
    try {
      const {
        referential_replaceCertification: { id: newCertificationId },
      } = await replaceCertification.mutateAsync({
        label: data.label,
        level: data.degreeLevel,
        codeRncp: data.codeRncp,
        typeDiplomeId: data.typeDiplomeId,
        domaineIds: data.domaineId ? [data.domaineId] : [],
        conventionCollectiveIds: data.conventionCollectiveId
          ? [data.conventionCollectiveId]
          : [],
        availableAt: parse(
          data.availableAt,
          "yyyy-MM-dd",
          new Date(),
        ).getTime(),
        expiresAt: parse(data.expiresAt, "yyyy-MM-dd", new Date()).getTime(),
      });

      successToast("Certification remplacée");
      router.push(`/certifications/${newCertificationId}`);
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {certification &&
        typeDiplomes &&
        domaines &&
        conventionCollectives &&
        degrees && (
          <>
            <BackButton href={`/certifications/${certificationId}`}>
              Retour
            </BackButton>
            <h1> Remplacer une certification</h1>
            <FormOptionalFieldsDisclaimer />
            <UpdateOrReplaceCertificationForm
              certification={
                { ...certification, codeRncp: "" } as Certification
              }
              typeDiplomes={typeDiplomes}
              domaines={domaines}
              conventionCollectives={conventionCollectives}
              degrees={degrees}
              onSubmit={handleFormSubmit}
            />
          </>
        )}
    </div>
  );
};

export default ReplaceCertificationPage;
