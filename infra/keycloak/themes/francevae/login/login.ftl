<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>
    <#if section = "header">

    <#elseif section = "form">

    <div class="fr-pt-md-14v">
    <div class="fr-container fr-container--fluid fr-mb-md-14v">
        <div class="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
            <div class="fr-col-12 fr-col-md-8 fr-col-lg-6">
                <div class="fr-container fr-background-alt--grey fr-px-md-0 fr-py-10v fr-py-md-14v">
                    <div class="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
                        <div class="fr-col-12 fr-col-md-9 fr-col-lg-9">
                            <h2>Connexion à votre espace professionnel</h2>
                            <div>
                                <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
                                    <fieldset class="fr-fieldset" id="login-fieldset" aria-labelledby="login-fieldset-legend login-fieldset-messages">
                                        <#if message?has_content>
                                            <#if message.type == 'error'>
                                                <div class="fr-alert fr-alert--error" role="alert">
                                                    <h3 class="fr-alert__title">Une erreur est survenue</h3>
                                                    <p>${kcSanitize(message.summary)?no_esc}</p>
                                                </div>
                                            <#elseif message.type == 'warning'>
                                                <div class="fr-alert fr-alert--warning">
                                                    <h3 class="fr-alert__title">Attention</h3>
                                                    <p>${kcSanitize(message.summary)?no_esc}</p>
                                                </div>
                                            <#else>
                                                <div class="fr-alert fr-alert--success">
                                                    <h3 class="fr-alert__title">Succès</h3>
                                                    <p>${kcSanitize(message.summary)?no_esc}</p>
                                                </div>
                                            </#if>
                                        </#if>
                                        <div class="fr-fieldset__element">
                                            <fieldset class="fr-fieldset" id="credentials" aria-labelledby="credentials-messages">
                                                <div class="fr-fieldset__element">
                                                    <div class="fr-input-group">
                                                        <label class="fr-label" for="username">
                                                            Saisissez votre e-mail pour vous connecter
                                                        </label>
                                                        <#if usernameEditDisabled??>
                                                            <input class="fr-input" aria-describedby="username-messages" name="username" id="username" value="${(login.username!'')}" type="text" disabled >
                                                        <#else>
                                                            <input class="fr-input" 
                                                            autofocus
                                                            autocomplete="email"
                                                            name="username" id="username" 
                                                            aria-required="true" 
                                                            aria-describedby="username-messages"
                                                            aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
                                                            value="${(login.username!'')}" type="text" >
                                                        </#if>
                                                        <div class="fr-messages-group sr-only" id="username-messages" aria-live="assertive">
                                                            Saisissez l'email associé à votre compte.
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="fr-fieldset__element mt-4">
                                                    <div class="fr-password" id="password">
                                                        <label class="fr-label" for="password-input">
                                                            Saisissez votre mot de passe
                                                        </label>
                                                        <div class="fr-input-wrap">
                                                            <input class="fr-password__input fr-input" 
                                                            aria-describedby="password-input-messages" 
                                                            aria-required="true" 
                                                            name="password" 
                                                            autocomplete="current-password" 
                                                            id="password-input" type="password">
                                                        </div>
                                                        <div class="fr-messages-group" id="password-input-messages" aria-live="assertive">
                                                        </div>
                                                        <#if realm.resetPasswordAllowed>
                                                            <div class="mt-2">
                                                                <p>
                                                                    <a href="${url.loginResetCredentialsUrl}" class="fr-link">${msg("doForgotPassword")}</a>
                                                                </p>
                                                            </div>
                                                        </#if>
                                                    </div>
                                                </div>
                                                <div class="fr-messages-group sr-only" id="credentials-messages" aria-live="assertive">
                                                    Saisissez le mot de passe de votre compte.
                                                </div>
                                            </fieldset>
                                        </div>

                                        <#if realm.rememberMe && !usernameEditDisabled??>
                                            <div class="fr-fieldset__element">
                                                <div class="fr-checkbox-group fr-checkbox-group--sm">
                                                    <#if login.rememberMe??>
                                                        <input name="remember" id="remember" type="checkbox" aria-describedby="remember-messages" checked>
                                                    <#else>
                                                        <input name="remember" id="remember" type="checkbox" aria-describedby="remember-messages">
                                                    </#if>
                                                    <label class="fr-label" for="remember">
                                                        ${msg("rememberMe")}
                                                    </label>
                                                    <div class="fr-messages-group sr-only" id="remember-messages" aria-live="assertive">
                                                        Se souvenir de moi
                                                    </div>
                                                </div>
                                            </div>
                                        </#if>
                                        <div class="fr-fieldset__element fr-btns-group mt-4">
                                            <button type="submit" class="fr-mt-2v fr-btn">
                                                Connectez-vous
                                            </button>
                                        </div>
                                        <div class="fr-messages-group" id="login-fieldset-messages" aria-live="assertive">
                                        </div>
                                    </fieldset>
                                </form>
                            </div>
                            
                            <hr>
                            <h3>Vous n’avez pas de compte architecte accompagnateur de parcours ?</h3>
                            <div class="fr-btns-group">
                                <a class="fr-btn fr-btn--secondary" href="${properties.revaUrl}/espace-professionnel/creation">
                                    Créez votre compte
                                </a>
                            </div>                 
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</#if>

</@layout.registrationLayout>
