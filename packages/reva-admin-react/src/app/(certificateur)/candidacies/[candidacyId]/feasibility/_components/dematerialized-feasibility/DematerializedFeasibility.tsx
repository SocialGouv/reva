import DffSummary from "@/app/(aap)/candidacies/[candidacyId]/feasibility-aap/_components/DffSummary/DffSummary";
import { DecisionSentComponent } from "@/components/alert-decision-sent-feasibility/DecisionSentComponent";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { useUrqlClient } from "@/components/urql-client";
import {
  Candidacy,
  DematerializedFeasibilityFile,
  FeasibilityDecision,
} from "@/graphql/generated/graphql";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import Input from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  createOrUpdateCertificationAuthorityDecision,
  useDematerializedFeasibility,
} from "./dematerializedFeasibility.hook";

const schema = z
  .object({
    decision: z.enum(["ADMISSIBLE", "INCOMPLETE", "REJECTED"]),
    decisionComment: z.string().optional(),
    decisionFile: z.object({
      0: z.instanceof(File, { message: "Merci de remplir ce champ" }),
    }),
  })
  .superRefine(({ decisionFile }, { addIssue }) => {
    if (!decisionFile?.[0]) {
      addIssue({
        path: ["decisionFile"],
        message: "Merci de remplir ce champ",
        code: z.ZodIssueCode.custom,
      });
    }
  });

type FormData = z.infer<typeof schema>;

export const DematerializedFeasibility = () => {
  const { candidacyId } = useParams<{ candidacyId: string }>();
  const { dematerializedFeasibilityFile, candidacy, feasibility } =
    useDematerializedFeasibility();
  const urqlClient = useUrqlClient();
  const decisionHasBeenMade = feasibility?.decision !== "PENDING";
  const queryClient = useQueryClient();

  const defaultValues = useMemo(
    () => ({
      decision: undefined,
      decisionComment: undefined,
      decisionFile: undefined,
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

  const resetForm = useCallback(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    resetForm();
  }, [resetForm]);

  const handleFormSubmit = async (data: FormData) => {
    const decisionFile = data.decisionFile?.[0];
    const input = {
      decisionFile,
      decision: data.decision,
      decisionComment: data.decisionComment,
    };

    try {
      const result = await urqlClient.mutation(
        createOrUpdateCertificationAuthorityDecision,
        {
          input,
          candidacyId,
        },
      );
      if (result?.error) {
        throw new Error(result?.error?.graphQLErrors[0].message);
      }
      successToast("Décision du dossier de faisability envoyée avec succès");
      queryClient.invalidateQueries({ queryKey: [candidacyId] });
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  if (!candidacy || !dematerializedFeasibilityFile) return null;

  const organism = candidacy.organism;

  return (
    <>
      <DffSummary
        dematerializedFeasibilityFile={
          dematerializedFeasibilityFile as DematerializedFeasibilityFile
        }
        candidacy={candidacy as Candidacy}
        HasBeenSentComponent={
          decisionHasBeenMade && (
            <DecisionSentComponent
              decisionSentAt={feasibility?.decisionSentAt as any as Date}
              decision={feasibility?.decision as FeasibilityDecision}
              decisionComment={feasibility?.decisionComment}
            />
          )
        }
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

      {!decisionHasBeenMade && (
        <>
          <hr className="mt-12 mb-11 pb-1" />
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            onReset={(e) => {
              e.preventDefault();
              resetForm();
            }}
          >
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
                      ...register("decision"),
                    },
                  },
                  {
                    label: "Je considère ce dossier incomplet ou incorrect",
                    hintText:
                      "Un dossier est incorrect ou incomplet s'il manque des éléments nécessaires à son traitement (tels que des pièces jointes ou des informations dans le document), si le dossier n'est pas le bon, s'il manque des éléments ou si les pièces jointes sont inexploitables, erronnées etc... Il sera renvoyé à l'AAP qui devra le compléter ou le corriger rapidement.",
                    nativeInputProps: {
                      value: "INCOMPLETE",
                      ...register("decision"),
                    },
                  },
                  {
                    label: "Je considère que ce dossier n'est pas recevable",
                    hintText:
                      "La non recevabilité d'un dossier ne peut être prononcée que sur un dossier complet ET pour lequel les activités du candidat ne semblent pas correspondre au référentiel de la certification (ou bloc) visée. Le candidat ne pourra plus demander de recevabilité sur cette certification durant l'année civile en cours.",
                    nativeInputProps: {
                      value: "REJECTED",
                      ...register("decision"),
                    },
                  },
                ]}
                state={errors.decision ? "error" : "default"}
                stateRelatedMessage={errors.decision?.message}
              />
              <Input
                hintText="(Optionnel)"
                label="Pouvez-vous préciser les motifs de votre décision ?"
                textArea
                nativeTextAreaProps={register("decisionComment")}
                state={errors.decisionComment ? "error" : "default"}
                stateRelatedMessage={errors.decisionComment?.message}
              />
              <SmallNotice className="mb-4">
                Ces motifs seront transmis au candidat ainsi qu'à son architecte
                accompagnateur de parcours.
              </SmallNotice>
              <Upload
                label="Joindre le courrier de recevabilité"
                hint="Ce courrier sera joint au message envoyé au candidat. L'architecte de parcours ne le recevra pas."
                nativeInputProps={{
                  required: true,
                  ...register("decisionFile"),
                  accept: ".pdf, .jpg, .jpeg, .png",
                }}
                state={errors.decisionFile ? "error" : "default"}
                stateRelatedMessage={
                  errors.decisionFile?.[0]?.message ??
                  "Text de validation / d'explication de l'erreur"
                }
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
        </>
      )}
    </>
  );
};
