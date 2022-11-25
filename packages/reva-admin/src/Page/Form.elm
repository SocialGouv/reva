module Page.Form exposing
    ( Element(..)
    , Form
    , Model
    , Msg
    , Status(..)
    , init
    , update
    , updateForm
    , view
    )

import Api exposing (Token)
import Browser.Dom
import Data.Context exposing (Context)
import Data.Form.Helper exposing (booleanToString)
import Dict exposing (Dict)
import Html.Styled as Html exposing (Html, button, dd, div, dt, fieldset, h2, h3, input, label, legend, li, option, p, select, span, text, textarea, ul)
import Html.Styled.Attributes exposing (checked, class, classList, disabled, for, id, name, property, required, selected, type_, value)
import Html.Styled.Events exposing (onCheck, onInput, onSubmit)
import RemoteData exposing (RemoteData(..))
import String exposing (String)
import Task
import View
import View.Helpers exposing (dataTest)


type Msg referential
    = UserChangedElement String String
    | UserClickedSave referential
    | GotSaveResponse (RemoteData String ())
    | GotLoadResponse (RemoteData String (Dict String String))
    | NoOp


type Element
    = Checkbox String
    | CheckboxList String (List ( String, String ))
    | Date String
    | Empty
    | Heading String
    | Input String
    | Number String
    | Textarea String
    | Select String (List ( String, String ))
    | SelectOther String String
    | Section String


type alias Form referential =
    { elements : referential -> List ( String, Element )
    , saveLabel : String
    , title : String
    }


type alias FormData =
    Dict String String


type RemoteForm referential
    = NotAsked
    | Loading (Form referential)
    | Editing (Maybe String) (Form referential) FormData
    | Saving (Form referential) FormData
    | Failure


type Status
    = Editable
    | ReadOnly


type alias Model referential =
    { onRedirect : Cmd (Msg referential)
    , onSave : String -> Token -> (RemoteData String () -> Msg referential) -> referential -> Dict String String -> Cmd (Msg referential)
    , form : RemoteForm referential
    , status : Status
    }


init : ( Model referential, Cmd msg )
init =
    let
        model : Model referential
        model =
            { onRedirect = Cmd.none
            , onSave = \_ _ _ _ _ -> Cmd.none
            , form = NotAsked
            , status = ReadOnly
            }
    in
    ( model
    , Cmd.none
    )



-- VIEW


view : RemoteData String referential -> Model referential -> Html (Msg referential)
view remoteReferential model =
    let
        saveButton label =
            View.primaryButton
                [ dataTest "save-description"
                , type_ "submit"
                ]
                label

        disabledSaveButton label =
            button
                [ dataTest "save-description"
                , disabled True
                , type_ "submit"
                , class "text-center mt-4 rounded bg-blue-400"
                , class "text-white px-12 py-2"
                ]
                [ text label ]

        skeleton =
            div [ class "ml-16 mt-10" ]
                [ View.skeleton "mt-8 h-8 w-96"
                , View.skeleton "mt-12 h-4 w-96"
                ]
    in
    case ( remoteReferential, model.form ) of
        ( RemoteData.NotAsked, _ ) ->
            text ""

        ( _, NotAsked ) ->
            text ""

        ( RemoteData.Loading, _ ) ->
            skeleton

        ( _, Loading _ ) ->
            skeleton

        ( RemoteData.Success referential, Saving form formData ) ->
            viewForm referential model.status Nothing formData form <|
                disabledSaveButton "..."

        ( RemoteData.Success referential, Editing error form formData ) ->
            viewForm referential model.status error formData form <|
                saveButton form.saveLabel

        ( _, Failure ) ->
            text "Une erreur est survenue"

        ( RemoteData.Failure err, _ ) ->
            text err


viewForm : referential -> Status -> Maybe String -> FormData -> Form referential -> Html (Msg referential) -> Html (Msg referential)
viewForm referential status maybeError formData form saveButton =
    let
        viewElement =
            case status of
                Editable ->
                    viewEditableElement

                ReadOnly ->
                    viewReadOnlyElement
    in
    Html.form
        [ class "pl-16 pr-4 mt-10"
        , onSubmit (UserClickedSave referential)
        ]
        [ View.title form.title
        , div
            [ class "mt-6 flex flex-wrap" ]
            (List.map (viewElement formData) (form.elements referential)
                |> List.map (div [ class "mr-8" ])
            )
        , case status of
            Editable ->
                div
                    [ class "mt-8 pb-4 flex justify-end" ]
                    [ saveButton
                    ]

            ReadOnly ->
                text ""
        , case maybeError of
            Just error ->
                div
                    [ class "fixed z-50 top-0 inset-x-0 pointer-events-none"
                    , class "w-full flex justify-center"
                    ]
                    [ p
                        [ class "max-w-2xl mt-10 px-6 py-4"
                        , class "rounded bg-white border border-red-400"
                        , class "text-center text-sm font-medium text-red-600"
                        ]
                        [ text error ]
                    ]

            Nothing ->
                text ""
        ]


