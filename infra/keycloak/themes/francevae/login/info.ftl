<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false; section>
    <#if section = "header">
        <#if messageHeader??>
        ${messageHeader}
        <#else>
        ${message.summary}
        </#if>
    <#elseif section = "form">
    <div id="kc-info-message">
        <h3>Bienvenue sur Reva</h3>
        <p class="instruction">${message.summary}<#if requiredActions??><#list requiredActions>: <ul><#items as reqActionItem><li>${msg("requiredAction.${reqActionItem}")}</li><#sep></#items></ul></#list><#else></#if></p>
        <#if pageRedirectUri?has_content>
            <a  class="fr-link" href="${pageRedirectUri}">Poursuivre sur Reva</a>
        <#elseif actionUri?has_content>
            <a class="fr-link" href="${actionUri}">Poursuivre sur Reva</a>
        <#elseif (client.baseUrl)?has_content>
            <a href="${client.baseUrl}">Poursuivre sur Reva</a>
        <#else>
            <a class="fr-link" href="${properties.revaUrl}">Poursuivre sur Reva</a>
        </#if>
    </div>
    </#if>
</@layout.registrationLayout>