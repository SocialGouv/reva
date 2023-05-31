<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=true displayMessage=!messagesPerField.existsError('username'); section>
    <#if section = "header">
        ${msg("emailForgotTitle")}
    <#elseif section = "form">

<main class="fr-pt-md-14v" role="main" id="content">
    <div class="fr-container fr-container--fluid fr-mb-md-14v">
        <div class="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
            <div class="fr-col-12 fr-col-md-8 fr-col-lg-6">
                <div class="fr-container fr-background-alt--grey fr-px-md-0 fr-py-10v fr-py-md-14v">
                    <div class="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
                        <div class="fr-col-12 fr-col-md-9 fr-col-lg-8">
                            <h1>Mot de passe oublié</h1>
                            <div>

                                <form id="kc-reset-password-form" class="${properties.kcFormClass!}" action="${url.loginAction}" method="post">
                                    <#if messagesPerField.existsError('username')>
                                        <div class="fr-alert fr-alert--error" role="alert">
                                            <h3 class="fr-alert__title">Une erreur est survenue</h3>
                                            <p>${kcSanitize(messagesPerField.get('username'))?no_esc}</p>
                                        </div>
                                    </#if>
                                    <div class="fr-fieldset__element">
                                        <fieldset class="fr-fieldset" id="credentials" aria-labelledby="credentials-messages">
                                            <div class="fr-fieldset__element">
                                                <div class="fr-input-group">
                                                    <label class="fr-label" for="username">
                                                        Courrier électronique
                                                        <span class="fr-hint-text">Format attendu : nom@domaine.fr</span>
                                                    </label>

                                                    <#if auth?has_content && auth.showUsername()>
                                                        <input class="fr-input" 
                                                        autofocus
                                                        autocomplete="email"
                                                        name="username" id="username" 
                                                        aria-required="true" 
                                                        aria-describedby="username-messages"
                                                        aria-invalid="<#if messagesPerField.existsError('username')>true</#if>"
                                                        value="${auth.attemptedUsername}" type="text" >

                                                    <#else>
                                                        <input class="fr-input" 
                                                        autofocus
                                                        autocomplete="email"
                                                        name="username" id="username" 
                                                        aria-required="true" 
                                                        aria-describedby="username-messages"
                                                        aria-invalid="<#if messagesPerField.existsError('username')>true</#if>"
                                                        type="text" >
                                                    </#if>
                                                    
                                                    <div class="fr-messages-group sr-only" id="username-messages" aria-live="assertive">
                                                        Saisissez l'email associé à votre compte.
                                                    </div>
                                                </div>
                                            </div>
                                        </fieldset>
                                        <div class="mt-4">
                                                <span><a href="${url.loginUrl}" class="fr-link">${kcSanitize(msg("backToLogin"))?no_esc}</a></span>
                                            </div>
                                         <div class="fr-fieldset__element mt-4">
                                            <ul class="fr-btns-group">
                                                <li>
                                                    <button type="submit" class="fr-mt-2v fr-btn">
                                                        ${msg("doSubmit")}
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                        <div class="mt-4">
                                            ${msg("emailInstruction")}
                                        </div>
                                    </div>
                                </form>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>

    </#if>
</@layout.registrationLayout>