viewEditableElement : FormData -> ( String, Element ) -> List (Html (Msg referential))
viewEditableElement formData ( elementId, element ) =
    let
        dataOrDefault =
            Dict.get elementId formData
                |> Maybe.withDefault (defaultValue element)

        inputStyle =
            String.join " "
                [ "border-b-[3px] border-0 border-b-gray-900"
                , "focus:ring-blue-500 focus:ring-0 focus:border-blue-600"
                , "text-xl placeholder:text-gray-500"
                , "block bg-gray-100 pl-8 mb-8"
                ]
                |> class

        inputView dataType extraClass =
            input
                [ type_ dataType
                , name elementId
                , id elementId
                , onInput (UserChangedElement elementId)
                , class extraClass
                , class "min-w-0 h-[85px] pr-4"
                , inputStyle
                , value dataOrDefault
                ]
                []

        checkboxView =
            input
                [ type_ "checkbox"
                , name elementId
                , id elementId
                , onCheck (booleanToString >> UserChangedElement elementId)
                , class "focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-400 rounded mr-4"
                , class "mt-1 block min-w-0 rounded sm:text-sm border-gray-300"
                , checked (dataOrDefault == "checked")
                ]
                []

        textareaView =
            textarea
                [ name elementId
                , id elementId
                , onInput (UserChangedElement elementId)
                , class "w-[420px] h-[150px] p-8 mb-8"
                , inputStyle
                , value dataOrDefault
                ]
                []

        labelView extraClass s =
            label
                [ for elementId
                , class "block"
                , class extraClass
                ]
                [ text s ]

        labelStyle =
            "text-lg font-normal text-slate-700 mb-2"

        withLegend s el =
            fieldset
                []
                [ legend [ class labelStyle ] [ text s ]
                , el
                ]

        withLabel s el =
            [ labelView labelStyle s
            , el
            ]
    in
    case element of
        Checkbox label ->
            [ div
                [ class "flex items-start h-8 w-full" ]
                [ checkboxView
                , labelView "text-base" label
                ]
            ]

        CheckboxList label choices ->
            let
                viewChoices =
                    List.map
                        (\( choiceId, choice ) -> viewEditableElement formData ( choiceId, Checkbox choice ))
                        choices
                        |> List.concat
            in
            [ div
                [ name elementId
                , id elementId
                , class "mt-1 mb-8"
                ]
                viewChoices
                |> withLegend label
            ]

        Date label ->
            inputView "date" "w-60 flex items-center"
                |> withLabel label

        Empty ->
            []

        Heading title ->
            [ h3
                [ class "w-[620px] mb-2"
                , class "text-xl font-semibold text-slate-500"
                ]
                [ text title ]
            ]

        Input label ->
            inputView "text" "w-full"
                |> withLabel label

        Number label ->
            inputView "number" "w-40"
                |> withLabel label

        Textarea label ->
            textareaView
                |> withLabel label

        Section title ->
            [ h2
                [ class "w-[620px] mt-4 mb-8"
                , class "text-xl font-semibold uppercase text-slate-900"
                ]
                [ text title ]
            ]

        Select label choices ->
            select
                [ id elementId
                , onInput (UserChangedElement elementId)
                , class "mt-1 block w-[420px] h-[85px] pr-10"
                , inputStyle
                , required True
                ]
                (option
                    [ disabled True
                    , selected (dataOrDefault == "")
                    , value ""
                    ]
                    [ text "Sélectionner" ]
                    :: List.map (viewChoice dataOrDefault) choices
                )
                |> withLabel label

        SelectOther selectId label ->
            case Dict.get selectId formData of
                Just "Autre" ->
                    inputView "text" "w-full"
                        |> withLabel label

                Just _ ->
                    []

                Nothing ->
                    []


