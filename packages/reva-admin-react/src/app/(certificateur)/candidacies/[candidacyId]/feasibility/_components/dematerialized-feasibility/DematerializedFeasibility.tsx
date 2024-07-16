import DffSummary from "@/app/(aap)/candidacies/[candidacyId]/feasibility-aap/_components/DffSummary/DffSummary";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import {
  Candidacy,
  DematerializedFeasibilityFile,
} from "@/graphql/generated/graphql";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import Input from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useDematerializedFeasibility } from "./dematerializedFeasibility.hook";

const schema = z
  .object({
    swornStatement: z.object({
      0: z.instanceof(File, { message: "Merci de remplir ce champ" }),
    }),
  })
  .superRefine(({ swornStatement }, { addIssue }) => {
    if (!swornStatement?.[0]) {
      addIssue({
        path: ["idCard"],
        message: "Merci de remplir ce champ",
        code: z.ZodIssueCode.custom,
      });
    }
  });

type FormData = z.infer<typeof schema>;

export const DematerializedFeasibility = () => {
  const { dematerializedFeasibilityFile, candidacy } =
    useDematerializedFeasibility();

  const resetFiles = useCallback(() => {}, []);

  useEffect(() => {
    resetFiles();
  }, [resetFiles]);

  const defaultValues = useMemo(
    () => ({
      swornStatement: undefined,
    }),
    [],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  if (!candidacy || !dematerializedFeasibilityFile) return null;

  const organism = candidacy.organism;

  return (
    <div>
      <DffSummary
        dematerializedFeasibilityFile={
          dematerializedFeasibilityFile as DematerializedFeasibilityFile
        }
        candidacy={candidacy as Candidacy}
      />

      {organism && (
        <CallOut title="Architecte accompagnateur de parcours en charge du dossier :">
          <div className="my-4 flex flex-col">
            <span>{organism.label}</span>
            <span>
              {organism.informationsCommerciales?.adresseCodePostal}{" "}
              {organism.informationsCommerciales?.adresseVille}
            </span>
            <span>{organism.informationsCommerciales?.telephone}</span>
            <span>{organism.informationsCommerciales?.emailContact}</span>
          </div>
        </CallOut>
      )}

      <hr className="mt-12 mb-11 pb-1" />
      <form>
        <div className="mb-12">
          <h2 className="mt-0">Votre décision concernant le dossier</h2>
          <RadioButtons
            legend="Sélectionnez et justifiez votre décision."
            name="decision"
            options={[
              {
                label: "Je considère ce dossier recevable",
                hintText: "",
                nativeInputProps: {
                  value: "ADMISSIBLE",
                },
              },
              {
                label: "Je considère ce dossier incomplet ou incorrect",
                hintText:
                  "Un dossier est incorrect ou incomplet s'il manque des éléments nécessaires à son traitement (tels que des pièces jointes ou des informations dans le document), si le dossier n'est pas le bon, s'il manque des éléments ou si les pièces jointes sont inexploitables, erronnées etc... Il sera renvoyé à l'AAP qui devra le compléter ou le corriger rapidement.",
                nativeInputProps: {
                  value: "INCOMPLETE",
                },
              },
              {
                label: "Je considère que ce dossier n'est pas recevable",
                hintText:
                  "La non recevabilité d'un dossier ne peut être prononcée que sur un dossier complet ET pour lequel les activités du candidat ne semblent pas correspondre au référentiel de la certification (ou bloc) visée. Le candidat ne pourra plus demander de recevabilité sur cette certification durant l'année civile en cours.",
                nativeInputProps: {
                  value: "REJECTED",
                },
              },
            ]}
            state="default"
          />
          <Input
            hintText="(Optionnel)"
            label="Pouvez-vous préciser les motifs de votre décision ?"
            textArea
          />
          <SmallNotice className="mb-4">
            Ces motifs seront transmis au candidat ainsi qu'à son architecte
            accompagnateur de parcours.
          </SmallNotice>
          <Upload
            label="Joindre le courrier de recevabilité"
            hint="Ce courrier sera joint au message envoyé au candidat. L'architecte de parcours ne le recevra pas."
            state="default"
            stateRelatedMessage="Text de validation / d'explication de l'erreur"
          />
        </div>

        <FormButtons
          backUrl={"/candidacies/feasibilities"}
          formState={{
            isDirty,
            isSubmitting,
          }}
        />
      </form>
    </div>
  );
};
