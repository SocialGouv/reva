module Page.Subscription exposing
    ( Model
    , Msg
    , init
    , update
    , view
    )

import Accessibility exposing (dd, dl, dt, h1, h2, h3)
import Admin.Enum.LegalStatus as LegalStatus
import Api.Subscription
import BetaGouv.DSFR.Button as Button
import Browser.Navigation as Nav
import Data.Context exposing (Context)
import Data.Subscription exposing (Subscription, SubscriptionSummary)
import Html exposing (Html, div, li, p, text, ul)
import Html.Attributes exposing (attribute, class)
import RemoteData exposing (RemoteData(..))
import Route
import String exposing (String)
import View
import View.Helpers exposing (dataTest)


type Msg
    = GotSubscriptionResponse (RemoteData String Subscription)
    | ClickedValidation String
    | ClickedRejection String
    | GotValidationResponse (RemoteData String String)
    | GotRejectionResponse (RemoteData String String)


type alias State =
    { subscription : RemoteData String Subscription
    , errors : List String
    }


type alias Model =
    { state : State }


init : Context -> String -> ( Model, Cmd Msg )
init context subscriptionId =
    let
        defaultModel : Model
        defaultModel =
            { state =
                { subscription = RemoteData.Loading
                , errors = []
                }
            }

        defaultCmd =
            Api.Subscription.get context.endpoint context.token GotSubscriptionResponse subscriptionId
    in
    ( defaultModel, defaultCmd )



-- VIEW


view :
    Context
    -> Model
    -> Html Msg
view context model =
    case model.state.subscription of
        NotAsked ->
            div [] []

        Loading ->
            View.layout
                ""
                []
                [ View.skeleton "ml-10 mt-8 bg-gray-100 mt-24 h-10 w-[353px]" ]

        Failure errors ->
            div [ class "text-red-500" ] [ text errors ]

        Success subscription ->
            View.layout
                ""
                []
                [ viewContent context model.state.errors subscription ]


viewContent : Context -> List String -> Subscription -> Html Msg
viewContent context errors subscription =
    View.article
        "subscription"
        (Route.href context.baseUrl (Route.Subscriptions Route.emptyFilters))
        "Toutes les inscriptions"
        [ div
            [ dataTest "directory-item"
            , class "flex flex-wrap"
            ]
            [ View.errors errors
            , h1 [ class "w-full mb-0" ] [ text subscription.accountFirstname, text " ", text subscription.accountLastname ]
            , viewTitle "Informations générales"
            , viewInfo "Adresse email de l'architecte de parcours" [ subscription.accountEmail ]
            , viewInfo "Téléphone de l'architecte de parcours" [ subscription.accountPhoneNumber ]
            , viewTitle "Informations juridiques de la structure"
            , viewInfo "SIRET de la structure" [ subscription.companySiret ]
            , viewInfo "Forme juridique" [ subscription.companyLegalStatus |> LegalStatus.toString ]
            , viewInfo "Raison sociale" [ subscription.companyName ]
            , viewInfo "Adresse de la structure" [ subscription.companyAddress, subscription.companyZipCode, subscription.companyCity ]
            , viewTitle "Informations de facturation"
            , viewInfo "Contact de facturation" [ subscription.companyBillingContactFirstname, subscription.companyBillingContactLastname ]
            , viewInfo "Adresse email de facturation" [ subscription.companyBillingEmail ]
            , viewInfo "Téléphone du contact de facturation" [ subscription.companyBillingPhoneNumber ]
            , viewInfo "BIC" [ subscription.companyBic ]
            , viewInfo "IBAN" [ subscription.companyIban ]
            , div
                [ class "flex items-center justify-end space-x-4 w-full my-8" ]
                [ Button.new { onClick = Just (ClickedRejection subscription.id), label = "Rejeter" }
                    |> Button.secondary
                    |> Button.view
                , Button.new { onClick = Just (ClickedValidation subscription.id), label = "Accepter" }
                    |> Button.view
                ]
            ]
        ]


viewTitle : String -> Accessibility.Html msg
viewTitle s =
    h2 [ class "w-full mt-6 mb-0 text-xl" ] [ text s ]


viewInfo : String -> List String -> Accessibility.Html msg
viewInfo term data =
    dl
        [ class "w-full sm:w-1/2 my-2" ]
        [ dt [ class "font-normal text-sm text-gray-600" ] [ text term ]
        , dd
            [ class "my-0" ]
            (List.intersperse " " data |> List.map text)
        ]



-- UPDATE


update : Context -> Msg -> Model -> ( Model, Cmd Msg )
update context msg model =
    let
        redirectToSubscriptions : Cmd msg
        redirectToSubscriptions =
            Nav.pushUrl
                context.navKey
                (Route.toString context.baseUrl (Route.Subscriptions Route.emptyFilters))
    in
    case msg of
        GotSubscriptionResponse remoteSubscription ->
            ( model, Cmd.none ) |> withSubscription remoteSubscription

        ClickedValidation id ->
            ( model, Api.Subscription.validate context.endpoint context.token GotValidationResponse id )

        GotValidationResponse RemoteData.NotAsked ->
            ( model, Cmd.none )

        GotValidationResponse RemoteData.Loading ->
            ( model, Cmd.none ) |> withErrors []

        GotValidationResponse (RemoteData.Success _) ->
            ( model, redirectToSubscriptions )

        GotValidationResponse (RemoteData.Failure errors) ->
            ( model, Cmd.none ) |> withErrors [ errors ]

        ClickedRejection id ->
            ( model, Api.Subscription.reject context.endpoint context.token GotRejectionResponse id )

        GotRejectionResponse RemoteData.NotAsked ->
            ( model, Cmd.none )

        GotRejectionResponse RemoteData.Loading ->
            ( model, Cmd.none ) |> withErrors []

        GotRejectionResponse (RemoteData.Success _) ->
            ( model, redirectToSubscriptions )

        GotRejectionResponse (RemoteData.Failure errors) ->
            ( model, Cmd.none ) |> withErrors [ errors ]


withErrors : List String -> ( Model, Cmd msg ) -> ( Model, Cmd msg )
withErrors errors ( model, cmd ) =
    let
        state =
            model.state
    in
    ( { model | state = { state | errors = errors } }, cmd )


withSubscription : RemoteData String Subscription -> ( Model, Cmd msg ) -> ( Model, Cmd msg )
withSubscription subscription ( model, cmd ) =
    let
        state =
            model.state
    in
    ( { model | state = { state | subscription = subscription } }, cmd )
