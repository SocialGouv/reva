"use client";

import { useParams } from "next/navigation";

import { CandidacyBackButton } from "@/components/candidacy-back-button/CandidacyBackButton";
import { useAapDossierDeValidationPage } from "./aapDossierDeValidation.hooks";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { useCallback } from "react";
import { successToast, graphqlErrorToast } from "@/components/toast/toast";

const readyForJuryEstimatedAtSchema = z.object({
  readyForJuryEstimatedAt: z.string(),
});

type ReadyForJuryEstimatedAtSchemaFormData = z.infer<
  typeof readyForJuryEstimatedAtSchema
>;

const AapDossierDeValidationPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { candidacy, getCandidacyStatus, setReadyForJuryEstimatedAt } =
    useAapDossierDeValidationPage();

  const updateReadyForJuryEstimatedAt = async ({
    readyForJuryEstimatedAt,
  }: ReadyForJuryEstimatedAtSchemaFormData) => {
    try {
      await setReadyForJuryEstimatedAt.mutateAsync({
        readyForJuryEstimatedAt: parse(
          readyForJuryEstimatedAt,
          "yyyy-MM-dd",
          new Date(),
        ).getTime(),
      });
      successToast("modifications enregistrées");
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <CandidacyBackButton candidacyId={candidacyId} />
      <h1 className="mb-0">Dossier de validation</h1>

      {getCandidacyStatus === "success" && (
        <Tabs
          tabs={[
            {
              label: "Date prévisionnelle",
              isDefault: !candidacy?.readyForJuryEstimatedAt,
              content: (
                <ReadyForJuryEstimatedDateTab
                  readyForJuryEstimatedAt={
                    candidacy?.readyForJuryEstimatedAt || undefined
                  }
                  onFormSubmit={updateReadyForJuryEstimatedAt}
                />
              ),
            },
            {
              label: "Dossier",
              isDefault: !!candidacy?.readyForJuryEstimatedAt,
              content: <DossierDeValidationTab />,
            },
          ]}
        />
      )}
    </div>
  );
};

const ReadyForJuryEstimatedDateTab = ({
  readyForJuryEstimatedAt,
  onFormSubmit,
}: {
  readyForJuryEstimatedAt?: number;
  onFormSubmit: (data: ReadyForJuryEstimatedAtSchemaFormData) => Promise<void>;
}) => {
  const {
    register,
    reset,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = useForm<ReadyForJuryEstimatedAtSchemaFormData>({
    resolver: zodResolver(readyForJuryEstimatedAtSchema),
    defaultValues: {
      readyForJuryEstimatedAt: format(
        new Date(readyForJuryEstimatedAt || ""),
        "yyyy-MM-dd",
      ),
    },
  });

  const handleReset = useCallback(() => {
    reset({
      readyForJuryEstimatedAt: format(
        new Date(readyForJuryEstimatedAt || ""),
        "yyyy-MM-dd",
      ),
    });
  }, [readyForJuryEstimatedAt, reset]);

  const handleFormSubmit = handleSubmit(onFormSubmit);

  return (
    <form
      className="flex flex-col overflow-auto"
      onSubmit={handleFormSubmit}
      onReset={(e) => {
        e.preventDefault();
        handleReset();
      }}
    >
      <p>
        Sauf mention contraire “(optionnel)” dans le label, tous les champs sont
        obligatoires.
      </p>
      <p>La date prévisionnelle correspond :</p>
      <ul className="mt-0">
        <li>
          à la date à laquelle le candidat aura finalisé son dossier de
          validation pour les certifications du Ministère du Travail et des
          Branches Professionnelles
        </li>
        <li>
          à la date de dépôt du dossier de validation pour les autres
          certifications
        </li>
      </ul>
      <br />
      <Input
        className="max-w-xs"
        label="Date prévisonnelle"
        hintText="Date au format 31/12/2022"
        nativeInputProps={{
          type: "date",
          ...register("readyForJuryEstimatedAt"),
        }}
      />
      <FormButtons formState={{ isDirty, isSubmitting }} />
    </form>
  );
};

const DossierDeValidationTab = () => {
  return <div className="flex flex-col flex-1 mb-2 overflow-auto"></div>;
};

export default AapDossierDeValidationPage;
