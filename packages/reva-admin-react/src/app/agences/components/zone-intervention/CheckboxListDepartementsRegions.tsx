import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch";
import { ZoneInterventionList } from "./useDepartementsOnRegions";

interface CheckboxListDepartementsRegionsProps {
  zoneIntervention: ZoneInterventionList;
  setZoneIntervention: (zoneIntervention: ZoneInterventionList) => void;
  listTitle: string;
}

function CheckboxListDepartementsRegions({
  zoneIntervention,
  setZoneIntervention,
  listTitle,
}: CheckboxListDepartementsRegionsProps) {
  if (!zoneIntervention) return null;
  const handleSelectRegion = (regionId: string) => {
    const regionFound = zoneIntervention.find(
      (region) => region.regionId === regionId,
    );
    if (!regionFound) return;
    const isSelected = !regionFound.isSelected;
    const zoneInterventionSelected = zoneIntervention.map((region) => {
      if (region.regionId === regionId) {
        return {
          ...region,
          isSelected,
          departements: region.departements.map((departement) => ({
            ...departement,
            isSelected,
          })),
        };
      }
      return region;
    });
    setZoneIntervention(zoneInterventionSelected);
  };

  const handleSelectDepartment = (departmentId: string) => {
    const regionFound = zoneIntervention.find((region) =>
      region.departements.some(
        (departement) => departement.departementId === departmentId,
      ),
    );
    const departmentFound = zoneIntervention
      .flatMap((region) => region.departements)
      .find((departement) => departement.departementId === departmentId);
    if (!departmentFound) return;
    const isSelected = !departmentFound.isSelected;
    const zoneInterventionSelected = zoneIntervention.map((region) => {
      if (region.regionId !== regionFound?.regionId) {
        return region;
      }
      return {
        ...region,
        isSelected: region.departements.every(
          (departement) =>
            (departement.isSelected === true &&
              departement.departementId !== departmentId) ||
            (departement.departementId === departmentId && isSelected),
        ),
        departements: region.departements.map((departement) => {
          if (departement.departementId === departmentId) {
            return {
              ...departement,
              isSelected,
            };
          }
          return departement;
        }),
      };
    });

    setZoneIntervention(zoneInterventionSelected);
  };

  const handleSelectAll = (isSelected: boolean) => {
    const zoneInterventionSelected = zoneIntervention.map((region) => {
      return {
        ...region,
        isSelected,
        departements: region.departements.map((departement) => ({
          ...departement,
          isSelected,
        })),
      };
    });

    setZoneIntervention(zoneInterventionSelected);
  };

  const isAllSelected = zoneIntervention.every((region) => region.isSelected);

  return (
    <div className="flex-1">
      <h3>{listTitle}</h3>
      <div>
        <ToggleSwitch
          inputTitle="Toute la France Métropolitaine"
          label="Toute la France Métropolitaine"
          labelPosition="left"
          showCheckedHint={false}
          checked={isAllSelected}
          onChange={(event) => {
            handleSelectAll(event);
          }}
        />
      </div>
      <div className="max-h-[500px] overflow-y-scroll overflow-x-hidden">
        {zoneIntervention.map((region) => {
          return (
            <div key={region.regionId} className="relative">
              <Checkbox
                className="absolute z-10 top-3 sm:left-4"
                key={region.regionLabel}
                options={[
                  {
                    label: region.regionLabel,
                    nativeInputProps: {
                      checked: region.isSelected,
                      onChange: () => {
                        handleSelectRegion(region.regionId);
                      },
                    },
                  },
                ]}
              />
              <Accordion label="">
                {region.departements.map((departement) => {
                  return (
                    <Checkbox
                      className="pl-4"
                      key={departement.departementId}
                      options={[
                        {
                          label: `${departement.departementLabel} (${departement.code})`,
                          nativeInputProps: {
                            checked: departement.isSelected,
                            onChange: () =>
                              handleSelectDepartment(departement.departementId),
                          },
                        },
                      ]}
                    />
                  );
                })}
              </Accordion>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CheckboxListDepartementsRegions;