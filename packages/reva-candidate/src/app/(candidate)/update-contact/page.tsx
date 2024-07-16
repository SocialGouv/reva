import { PageLayout } from "@/layouts/page.layout";

import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";
import UpdateForm from "./(components)/UpdateForm";
import { getCandidacy } from "@/app/home.loaders";

export default async function UpdateContact() {
  const { candidate } = await getCandidacy();

  return (
    <PageLayout
      className="max-w-4xl"
      data-test={`project-update-contact`}
      displayBackToHome
    >
      <h2 className="mt-6 mb-2">Modifiez vos informations</h2>
      <FormOptionalFieldsDisclaimer
        className="mb-4"
        label="Tous les champs sont obligatoires."
      />

      <UpdateForm candidate={candidate} />
    </PageLayout>
  );
}
