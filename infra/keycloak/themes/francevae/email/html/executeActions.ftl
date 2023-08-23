<#import "email-template.ftl" as layout>
  <@layout.emailLayout ; section>
    <#if section="title">
      Votre compte professionnel France VAE a été validé
      <#elseif section="intro">
        <p>Nous vous remercions pour votre référencement en tant qu'Architecte Accompagnateur de Parcours (AAP) sur la plateforme France VAE. Votre compte a été validé.</p>
        <h2 style="margin-top: 35px">Finalisez votre inscription</h2>
        <p>Il ne vous reste qu’une seule étape : choisir un mot de passe pour vos futures connexions. Nous vous invitons à cliquer sur le bouton ci-dessous.</p>
        <p>Ce lien est valable 4 jours. </p>
        <a href="${link}" style="display:inline-block;background:transparent;color:black;border: solid 1px lightgray;font-family:Arial, sans-serif;font-size:14px;font-weight:normal;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:5px 8px;mso-padding-alt:0px;border-radius:3px;" target="_blank">Finaliser mon inscription ⚠️</a>
        <p>Si vous avez dépassé ce délai, <a href="https://${properties.keycloakHostname}/realms/reva/login-actions/reset-credentials" target="_blank">nous vous invitons à redemander un mot de passe.</a></p>
        <#elseif section="outro">
          <h2 style="margin-top: 0px">Aide et support</h2>
          <p><a href="https://france-vae.info/" target="_blank">Explorez l’espace documentaire</a> dédié aux professionnels de la VAE. Cet espace regroupe les documents essentiels pour suivre vos premiers candidats. Nous vous conseillons de vous familiariser dès maintenant avec <a href="https://france-vae.info/Cahier-des-charges-ea8790303ab447cfb25b5c11c26b0d67" target="_blank">le cahier des charges des AAP.</a></p>
          <p><a href="https://reva.crisp.help/fr/" target="_blank">Un centre d’aide</a> et une <a href="https://reva.crisp.help/fr/category/architectes-accompagnateurs-de-parcours-1oikyam/" target="_blank">F.A.Q</a> vous permettront également de trouver les réponses à vos principales questions.</p>
          <br />
          <p>Si jamais vous rencontrez encore des difficultés, n’hésitez pas à nous contacter via la messagerie instantanée (en bas à droite de l’écran sur le site France VAE) ou par email à support@vae.gouv.fr</p>
          <br />
          <p>L’équipe France VAE.</p>
    </#if>
  </@layout.emailLayout>