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
        <h3>Préconisation accompagnement méthodologique </h3>
      </div>
      <div className="ml-10">
        <p className="mb-2">
          Accompagnement individuel : {individualHourCount ?? 0}h
        </p>
        <p className="mb-2">
          Accompagnement collectif : {collectiveHourCount ?? 0}h
        </p>
        <p>Formation : {additionalHourCount ?? 0}h</p>
      </div>

      <h3>Préconisation actes formatifs </h3>

      <div className="ml-10">
        {mandatoryTrainings.length > 0 && (
          <>
            <h4 className="mb-2">Formations obligatoires</h4>
            <div className="mb-4">
              {mandatoryTrainings.map((training) => (
                <p key={training.id} className="mb-2">
                  {training.label}
                </p>
              ))}
            </div>
          </>
        )}

        {basicSkills.length > 0 && (
          <>
            <h4 className="mb-2">Savoir de base</h4>
            {basicSkills.map((skill) => (
              <p key={skill.id} className="mb-2">
                {skill.label}
              </p>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
