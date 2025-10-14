import { getCohorteById } from "./actions";
import { UpdateNomCohorteForm } from "./form";

export default async function UpdateCohortNamePage({
  params,
}: {
  params: Promise<{ commanditaireId: string; cohorteVaeCollectiveId: string }>;
}) {
  const { commanditaireId, cohorteVaeCollectiveId } = await params;

  const cohorte = await getCohorteById(commanditaireId, cohorteVaeCollectiveId);

  if (!cohorte) {
    throw new Error("Cohorte non trouvée");
  }

  return (
    <div className="flex flex-col w-full">
      <h1 className="mb-12">{cohorte?.nom}</h1>
      <UpdateNomCohorteForm
        commanditaireId={commanditaireId}
        cohorteVaeCollectiveId={cohorteVaeCollectiveId}
        initialState={{ nom: cohorte?.nom }}
      />
    </div>
  );
}
