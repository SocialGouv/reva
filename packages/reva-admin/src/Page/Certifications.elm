module Page.Certifications exposing
    ( Model
    , Msg
    , init
    , update
    , view
    )

import Accessibility exposing (h1)
import Api.Certification
import BetaGouv.DSFR.Button as Button
import BetaGouv.DSFR.Icons.System as Icons
import Data.Candidacy exposing (Candidacy, CandidacyId)
import Data.Certification exposing (Certification)
import Data.Context exposing (Context)
import Html exposing (Html, div, p, text)
import Html.Attributes exposing (attribute, class)
import Page.Search as Search
import Route
import View
import View.Candidacy.Tab exposing (Value(..))


type Msg
    = GotSearchMsg (Search.Msg Certification)


type alias Model =
    { candidacyId : Maybe CandidacyId
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
      , page = config.page
      , search = searchModel
      }
    , Cmd.map GotSearchMsg searchCmd
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
            [ class "text-3xl my-4" ]
            [ case model.candidacyId of
                Just _ ->
                    text "Changement de certification"

                Nothing ->
                    text "Certifications"
            ]
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
            , div [ class "text-xl font-semibold" ] [ text certification.label ]
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
