import Select from "@codegouvfr/react-dsfr/Select";
import { useSelectDepartment } from "./SelectDepartment.hooks";

export type DepartmentType = {
  id: string;
  code: string;
  label: string;
};

interface Props {
  required?: boolean;
  departmentId?: string;
  hint?: string;
  onSelectDepartment: (department?: DepartmentType) => void;
}

export const SelectDepartment = (props: Props): JSX.Element => {
  const { hint, required, departmentId, onSelectDepartment } = props;

  const { departments } = useSelectDepartment();

  const selectsOptionsDepartments = departments.data?.getDepartments || [];

  return (
    <Select
      className="my-4"
      data-test="certificates-select-department"
      label="Département"
      hint={hint}
      nativeSelectProps={{
        name: "department",
        value: departmentId || "",
        required,
        onChange: (e) => {
          const department = selectsOptionsDepartments.find(
            (d) => d.id == e.target.value,
          );
          onSelectDepartment(department);
        },
      }}
    >
      <option value="" disabled hidden>
        Votre département
      </option>
      {selectsOptionsDepartments.map((d) => (
        <option key={d.id} value={d.id}>
          {d.label}
        </option>
      ))}
    </Select>
  );
};
