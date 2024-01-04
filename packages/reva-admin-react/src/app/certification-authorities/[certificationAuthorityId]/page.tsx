"use client";
import { useCertificationAuthorityPageLogic } from "@/app/certification-authorities/[certificationAuthorityId]/certificationAuthorityPageLogic";
import { TreeSelect } from "@/components/tree-select";
import Button from "@codegouvfr/react-dsfr/Button";
import Link from "next/link";

const CertificationAuthorityPage = () => {
  const {
    certificationAuthority,
    certificationsController,
    regionsAndDeparmController,
    handleFormSubmit,
    toggleCertification,
    toggleAllCertifications,
    toggleRegionOrDepartment,
    toggleAllRegionsAndDepartments,
    isSubmitting,
  } = useCertificationAuthorityPageLogic();

  return (
    <div className="flex flex-col flex-1">
      <Link
        href="/certification-authorities"
        className="fr-icon-arrow-left-line fr-link--icon-left text-blue-900 text-lg mr-auto"
      >
        Tous les certificateurs
      </Link>
      {certificationAuthority && (
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold mt-8 mb-6">
            {certificationAuthority.label}
          </h1>
          <p className="text-xl mb-4">{certificationAuthority.contactEmail}</p>
          <form onSubmit={handleFormSubmit} className="flex flex-col">
            <fieldset className="mt-3 grid grid-cols-2 gap-x-8">
              <div className="flex flex-col gap-y-4 sm:gap-x-8">
                <legend className="text-2xl font-bold">
                  Zone d'intervention
                </legend>

                <TreeSelect
                  title="Cochez les régions ou départements gérés"
                  label="Toute la France"
                  items={regionsAndDeparmController.field.value || []}
                  onClickSelectAll={(selected) =>
                    toggleAllRegionsAndDepartments(selected)
                  }
                  onClickItem={(i) => toggleRegionOrDepartment(i.id)}
                />
              </div>

              <div className="flex flex-col gap-y-4 sm:gap-x-8">
                <legend className="text-2xl font-bold">
                  Certifications gérées
                </legend>

                <TreeSelect
                  title="Cochez les certifications gérées"
                  label="Toutes les certifications"
                  items={certificationsController.field.value || []}
                  onClickSelectAll={(selected) =>
                    toggleAllCertifications(selected)
                  }
                  onClickItem={(i) => toggleCertification(i.id)}
                />
              </div>
            </fieldset>
            <div className="flex flex-col md:flex-row gap-4 self-center md:self-end mt-10">
              <Button priority="secondary" type="reset">
                Annuler les modifications
              </Button>
              <Button disabled={isSubmitting}>Valider</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CertificationAuthorityPage;
