"use client";
import { agenceFormSchema } from "@/app/(aap)/agences/components/agenceFormSchema";
import { TreeSelect } from "@/components/tree-select";
import { Organism } from "@/graphql/generated/graphql";
import { useDepartementsOnRegions } from "@/hooks";
import { ZoneInterventionList } from "@/types";
import { isInterventionZoneIsFullySelectedWithoutDOM } from "@/utils";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Input from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { InterventionZoneFormData } from "./interventionZoneFormSchema";
import { useInterventionZonePageQueries } from "./interventionZonePageQueries";

const InterventionZonePage = () => {
  const { interventionZoneIsError, maisonMereAAP, organism } =
    useInterventionZonePageQueries();
  const methods = useForm<InterventionZoneFormData>({
    resolver: zodResolver(agenceFormSchema),
  });
  const { reset, watch, setValue } = methods;

  const {
    organismOndepartementsOnRegionsOnSite,
    organismOndepartementsOnRegionsRemote,
  } = useDepartementsOnRegions({
    setValue,
    zoneInterventionDistanciel: watch(
      "zoneInterventionDistanciel",
    ) as ZoneInterventionList,
    zoneInterventionPresentiel: watch(
      "zoneInterventionPresentiel",
    ) as ZoneInterventionList,
    organism: organism as Partial<Organism>,
  });

  const handleReset = useCallback(() => {
    reset({
      zoneInterventionPresentiel: organismOndepartementsOnRegionsOnSite,
      zoneInterventionDistanciel: organismOndepartementsOnRegionsRemote,
    });
  }, [
    organismOndepartementsOnRegionsOnSite,
    organismOndepartementsOnRegionsRemote,
    reset,
  ]);

  useEffect(() => {
    if (
      organismOndepartementsOnRegionsOnSite &&
      organismOndepartementsOnRegionsRemote
    ) {
      handleReset();
    }
  }, [
    reset,
    handleReset,
    organismOndepartementsOnRegionsOnSite,
    organismOndepartementsOnRegionsRemote,
  ]);

  return (
    <div className="flex flex-col w-full">
      <h1 className="leading-6 font-bold text-2xl mb-8">Zone d'intervention</h1>

      {interventionZoneIsError && (
        <Alert
          className="mb-6"
          severity="error"
          title="Une erreur est survenue pendant la récupération des informations juridiques."
        />
      )}

      {maisonMereAAP && (
        <div className="flex flex-col gap-8">
          <fieldset className="flex flex-col gap-4">
            <h3 className="leading-6 font-bold text-lg">
              Informations sur la typologie
            </h3>
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
            <div className="flex flex-col gap-y-4 sm:gap-x-8 w-full">
              <legend className="text-lg font-bold">
                Zone d'intervention en présentiel
              </legend>
              <span className="text-sm ">
                Cochez les régions ou départements couverts en présentiel
              </span>
              <TreeSelect
                readonly
                title=""
                label="Toute la France Métropolitaine"
                items={organismOndepartementsOnRegionsOnSite}
                onClickSelectAll={() => {}}
                onClickItem={() => {}}
                toggleButtonIsSelected={isInterventionZoneIsFullySelectedWithoutDOM(
                  organismOndepartementsOnRegionsOnSite,
                )}
              />
            </div>

            <div className="flex flex-col gap-y-4 sm:gap-x-8 w-full">
              <legend className="text-lg font-bold">
                Zone d'intervention en distanciel
              </legend>
              <span className="text-sm">
                Cochez les régions ou départements couverts en distanciel
              </span>

              <TreeSelect
                readonly
                title=""
                label="Toute la France Métropolitaine"
                items={organismOndepartementsOnRegionsRemote}
                onClickSelectAll={() => {}}
                onClickItem={() => {}}
                toggleButtonIsSelected={isInterventionZoneIsFullySelectedWithoutDOM(
                  organismOndepartementsOnRegionsRemote,
                )}
              />
            </div>
          </fieldset>
        </div>
      )}
    </div>
  );
};

export default InterventionZonePage;
