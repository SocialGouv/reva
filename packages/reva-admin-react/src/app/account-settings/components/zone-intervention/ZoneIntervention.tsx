import CheckboxListWithChildren from "./CheckboxListWithChildren";

const mockRegionsWithNestedDepartments = [
  {
    id: "region-1",
    label: "Région 1",
    isSelected: false,
    departments: [
      {
        id: "department-1",
        label: "Département 1",
        isSelected: false,
      },
      {
        id: "department-2",
        label: "Département 2",
        isSelected: false,
      },
      {
        id: "department-3",
        label: "Département 3",
        isSelected: false,
      },
    ],
  },
  {
    id: "region-2",
    label: "Région 2",
    isSelected: false,
    departments: [
      {
        id: "department-4",
        label: "Département 4",
        isSelected: false,
      },
      {
        id: "department-5",
        label: "Département 5",
        isSelected: false,
      },
      {
        id: "department-6",
        label: "Département 6",
        isSelected: false,
      },
    ],
  },
  {
    id: "region-3",
    label: "Région 3",
    isSelected: false,
    departments: [
      {
        id: "department-7",
        label: "Département 7",
        isSelected: false,
      },
      {
        id: "department-8",
        label: "Département 8",
        isSelected: false,
      },
      {
        id: "department-9",
        label: "Département 9",
        isSelected: false,
      },
    ],
  },
];

function ZoneIntervention() {
  return (
    <fieldset className="mt-8">
      <legend className="text-2xl font-bold mb-4">Zone d'intervention</legend>
      <div className="flex flex-col sm:flex-row gap-y-8 sm:gap-x-8">
        <CheckboxListWithChildren
          regionsWithNestedDepartments={mockRegionsWithNestedDepartments}
        />
        <CheckboxListWithChildren
          regionsWithNestedDepartments={mockRegionsWithNestedDepartments}
        />
      </div>
    </fieldset>
  );
}

export default ZoneIntervention;
