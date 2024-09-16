<#import "email-template.ftl" as layout>
<@layout.emailLayout ; section>

    <#assign subject = "Bienvenue sur votre compte professionnel France VAE">

<#--  user_profile_type = organism  -->
    <#if (user.attributes.user_profile_type)?has_content && (user.attributes.user_profile_type == "organism" || user.attributes.user_profile_type == "gestionnaire_maison_mere_aap")>
        <#assign subject = "Bienvenue sur votre compte professionnel France VAE">

    <#--  user_profile_type = certification_authority  -->
    <#elseif (user.attributes.user_profile_type)?has_content && user.attributes.user_profile_type == "certification_authority">
        <#assign subject = "Accédez à votre espace certificateur France VAE">

    </#if>
     <#--  user_profile_type = certification_registry_manager  -->
    <#elseif (user.attributes.user_profile_type)?has_content && user.attributes.user_profile_type == "certification_registry_manager">
        <#assign subject = "Créez votre compte Responsable des certifications dès maintenant">

    </#if>

<#--  Mail Subject  -->
    <#if section="title">
        ${subject}
    </#if>

<#--  Mail Body  -->
<#--  user_profile_type = gestionnaire_maison_mere_aap  -->
    <#if (user.attributes.user_profile_type)?has_content && user.attributes.user_profile_type == "gestionnaire_maison_mere_aap">
        <#if section="intro">
            <p>Votre compte a été créé avec succès ! Nous sommes heureux de vous accueillir en tant qu'Architecte
                Accompagnateur de Parcours (AAP) sur notre plateforme France VAE. Votre structure est désormais visible
                par les candidats.</p>

            <h2>Prochaine étape : activez votre compte</h2>
            <p>Pour finaliser votre inscription, cliquez sur le bouton ci-dessous, il vous sera demandé de choisir un
                mot de passe pour vos prochaines connexions :</p>
        <#elseif section="actionButton">
            <a href="${link}"
               style="display:inline-block;background:#000099;color:white;font-family:Arial, sans-serif;font-size:14px;font-weight:500;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:12px 16px;mso-padding-alt:0px;"
               target="_blank">Finaliser mon inscription</a>
        <#elseif section="outro">
            <p><i>Note : Ce lien restera actif pendant 4 jours.</i> Si vous avez dépassé ce délai,
                <a href="https://${properties.keycloakHostname}/realms/reva/login-actions/reset-credentials"
                   target="_blank">nous vous invitons à redemander un mot de passe.
                </a>
            </p>

            <h2>Tout ce qu’il faut savoir pour bien démarrer</h2>
            <ul>
                <li><strong>Mode invisible</strong> : Besoin d’un peu de temps pour vous familiariser avec l’univers
                    France VAE ? Profitez du mode invisible (activable depuis les paramètres de votre compte) pour vous
                    documenter avant de recevoir vos premières candidatures. Cliquez sur l’icône 💡en bas à droite dans
                    votre espace personnel pour avoir accès à toutes nos ressources.<br /><br />
                </li>
                <li><strong>Webinaires</strong> : Participez à nos différents webinaires et obtenez toutes les
                    informations nécessaires à
                    votre nouveau rôle d’AAP. Vous serez régulièrement informé des sujets via notre
                    newsletter.<br /><br />
                </li>
                <li><strong>Tutoriels</strong> : Parfois, on a juste besoin d’un petit coup de pouce pour avancer
                    sereinement sur la plateforme. C’est chose possible grâce à nos tutoriels !<br /><br />
                </li>
                <li>
                    <a href="https://vae.gouv.fr/savoir-plus/"><strong>Espace d’informations</strong></a> : Découvrez
                    les documents clés pour accompagner efficacement vos premiers candidats.<br /><br />
                </li>
                <li>
                    <a href="https://fabnummas.notion.site/Cahier-des-charges-ea8790303ab447cfb25b5c11c26b0d67">
                        <strong> Cahier des charges des AAP</strong></a> : Familiarisez-vous avec vos responsabilités et
                    les attentes du rôle.<br /><br />
                </li>
                <li>
                    <strong>Dossier de faisabilité</strong> : Téléchargez les dossiers de faisabilité et modifiez-les
                    via Adobe Reader.<br /><br />
                </li>
                <li><strong>Facturation</strong> : Vous devrez adresser une seule facturation en fin d’accompagnement à
                    Uniformation. <i>Bon à savoir</i> : Si vous décidez de prescrire une formation à votre candidat,
                    votre organisme devra avancer les frais de formation.
                </li>
            </ul>
            <p>Pour toute question, vous pouvez consulter notre
                <a href="https://reva.crisp.help/fr/category/architectes-accompagnateurs-de-parcours-1oikyam"
                   target="_blank">FAQ
                </a> ou nous contacter via
                <a href="https://vae.gouv.fr/nous-contacter/" target="_blank">notre formulaire de contact</a>.
            </p>
            <p>Cordialement,</p>
            <p>L'équipe France VAE.</p>
        </#if>

    <#--  user_profile_type = organism  -->
    <#elseif (user.attributes.user_profile_type)?has_content && user.attributes.user_profile_type == "organism">
        <#if section="intro">
            <p>L'agence administratrice
            <#if (user.attributes.nom_maison_mere_aap)?has_content>
                ${user.attributes.nom_maison_mere_aap}
            </#if>
             vous invite à rejoindre l'espace professionnel France VAE en tant que responsable d'agence. </p>

            <br />

            <h2>Finalisez votre inscription</h2>
            <p>Il ne vous reste qu'une seule étape : choisir un mot de passe pour vos futures connexions. Nous vous
                invitons à cliquer sur le bouton ci-dessous.</p>
        <#elseif section="actionButton">
            <a href="${link}"
               style="display:inline-block;background:#000099;color:white;font-family:Arial, sans-serif;font-size:14px;font-weight:500;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:12px 16px;mso-padding-alt:0px;"
               target="_blank">Finaliser mon inscription</a>
        <#elseif section="outro">
            <p>Ce lien est valable 4 jours.</p>
            <p>Si vous avez dépassé ce délai, <a
                        href="https://${properties.keycloakHostname}/realms/reva/login-actions/reset-credentials"
                        target="_blank">nous vous invitons à redemander un mot de passe</a>.</p>

            <br />

            <h2>Gérez vos candidats</h2>
            <p>Une fois inscrit, vous pourrez commencer l’accompagnement des candidats qui vous auront sélectionné.</p>


            <br />

            <h2>Aide et support</h2>
            <p><a href="https://france-vae.info" target="_blank">Explorez l'espace documentaire</a> dédié aux
                professionnels de la VAE. Cet espace regroupe les documents essentiels pour suivre vos premiers
                candidats. Nous vous conseillons de vous familiariser dès maintenant avec <a
                        href="https://france-vae.info/Cahier-des-charges-ea8790303ab447cfb25b5c11c26b0d67"
                        target="_blank">le cahier des charges des AAP</a>.</p>
            <p>Un <a href="https://reva.crisp.help/fr" target="_blank">centre d'aide</a> et une <a
                        href="https://reva.crisp.help/fr/category/architectes-accompagnateurs-de-parcours-1oikyam"
                        target="_blank">F.A.Q</a> vous permettront également de trouver les réponses à vos principales
                questions.</p>

            <p>Si jamais vous rencontrez encore des difficultés, n'hésitez pas à nous contacter via la messagerie
                instantanée (en bas à droite de l'écran sur le site France VAE) ou par email à support@vae.gouv.fr</p>
            <p>L'équipe France VAE.</p>
        </#if>

    <#--  user_profile_type = certification_authority  -->
    <#elseif (user.attributes.user_profile_type)?has_content && user.attributes.user_profile_type == "certification_authority">
        <#if section="intro">
            <p>Vous avez été référencé en tant que certificateur dans le portail France VAE.</p>
            <p>Pour finaliser votre inscription, il ne vous reste qu'une seule étape : choisir un mot de passe pour vos
                futures connexions. Nous vous invitons à cliquer sur le bouton ci-dessous.</p>
        <#elseif section="actionButton">
            <a href="${link}"
               style="display:inline-block;background:#000099;color:white;font-family:Arial, sans-serif;font-size:14px;font-weight:500;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:12px 16px;mso-padding-alt:0px;"
               target="_blank">Finaliser mon inscription</a>
        <#elseif section="outro">
            <p>Ce lien est valable 4 jours.</p>
            <p>Si vous avez dépassé ce délai, <a
                        href="https://${properties.keycloakHostname}/realms/reva/login-actions/reset-credentials"
                        target="_blank">nous vous invitons à redemander un mot de passe.</a></p>
            <p>Si jamais vous rencontrez encore des difficultés, n'hésitez pas à nous contacter via la messagerie
                instantanée (en bas à droite de l'écran sur le site France VAE) ou par email à support@vae.gouv.fr</p>
            <p>L'équipe France VAE.</p>
        </#if>
    
     <#--  user_profile_type = certification_registry_manager  -->
    <#elseif (user.attributes.user_profile_type)?has_content && user.attributes.user_profile_type == "certification_registry_manager">
        <#if section="intro">
            <p>En tant que responsable des certifications, vous devez créer votre compte pour profiter d’un espace dédié à vos missions dans la plateforme France VAE  (éditer, corriger, modifier et valider les informations clés liées aux certifications en vue de leur publication sur France VAE).</p>
            <p>Vous pouvez le faire dès à présent en cliquant sur le bouton ci-dessous : </p>
        <#elseif section="actionButton">
            <a href="${link}"
               style="display:inline-block;background:#000099;color:white;font-family:Arial, sans-serif;font-size:14px;font-weight:500;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:12px 16px;mso-padding-alt:0px;"
               target="_blank">Créer mon compte</a>
        <#elseif section="outro">
            <p>Ce lien est valable 4 jours.</p>
            <p>Si vous avez dépassé ce délai, <a
                        href="https://${properties.keycloakHostname}/realms/reva/login-actions/reset-credentials"
                        target="_blank">nous vous invitons à redemander un mot de passe.</a></p>
            <p>Nous restons disponibles si vous avez la moindre question.</p>
            <p>L'équipe France VAE.</p>
        </#if>

    <#--  default  -->
    <#else>
        <#if section="intro">
            <p>Nous vous remercions pour votre référencement sur la plateforme France VAE. Pour finaliser la création de
                votre compte, il ne vous reste qu'une seule étape : choisir un mot de passe pour vos futures connexions.
                Nous vous invitons à cliquer sur le bouton ci-dessous.</p>
        <#elseif section="actionButton">
            <a href="${link}"
               style="display:inline-block;background:#000099;color:white;font-family:Arial, sans-serif;font-size:14px;font-weight:500;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:12px 16px;mso-padding-alt:0px;"
               target="_blank">Finaliser mon inscription</a>
        <#elseif section="outro">
            <p>Ce lien est valable 4 jours.</p>
            <p>Si vous avez dépassé ce délai, <a
                        href="https://${properties.keycloakHostname}/realms/reva/login-actions/reset-credentials"
                        target="_blank">nous vous invitons à redemander un mot de passe.</a></p>
            <p>Si jamais vous rencontrez encore des difficultés, n'hésitez pas à nous contacter via la messagerie
                instantanée (en bas à droite de l'écran sur le site France VAE) ou par email à support@vae.gouv.fr</p>
            <p>L'équipe France VAE.</p>
        </#if>
    </#if>
</@layout.emailLayout>