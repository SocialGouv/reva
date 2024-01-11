(function () {
  // Edit links config here
  const HELP_LINKS = [
    {
      label: "Nouvelles fonctionnalités",
      url: "https://www.notion.so/fabnummas/Nouveaut-s-produit-42e539695d68436abe32fcf4b146c192?pvs=4",
    },
    {
      label: "Espace documentaire",
      url: "https://www.notion.so/fabnummas/f697c4fa5fcf42d49d85428b5e0b40c5?v=9f55d3b4b2e54bd19d390ebe6febe3ea",
    },
    {
      label: "Cahier des charges AAP",
      url: "https://fabnummas.notion.site/Cahier-des-charges-ea8790303ab447cfb25b5c11c26b0d67",
    },
    {
      label: "En savoir plus sur la VAE",
      url: "https://vae.gouv.fr/savoir-plus/",
    },
    {
      label: "FAQ AAP",
      url: "https://reva.crisp.help/fr/category/architectes-accompagnateurs-de-parcours-1oikyam/",
    },
    {
      label: "Calendrier des webinaires",
      url: "https://fabnummas.notion.site/82b7cdf15d7b45d1830c8b1024ddfa8c?v=3a2fe0a672f34db9900d7f0bb3ab598f",
    },
  ];

  const helpIcon = `
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M28.6668 38H24.5881C24.1921 36.3026 22.4054 34.9146 21.6721 34C18.1809 29.638 18.6471 23.3211 22.7409 19.5189C26.8347 15.7168 33.1687 15.7178 37.2613 19.5213C41.3539 23.3247 41.8181 29.6418 38.3254 34.0026C37.5921 34.916 35.8081 36.304 35.4121 38H31.3334V31.3333H28.6668V38ZM35.3334 40.6666V42C35.3334 43.4727 34.1395 44.6666 32.6668 44.6666H27.3334C25.8607 44.6666 24.6668 43.4727 24.6668 42V40.6666H35.3334Z" fill="#000091"/>
    </svg>
`;

  const closeIcon = `
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M30.0002 27.6436L38.2502 19.3936L40.6069 21.7502L32.3569 30.0002L40.6069 38.2502L38.2502 40.6069L30.0002 32.3569L21.7502 40.6069L19.3936 38.2502L27.6436 30.0002L19.3936 21.7502L21.7502 19.3936L30.0002 27.6436Z" fill="#000091"/>
    </svg>
`;

  const helpBubble = document.createElement("div");
  const helpBlock = document.createElement("div");

  // Add CSS
  const css = `
    #help-bubble {
      position: fixed;
      bottom: 100px;
      right: 24px;
      width: 60px;
      height: 60px;
      background-color: white;
      box-shadow: 0px 6px 18px 0px rgba(0, 0, 18, 0.16);
      border-radius: 50%;
      cursor: pointer;
      z-index: 1000;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    #help-block {
      position: fixed;
      bottom: 180px;
      right: 24px;
      width: 20rem;
      background-color: white;
      border-radius: 16px;
      padding: 1rem 1.5rem 1.5rem 1.5rem;
      box-shadow: 0px 6px 18px 0px rgba(0, 0, 18, 0.16);
      display: none;
      z-index: 1000;
    }
    @media (max-width: 479px) or (max-height: 599px) {
      #help-bubble {
        bottom: 82px;
        right: 14px;
        width: 54px;
        height: 54px;
      }
      #help-block {
        bottom: 150px;
        right: 14px;
      }
    }
    #help-block ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    #help-block h2 {
      font-size: 1.375rem;
      font-style: normal;
      font-weight: 700;
      color: #161616;
      line-height: 1.75rem;
      margin-bottom: 1rem;
    }`;

  const style = document.createElement("style");
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  const toggleHelpBlock = () => {
    const isOpen = helpBlock.style.display === "block";
    helpBlock.style.display = isOpen ? "none" : "block";
    helpBubble.innerHTML = isOpen ? helpIcon : closeIcon;
  };

  // Add bubble
  helpBubble.id = "help-bubble";
  helpBubble.innerHTML = helpIcon;
  document.body.appendChild(helpBubble);
  helpBubble.addEventListener("click", toggleHelpBlock);

  // Add help block
  helpBlock.id = "help-block";
  helpBlock.innerHTML = "<h2>Notre aide en ligne</h2>";

  const ul = document.createElement("ul");
  HELP_LINKS.forEach((link) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = link.url;
    a.textContent = link.label;
    a.target = "_blank";
    a.className = "fr-link";
    li.appendChild(a);
    ul.appendChild(li);
  });
  helpBlock.appendChild(ul);
  document.body.appendChild(helpBlock);
})();
