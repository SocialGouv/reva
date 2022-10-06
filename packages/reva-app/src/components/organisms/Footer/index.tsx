import logoImg from "../../atoms/Logo/logo.png";

const Divider = () => <span className="text-gray-600">|</span>;

export const Footer = () => (
  <footer>
    <div className="w-full hidden sm:flex items-end justify-center text-gray-600 text-sm pb-6">
      <div className="space-x-2">
        <a href="https://reva.incubateur.net/">Site Reva</a>
        <Divider />
        <a href="https://reva.incubateur.net/mentions-l%C3%A9gale">
          Mentions légales
        </a>
        <Divider />
        <a href="https://reva.incubateur.net/politique-de-confidentialit%C3%A9">
          Données personnelles
        </a>
      </div>
    </div>
    <div className="fixed bottom-0 left-0 hidden sm:block p-6">
      <a href="https://reva.incubateur.net/">
        <img className="h-6" src={logoImg} />
      </a>
    </div>
  </footer>
);
