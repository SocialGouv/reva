<#import "email-template.ftl" as layout>
  <@layout.emailLayout ; section>
    <#if section="title">
      Réinitialisation de votre mot de passe France VAE
      <#elseif section="intro">
        Nous avons reçu une demande de récupération de mot de passe pour le site France VAE pour cette adresse électronique. Si vous avez bien effectué cette demande, vous pouvez changer de mot de passe en cliquant sur le lien ci-dessous:
        <a href="${link}" style="display:inline-block;background:#00007f;color:white;font-family:Arial, sans-serif;font-size:18px;font-weight:500;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:15px 24px;mso-padding-alt:0px;" target="_blank">Choisir un nouveau mot de passe</a>
        <#elseif section="outro">
          <p class="text-build-content" data-testid="I0ETIbJm4" style="margin: 10px 0;">Si vous n'êtes pas à l'origine de cette demande, merci de ne pas tenir compte de ce mail.
          </p>
          <p class="text-build-content" data-testid="I0ETIbJm4" style="margin: 0; margin-bottom: 10px;">Ce lien expire dans ${linkExpirationFormatter(linkExpiration)}.</p>
    </#if>
  </@layout.emailLayout>