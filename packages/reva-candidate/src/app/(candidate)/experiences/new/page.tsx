import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";
import Button from "@codegouvfr/react-dsfr/Button";
import Link from "next/link";

export default function ExperiencesNewPage() {
  return (
    <div className="flex flex-col w-full gap-6">
      <div>
        <h1 className="mb-0">Mes expériences</h1>
        <FormOptionalFieldsDisclaimer />
      </div>
      <p className="mb-6">
        Complétez cette section avec vos différentes expériences
        professionnelles (salarié, entrepreneur, stage...) ou activités
        extra-professionnelles (bénévole).
      </p>

      <Link href="/experiences" className="w-fit bg-none">
        <Button priority="secondary">Retour</Button>
      </Link>
    </div>
  );
}
