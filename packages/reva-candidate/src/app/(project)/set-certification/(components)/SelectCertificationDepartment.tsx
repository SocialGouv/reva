"use client";
import Select from "@codegouvfr/react-dsfr/Select";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

export type DepartmentType = {
  id: string;
  code: string;
  label: string;
};

interface Props {
  departments: DepartmentType[];
  required?: boolean;
  hint?: string;
  defaultValue?: string;
  // onSelectDepartment: (department?: DepartmentType) => void;
}

export default function SelectCertificationDepartment(props: Props) {
  const { departments = [], hint, required, defaultValue } = props;

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // const selectsOptionsDepartments = departments || [];

  return (
    <Select
      className="my-4"
      data-test="certificates-select-department"
      label="Département"
      hint={hint}
      nativeSelectProps={{
        name: "department",
        required,
        defaultValue,
        onChange: (e) => {
          const departmentId = e.target.value;
          const queryParams = new URLSearchParams(searchParams);
          queryParams.set("departmentId", departmentId);
          queryParams.set("page", "1");
          const path = `${pathname}?${queryParams.toString()}`;
          router.push(path, {
            scroll: false,
          });
        },
      }}
    >
      <option value="" disabled hidden>
        Votre département
      </option>
      {departments.map((d) => (
        <option key={d.id} value={d.id}>
          {d.label}
        </option>
      ))}
    </Select>
  );
}
