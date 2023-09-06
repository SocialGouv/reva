<#import "email-template.ftl" as layout>
<@layout.emailLayout ; section>
    <#if section = "title">
      France VAE - Vérification de votre courriel
    <#elseif section = "intro">
      Afin de finaliser la création de votre compte, merci de cliquer sur le bouton ci-dessous. 
    <#elseif section = "actionButton">
      <a href="${link}" style="display:inline-block;background:#00007f;color:white;font-family:Arial, sans-serif;font-size:18px;font-weight:500;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:15px 24px;mso-padding-alt:0px;" target="_blank"><span style="font-size:14px;">Valider mon courriel</span></a>
    <#elseif section = "outro">
      <p class="text-build-content" data-testid="I0ETIbJm4" style="margin: 10px 0; margin-top: 10px;">
      Si vous n'êtes pas à l'origine de cette création vous pouvez ignorer cet email. 
      </p>
    </#if>
</@layout.emailLayout>
