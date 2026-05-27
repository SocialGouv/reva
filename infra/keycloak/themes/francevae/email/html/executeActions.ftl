<#import "email-template.ftl" as layout>
<@layout.emailLayout ; section>

    <#assign subject = "Bienvenue sur votre compte professionnel France VAE!!!!">

    <#--  user_profile_type = gestionnaire_maison_mere_aap  -->
    <#if (user.attributes.user_profile_type)?has_content && user.attributes.user_profile_type == "gestionnaire_maison_mere_aap">
        <#assign subject = "Bienvenue sur votre compte professionnel France VAE">

    <#--  user_profile_type = organism  -->
    <#elseif (user.attributes.user_profile_type)?has_content && user.attributes.user_profile_type == "organism">
        <#assign subject = "Vous avez été invité à rejoindre France VAE">

     <#--  user_profile_type = certification_authority  -->
    <#elseif (user.attributes.user_profile_type)?has_content && user.attributes.user_profile_type == "certification_authority">
        <#assign subject = "Activez votre compte Gestionnaire de candidatures administrateur - France VAE">

     <#--  user_profile_type = certification_registry_manager  -->
    <#elseif (user.attributes.user_profile_type)?has_content && user.attributes.user_profile_type == "certification_registry_manager">
        <#assign subject = "Activez votre compte Responsable de certifications - France VAE">

    </#if>

<#--  Mail Subject  -->
    <#if section="title">
        ${subject}
    </#if>

