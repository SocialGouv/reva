import { PageLayout } from "@/layouts/page.layout";

import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";
import UpdateForm from "./(components)/UpdateForm";
import { getCandidacy } from "@/app/home.loaders";
import RscModal from "@/components/auth/modal/RscModal";


export default async function UpdateContact({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { candidate } = await getCandidacy();

  const showModal = !!searchParams["changeEmail"];

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
      {showModal && (
        <RscModal
          size="large"
          title="Votre demande de changement d'e-mail de connexion a bien été
              prise en compte"
          iconId="fr-icon-arrow-right-line"
        >
          <p className="my-4">
            Afin de valider ce changement, un e-mail d&apos;activation a été
            envoyé sur votre nouvelle adresse. Si vous ne trouvez pas notre
            e-mail, pensez à vérifier votre dossier de courriers indésirables
            (spams).
          </p>
        </RscModal>
      )}
    </PageLayout>
  );
}
