module Page.Feasibility exposing
    ( Model
    , Msg
    , init
    , update
    , view
    )

import Accessibility exposing (a, div, h3, h4)
import Api.Feasibility
import Data.Context exposing (Context)
import Data.Feasibility exposing (Feasibility)
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
                    [ class "p-4" ]
                    [ h3
                        [ class "text-4xl" ]
                        [ text
                            (case feasibility.candidate of
                                Just candidate ->
                                    String.concat [ candidate.firstname, " ", candidate.lastname ]

                                Nothing ->
                                    ""
                            )
                        ]
                    , h4 [] [ text <| Maybe.withDefault "" feasibility.certificationLabel ]
                    , viewFileLink feasibility.file
                    , feasibility.otherFile
                        |> Maybe.map viewFileLink
                        |> Maybe.withDefault (text "")
                    ]
                ]


viewFileLink file =
    div
        [ class "bg-gray-50 px-8 pt-6 pb-8 border" ]
        [ a
            [ href file.url
            , target "_blank"
            , class "fr-link text-2xl font-semibold"
            , title (file.name ++ " - nouvelle fenêtre")
            ]
            [ text file.name ]
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
