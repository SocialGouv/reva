<#import "template.ftl" as layout>
    <@layout.registrationLayout displayMessage=false; section>
        <#if section="header">
            <#if messageHeader??>
                ${messageHeader}
                <#else>
                    ${message.summary}
            </#if>
            <#elseif section="form">
                <div id="kc-info-message">
                    <h3 style="margin-top:2rem;"> Bienvenue sur France VAE</h3>
                    <p class="instruction">
                        ${message.summary}
                        <#if requiredActions??>
                            <#list requiredActions>: <ul>
                                    <#items as reqActionItem>
                                        <li>
                                            ${msg("requiredAction.${reqActionItem}")}
                                        </li>
                                        <#sep>
                                    </#items>
                                </ul>
                            </#list>
                            <#else>
                        </#if>
                    </p>
                    <#if pageRedirectUri?has_content>
                        <a class="fr-link" href="${pageRedirectUri}">Poursuivre sur France VAE</a>
                        <#elseif actionUri?has_content>
                            <a class="fr-link" href="${actionUri}">Poursuivre sur France VAE</a>
                            <#elseif (client.baseUrl)?has_content>
                                <a href="${client.baseUrl}">Poursuivre sur France VAE</a>
                                <#else>
                                    <a class="fr-link" href="${properties.revaUrl}">Poursuivre sur France VAE</a>
                    </#if>
                </div>
        </#if>
    </@layout.registrationLayout>