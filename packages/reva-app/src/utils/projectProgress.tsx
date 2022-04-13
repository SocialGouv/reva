import { Goal } from "../interface";

interface projectProgressProps {
  goals: Goal[];
}

export function projectProgress({ goals }: projectProgressProps) {
  const selectedGoals = goals.filter((goal) => goal.checked);
  return selectedGoals.length > 0 ? 70 : 35;
}
