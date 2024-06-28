const SitemapPage = () => (
  <div className="flex flex-col w-full p-1 md:p-2">
    <h1>Plan du site</h1>
    <ul className="flex flex-col gap-2">
      <li>
        <a href="/admin2/candidacies">Candidatures</a>
      </li>
      <li>
        <a href="/mentions-legales">Mentions légales</a>
      </li>
      <li>
        <a href="/confidentialite">Données personnelles</a>
      </li>
      <li>
        <a href="/declaration-accessibilite">Déclaration d'accessibilité</a>
      </li>
      <li>
        <a href="/nous-contacter">Nous contacter</a>
      </li>
    </ul>
  </div>
);

export default SitemapPage;
