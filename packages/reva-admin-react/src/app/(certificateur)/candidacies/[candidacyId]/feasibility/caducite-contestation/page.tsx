"use client";

import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { errorToast, successToast } from "@/components/toast/toast";
import { CertificationAuthorityContestationDecision } from "@/graphql/generated/graphql";
import { dateThresholdCandidacyIsCaduque } from "@/utils/dateThresholdCandidacyIsCaduque";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCaduciteContestation } from "./caduciteContestation.hook";

const schema = z.object({
  certificationAuthorityContestationDecision: z.enum(
    ["CADUCITE_CONFIRMED", "CADUCITE_INVALIDATED", "DECISION_PENDING"],
    {
      errorMap: () => ({ message: "Merci de sélectionner une décision" }),
    },
  ),
});

type CaduciteContestationFormData = z.infer<typeof schema>;

export default function CaduciteContestationPage() {
  const { candidacy, updateContestationCaduciteDecision } =
    useCaduciteContestation();

  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<CaduciteContestationFormData>({
    resolver: zodResolver(schema),
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    if (!data.certificationAuthorityContestationDecision) {
      errorToast("Merci de sélectionner une décision");
      return;
    }
    try {
      await updateContestationCaduciteDecision(
        data.certificationAuthorityContestationDecision as CertificationAuthorityContestationDecision,
      );
      successToast("La décision a été mise à jour avec succès");
      router.push(backUrl);
    } catch (error) {
      console.error(error);
    }
  });

  const handleReset = () => {
    reset({
      certificationAuthorityContestationDecision: "DECISION_PENDING",
    });
  };

  const pendingCaduciteContestation =
    candidacy?.candidacyContestationsCaducite?.find(
      (caducite) =>
        caducite?.certificationAuthorityContestationDecision ===
        "DECISION_PENDING",
    );

  if (!candidacy || !pendingCaduciteContestation) {
    return null;
  }

  const backUrl = `/candidacies/${candidacy.id}/feasibility`;

  return (
    <div>
      <Breadcrumb
        currentPageLabel="Lever la caducité"
        homeLinkProps={{
          href: "/candidacies",
        }}
        segments={[
          {
            label:
              candidacy.candidate?.firstname +
              " " +
              candidacy.candidate?.lastname,
            linkProps: {
              href: backUrl,
            },
          },
        ]}
      />
      <h1 className="mb-12">Contestation de la caducité </h1>
      <div>
        <p>
          Recevable depuis le :{" "}
          <span className="font-medium">
            {format(
              candidacy?.feasibility?.decisionSentAt as number,
              "dd/MM/yyyy",
            )}
          </span>
        </p>
        <div className="flex gap-8 mb-8">
          <p className="mb-0">
            Caducité depuis le :{" "}
            <span className="font-medium">
              {format(
                dateThresholdCandidacyIsCaduque(
                  candidacy?.lastActivityDate as number,
                ),
                "dd/MM/yyyy",
              )}
            </span>
          </p>
          <p className="mb-0">
            Demande envoyée le :{" "}
            <span className="font-medium">
              {format(
                pendingCaduciteContestation?.contestationSentAt as number,
                "dd/MM/yyyy",
              )}
            </span>
          </p>
        </div>
        <p className="mb-0">Motif :</p>
        <p className="font-medium mb-8">
          {pendingCaduciteContestation?.contestationReason}
        </p>

        <p className="mb-8">
          Date prévisionnelle :{" "}
          <span className="font-medium">
            {format(
              addDays(
                pendingCaduciteContestation?.contestationSentAt as number,
                10,
              ),
              "dd/MM/yyyy",
            )}
          </span>
        </p>

        <p className="mb-2">Décision du certificateur :</p>
        <p className="text-xs text-gray-600">
          Elle sera transmise au candidat et, le cas échéant, à son
          accompagnateur.
        </p>
        <form
          onSubmit={handleFormSubmit}
          onReset={(e) => {
            e.preventDefault();
            handleReset();
          }}
        >
          <RadioButtons
            legend=""
            state={
              errors.certificationAuthorityContestationDecision
                ? "error"
                : "default"
            }
            stateRelatedMessage={
              errors.certificationAuthorityContestationDecision?.message
            }
            options={[
              {
                illustration: (
                  <Image
                    alt="button cross"
                    src="/admin2/components/button-cross.svg"
                    width={56}
                    height={56}
                  />
                ),
                label: "La recevabilité reste caduque",
                hintText:
                  "Le candidat ne pourra pas poursuivre son parcours. Il aura toutefois encore la possibilité de contester cette décision.",
                nativeInputProps: {
                  ...register("certificationAuthorityContestationDecision"),
                  value: "CADUCITE_CONFIRMED",
                },
              },
              {
                illustration: (
                  <Image
                    alt="button check"
                    src="/admin2/components/button-check.svg"
                    width={56}
                    height={56}
                  />
                ),
                label: "La recevabilité est restaurée",
                hintText:
                  "Le candidat peut reprendre son parcours. Il devra toutefois veiller à s'actualiser tous les 6 mois.",
                nativeInputProps: {
                  ...register("certificationAuthorityContestationDecision"),
                  value: "CADUCITE_INVALIDATED",
                },
              },
            ]}
          />

          <FormButtons
            formState={{
              isDirty,
              isSubmitting,
            }}
            backUrl={backUrl}
          />
        </form>
      </div>
    </div>
  );
}
