import Link from "next/link";

export default function AgencesPage() {
  return (
    <div className="w-full flex flex-col items-center justify-center px-4 sm:px-10 text-gray-500">
      <span>
        <Link href="/agences/add-agence">Ajoutez une agence</Link> ou
        sélectionnez une agence existante.
      </span>
    </div>
  );
}
