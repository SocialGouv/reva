"use client";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { format, add } from "date-fns";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useJuryPageLogic } from "./juryPageLogic";
import { FileLink } from "../../../(components)/FileLink";

const schema = z.object({
  date: z.string().min(1),
  time: z.string().optional(),
  address: z.string().optional(),
  information: z.string().optional(),
  convocationFile: z.object({ 0: z.instanceof(File).optional() }),
});

type DateDeJuryFormData = z.infer<typeof schema>;

export const DateDeJury = (): JSX.Element => {
  const { candidacy, scheduleJury } = useJuryPageLogic();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<DateDeJuryFormData>({ resolver: zodResolver(schema) });

  const handleFormSubmit = handleSubmit((data) => {
    if (candidacy?.id) {
      scheduleJury.mutateAsync({
        ...data,
        candidacyId: candidacy.id,
        convocationFile: data.convocationFile?.[0],
      });
    }
  });

  const jury = candidacy?.jury;

  return (
    <div className="flex flex-col">
      <>
        <h5 className="text-xl font-bold mb-4">
          Attribution d’une date de passage en jury au candidat
        </h5>
        <p className="text-gray-600 mb-12">
          Merci de renseigner la date et l'heure de l'entretien du candidat avec
          le jury. Une convocation officielle devra être émise à destination du
          candidat. Elle peut être ajoutée en pièce jointe ci-dessous (le
          candidat l’aura dans son e-mail récapitulatif) ou transmise par
          courrier papier par vos soins.
        </p>
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

      {jury ? (
        <>
          <div className="flex flex-row items-start justify-between gap-4">
            <Card
              label="Date"
              value={format(jury.dateOfSession, "dd/MM/yyyy")}
            />

            <Card label="Heure de convocation" value={jury.timeOfSession} />

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
        </>
      ) : (
        <form onSubmit={handleFormSubmit}>
          <h5 className="text-xl font-bold mb-4">Date de jury</h5>
          <div className="flex flex-row items-start gap-4">
            <Input
              label="Date"
              nativeInputProps={{
                type: "date",
                ...register("date"),
                min: format(add(new Date(), { days: 1 }), "yyyy-MM-dd"),
                max: format(add(new Date(), { years: 2 }), "yyyy-MM-dd"),
              }}
              state={errors.date ? "error" : "default"}
              stateRelatedMessage={errors.date?.message}
            />
            <Input
              label="Heure de convocation"
              nativeInputProps={{
                type: "time",
                ...register("time"),
              }}
            />
            <Input
              className="flex-1"
              label="Lieu (Optionnel)"
              nativeInputProps={{
                ...register("address"),
              }}
            />
          </div>
          <Input
            label="Information complémentaire liée à la session (Optionnel)"
            nativeInputProps={{
              ...register("information"),
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

          <div className="flex flex-row items-end">
            <Button
              className="ml-auto mt-8 text-right"
              disabled={isSubmitting || !isValid}
            >
              Envoyer
            </Button>
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
