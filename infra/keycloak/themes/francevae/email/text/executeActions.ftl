<#ftl output_format="plainText">
<#assign requiredActionsText><#if requiredActions??><#list requiredActions><#items as reqActionItem>${msg("requiredAction.${reqActionItem}")}<#sep>, </#items></#list><#else></#if></#assign>

<#if requiredActions?? && requiredActions?seq_contains("CONFIGURE_TOTP")>
Bonjour,

Pour mieux protéger votre compte France VAE, nous vous demandons de mettre en place une double authentification.

À chaque connexion, en plus de votre mot de passe, vous devrez saisir un code à 6 chiffres qui change toutes les 30 secondes.

Ce dont vous avez besoin :
- Une application gratuite sur votre téléphone (Google Authenticator, Microsoft Authenticator, FreeOTP...)

Pour activer la double authentification, cliquez sur le lien ci-dessous depuis votre ordinateur :

${link}

Ce lien est valable ${linkExpirationFormatter(linkExpiration)}.

Pour toute question, contactez-nous via https://francevae.crisp.help/fr/?contact

Cordialement,
L'équipe France VAE.
<#else>
${msg("executeActionsBody",link, linkExpiration, realmName, requiredActionsText, linkExpirationFormatter(linkExpiration), linkExpiration)}
</#if>
