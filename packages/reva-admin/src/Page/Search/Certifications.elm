module Page.Search.Certifications exposing
    ( Model
    , Msg
    , init
    , update
    , view
    )

import Accessibility exposing (h1, h2, span)
import Api.Candidacy
import Api.Certification
import BetaGouv.DSFR.Button as Button
import BetaGouv.DSFR.Icons.System as Icons
import Data.Candidacy exposing (Candidacy, CandidacyId)
import Data.Certification exposing (Certification, CertificationSummary)
import Data.Context exposing (Context)
import Html exposing (Html, div, p, text)
import Html.Attributes exposing (attribute, class, title)
import Page.Search as Search
import RemoteData exposing (RemoteData(..))
import Route
import View
import View.Candidacy.Tab exposing (Value(..))


type Msg
    = GotSearchMsg (Search.Msg Certification)
    | GotCertificationResponse (RemoteData (List String) Certification)


type alias Model =
    { candidacyId : Maybe CandidacyId
    , certification : RemoteData (List String) Certification
    , search : Search.Model Certification
    , page : Int
    }


type alias Config =
    { candidacyId : Maybe CandidacyId
    , organismId : Maybe String
    , page : Int
    }


init : Context -> Config -> ( Model, Cmd Msg )
init context config =
    let
        ( searchModel, searchCmd ) =
            Search.init
                { onSearch =
                    Api.Certification.getCertifications context.endpoint
                        context.token
                        config.page
                        config.organismId
                , toPageRoute =
                    case config.candidacyId of
                        Just candidacyId ->
                            \p -> Route.Reorientation candidacyId (Route.CertificationsFilters config.organismId p)

                        Nothing ->
                            \p -> Route.Certifications (Route.CertificationsFilters config.organismId p)
                , viewItem = viewItem context
                }
    in
    ( { candidacyId = config.candidacyId
      , certification = Loading
      , page = config.page
      , search = searchModel
      }
    , Cmd.batch
        [ Cmd.map GotSearchMsg searchCmd
        , case config.candidacyId of
            Just candidacyId ->
                Api.Candidacy.getCertification context.endpoint context.token GotCertificationResponse candidacyId

            Nothing ->
                Cmd.none
        ]
    )



-- VIEW


view : Context -> Model -> Html Msg
view context model =
    View.layout
        ""
        []
        (viewDirectoryPanel context model)


viewDirectoryHeader : Context -> Model -> Html Msg
viewDirectoryHeader context model =
    let
        backRoute =
            case model.candidacyId of
                Just candidacyId ->
                    Route.Candidacy { value = Profile, candidacyId = candidacyId }

                Nothing ->
                    Route.Home
    in
    div
        [ class "sm:px-6 sm:mt-6" ]
        [ Button.new { onClick = Nothing, label = "Retour" }
            |> Button.linkButton (Route.toString context.baseUrl backRoute)
            |> Button.leftIcon Icons.arrowGoBackFill
            |> Button.tertiary
            |> Button.view
        , h1
            [ class "text-3xl mt-4 mb-8" ]
            [ case model.candidacyId of
                Just _ ->
                    text "Changement de certification"

                Nothing ->
                    text "Certifications"
            ]
        , h2 [ class "text-sm font-semibold mb-2" ] [ text "Diplôme sélectionné" ]
        , case model.candidacyId of
            Just _ ->
                div
                    [ class "mb-10 h-20 flex flex-col justify-center"
                    , class "bg-gray-100 rounded-xl px-5"
                    ]
                    (viewCertification model.certification)

            Nothing ->
                text ""
        , p [ class "mb-2" ] [ text "Recherchez parmi les diplômes disponibles" ]
        ]


viewDirectoryPanel : Context -> Model -> List (Html Msg)
viewDirectoryPanel context model =
    [ viewDirectoryHeader context model
    , div
        [ class "sm:px-6"
        , attribute "aria-label" "Certifications"
        ]
        [ Search.view context model.search |> Html.map GotSearchMsg ]
    ]


viewItem : Context -> Certification -> List (Html msg)
viewItem context certification =
    [ div
        [ class "flex items-end justify-between"
        , class "my-6 border-b pb-6 px-4"
        ]
        [ div
            []
            [ div [ class "text-sm text-gray-500" ] [ text certification.codeRncp ]
            , div [ class "text-lg font-semibold" ] [ text certification.label ]
            ]
        , div
            []
            [ Button.new
                { onClick = Nothing, label = "Choisir" }
                |> Button.tertiary
                |> Button.disable
                |> Button.view
            ]
        ]
    ]


viewCertification : RemoteData (List String) Certification -> List (Html msg)
viewCertification remoteCertification =
    case remoteCertification of
        Loading ->
            [ span
                [ class "mt-6 w-full h-6"
                , class "rounded-lg bg-gray-50"
                ]
                []
            ]

        Failure e ->
            List.map text e

        Success certification ->
            [ div
                [ class "text-sm text-gray-600" ]
                [ text certification.codeRncp ]
            , div
                [ class "text-lg font-semibold"
                , class "truncate"
                , title certification.label
                ]
                [ text certification.label ]
            ]

        NotAsked ->
            [ text "" ]



-- UPDATE


update : Context -> Msg -> Model -> ( Model, Cmd Msg )
update context msg model =
    case msg of
        GotSearchMsg searchMsg ->
            let
                ( newSearchModel, searchCmd ) =
                    Search.update context searchMsg model.search
            in
            ( { model | search = newSearchModel }
            , Cmd.map GotSearchMsg searchCmd
            )

        GotCertificationResponse certification ->
            ( { model | certification = certification }, Cmd.none )
