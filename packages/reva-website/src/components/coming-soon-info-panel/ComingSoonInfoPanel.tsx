export const ComingSoonInfoPanel = ({ className }: { className?: string }) => (
  <div className={`fr-alert fr-alert--warning ${className || ""}`}>
    <h3 className="fr-alert__title !text-2xl">Attention</h3>
    <p className="text-xl">
      Ce site est actuellement en déploiement progressif. Les candidatures pour
      effectuer une VAE seront ouvertes courant juillet 2023.
    </p>
    <p className="text-xl">
      Les candidatures déjà en cours sont toujours accessibles.
    </p>
  </div>
);
