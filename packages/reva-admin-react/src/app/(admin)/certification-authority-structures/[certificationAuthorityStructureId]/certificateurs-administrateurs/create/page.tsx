"use client";
import { CertificationAuthorityStructureBreadcrumb } from "../../_components/certification-authority-structure-breadcrumb/CertificationAuthorityStructureBreadcrumb";
import { useCreateCertificationAuthorityPage } from "./createCertificationAuthority.hooks";

type CertificationAuthorityStructure = NonNullable<
  ReturnType<
    typeof useCreateCertificationAuthorityPage
  >["certificationAuthorityStructure"]
>;
const CreateCertificationAuthorityPageContent = ({
  certificationAuthorityStructure,
}: {
  certificationAuthorityStructure: CertificationAuthorityStructure;
}) => {
  return (
    <div className="flex flex-col flex-1">
      <CertificationAuthorityStructureBreadcrumb
        certificationAuthorityStructureId={certificationAuthorityStructure.id}
        certificationAuthorityStructureLabel={
          certificationAuthorityStructure.label
        }
        pageLabel="Ajouter un certificateur administrateur"
      />
      <h1>Ajouter un certificateur administrateur</h1>
      <p className="text-xl">
        Le certificateur administrateur bénéficie d’ un espace personnel sur la
        plateforme. Renseignez ses informations de connexion pour qu’il puisse
        commencer à travailler.
      </p>
      <div className="flex flex-col gap-y-6"></div>
    </div>
  );
};

const CreateCertificationAuthorityPage = () => {
  const {
    certificationAuthorityStructure,
    getCertificationAuthorityStructureStatus,
  } = useCreateCertificationAuthorityPage();

  if (
    !certificationAuthorityStructure ||
    getCertificationAuthorityStructureStatus !== "success"
  ) {
    return null;
  }

  return (
    <CreateCertificationAuthorityPageContent
      certificationAuthorityStructure={certificationAuthorityStructure}
    />
  );
};

export default CreateCertificationAuthorityPage;
