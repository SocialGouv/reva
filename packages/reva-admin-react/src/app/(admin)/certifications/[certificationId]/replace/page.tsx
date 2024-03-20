"use client";
import { useCertificationQueries } from "@/app/(admin)/certifications/[certificationId]/certificationQueries";
import { useParams, useRouter } from "next/navigation";
import { PageTitle } from "@/components/page/page-title/PageTitle";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import UpdateOrReplaceCertificationForm, {
  UpdateOrReplaceCertificationFormData,
} from "@/app/(admin)/certifications/[certificationId]/_components/UpdateOrReplaceCertificationForm";
import { Certification } from "@/graphql/generated/graphql";
import { parse } from "date-fns";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { BackButton } from "@/components/back-button/BackButton";

const ReplaceCertificationPage = () => {
  const { certificationId } = useParams<{ certificationId: string }>();
  const router = useRouter();
  const {
    certification,
    typeDiplomes,
    degrees,
    domaines,
    conventionCollectives,
    certificationAuthorityTags,
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
        certificationAuthorityTag: data.certificationAuthorityTag,
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
        degrees &&
        certificationAuthorityTags && (
          <>
            <BackButton href={`/certifications/${certificationId}`}>
              Retour
            </BackButton>
            <PageTitle> Remplacer une certification</PageTitle>
            <FormOptionalFieldsDisclaimer />
            <br />
            <UpdateOrReplaceCertificationForm
              certification={
                { ...certification, codeRncp: "" } as Certification
              }
              typeDiplomes={typeDiplomes}
              domaines={domaines}
              conventionCollectives={conventionCollectives}
              degrees={degrees}
              certificationAuthorityTags={certificationAuthorityTags}
              onSubmit={handleFormSubmit}
            />
          </>
        )}
    </div>
  );
};

export default ReplaceCertificationPage;
