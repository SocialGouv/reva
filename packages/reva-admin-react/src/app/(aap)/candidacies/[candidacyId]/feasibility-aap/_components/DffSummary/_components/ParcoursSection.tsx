import { BasicSkill, Training } from "@/graphql/generated/graphql";

export default function ParcoursSection({
  basicSkills,
  mandatoryTrainings,
  additionalHourCount,
  individualHourCount,
  collectiveHourCount,
}: {
  basicSkills: BasicSkill[];
  mandatoryTrainings: Training[];
  additionalHourCount?: number | null;
  individualHourCount?: number | null;
  collectiveHourCount?: number | null;
}) {
  return (
    <div>
      <div className="flex">
        <span className="fr-icon-time-fill fr-icon--lg mr-2" />
        <h2>Parcours envisagé</h2>
      </div>
      <p>Accompagnement individuel : {individualHourCount ?? 0}h</p>
      <p>Accompagnement collectif : {collectiveHourCount ?? 0}h</p>
      <p>Formation : {additionalHourCount ?? 0}h</p>
    </div>
  );
}
