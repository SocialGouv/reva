import { useFormContext } from "react-hook-form";
import CheckboxListWithChildren from "./CheckboxListDepartementsRegions";

function ZoneIntervention() {
  const { watch, setValue } = useFormContext();
  const zoneInterventionPresentiel = watch("zoneInterventionPresentiel");
  const zoneInterventionDistanciel = watch("zoneInterventionDistanciel");

  if (
    !zoneInterventionPresentiel?.length &&
    !zoneInterventionDistanciel?.length
  )
    return null;

  return (
    <fieldset className="mt-8">
      <legend className="text-2xl font-bold mb-4">Zone d'intervention</legend>
      <div className="flex flex-col sm:flex-row gap-y-8 sm:gap-x-8">
        {!!zoneInterventionPresentiel?.length && (
          <CheckboxListWithChildren
            listTitle="Zone d'intervention en présentiel"
            setZoneIntervention={(zoneInterventionPresentiel) =>
              setValue("zoneInterventionPresentiel", zoneInterventionPresentiel)
            }
            zoneIntervention={zoneInterventionPresentiel}
          />
        )}
        {!!zoneInterventionDistanciel?.length && (
          <CheckboxListWithChildren
            listTitle="Zone d'intervention à distance"
            zoneIntervention={zoneInterventionDistanciel}
            setZoneIntervention={(zoneInterventionDistanciel) =>
              setValue("zoneInterventionDistanciel", zoneInterventionDistanciel)
            }
          />
        )}
      </div>
    </fieldset>
  );
}

export default ZoneIntervention;
