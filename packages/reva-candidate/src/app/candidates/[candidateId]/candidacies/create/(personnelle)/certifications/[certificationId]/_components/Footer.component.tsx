"use client";

import Button from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/navigation";

export function CertificationFooterComponent() {
  const router = useRouter();

  return (
    <div className="flex flex-row justify-end mt-6">
      <Button
        className="justify-center w-[100%]  md:w-fit"
        onClick={() => {
          router.push("./type-accompagnement");
        }}
      >
        Choisir ce diplôme
      </Button>
    </div>
  );
}
