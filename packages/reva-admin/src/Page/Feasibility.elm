module Page.Feasibility exposing
    ( Model
    , Msg
    , init
    , update
    , view
    )

import Accessibility exposing (div, h3, h4, h6, p)
import Api.Feasibility
import Api.Form.Feasibility
import Api.Token
import Browser.Navigation as Nav
import Data.Context exposing (Context)
import Data.Feasibility exposing (Decision(..), Feasibility)
import Data.File exposing (File)
import Data.Form exposing (FormData)
import Data.Form.Feasibility exposing (Decision(..), decisionToString)
import Data.Organism exposing (Organism)
import Html exposing (Html, node, text)
import Html.Attributes exposing (class, classList, property)
import Json.Encode as Encode
import Page.Form as Form exposing (Form)
import RemoteData exposing (RemoteData(..))
import Route exposing (emptyFeasibilityFilters)
import String exposing (String)
import View
import View.Candidate
import View.Feasibility.Decision


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
            Form.updateForm context
                { form = form
                , onLoad = Nothing
                , onSave = Nothing
                , onSubmit = Api.Form.Feasibility.submitDecision
                , onRedirect =
                    Nav.pushUrl
                        context.navKey
                        (Route.toString context.baseUrl (Route.Feasibility feasibilityId))
                , onValidate = Data.Form.Feasibility.validate
                , status = Form.Editable
                }
                Form.empty

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
                    [ class "flex flex-col gap-y-8"
                    , classList [ ( "pb-8", feasibility.decision /= Pending ) ]
                    ]
                    [ View.Candidate.viewWithCertification
                        feasibility.certificationLabel
                        feasibility.candidate
                    , viewFileLink context feasibility.file
                    , feasibility.otherFile
                        |> Maybe.map (viewFileLink context)
                        |> Maybe.withDefault (text "")
                    , Maybe.map viewOrganism feasibility.organism
                        |> Maybe.withDefault (text "")
                    , case feasibility.decision of
                        Pending ->
                            Form.view (RemoteData.succeed feasibility) model.form
                                |> Html.map GotFormMsg

                        _ ->
                            View.Feasibility.Decision.view feasibility
                    ]
                ]


viewFileLink : Context -> File -> Html msg
viewFileLink context file =
    div
        [ class "bg-gray-100 px-8 pt-6 pb-8 border" ]
        [ node "authenticated-link"
            [ property "params" <|
                Encode.object
                    [ ( "text", Encode.string file.name )
                    , ( "title", Encode.string (file.name ++ " - nouvelle fenêtre") )
                    , ( "url", Encode.string file.url )
                    , ( "token", Encode.string (Api.Token.toString context.token) )
                    , ( "class", Encode.string "fr-link text-2xl font-semibold" )
                    ]
            ]
            []
        ]


viewOrganism : Organism -> Accessibility.Html msg
viewOrganism organism =
    View.summaryBlock "Architecte accompagnateur de parcours"
        [ h6
            [ class "text-xl mb-4" ]
            [ text organism.label ]
        , p [ class "text-lg mb-0" ] [ text organism.contactAdministrativeEmail ]
        ]


form : FormData -> Feasibility -> Form
form formData _ =
    let
        keys =
            Data.Form.Feasibility.keys

        decisions =
            [ ( "valid", Valid )
            , ( "invalid", Invalid )
            ]
                |> List.map (\( id, decision ) -> ( id, decisionToString decision ))

        status =
            Data.Form.Feasibility.fromDict formData
    in
    { elements =
        [ ( keys.decision, Form.RadioList "Décision prise concernant ce dossier" decisions )
        , ( keys.reason, Form.Textarea "Précisez les motifs de votre décision" Nothing )
        , ( "info"
          , Form.Info "" "Rappel : les motifs de votre décision seront transmis au candidat et à son architecte de parcours."
          )
        ]
    , saveLabel = Nothing
    , submitLabel = "Envoyer la décision"
    , title = ""
    }


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
