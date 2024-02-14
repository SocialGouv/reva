"use client";
import { useCertificationQueries } from "@/app/(admin)/certifications/[certificationId]/certificationQueries";
import { useParams, useRouter } from "next/navigation";
import { PageTitle } from "@/components/page/page-title/PageTitle";
import Link from "next/link";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import UpdateOrReplaceCertificationForm, {
  UpdateOrReplaceCertificationFormData,
} from "@/app/(admin)/certifications/[certificationId]/_components/UpdateOrReplaceCertificationForm";
import { Certification } from "@/graphql/generated/graphql";
import { parse } from "date-fns";

const UpdateCertificationPage = () => {
  const { certificationId } = useParams<{ certificationId: string }>();
  const router = useRouter();

  const {
    certification,
    typeDiplomes,
    degrees,
    domaines,
    conventionCollectives,
    certificationAuthorityTags,
    updateCertification,
  } = useCertificationQueries({
    certificationId,
  });

  const handleFormSubmit = async (
    data: UpdateOrReplaceCertificationFormData,
  ) => {
    try {
      await updateCertification.mutateAsync({
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

      successToast("Certification enregistrée");
      router.push(`/certifications/${certificationId}`);
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
            <Link
              href={`/certifications/${certificationId}`}
              className="fr-icon-arrow-left-line fr-link--icon-left text-blue-900 text-lg mr-auto mb-8"
            >
              Retour
            </Link>
            <PageTitle> Modifier une certification</PageTitle>
            <p>
              Sauf mention contraire “(optionnel)” dans le label, tous les
              champs sont obligatoires.
            </p>
            <br />
            <UpdateOrReplaceCertificationForm
              certification={certification as Certification}
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

export default UpdateCertificationPage;
