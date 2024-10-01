"use client";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { ReadyForJuryEstimatedDateTab } from "./_components/tabs/ready-for-jury-estimated-date-tab/ReadyForJuryEstimatedAtTab";
import { useDossierDeValidationAutonomePage } from "./dossierDeValidationAutonome.hook";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { GraphQLError } from "graphql";
import Button from "@codegouvfr/react-dsfr/Button";

export default function DossierDeValidationAutonomePag() {
  const {
    readyForJuryEstimatedAt,
    updateReadyForJuryEstimatedAt,
    queryStatus,
  } = useDossierDeValidationAutonomePage();

  const handleSubmit = async ({
    readyForJuryEstimatedAt,
  }: {
    readyForJuryEstimatedAt: Date;
  }) => {
    try {
      await updateReadyForJuryEstimatedAt.mutateAsync({
        readyForJuryEstimatedAt,
      });
      successToast("Modifications enregistrées");
    } catch (error) {
      graphqlErrorToast(error as GraphQLError);
    }
  };
  return (
    <div className="flex flex-col">
      <h1>Dossier de validation</h1>
      <p>
        Renseignez les informations liées à votre dossier de validation puis
        déposez-le afin de la transmettre au certificateur.
      </p>
      {queryStatus === "success" && (
        <Tabs
          tabs={[
            {
              label: "Date prévisionnelle",
              isDefault: true,
              content: (
                <ReadyForJuryEstimatedDateTab
                  defaultValues={{
                    readyForJuryEstimatedAt: readyForJuryEstimatedAt
                      ? new Date(readyForJuryEstimatedAt)
                      : undefined,
                  }}
                  onSubmit={handleSubmit}
                />
              ),
            },
          ]}
        />
      )}
      <Button priority="tertiary" linkProps={{ href: "/" }} className="mt-12">
        Retour
      </Button>
    </div>
  );
}
