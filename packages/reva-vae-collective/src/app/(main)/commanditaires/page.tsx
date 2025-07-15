import { redirect } from "next/navigation";

export default async function CommanditairePage({
  params,
}: {
  params: Promise<{ commanditaireId: string }>;
}) {
  const { commanditaireId } = await params;

  redirect(`/commanditaires/${commanditaireId}/cohortes`);
}
