import { GoalsUseSubmitCandidacyForDashboard } from "./submit-candidacy-dashboard.hook";

export default function GoalsSectionSubmitCandidacy({
  goals,
}: {
  goals: GoalsUseSubmitCandidacyForDashboard;
}) {
  return (
    <div className="mt-10">
      <div className="flex">
        <svg
          className="mr-2"
          height={32}
          width={32}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          data-html2canvas-ignore="true"
        >
          <path d="M12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2ZM12 20C16.4267 20 20 16.4267 20 12C20 7.57333 16.4267 4 12 4C7.57333 4 4 7.57333 4 12C4 16.4267 7.57333 20 12 20ZM12 18C8.68 18 6 15.32 6 12C6 8.68 8.68 6 12 6C15.32 6 18 8.68 18 12C18 15.32 15.32 18 12 18ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z" />
        </svg>
        <h2>Mes objectifs</h2>
      </div>
      <ul className="pl-10 mb-0">
        {goals.map((goal) => (
          <li key={goal.id}>{goal.label}</li>
        ))}
      </ul>
    </div>
  );
}
