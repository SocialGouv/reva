import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import { isBefore, parseISO, startOfToday } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormButtons } from "@/components/form/form-footer/FormButtons";
import {
  sanitizedOptionalText,
  sanitizedText,
} from "@/utils/input-sanitization";

const appointmentFormSchema = z
  .object({
    title: sanitizedText(),
    date: sanitizedText(),
    time: sanitizedText(),
    duration: z
      .enum([
        "",
        "HALF_AN_HOUR",
        "ONE_HOUR",
        "TWO_HOURS",
        "THREE_HOURS",
        "FOUR_HOURS",
      ])
      .optional()
      .nullable(),
    location: sanitizedOptionalText(),
    description: sanitizedOptionalText(),
  })
  .superRefine((data, ctx) => {
    if (isBefore(parseISO(data.date), startOfToday())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["date"],
        message: "La date ne doit pas être dans le passé",
      });
    }
  });

export type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

export const AppointmentForm = ({
  onSubmit,
  backUrl,
  defaultValues,
  onDeleteButtonClick,
}: {
  backUrl: string;
  onSubmit: (data: AppointmentFormData) => void;
  defaultValues?: Partial<AppointmentFormData>;
  onDeleteButtonClick?: () => void;
}) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues,
  });

  return (
    <form
      className="w-full grid grid-cols-1 md:grid-cols-3 gap-x-6"
      onSubmit={handleSubmit(onSubmit, (e) => console.error(e))}
    >
      <Input
        data-test="title-input"
        label="Intitulé :"
        className="col-span-full"
        nativeInputProps={{ ...register("title") }}
        state={errors.title ? "error" : "default"}
        stateRelatedMessage={errors.title?.message}
      />
      <Input
        data-test="date-input"
        label="Date :"
        nativeInputProps={{ type: "date", ...register("date") }}
        state={errors.date ? "error" : "default"}
        stateRelatedMessage={errors.date?.message}
      />
      <Input
        data-test="time-input"
        label="Heure de convocation :"
        nativeInputProps={{ type: "time", ...register("time") }}
        state={errors.time ? "error" : "default"}
        stateRelatedMessage={errors.time?.message}
      />
      <Select
        data-test="duration-input"
        label="Durée estimée: (Optionnel)"
        nativeSelectProps={{ ...register("duration") }}
        state={errors.duration ? "error" : "default"}
        stateRelatedMessage={errors.duration?.message}
      >
        <option value=""></option>
        <option value="HALF_AN_HOUR">30 minutes</option>
        <option value="ONE_HOUR">1 heure</option>
        <option value="TWO_HOURS">2 heures</option>
        <option value="THREE_HOURS">3 heures</option>
        <option value="FOUR_HOURS">4 heures</option>
      </Select>
      <Input
        data-test="location-input"
        label="Lieu : (Optionnel)"
        hintText="Ajouter une adresse, un lieu ou un lien de visioconférence en fonction de la modalité d’accompagnement envisagée."
        className="col-span-full"
        nativeInputProps={{ ...register("location") }}
        state={errors.location ? "error" : "default"}
        stateRelatedMessage={errors.location?.message}
      />
      <Input
        data-test="description-input"
        textArea
        nativeTextAreaProps={{ rows: 3, ...register("description") }}
        label="Description : (Optionnel)"
        className="col-span-full"
        state={errors.description ? "error" : "default"}
        stateRelatedMessage={errors.description?.message}
      />
      {onDeleteButtonClick && (
        <Button
          data-test="delete-appointment-button"
          type="button"
          onClick={onDeleteButtonClick}
          priority="tertiary no outline"
          iconId="fr-icon-delete-line"
          className="col-span-full"
        >
          Supprimer ce rendez-vous
        </Button>
      )}
      <FormButtons
        className="col-span-full"
        backUrl={backUrl}
        backButtonLabel="Annuler"
        formState={{ isDirty, isSubmitting }}
        disabled={!isDirty}
      />
    </form>
  );
};
