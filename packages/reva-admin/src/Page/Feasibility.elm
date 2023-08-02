module Page.Feasibility exposing
    ( Model
    , Msg
    , init
    , update
    , view
    )

import Accessibility exposing (a, div, h3, h4, h5, h6, p)
import Api.Feasibility
import Data.Context exposing (Context)
import Data.Feasibility exposing (Feasibility)
import Data.File exposing (File)
import Data.Organism exposing (Organism)
import Html exposing (Html, text)
import Html.Attributes exposing (class, href, target, title)
import Page.Form as Form
import RemoteData exposing (RemoteData(..))
import Route exposing (emptyFeasibilityFilters)
import String exposing (String)
import View


type Msg
    = GotFeasibilityResponse (RemoteData (List String) Feasibility)
    | GotFormMsg (Form.Msg Feasibility)


type alias Model =
    { form : Form.Model Feasibility
    , selected : RemoteData (List String) Feasibility
    }


init : Context -> String -> ( Model, Cmd Msg )
init context feasibilityId =
    let
        ( formModel, formCmd ) =
            Form.init

        defaultModel : Model
        defaultModel =
            { form = formModel
            , selected = Loading
            }
    in
    ( defaultModel
    , Cmd.batch
        [ Api.Feasibility.get context.endpoint context.token GotFeasibilityResponse feasibilityId
        , Cmd.map GotFormMsg formCmd
        ]
    )



-- VIEW


view :
    Context
    -> Model
    -> Html Msg
view context model =
    View.layout "" [] [] [ viewFeasibilityPanel context model ]


viewFeasibilityPanel : Context -> Model -> Html Msg
viewFeasibilityPanel context model =
    viewMain context "profile" <|
        case model.selected of
            NotAsked ->
                []

            Loading ->
                [ View.skeleton "mt-6 mb-10 w-full sm:w-96 h-8"
                , View.skeleton "mb-12 w-full w-96 h-5"
                , View.skeleton "w-full h-32 mb-6"
                , View.skeleton "w-full h-64 mb-6"
                , View.skeleton "w-full h-64 mb-12"
                ]

            Failure errors ->
                List.map text errors

            Success feasibility ->
                [ div
                    [ class "flex flex-col gap-y-8" ]
                    [ h3
                        [ class "text-4xl mb-0" ]
                        [ text
                            (case feasibility.candidate of
                                Just candidate ->
                                    String.concat [ candidate.firstname, " ", candidate.lastname ]

                                Nothing ->
                                    ""
                            )
                        ]
                    , h4 [ class "mb-0" ] [ text <| Maybe.withDefault "" feasibility.certificationLabel ]
                    , viewFileLink feasibility.file
                    , feasibility.otherFile
                        |> Maybe.map viewFileLink
                        |> Maybe.withDefault (text "")
                    , Maybe.map viewOrganism feasibility.organism
                        |> Maybe.withDefault (text "")
                    ]
                ]


viewFileLink : File -> Html msg
viewFileLink file =
    div
        [ class "bg-gray-100 px-8 pt-6 pb-8 border" ]
        [ a
            [ href file.url
            , target "_blank"
            , class "fr-link text-2xl font-semibold"
            , title (file.name ++ " - nouvelle fenêtre")
            ]
            [ text file.name ]
        ]


viewOrganism : Organism -> Accessibility.Html msg
viewOrganism organism =
    div
        [ class "bg-gray-100 px-8 pt-6 pb-8" ]
        [ h5
            [ class "text-2xl mb-4" ]
            [ text "Architecte accompagnateur de parcours" ]
        , h6
            [ class "text-xl mb-4" ]
            [ text organism.label ]
        , p [ class "text-lg mb-0" ] [ text organism.contactAdministrativeEmail ]
        ]


viewMain : Context -> String -> List (Html msg) -> Html msg
viewMain context dataTest content =
    View.article
        dataTest
        (Route.href context.baseUrl (Route.Feasibilities emptyFeasibilityFilters))
        "Tous les dossiers"
        content



-- UPDATE


update : Context -> Msg -> Model -> ( Model, Cmd Msg )
update context msg model =
    case msg of
        GotFeasibilityResponse remoteFeasibility ->
            ( { model | selected = remoteFeasibility }, Cmd.none )

        GotFormMsg formMsg ->
            let
                ( formModel, formCmd ) =
                    Form.update context formMsg model.form
            in
            ( { model | form = formModel }, Cmd.map GotFormMsg formCmd )
