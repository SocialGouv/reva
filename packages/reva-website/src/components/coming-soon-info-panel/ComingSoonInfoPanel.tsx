export const ComingSoonInfoPanel = ({ className }: { className?: string }) => (
  <div className={`fr-alert fr-alert--warning ${className || ""}`}>
    <h3 className="fr-alert__title !text-2xl">Attention</h3>
    <p className="text-xl font-semibold">
      Les inscriptions pour effectuer une VAE ne sont pas encore ouvertes.
    </p>
    <p className="text-xl">
      Les candidatures déjà en cours sont toujours accessibles.
    </p>
  </div>
);
