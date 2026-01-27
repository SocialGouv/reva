import Image from "next/image";

export function InvalidLink() {
  return (
    <div className="flex flex-row items-center justify-between p-24">
      <div>
        <h1>Ce lien n’est plus valide</h1>
        <p>Causes possibles : </p>
        <ul>
          <li>le délai d’utilisation du lien est dépassé</li>
          <li>vous avez déjà effectué l’action demandée à partir de ce lien</li>
        </ul>
      </div>

      <div>
        <Image
          src="/candidat/images/invalid-link.png"
          alt="Lien invalide"
          width={282}
          height={319}
        />
      </div>
    </div>
  );
}
