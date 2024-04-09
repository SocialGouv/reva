module View exposing (AlertType(..), alert, article, backLink, errors, image, infoBlock, infoHint, layout, layoutWithLargeSidebar, logo, noticeInfo, popupErrors, skeleton, stepper, summaryBlock, summaryBlockWithItems, title, warningHint)

import Accessibility exposing (br, button, h3, h5, hr, nav, p, span)
import Accessibility.Aria as Aria
import Api.Token
import BetaGouv.DSFR.Button as Button
import BetaGouv.DSFR.Icons.System as Icons
import Data.Context exposing (Context)
import Html exposing (Html, div, h2, h6, img, node, text)
import Html.Attributes exposing (attribute, class, id, src)
import Html.Attributes.Extra exposing (role)
import Url.Builder
import View.Helpers exposing (dataTest)


title : String -> Html msg
title s =
    h2
        [ class "text-4xl font-medium text-gray-900 leading-none"
        , class "mt-6 mb-10"
        ]
        [ text s ]


image : List (Html.Attribute msg) -> String -> String -> Html msg
image attributes baseUrl imgName =
    img ((src <| Url.Builder.absolute [ baseUrl, imgName ] []) :: attributes) []


skeleton : String -> Html msg
skeleton extraClass =
    div
        [ class "animate-pulse bg-gray-100"
        , class extraClass
        ]
        []


baseLayout : Context -> List (Html msg) -> Html msg
baseLayout context content =
    let
        bgClass =
            if Api.Token.isAdmin context.token then
                "lg:bg-admin"

            else if Api.Token.isOrganism context.token then
                "lg:bg-organism"

            else if
                Api.Token.isCertificationAuthority context.token
                    || Api.Token.isAdminCertificationAuthority context.token
            then
                "lg:bg-certification-authority"

            else
                "lg:bg-unknown"
    in
    node "main"
        [ role "main"
        , class "flex relative bg-triangle"
        , class bgClass
        , id "content"
        ]
        [ div
            [ class "fr-container" ]
            [ div
                [ class "lg:mt-8 fr-grid-row"
                , class "bg-white lg:shadow-lifted mb-12"
                ]
                content
            ]
        ]


layoutHelper :
    Context
    ->
        { sidebarClasses : String
        , mainClasses : String
        , navContent : List (Html msg)
        , navButtonLabel : String
        , content : List (Html msg)
        }
    -> Html msg
layoutHelper context config =
    baseLayout context
        [ div
            [ class config.sidebarClasses ]
            [ nav
                [ role "navigation"
                , attribute "aria-label" "Menu latéral"
                , class "fr-sidemenu bg-white"
                , class "h-full lg:pl-2 pr-0 py-2 md:py-6"
                ]
                [ div
                    [ class "h-full md:border-r mr-1 lg:mr-0" ]
                    [ div
                        [ class "fr-sidemenu__inner"
                        , class "shadow-none pr-0"
                        , class "h-full lg:pl-4 md:pb-24"
                        ]
                      <|
                        -- When the nav context is empty, we remove the wrapper.
                        -- As a result, on mobile, we can close the nav when browsing to a new page
                        if config.navContent == [] then
                            [ div [ class "h-12 mr-24 animate-pulse" ] [] ]

                        else
                            [ button
                                [ class "fr-sidemenu__btn"
                                , attribute "aria-controls" "fr-sidemenu-wrapper"
                                , attribute "aria-expanded" "false"
                                ]
                                [ text config.navButtonLabel ]
                            , div
                                [ class "fr-collapse"
                                , id "fr-sidemenu-wrapper"
                                ]
                                config.navContent
                            ]
                    ]
                ]
            ]
        , div
            [ class config.mainClasses, class "pt-3 md:pt-0" ]
            config.content
        ]


layout : Context -> String -> List (Html msg) -> List (Html msg) -> Html msg
layout context navButtonLabel navContent content =
    layoutHelper context
        { sidebarClasses = "fr-col-12 fr-col-md-3"
        , mainClasses = "fr-col-12 fr-col-md-9"
        , navButtonLabel = navButtonLabel
        , navContent = navContent
        , content = content
        }


layoutWithLargeSidebar : Context -> String -> List (Html msg) -> List (Html msg) -> Html msg
layoutWithLargeSidebar context navButtonLabel navContent content =
    layoutHelper context
        { sidebarClasses = "fr-col-12 fr-col-md-3 fr-col-lg-4"
        , mainClasses = "fr-col-12 fr-col-md-9 fr-col-lg-8"
        , navButtonLabel = navButtonLabel
        , navContent = navContent
        , content = content
        }


article : String -> String -> String -> List (Accessibility.Html msg) -> Html msg
article dataTestValue url backLinkLabel content =
    div
        [ class "bg-white pt-0 sm:pl-4 lg:px-8 sm:pt-6"
        , dataTest dataTestValue
        ]
        [ backLink url backLinkLabel
        , Accessibility.article [ class "mt-6" ] content
        ]