viewReadOnlyElement : FormData -> ( String, Element ) -> List (Html (Msg referential))
viewReadOnlyElement formData ( elementId, element ) =
    let
        dataOrDefault =
            Dict.get elementId formData
                |> Maybe.withDefault (defaultValue element)

        dataClass =
            "text-lg font-semibold text-gray-800"

        dataView =
            dd
                [ class dataClass ]
                [ text dataOrDefault ]

        termView s =
            dt
                [ class "text-base text-gray-600 mt-8" ]
                [ text s ]

        withTerm s el =
            [ termView s
            , el
            ]

        defaultView label =
            dataView |> withTerm label
    in
    case element of
        Checkbox label ->
            if dataOrDefault == "checked" then
                [ text label ]

            else
                []

        CheckboxList label choices ->
            let
                viewChoices =
                    List.map
                        (\( choiceId, choice ) -> li [] <| viewReadOnlyElement formData ( choiceId, Checkbox choice ))
                        choices
            in
            dd
                [ class dataClass ]
                [ ul
                    [ name elementId
                    , id elementId
                    ]
                    viewChoices
                ]
                |> withTerm label

        Date label ->
            defaultView label

        Empty ->
            []

        Heading title ->
            [ h3 [ class "text-xl text-slate-800" ] [ text title ] ]

        Input label ->
            defaultView label

        Number label ->
            defaultView label

        Textarea label ->
            defaultView label

        Section title ->
            [ h2 [ class "text-2xl text-gray-900" ] [ text title ] ]

        Select label choices ->
            List.filter (\( choiceId, _ ) -> choiceId == dataOrDefault) choices
                |> List.head
                |> Maybe.map (\( _, choice ) -> text choice |> withTerm label)
                |> Maybe.withDefault []

        SelectOther selectId label ->
            case Dict.get selectId formData of
                Just "Autre" ->
                    defaultView label

                Just _ ->
                    []

                Nothing ->
                    []


defaultValue : Element -> String
defaultValue element =
    case element of
        Number _ ->
            "0"

        _ ->
            ""


viewChoice : String -> ( String, String ) -> Html msg
viewChoice currentChoiceId ( choiceId, choice ) =
    option
        [ selected (choiceId == currentChoiceId), value choiceId ]
        [ text choice ]



-- UPDATE


update : Context -> Msg referential -> Model referential -> ( Model referential, Cmd (Msg referential) )
update context msg model =
    let
        noChange =
            ( model, Cmd.none )
    in
    case ( msg, model.form ) of
        ( UserChangedElement elementId elementValue, Editing error form formData ) ->
            let
                newFormData =
                    Dict.insert elementId elementValue formData
            in
            ( { model | form = Editing Nothing form newFormData }, Cmd.none )

        ( UserChangedElement _ _, _ ) ->
            noChange

        ( UserClickedSave referential, Editing error form formData ) ->
            ( { model | form = Saving form formData }, model.onSave context.endpoint context.token GotSaveResponse referential formData )

        ( UserClickedSave _, _ ) ->
            noChange

        ( GotLoadResponse (RemoteData.Success formData), Loading form ) ->
            ( { model | form = Editing Nothing form formData }, Cmd.none )

        ( GotLoadResponse (RemoteData.Failure _), Loading form ) ->
            ( { model | form = Failure }, Cmd.none )

        ( GotLoadResponse _, _ ) ->
            noChange

        ( GotSaveResponse (RemoteData.Success _), Saving _ _ ) ->
            ( model
            , Cmd.batch
                [ Task.perform (\_ -> NoOp) (Browser.Dom.setViewport 0 0)
                , model.onRedirect
                ]
            )

        ( GotSaveResponse (RemoteData.Failure error), Saving form formData ) ->
            -- TODO: Handle save failure
            ( { model | form = Editing (Just error) form formData }, Cmd.none )

        ( GotSaveResponse _, _ ) ->
            noChange

        ( NoOp, _ ) ->
            noChange


updateForm :
    Context
    ->
        { form : Form referential
        , onLoad : String -> Token -> (RemoteData String (Dict String String) -> Msg referential) -> Cmd (Msg referential)
        , onRedirect : Cmd (Msg referential)
        , onSave : String -> Token -> (RemoteData String () -> Msg referential) -> referential -> Dict String String -> Cmd (Msg referential)
        , status : Status
        }
    -> Model referential
    -> ( Model referential, Cmd (Msg referential) )
updateForm context config model =
    ( { model
        | form = Loading config.form
        , onRedirect = config.onRedirect
        , onSave = config.onSave
        , status = config.status
      }
    , config.onLoad context.endpoint context.token GotLoadResponse
    )
