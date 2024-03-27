"use client";
import { useEffect, useState } from "react";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { add, endOfDay, format, isAfter, isBefore, startOfDay } from "date-fns";

import { errorToast } from "@/components/toast/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FileLink } from "../../../(components)/FileLink";
import { useJuryPageLogic } from "./juryPageLogic";

const schema = z
  .object({
    date: z.string(),
    time: z.string().optional(),
    address: z.string().optional(),
    information: z.string().optional(),
    convocationFile: z.object({ 0: z.instanceof(File).optional() }),
  })
  .superRefine((data, ctx) => {
    const date = data.date;
    if (!date) {
      ctx.addIssue({
        path: ["date"],
        message: "La date est obligatoire",
        code: z.ZodIssueCode.custom,
      });
    }
    if (isAfter(new Date(date), endOfDay(add(new Date(), { years: 2 })))) {
      ctx.addIssue({
        path: ["date"],
        message: "La date doit être inférieure à 2 ans",
        code: z.ZodIssueCode.custom,
      });
    }
  });

type DateDeJuryFormData = z.infer<typeof schema>;

export const DateDeJury = (): JSX.Element => {
  const { getCandidacy, scheduleJury } = useJuryPageLogic();

  const candidacy = getCandidacy.data?.getCandidacyById;
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<DateDeJuryFormData>({
    resolver: zodResolver(schema),
    mode: "all",
  });

  useEffect(() => {
    if (candidacy?.jury?.dateOfSession) {
      setValue(
        "date",
        format(new Date(candidacy.jury.dateOfSession), "yyyy-MM-dd"),
      );
      setValue("time", format(new Date(candidacy.jury.dateOfSession), "HH:mm"));
    }
  }, [candidacy?.jury?.dateOfSession, setValue]);

  const handleFormSubmit = handleSubmit(async (data) => {
    if (candidacy?.id) {
      try {
        let date = new Date(format(data.date, "yyyy-MM-dd"))
          .valueOf()
          .toString();
        let time;
        if (data.time) {
          date = new Date(data.date)
            .setHours(
              Number(data.time.split(":")[0]),
              Number(data.time.split(":")[1]),
            )
            .valueOf()
            .toString();
          time = new Date(
            format(`${data.date}T${data.time}`, "yyyy-MM-dd HH:mm"),
          )
            .valueOf()
            .toString();
        }
        const response = await scheduleJury.mutateAsync({
          ...data,
          date,
          time,
          candidacyId: candidacy.id,
          convocationFile: data.convocationFile?.[0],
        });

        const textError = await response.text();
        if (textError) {
          errorToast(textError);

          console.error(textError);
        } else {
          setEditing(false);
        }
      } catch (error) {
        console.error(error);
      }
    }
  });

  const [editing, setEditing] = useState<boolean>(false);

  const jury = candidacy?.jury;

  const editable = candidacy?.jury
    ? isBefore(new Date(), startOfDay(candidacy?.jury.dateOfSession)) &&
      !jury?.result
    : false;

  return (
    <div className="flex flex-col">
      <>
        <h5 className="text-xl font-bold">
          Attribution d’une date de passage en jury au candidat
        </h5>
        {!jury && (
          <p className="text-gray-600">
            Une convocation officielle devra être émise à destination du
            candidat. Elle peut être ajoutée en pièce jointe ci-dessous (le
            candidat l’aura dans son e-mail récapitulatif) ou transmise par
            courrier papier par vos soins.
          </p>
        )}
      </>

      <>
        <label className="text-xs font-bold py-2">
          Certification concernée
        </label>

        <div className="bg-gray-100 p-4 rounded-xl mb-12">
          <div className="flex flex-row items-center justify-between">
            <label className="text-gray-600 text-xs italic">
              {candidacy?.certification?.typeDiplome.label}
            </label>
            <label className="text-gray-600 text-xs italic">
              {candidacy?.certification?.codeRncp}
            </label>
          </div>
          <label className="text-lg font-bold">
            {candidacy?.certification?.label}
          </label>
        </div>
      </>

      {!getCandidacy.isLoading && jury && !editing && (
        <>
          <div className="flex flex-row items-start justify-between gap-4">
            <Card
              label="Date"
              value={format(new Date(jury?.dateOfSession), "yyyy-MM-dd")}
            />

            <Card
              label="Heure de convocation"
              value={format(new Date(jury?.dateOfSession), "HH:mm")}
            />

            <Card label="Lieu" value={jury.addressOfSession} />
          </div>

          <Card
            label="Information complémentaire liée à la session"
            value={jury.informationOfSession}
          />

          {jury.convocationFile && (
            <FileLink
              text={jury.convocationFile.name}
              url={jury.convocationFile.url}
            />
          )}

          {editable && (
            <div className="flex flex-row items-end justify-between gap-4">
              <Button
                priority="secondary"
                className="ml-auto mt-8 text-right"
                onClick={() => setEditing(true)}
              >
                Modifer
              </Button>
            </div>
          )}
        </>
      )}

      {!getCandidacy.isLoading && (!jury || editing) && (
        <form onSubmit={handleFormSubmit}>
          <h5 className="text-xl font-bold mb-4">Date de jury</h5>
          <div className="flex flex-row items-start gap-4">
            <Input
              label="Date"
              nativeInputProps={{
                ...register("date"),
                type: "date",
              }}
              state={errors.date ? "error" : "default"}
              stateRelatedMessage={errors.date?.message}
            />
            <Input
              label="Heure de convocation (Optionnel)"
              nativeInputProps={{
                type: "time",
                ...register("time"),
                defaultValue: jury?.timeOfSession || "",
              }}
            />
            <Input
              className="flex-1"
              label="Lieu (Optionnel)"
              nativeInputProps={{
                ...register("address"),
                defaultValue: jury?.addressOfSession || "",
              }}
            />
          </div>
          <Input
            label="Information complémentaire liée à la session (Optionnel)"
            nativeInputProps={{
              ...register("information"),
              defaultValue: jury?.informationOfSession || "",
            }}
          />
          <Upload
            className="upload-file"
            label="Joindre la convocation officielle (optionnel)"
            hint="Format supporté : PDF uniquement avec un poids maximum de 15 Mo"
            nativeInputProps={{
              ...register("convocationFile"),
            }}
          />

          <div className="flex flex-row items-end justify-end mt-8 gap-4">
            {editing && (
              <Button priority="secondary" onClick={() => setEditing(false)}>
                Annuler
              </Button>
            )}

            <Button disabled={isSubmitting || !isValid}>Envoyer</Button>
          </div>
        </form>
      )}
    </div>
  );
};

interface CardProps {
  label: string;
  value?: string | null;
}

const Card = (props: CardProps): JSX.Element => {
  const { label, value } = props;

  return (
    <div className="flex flex-col mb-6">
      <span className="uppercase font-bold text-xs">{label}</span>
      <span className="text-base">{value || "Non renseigné"}</span>
    </div>
  );
};
