import Select from "@codegouvfr/react-dsfr/Select";
import { getDepartments } from "./SelectDepartment.loaders";

export type DepartmentType = {
  id: string;
  code: string;
  label: string;
};

interface Props {
  required?: boolean;
  departmentId?: string;
  hint?: string;
  // onSelectDepartment: (department?: DepartmentType) => void;
}

export const SelectDepartment = async (props: Props) => {
  const { hint, required } = props;

  const departments = await getDepartments();

  const selectsOptionsDepartments = departments || [];

  return (
    <Select
      className="my-4"
      data-test="certificates-select-department"
      label="Département"
      hint={hint}
      nativeSelectProps={{
        name: "department",
        required,
        // onChange: (e) => {
        //   const department = selectsOptionsDepartments.find(
        //     (d) => d.id == e.target.value,
        //   );
        //   onSelectDepartment(department);
        // },
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
