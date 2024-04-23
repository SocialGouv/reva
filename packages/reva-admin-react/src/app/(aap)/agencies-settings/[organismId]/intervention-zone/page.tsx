"use client";
import { agenceFormSchema } from "@/app/(aap)/agences/components/agenceFormSchema";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Input from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { InterventionZoneFormData } from "./interventionZoneFormSchema";
import { useInterventionZonePage } from "./interventionZonePage.hook";
import { useZoneInterventionAAP } from "@/app/(aap)/agencies-settings/_components/zone-intervention/zoneInterventionAAP.hook";
import { ZoneIntervention } from "@/app/(aap)/agencies-settings/_components/zone-intervention/ZoneIntervention";

const InterventionZonePage = () => {
  const { interventionZoneIsError, maisonMereAAP, organism } =
    useInterventionZonePage();
  const methods = useForm<InterventionZoneFormData>({
    resolver: zodResolver(agenceFormSchema),
  });
  const { reset } = methods;

  const { getZonesIntervention } = useZoneInterventionAAP();

  const zonesIntervention = useMemo(
    () =>
      getZonesIntervention({
        maisonMereAAPOnDepartements:
          maisonMereAAP?.maisonMereAAPOnDepartements || [],
        organismOnDepartments: organism?.organismOnDepartments || [],
      }),
    [getZonesIntervention, maisonMereAAP, organism],
  );

  const handleReset = useCallback(() => {
    reset({
      zoneInterventionDistanciel: zonesIntervention.remote,
      zoneInterventionPresentiel: zonesIntervention.onSite,
    });
  }, [reset, zonesIntervention]);

  useEffect(() => {
    handleReset();
  }, [handleReset]);

  return (
    <div className="flex flex-col w-full">
      <h1>Zone d'intervention</h1>

      {interventionZoneIsError && (
        <Alert
          className="mb-6"
          severity="error"
          title="Une erreur est survenue pendant la récupération de la zone d'intervention."
        />
      )}

      {maisonMereAAP && (
        <div className="flex flex-col gap-8">
          <fieldset className="flex flex-col gap-4">
            <h2>Informations sur la typologie</h2>
            <Input
              label="Typologie d'Architecte Accompagnateur de Parcours"
              hintText="Les certifications vous sont rattachées en fonction de la typologie sélectionnée."
              nativeInputProps={{
                value: maisonMereAAP.typologie,
              }}
              disabled
            />
          </fieldset>
          <fieldset className="flex gap-4 w-full">
            <ZoneIntervention
              type="ON_SITE"
              zoneIntervention={zonesIntervention.onSite}
              disabled
            />
            <ZoneIntervention
              type="REMOTE"
              zoneIntervention={zonesIntervention.remote}
              disabled
            />
          </fieldset>
        </div>
      )}
    </div>
  );
};

export default InterventionZonePage;
