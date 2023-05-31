<#import "template.ftl" as layout>
    <@layout.registrationLayout displayMessage=!messagesPerField.existsError('password','password-confirm'); section>
        <#if section="header">
            ${msg("updatePasswordTitle")}
            <#elseif section="form">
                <main class="fr-pt-md-14v" role="main" id="content">
                    <div class="fr-container fr-container--fluid fr-mb-md-14v">
                        <div class="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
                            <div class="fr-col-12 fr-col-md-8 fr-col-lg-6">
                                <div class="fr-container fr-background-alt--grey fr-px-md-0 fr-py-10v fr-py-md-14v">
                                    <div class="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
                                        <div class="fr-col-12 fr-col-md-9 fr-col-lg-8">
                                            <h1>Merci de choisir un mot de passe</h1>
                                            <form id="kc-passwd-update-form" class="${properties.kcFormClass!}" action="${url.loginAction}" method="post">
                                                <#if messagesPerField.existsError('password-confirm')>
                                                    <div class="fr-alert fr-alert--error" role="alert">
                                                        <h3 class="fr-alert__title">Une erreur est survenue</h3>
                                                        <p>
                                                            ${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}
                                                        </p>
                                                    </div>
                                                </#if>
                                                <#if messagesPerField.existsError('password')>
                                                    <div class="fr-alert fr-alert--error" role="alert">
                                                        <h3 class="fr-alert__title">Une erreur est survenue</h3>
                                                        <p>
                                                            ${kcSanitize(messagesPerField.get('password'))?no_esc}
                                                        </p>
                                                    </div>
                                                </#if>
                                                <#if message?has_content && message.type=='error'>
                                                    <div class="fr-alert fr-alert--error" role="alert">
                                                        <h3 class="fr-alert__title">Une erreur est survenue</h3>
                                                        <p>
                                                            ${kcSanitize(message.summary)?no_esc}
                                                        </p>
                                                    </div>
                                                </#if>
                                                <fieldset class="fr-fieldset" style="margin-top:1rem;" id="credentials" aria-labelledby="credentials-messages">
                                                    <input type="text" id="username" name="username" value="${username}" autocomplete="username"
                                                        readonly="readonly" style="display:none;" />
                                                    <input type="password" id="password" name="password" autocomplete="current-password" style="display:none;" />
                                                    <div class="fr-fieldset__element">
                                                        <div class="fr-input-group">
                                                            <label class="fr-label" for="password-new">
                                                                ${msg("passwordNew")}
                                                            </label>
                                                            <input class="fr-input"
                                                                autofocus
                                                                type="password"
                                                                autocomplete=" new-password"
                                                                name="password-new" id="password-new"
                                                                aria-required="true"
                                                                aria-describedby="nouveau mot de passe"
                                                                aria-invalid="<#if messagesPerField.existsError('password','password-confirm')>true</#if>" />
                                                            <div class="fr-messages-group sr-only" id="password-new-messages" aria-live="assertive">
                                                                Saisissez votre nouveau mot de passe
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="fr-fieldset__element" style="margin-top:1rem;">
                                                        <div class="fr-input-group">
                                                            <label class="fr-label" for="password-new">
                                                                ${msg("passwordConfirm")}
                                                            </label>
                                                            <input class="fr-input"
                                                                autofocus
                                                                type="password"
                                                                autocomplete="new-password"
                                                                name="password-confirm" id="password-confirm"
                                                                aria-required="true"
                                                                aria-describedby="confirmation du nouveau mot de passe"
                                                                aria-invalid="<#if messagesPerField.existsError('password-confirm')>true</#if>" />
                                                            <div class="fr-messages-group sr-only" id="password-confirm-messages" aria-live="assertive">
                                                                Confirmez votre nouveau mot de passe
                                                            </div>
                                                        </div>
                                                    </div>
                                                </fieldset>
                                                <div class="${properties.kcFormGroupClass!}" style="margin-top:2rem;">
                                                    <div id="kc-form-options" class="${properties.kcFormOptionsClass!}">
                                                        <div class="${properties.kcFormOptionsWrapperClass!}">
                                                            <#if isAppInitiatedAction??>
                                                                <div class="checkbox">
                                                                    <label><input type="checkbox" class="fr-checkbox" id="logout-sessions" name="logout-sessions" value="on" checked>
                                                                        ${msg("logoutOtherSessions")}
                                                                    </label>
                                                                </div>
                                                            </#if>
                                                        </div>
                                                    </div>
                                                    <div id="kc-form-buttons" class="${properties.kcFormButtonsClass!}">
                                                        <#if isAppInitiatedAction??>
                                                            <input class="fr-btn" type="submit" value="${msg("doSubmit")}" />
                                                            <button class="fr-btn fr-btn--secondary" type="submit" name="cancel-aia" value="true" />
                                                            ${msg("doCancel")}
                                                            </button>
                                                            <#else>
                                                                <input class="fr-btn" type="submit" value="${msg("doSubmit")}" />
                                                        </#if>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
        </#if>
    </@layout.registrationLayout>