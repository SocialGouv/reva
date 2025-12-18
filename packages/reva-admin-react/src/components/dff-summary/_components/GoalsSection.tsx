import { Goal } from "@/graphql/generated/graphql";

export default function GoalsSection({ goals }: { goals: Goal[] }) {
  return (
    <div className="flex flex-col gap-6 mt-6">
      <h3 className="mb-0">Objectifs</h3>
      <div className="ml-10">
        {goals.map((goal) => (
          <p key={goal.id}>{goal.label}</p>
        ))}
      </div>
    </div>
  );
}
