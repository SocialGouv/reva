import Button from "@codegouvfr/react-dsfr/Button";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CandidaciesEmptyState() {
  const router = useRouter();
  return (
    <div className="flex justify-between items-center w-full">
      <div>
        <h1>Mes candidatures et parcours</h1>
        <p className="text-lg mb-10">
          Valorisez votre expérience professionnelle en commençant une
          candidature dès maintenant.
        </p>
        <Button priority="secondary" onClick={() => router.push("./create")}>
          Commencer une VAE
        </Button>
      </div>
      <Image
        src="/candidat/images/search-glass.png"
        alt="candidature"
        width={282}
        height={319}
        className="max-h-[319px]"
      />
    </div>
  );
}
