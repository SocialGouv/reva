<#import "email-template.ftl" as layout>
<@layout.emailLayout ; section>
    <#if section = "title">
      France VAE - Invitation à changer de mot de passe
    <#elseif section = "intro">
      Dans une démarche de renforcement de la sécurité de France VAE, nous vous prions de bien vouloir choisir un nouveau mot de passe. Pour cela, cliquez sur le lien ci-dessous:
    <#elseif section = "actionButton">
      <a href="${link}" style="display:inline-block;background:#000099;color:white;font-family:Arial, sans-serif;font-size:14px;font-weight:500;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:12px 16px;mso-padding-alt:0px;" target="_blank"><span style="font-size:14px;">Mettre à jour mon mot de passe</span></a>
    <#elseif section = "outro">
      <p class="text-build-content" data-testid="I0ETIbJm4" style="margin: 10px 0; margin-top: 10px;">Ce lien expire dans ${linkExpirationFormatter(linkExpiration)}.</p>
      <p class="text-build-content" data-testid="I0ETIbJm4" style="margin: 10px 0; margin-top: 10px;">Si vous ne parvenez pas à utiliser ce lien à temps, vous pourrez utiliser le lien "mot de passe oublié" présent sur la page d'identification.</p>
    </#if>
</@layout.emailLayout>