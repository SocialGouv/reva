<#import "email-template.ftl" as layout>
  <@layout.emailLayout ; section>
    
    <#assign subject = "Votre compte professionnel France VAE est prêt à être finalisé">

    <#--  user_profile_type = organism  -->
    <#if (user.attributes.user_profile_type)?has_content && (user.attributes.user_profile_type == "organism" || user.attributes.user_profile_type == "gestionnaire_maison_mere_aap")>
        <#assign subject = "Votre compte professionnel France VAE a été validé">

    <#--  user_profile_type = certification_authority  -->
    <#elseif (user.attributes.user_profile_type)?has_content && user.attributes.user_profile_type == "certification_authority">
        <#assign subject = "Accédez à votre espace certificateur France VAE">

    </#if>

    <#--  Mail Subject  -->
    <#if section="title">
      ${subject}
    </#if>

    <#--  Mail Body  -->
    <#--  user_profile_type = gestionnaire_maison_mere_aap  -->
    <#if (user.attributes.user_profile_type)?has_content && user.attributes.user_profile_type == "gestionnaire_maison_mere_aap">
      <#if section="intro">
        <p>Nous vous remercions pour votre référencement en tant qu'Architecte Accompagnateur de Parcours (AAP) sur la plateforme France VAE. Votre compte a été validé.</p>
        
        <br />

        <h2>Finalisez votre inscription</h2>
        <p>Il ne vous reste qu'une seule étape : choisir un mot de passe pour vos futures connexions. Nous vous invitons à cliquer sur le bouton ci-dessous.</p>
      <#elseif section="actionButton">
        <a href="${link}" style="display:inline-block;background:#000099;color:white;font-family:Arial, sans-serif;font-size:14px;font-weight:500;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:12px 16px;mso-padding-alt:0px;" target="_blank">Finaliser mon inscription</a>
      <#elseif section="outro">
        <p>Ce lien est valable 4 jours.</p>
        <p>Si vous avez dépassé ce délai, <a href="https://${properties.keycloakHostname}/realms/reva/login-actions/reset-credentials" target="_blank">nous vous invitons à redemander un mot de passe.</a></p>
        
        <br />

        <h2>Aide et support</h2>
        <p><a href="https://france-vae.info" target="_blank">Explorez l'espace documentaire</a> dédié aux professionnels de la VAE. Cet espace regroupe les documents essentiels pour suivre vos premiers candidats. Nous vous conseillons de vous familiariser dès maintenant avec <a href="https://france-vae.info/Cahier-des-charges-ea8790303ab447cfb25b5c11c26b0d67" target="_blank">le cahier des charges des AAP</a>.</p>
        <p>Un <a href="https://reva.crisp.help/fr" target="_blank">centre d'aide</a> et une <a href="https://reva.crisp.help/fr/category/architectes-accompagnateurs-de-parcours-1oikyam" target="_blank">F.A.Q</a> vous permettront également de trouver les réponses à vos principales questions.</p>

        <p>Si jamais vous rencontrez encore des difficultés, n'hésitez pas à nous contacter via la messagerie instantanée (en bas à droite de l'écran sur le site France VAE) ou par email à support@vae.gouv.fr</p>
        <p>L'équipe France VAE.</p>
      </#if>

    <#--  user_profile_type = organism  -->
    <#if (user.attributes.user_profile_type)?has_content && user.attributes.user_profile_type == "organism">
      <#if section="intro">
        <p>Votre établissement mère vous invite à rejoindre l'espace professionnel France VAE en tant que responsable d'agence. </p>
        
        <br />

        <h2>Finalisez votre inscription</h2>
        <p>Il ne vous reste qu'une seule étape : choisir un mot de passe pour vos futures connexions. Nous vous invitons à cliquer sur le bouton ci-dessous.</p>
      <#elseif section="actionButton">
        <a href="${link}" style="display:inline-block;background:#000099;color:white;font-family:Arial, sans-serif;font-size:14px;font-weight:500;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:12px 16px;mso-padding-alt:0px;" target="_blank">Finaliser mon inscription</a>
      <#elseif section="outro">
        <p>Ce lien est valable 4 jours.</p>
        <p>Si vous avez dépassé ce délai, <a href="https://${properties.keycloakHostname}/realms/reva/login-actions/reset-credentials" target="_blank">nous vous invitons à redemander un mot de passe.</a></p>
        
        <br />

        <h2>Gérez vos candidats</h2>
        <p>Une fois inscrit, vous pourrez commencer l’accompagnement des candidats qui vous auront sélectionné.</p>


        <br />

        <h2>Aide et support</h2>
        <p><a href="https://france-vae.info" target="_blank">Explorez l'espace documentaire</a> dédié aux professionnels de la VAE. Cet espace regroupe les documents essentiels pour suivre vos premiers candidats. Nous vous conseillons de vous familiariser dès maintenant avec <a href="https://france-vae.info/Cahier-des-charges-ea8790303ab447cfb25b5c11c26b0d67" target="_blank">le cahier des charges des AAP</a>.</p>
        <p>Un <a href="https://reva.crisp.help/fr" target="_blank">centre d'aide</a> et une <a href="https://reva.crisp.help/fr/category/architectes-accompagnateurs-de-parcours-1oikyam" target="_blank">F.A.Q</a> vous permettront également de trouver les réponses à vos principales questions.</p>

        <p>Si jamais vous rencontrez encore des difficultés, n'hésitez pas à nous contacter via la messagerie instantanée (en bas à droite de l'écran sur le site France VAE) ou par email à support@vae.gouv.fr</p>
        <p>L'équipe France VAE.</p>
      </#if>

    <#--  user_profile_type = certification_authority  -->
    <#elseif (user.attributes.user_profile_type)?has_content && user.attributes.user_profile_type == "certification_authority">
      <#if section="intro">
        <p>Vous avez été référencé en tant que certificateur dans le portail France VAE.</p>
        <p>Pour finaliser votre inscription, il ne vous reste qu'une seule étape : choisir un mot de passe pour vos futures connexions. Nous vous invitons à cliquer sur le bouton ci-dessous.</p>
      <#elseif section="actionButton">
        <a href="${link}" style="display:inline-block;background:#000099;color:white;font-family:Arial, sans-serif;font-size:14px;font-weight:500;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:12px 16px;mso-padding-alt:0px;" target="_blank">Finaliser mon inscription</a>
      <#elseif section="outro">
        <p>Ce lien est valable 4 jours.</p>
        <p>Si vous avez dépassé ce délai, <a href="https://${properties.keycloakHostname}/realms/reva/login-actions/reset-credentials" target="_blank">nous vous invitons à redemander un mot de passe.</a></p>
        <p>Si jamais vous rencontrez encore des difficultés, n'hésitez pas à nous contacter via la messagerie instantanée (en bas à droite de l'écran sur le site France VAE) ou par email à support@vae.gouv.fr</p>
        <p>L'équipe France VAE.</p>
      </#if>

    <#--  default  -->
    <#else>
      <#if section="intro">
        <p>Nous vous remercions pour votre référencement sur la plateforme France VAE. Pour finaliser la création de votre compte, il ne vous reste qu'une seule étape : choisir un mot de passe pour vos futures connexions. Nous vous invitons à cliquer sur le bouton ci-dessous.</p>
      <#elseif section="actionButton">
        <a href="${link}" style="display:inline-block;background:#000099;color:white;font-family:Arial, sans-serif;font-size:14px;font-weight:500;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:12px 16px;mso-padding-alt:0px;" target="_blank">Finaliser mon inscription</a>
      <#elseif section="outro">
        <p>Ce lien est valable 4 jours.</p>
        <p>Si vous avez dépassé ce délai, <a href="https://${properties.keycloakHostname}/realms/reva/login-actions/reset-credentials" target="_blank">nous vous invitons à redemander un mot de passe.</a></p>
        <p>Si jamais vous rencontrez encore des difficultés, n'hésitez pas à nous contacter via la messagerie instantanée (en bas à droite de l'écran sur le site France VAE) ou par email à support@vae.gouv.fr</p>
        <p>L'équipe France VAE.</p>
      </#if>
    </#if>
  </@layout.emailLayout>