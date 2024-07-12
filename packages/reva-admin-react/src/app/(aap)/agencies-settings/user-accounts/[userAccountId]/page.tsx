"use client";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";

const UpdateUserAccountPage = () => {
  return (
    <div className="w-full flex flex-col">
      <h1 className="mb-12">Ajout d’un compte collaborateur</h1>
      <FormOptionalFieldsDisclaimer />
      <p>
        Le collaborateur ajouté recevra un mail afin de créer son compte. Il
        pourra compléter et modifier les informations qui seront affichées aux
        candidats depuis son compte.
      </p>
    </div>
  );
};

export default UpdateUserAccountPage;
