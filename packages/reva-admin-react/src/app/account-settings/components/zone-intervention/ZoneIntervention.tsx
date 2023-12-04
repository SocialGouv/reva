import CheckboxListWithChildren from "./CheckboxListWithChildren";

interface Department {
  id: string;
  label: string;
  isSelected: boolean;
}

interface Region {
  id: string;
  label: string;
  isSelected: boolean;
  departments: Department[];
}

export type ZoneInterventionList = Region[];

interface ZoneInterventionProps {
  setZoneInterventionPresentiel: (
    zoneInterventionPresentiel: ZoneInterventionList,
  ) => void;
  setZoneInterventionDistanciel: (
    zoneInterventionDistanciel: ZoneInterventionList,
  ) => void;
  zoneInterventionPresentiel: ZoneInterventionList;
  zoneInterventionDistanciel: ZoneInterventionList;
}

function ZoneIntervention({
  setZoneInterventionPresentiel,
  setZoneInterventionDistanciel,
  zoneInterventionPresentiel,
  zoneInterventionDistanciel,
}: ZoneInterventionProps) {
  return (
    <fieldset className="mt-8">
      <legend className="text-2xl font-bold mb-4">Zone d'intervention</legend>
      <div className="flex flex-col sm:flex-row gap-y-8 sm:gap-x-8">
        <CheckboxListWithChildren
          setZoneIntervention={setZoneInterventionPresentiel}
          zoneIntervention={zoneInterventionPresentiel}
        />
        <CheckboxListWithChildren
          zoneIntervention={zoneInterventionDistanciel}
          setZoneIntervention={setZoneInterventionDistanciel}
        />
      </div>
    </fieldset>
  );
}

export default ZoneIntervention;
