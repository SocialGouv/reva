module Page.Subscription exposing
    ( Model
    , Msg
    , init
    , update
    , view
    )

import Accessibility exposing (dd, dl, dt, h1, h2, h3)
import Admin.Enum.LegalStatus as LegalStatus
import Admin.Enum.OrganismTypology exposing (OrganismTypology(..))
import Api.Subscription
import BetaGouv.DSFR.Button as Button
import Browser.Navigation as Nav
import Data.Context exposing (Context)
import Data.Referential exposing (DepartmentWithOrganismMethods)
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
                [ viewCandidaciesLink context ]
                []
                [ View.skeleton "ml-10 mt-8 bg-gray-100 mt-24 h-10 w-[353px]" ]

        Failure errors ->
            div [ class "text-red-500" ] [ text errors ]

        Success subscription ->
            View.layout
                ""
                [ viewCandidaciesLink context ]
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
            , viewInfoText "Adresse email de l'architecte de parcours" [ subscription.accountEmail ]
            , viewInfoText "Téléphone de l'architecte de parcours" [ subscription.accountPhoneNumber ]
            , viewTitle "Informations juridiques de la structure"
            , viewInfoText "SIRET de la structure" [ subscription.companySiret ]
            , viewInfoText "Forme juridique" [ subscription.companyLegalStatus |> LegalStatus.toString ]
            , viewInfoText "Raison sociale" [ subscription.companyName ]
            , viewInfoText "Adresse de la structure"
                [ subscription.companyAddress
                , subscription.companyZipCode
                , subscription.companyCity
                ]
            , viewTitle "Typologie et zone d'intervention"
            , viewInfoText "Typologie" [ subscription.typology |> typologyToString ]
            , case subscription.typology of
                ExpertBranche ->
                    viewInfo "Conventions collectives" [ viewCategory subscription.ccns ]

                ExpertFiliere ->
                    viewInfo "Filière(s)" [ viewCategory subscription.domains ]

                Generaliste ->
                    div [ class "w-full" ] []
            , viewInfo "Zone d'intervention en présentiel"
                [ viewDepartements subscription.departmentsWithOrganismMethods .isOnSite ]
            , viewInfo "Zone d'intervention en distanciel"
                [ viewDepartements subscription.departmentsWithOrganismMethods .isRemote ]
            , viewTitle "Informations de facturation"
            , viewInfoText "Contact de facturation"
                [ subscription.companyBillingContactFirstname
                , subscription.companyBillingContactLastname
                ]
            , viewInfoText "Adresse email de facturation" [ subscription.companyBillingEmail ]
            , viewInfoText "Téléphone du contact de facturation" [ subscription.companyBillingPhoneNumber ]
            , viewInfoText "BIC" [ subscription.companyBic ]
            , viewInfoText "IBAN" [ subscription.companyIban ]
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


typologyToString : OrganismTypology -> String
typologyToString typology =
    case typology of
        Generaliste ->
            "Généraliste"

        ExpertFiliere ->
            "Expert de filière(s)"

        ExpertBranche ->
            "Expert de branche(s)"


viewDepartements : List DepartmentWithOrganismMethods -> (DepartmentWithOrganismMethods -> Bool) -> Html msg
viewDepartements departments predicate =
    departments
        |> List.filter predicate
        |> List.map (\d -> li [] [ text <| Data.Referential.departmentToString d.department ])
        |> ul [ class "my-0" ]


viewCategory : List { a | label : String } -> Html msg
viewCategory category =
    category
        |> List.map (\c -> li [] [ text c.label ])
        |> ul [ class "my-0" ]


viewTitle : String -> Accessibility.Html msg
viewTitle s =
    h2 [ class "w-full mt-6 mb-0 text-xl" ] [ text s ]


viewInfo : String -> List (Accessibility.Html msg) -> Accessibility.Html msg
viewInfo term content =
    dl
        [ class "w-full sm:w-1/2 my-2" ]
        [ dt [ class "font-normal text-sm text-gray-600 mb-1" ] [ text term ]
        , dd [ class "my-0" ] content
        ]


viewInfoText : String -> List String -> Accessibility.Html msg
viewInfoText term data =
    viewInfo term <| (List.intersperse " " data |> List.map text)



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


viewCandidaciesLink : Context -> Html msg
viewCandidaciesLink context =
    Html.a
        [ class "fr-link"
        , class "md:text-lg text-gray-900 hover:text-blue-900"
        , Route.href context.baseUrl (Route.Candidacies Route.emptyFilters)
        ]
        [ text "Voir les candidatures" ]