<#--  Mail Body  -->
<#--  Action prioritaire : CONFIGURE_TOTP (prime sur user_profile_type)  -->
    <#if requiredActions?? && requiredActions?seq_contains("CONFIGURE_TOTP")>
        <#--  Sujet TOTP : doit etre defini hors des sections (rendues en plusieurs passes)  -->
        <#assign subject = "Sécurisez votre compte France VAE avec la double authentification">

        <#if section="intro">
            <p>Pour mieux protéger votre compte France VAE, nous vous demandons de mettre en place une <strong>double authentification</strong>.</p>
            <p>À chaque connexion, en plus de votre mot de passe, vous devrez saisir un code à 6 chiffres qui change toutes les 30 secondes.</p>

            <h2>Ce dont vous avez besoin</h2>
            <p>Une application gratuite sur votre téléphone, par exemple :</p>
            <ul>
                <li>Google Authenticator</li>
                <li>Microsoft Authenticator</li>
                <li>FreeOTP</li>
            </ul>

            <h2>Comment faire ?</h2>
            <p>Cliquez sur le bouton ci-dessous depuis votre ordinateur, puis suivez les instructions à l'écran. Vous scannerez un QR code avec votre application pour la lier à votre compte.</p>
        <#elseif section="actionButton">
            <a href="${link}"
               style="display:inline-block;background:#000099;color:white;font-family:Arial, sans-serif;font-size:14px;font-weight:500;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:12px 16px;mso-padding-alt:0px;"
               target="_blank">Activer la double authentification</a>
        <#elseif section="outro">
            <p><i>Ce lien est valable ${linkExpirationFormatter(linkExpiration)}.</i></p>
            <p>Une fois la double authentification activée, vous devrez saisir un nouveau code à chaque connexion. Conservez votre téléphone en sécurité.</p>
            <p>Pour toute question, vous pouvez nous contacter via
                <a href="https://vae.gouv.fr/nous-contacter/" target="_blank">notre formulaire de contact</a>.
            </p>
            <p>Cordialement,</p>
            <p>L'équipe France VAE.</p>
        </#if>

    <#--  user_profile_type = gestionnaire_maison_mere_aap  -->
    <#elseif (user.attributes.user_profile_type)?has_content && user.attributes.user_profile_type == "gestionnaire_maison_mere_aap">
        <#if section="intro">
            <p>${user.attributes.nom_maison_mere_aap}</p>
            <p><strong>Votre compte a été créé avec succès !</strong></p>
            <p>Nous sommes heureux de vous accueillir en tant qu'Architecte Accompagnateur de Parcours (AAP) sur notre plateforme France VAE. Vous serez prochainement visible dans les résultats de recherche des candidats.</p>

            <h2>Prochaine étape : activez votre compte</h2>
            <p>Pour finaliser votre inscription, cliquez sur le bouton ci-dessous, il vous sera demandé de choisir un mot de passe pour vos prochaines connexions :</p>
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
                <li>
                    <a href="https://scribehow.com/viewer/Parametres_de_compte_de_lespace_professionnel_AAP__L1t9XG60QgORY97mqc-7tw"><strong>Paramétrage du compte</strong></a> : Renseignez les informations essentielles à votre référencement sur la plateforme et apparaissez rapidement dans les recherches des candidats. Pour vous accompagner dans votre démarche, suivez notre tutoriel qui vous explique le paramétrage pas à pas.<br /><br />
                </li>
                <li><a href="https://francevae.notion.site/Tutoriels-169100b69ece8378aaee01fa5361aea4">
                    <strong>Tutoriels</strong></a> : Parfois, on a juste besoin d'un petit coup de pouce pour avancer sereinement sur la plateforme. C'est chose possible grâce à nos tutoriels !<br /><br />
                </li>
                <li>
                    <a href="https://vae.gouv.fr/cgu/">
                    <strong>Conditions générales d'utilisation</strong></a> : Familiarisez-vous avec vos responsabilités et les attentes du rôle en consultant le cahier des charges.<br /><br />
                </li>
                <li>
                    <a href="https://francevae.notion.site/Espace-documentaire-8a8100b69ece833d8af001ef76b98a67">
                    <strong>Espace documentaire</strong></a> : Découvrez les documents clés pour accompagner efficacement vos premiers candidats. Cliquez sur l'icône 💡 en bas à droite de votre espace professionnel pour avoir accès à toutes nos ressources.
                </li>
            </ul>
            <p>Pour toute question, vous pouvez consulter notre
                <a href="https://vae.gouv.fr/faq/"
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
            <p>
            La structure
            <#if (user.attributes.nom_maison_mere_aap)?has_content>
                ${user.attributes.nom_maison_mere_aap}
            </#if>
            vient de vous créer un compte collaborateur. Vous êtes désormais rattaché à
            <#if (user.attributes.nom_maison_mere_aap)?has_content>
                ( ${user.attributes.nom_maison_mere_aap} )
            </#if>
            pour des accompagnements.
            </p>

            <br />

            <h2>Prochaine étape : activez votre compte</h2>
            <p>Pour pouvoir utiliser votre compte collaborateur, cliquez sur le bouton ci-dessous, il vous sera demandé de choisir un mot de passe pour vos prochaines connexions :</p>
        <#elseif section="actionButton">
            <a href="${link}"
               style="display:inline-block;background:#000099;color:white;font-family:Arial, sans-serif;font-size:14px;font-weight:500;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:12px 16px;mso-padding-alt:0px;"
               target="_blank">Finaliser mon inscription</a>
        <#elseif section="outro">
            <p><strong style="text-decoration: underline;">Rappel</strong> : Ce lien est valable 4 jours. Si vous avez dépassé ce délai, nous vous invitons à <a
                href="https://${properties.keycloakHostname}/realms/reva/login-actions/reset-credentials"
                target="_blank">redemander un mot de passe
            </a>
            .
            </p>

            <br />

            <h2>Besoin d’aide ?</h2>
            <p>N’hésitez pas à explorer les ressources dédiées aux professionnels de la VAE. Vous y trouverez des informations essentielles pour suivre vos premiers candidats !</p>
            <ul>
                <li>
                    <a href="https://francevae.notion.site/Espace-documentaire-8a8100b69ece833d8af001ef76b98a67" target="_blank">Espace documentaire</a>
                </li>
                <li>
                    <a href="https://vae.gouv.fr/faq/" target="_blank">Notre foire aux questions</a>
                </li>
                <li>
                    <a href="https://francevae.notion.site/Tutoriels-169100b69ece8378aaee01fa5361aea4" target="_blank">Tutoriels</a>
                </li>
            </ul>

            <br />

            <p>Pour toute question, vous pouvez nous contacter via <a href="https://vae.gouv.fr/nous-contacter/" target="_blank">notre formulaire de contact</a>.</p>

            <p>
            Cordialement,
            <br />
            L'équipe France VAE.
            </p>
        </#if>

    <#--  user_profile_type = certification_authority  -->
    <#elseif (user.attributes.user_profile_type)?has_content && user.attributes.user_profile_type == "certification_authority">
        <#if section="intro">
            <p>Votre demande de référencement sur France VAE a bien été prise en compte.</p>
            <p>Activez votre compte <strong>Gestionnaire de candidatures administrateur</strong> dès maintenant :</p>
        <#elseif section="actionButton">
            <a href="${link}"
               style="display:inline-block;background:#000099;color:white;font-family:Arial, sans-serif;font-size:14px;font-weight:500;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:12px 16px;mso-padding-alt:0px;"
               target="_blank">Activer mon compte</a>
        <#elseif section="outro">
            <p>Passé 4 jours, vous pourrez l'activer depuis <a href="https://vae.gouv.fr/" target="_blank">France VAE</a> via <strong>Mot de passe oublié</strong>.</p>
            <p>Pour prendre en main vos missions (recevabilité, dossiers de validation, dates et résultats de jury) et paramétrer vos comptes locaux, consultez le <a href="https://scribehow.com/viewer/Tutoriel_certificateurs__gestion_des_candidatures__iAOKgJsISUOp5K7_zfYhzw?referrer=documents" target="_blank">tutoriel "Certificateurs – Gestion des candidatures"</a>.</p>
            <p>Pour toutes questions liées à vos missions au sein de la plateforme, vous pourrez vous adresser à notre équipe support : <a href="mailto:support@vae.gouv.fr">support@vae.gouv.fr</a></p>
            <p>L'équipe France VAE vous souhaite une bonne intégration.</p>
        </#if>

     <#--  user_profile_type = certification_registry_manager  -->
    <#elseif (user.attributes.user_profile_type)?has_content && user.attributes.user_profile_type == "certification_registry_manager">
        <#if section="intro">
            <p>Votre demande de référencement sur France VAE a bien été prise en compte.</p>
            <p>Activez votre compte <strong>Responsable de certifications</strong> dès maintenant :</p>
        <#elseif section="actionButton">
            <a href="${link}"
               style="display:inline-block;background:#000099;color:white;font-family:Arial, sans-serif;font-size:14px;font-weight:500;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:12px 16px;mso-padding-alt:0px;"
               target="_blank">Activer mon compte</a>
        <#elseif section="outro">
            <p>Passé 4 jours, vous pourrez l'activer depuis <a href="https://vae.gouv.fr/" target="_blank">France VAE</a> via <strong>Mot de passe oublié</strong>.</p>
            <p>Afin de bénéficier d'un appui à la prise en main des fonctionnalités liées à vos missions sur la plateforme, nous vous invitons à consulter le <a href="https://scribehow.com/viewer/Tutoriel_du_Responsable_des_Certifications__7T3db0CzTtSaRV4tXSubfw?referrer=documents" target="_blank">tutoriel "Responsable des Certifications"</a> et les ressources mises à votre disposition dans l'<a href="https://www.notion.so/Espace-documentaire-2ea100b69ece81fc9cded783f96d88e8?pvs=21" target="_blank">espace documentaire des certificateurs</a></p>
            <p>Pour toutes questions liées à vos missions au sein de la plateforme, vous pourrez vous adresser à notre équipe support via <a href="https://vae.gouv.fr/nous-contacter/" target="_blank">https://vae.gouv.fr/nous-contacter/</a></p>
            <p>L'équipe France VAE vous souhaite une bonne intégration au sein de la plateforme.</p>
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