errors : List String -> Html msg
errors l =
    div [ class "text-red-500", role "alert" ] <| List.map (\e -> div [] [ text e ]) l


popupErrors : List String -> Html msg
popupErrors messages =
    case messages of
        [] ->
            text ""

        _ ->
            div
                [ class "fixed z-[1000] top-12 sm:top-6 inset-x-0 pointer-events-none"
                , class "w-full flex flex-col items-center justify-center"
                ]
                [ div
                    [ class "mx-2 bg-white max-w-2xl"
                    , class "fr-alert fr-alert--error fr-alert--sm"
                    , role "alert"
                    ]
                  <|
                    h3 [ class "fr-alert__title" ] [ text "Une erreur est survenue" ]
                        :: List.map
                            (\error -> p [] [ text error ])
                            messages
                ]


backLink : String -> String -> Accessibility.Html msg
backLink url label =
    let
        externalUrl =
            String.contains "/admin2/" url

        targetAttribute =
            if externalUrl then
                "_self"

            else
                ""
    in
    Button.new { onClick = Nothing, label = label }
        |> Button.linkButton url
        |> Button.withAttrs
            [ attribute "target" targetAttribute
            ]
        |> Button.leftIcon Icons.arrowGoBackFill
        |> Button.tertiary
        |> Button.view


infoBlock : String -> List (Html msg) -> Html msg
infoBlock label contents =
    div [ class "mb-6 px-6 py-6 bg-neutral-100" ] <|
        h3 [ class "text-2xl font-bold mb-2" ] [ text label ]
            :: contents


infoHint : String -> Html msg
infoHint label =
    p [ class "flex text-xs text-dsfrBlue-400" ]
        [ span [ class "fr-icon-info-fill fr-icon--sm mr-1", Aria.hidden True ] []
        , text label
        ]


warningHint : String -> Html msg
warningHint label =
    p [ class "flex text-xs text-dsfrOrange-500" ]
        [ span [ class "fr-icon-warning-fill fr-icon--sm mr-1", Aria.hidden True ] []
        , text label
        ]


logo : Accessibility.Html msg
logo =
    p [ class "fr-logo" ] [ text "République", br [], text "française" ]


summaryBlock : String -> List (Html msg) -> Html msg
summaryBlock titleValue content =
    div
        [ class "bg-neutral-100 px-8 pt-6 pb-8 w-full" ]
    <|
        if titleValue == "" then
            content

        else
            h5
                [ class "text-2xl mb-4" ]
                [ text titleValue ]
                :: content


summaryBlockWithItems : List (Html msg) -> Html msg
summaryBlockWithItems items =
    div
        [ class "bg-neutral-100 text-lg px-8 pt-6 pb-8 w-full" ]
        (items |> List.intersperse (hr [ class "h-px p-0 mt-4 mb-6 bg-gray-200 border-0" ] []))


noticeInfo : List (Html.Attribute msg) -> List (Html msg) -> Html msg
noticeInfo attributes content =
    div
        (class "fr-notice fr-notice--info" :: attributes)
        [ div
            [ class "fr-container" ]
            [ div
                [ class "fr-notice__body" ]
                [ div
                    [ class "fr-notice__title" ]
                    content
                ]
            ]
        ]


type AlertType
    = Warning
    | Error
    | Success
    | Info


alert : AlertType -> List (Html.Attribute msg) -> String -> List (Html msg) -> Html msg
alert alertType attributes alertTitle content =
    let
        alertClass =
            case alertType of
                Warning ->
                    "fr-alert--warning"

                Error ->
                    "fr-alert--error"

                Success ->
                    "fr-alert--success"

                Info ->
                    "fr-alert--info"
    in
    div
        ([ class ("fr-alert " ++ alertClass), role "alert" ]
            ++ attributes
        )
    <|
        if alertTitle /= "" then
            h6
                []
                [ text alertTitle ]
                :: content

        else
            content


stepper :
    { currentStep : Int
    , totalSteps : Int
    , currentTitle : String
    , nextTitle : Maybe String
    }
    -> Html msg
stepper config =
    div
        [ class "fr-stepper" ]
        [ h2
            [ class "fr-stepper__title" ]
            [ span
                [ class "fr-stepper__state" ]
                [ text "Étape "
                , text (String.fromInt config.currentStep)
                , text " sur "
                , text (String.fromInt config.totalSteps)
                ]
            , text config.currentTitle
            ]
        , div
            [ class "fr-stepper__steps"
            , attribute "data-fr-current-step" (String.fromInt config.currentStep)
            , attribute "data-fr-steps" (String.fromInt config.totalSteps)
            ]
            []
        , case config.nextTitle of
            Just nextTitle ->
                p
                    [ class "fr-stepper__details" ]
                    [ span [ class "fr-text--bold" ] [ text "Étape suivante : " ]
                    , text nextTitle
                    ]

            Nothing ->
                text ""
        ]
