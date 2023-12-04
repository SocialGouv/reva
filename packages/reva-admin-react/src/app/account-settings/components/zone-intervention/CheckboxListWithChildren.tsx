import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch";
import { ZoneInterventionList } from "./ZoneIntervention";

interface CheckboxListWithChildrenProps {
  zoneIntervention: ZoneInterventionList;
  setZoneIntervention: (zoneIntervention: ZoneInterventionList) => void;
}

function CheckboxListWithChildren({
  zoneIntervention,
  setZoneIntervention,
}: CheckboxListWithChildrenProps) {
  if (!zoneIntervention) return null;
  const handleSelectRegion = (regionId: string) => {
    const regionFound = zoneIntervention.find(
      (region) => region.id === regionId,
    );
    if (!regionFound) return;
    const isSelected = !regionFound.isSelected;
    const zoneInterventionSelected = zoneIntervention.map((region) => {
      if (region.id === regionId) {
        return {
          ...region,
          isSelected,
          departments: region.departments.map((department) => ({
            ...department,
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
      region.departments.some((department) => department.id === departmentId),
    );
    const departmentFound = zoneIntervention
      .flatMap((region) => region.departments)
      .find((department) => department.id === departmentId);
    if (!departmentFound) return;
    const isSelected = !departmentFound.isSelected;
    const zoneInterventionSelected = zoneIntervention.map((region) => {
      if (region.id !== regionFound?.id) {
        return region;
      }
      return {
        ...region,
        isSelected: region.departments.every(
          (department) =>
            (department.isSelected === true &&
              department.id !== departmentId) ||
            (department.id === departmentId && isSelected),
        ),
        departments: region.departments.map((department) => {
          if (department.id === departmentId) {
            return {
              ...department,
              isSelected,
            };
          }
          return department;
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
        departments: region.departments.map((department) => ({
          ...department,
          isSelected,
        })),
      };
    });

    setZoneIntervention(zoneInterventionSelected);
  };

  const isAllSelected = zoneIntervention.every((region) => region.isSelected);

  return (
    <div className="flex-1">
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
            <div key={region.id} className="relative">
              <Checkbox
                className="absolute z-10 top-3 sm:left-4"
                key={region.label}
                options={[
                  {
                    label: region.label,
                    nativeInputProps: {
                      checked: region.isSelected,
                      onChange: () => {
                        handleSelectRegion(region.id);
                      },
                    },
                  },
                ]}
              />
              <Accordion label="">
                {region.departments.map((department) => {
                  return (
                    <Checkbox
                      className="pl-4"
                      key={department.id}
                      options={[
                        {
                          label: `${department.label} (${department.id})`,
                          nativeInputProps: {
                            checked: department.isSelected,
                            onChange: () =>
                              handleSelectDepartment(department.id),
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

export default CheckboxListWithChildren;
