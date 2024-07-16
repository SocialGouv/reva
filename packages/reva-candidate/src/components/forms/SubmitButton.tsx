"use client";

import { useFormStatus } from "react-dom";
import Button from "@codegouvfr/react-dsfr/Button";

export default function SubmitButton({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      data-test="login-home-submit"
      type="submit"
      disabled={pending}
      className={className}
    >
      {label}
    </Button>
  );
}
