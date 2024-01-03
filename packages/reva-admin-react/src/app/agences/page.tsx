import { PageTitle } from "@/components/page/page-title/PageTitle";

export default function AgencesPage() {
  return (
    <div className="flex flex-col items-center justify-center ox-4 sm:px-10">
      <PageTitle>Ajoutez et gérez vos agences locales ici.</PageTitle>

      <div className="my-4 self-start text-lg">Vous pouvez :</div>

      <ul className="self-start pl-10">
        <li className="list-disc">
          déclarer votre structure actuelle en tant qu'agence,
        </li>
        <li className="list-disc">ajouter une ou plusieurs agences</li>
      </ul>
    </div>
  );
}
