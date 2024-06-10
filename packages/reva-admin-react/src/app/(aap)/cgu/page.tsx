"use client";

import { Cgu } from "@/app/(aap)/cgu/_components/Cgu";

export default function CguPage() {
  return (
    <div>
      <h1>Conditions générales d'utilisation</h1>
      <p className="text-light-text-mention-grey text-xs leading-5 -mt-6">
        Sauf mention contraire “(optionnel)” dans le label, tous les champs sont
        obligatoires.
      </p>
      <form>
        <fieldset>
          <legend className="text-xl font-bold text-gray-900 mb-8">
            Pour créer votre compte, vous devez accepter les conditions
            générales d'utilisation :
          </legend>
          <Cgu />
        </fieldset>
      </form>
    </div>
  );
}
