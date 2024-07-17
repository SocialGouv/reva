"use client";

import { useFormStatus } from "react-dom";
import Button from "@codegouvfr/react-dsfr/Button";

export default function SubmitButton({
  label,
  className,
  dataTest
}: {
  label: string;
  className?: string;
  dataTest?: string
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      data-test={dataTest}
      type="submit"
      disabled={pending}
      className={className}
    >
      {label}
    </Button>
  );
}
