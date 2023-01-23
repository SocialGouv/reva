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

import Api.Token exposing (Token)
import Browser.Dom
import Data.Context exposing (Context)
import Data.Form.Helper exposing (booleanToString)
import Dict exposing (Dict)
import Html.Styled as Html exposing (Html, button, dd, div, dt, fieldset, input, label, legend, li, option, p, select, text, textarea, ul)
import Html.Styled.Attributes exposing (checked, class, classList, disabled, for, id, name, placeholder, required, selected, type_, value)
import Html.Styled.Events exposing (onCheck, onClick, onInput, onSubmit)
import RemoteData exposing (RemoteData(..))
import String exposing (String)
import Task
import View
import View.Heading
import View.Helpers exposing (dataTest)


type Msg referential
    = UserChangedElement String String
    | UserClickSave referential
    | UserClickSubmit referential
    | GotSaveResponse (RemoteData String ())
    | GotLoadResponse (RemoteData String (Dict String String))
    | NoOp


type Element
    = Checkbox String
    | CheckboxList String (List ( String, String ))
    | Date String
    | Empty
    | Heading String
    | Info String String
    | Input String
    | Number String
    | ReadOnlyElement Element
    | ReadOnlyElements (List ( String, Element ))
    | Select String (List ( String, String ))
    | SelectOther String String String
    | Section String
    | Title String
    | Textarea String (Maybe String)
    | Radio String
    | RadioList String (List ( String, String ))


type alias Form =
    { elements : List ( String, Element )
    , saveLabel : Maybe String
    , submitLabel : String
    , title : String
    }


type alias FormBuilder referential =
    FormData -> referential -> Form


type alias FormData =
    Dict String String


type RemoteForm referential
    = NotAsked
    | Loading (FormBuilder referential)
    | Editing (Maybe String) (FormBuilder referential) FormData
    | Saving (FormBuilder referential) FormData
    | Submitting (FormBuilder referential) FormData
    | Failure


type Status
    = Editable
    | ReadOnly


type alias ClickHandler referential =
    String
    -> Token
    -> (RemoteData String () -> Msg referential)
    -> referential
    -> Dict String String
    -> Cmd (Msg referential)


type alias Model referential =
    { onRedirect : Cmd (Msg referential)
    , onSave : ClickHandler referential
    , onSubmit : ClickHandler referential
    , onValidate : referential -> Dict String String -> Result String ()
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
            , onSubmit = \_ _ _ _ _ -> Cmd.none
            , onValidate = \_ _ -> Ok ()
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
        submitButton label =
            View.primaryButton
                [ dataTest "submit"
                , type_ "submit"
                ]
                label

        saveButton maybeLabel referential =
            case maybeLabel of
                Just label ->
                    View.secondaryButton
                        [ dataTest "save"
                        , onClick (UserClickSave referential)
                        ]
                        label

                Nothing ->
                    div [] []

        disabledButton dataTestValue =
            button
                [ dataTest dataTestValue
                , disabled True
                , class "text-center mt-4 rounded bg-blue-400"
                , class "text-white px-12 py-2"
                ]
                [ text "..." ]

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

        ( RemoteData.Success referential, Saving formBuilder formData ) ->
            let
                form =
                    formBuilder formData referential
            in
            viewForm referential
                model.status
                Nothing
                formData
                formBuilder
                (disabledButton "save")
                (submitButton form.submitLabel)

        ( RemoteData.Success referential, Submitting formBuilder formData ) ->
            let
                form =
                    formBuilder formData referential
            in
            viewForm referential
                model.status
                Nothing
                formData
                formBuilder
                (saveButton form.saveLabel referential)
                (disabledButton "submit")

        ( RemoteData.Success referential, Editing error formBuilder formData ) ->
            let
                form =
                    formBuilder formData referential
            in
            viewForm referential
                model.status
                error
                formData
                formBuilder
                (saveButton form.saveLabel referential)
                (submitButton form.submitLabel)

        ( _, Failure ) ->
            text "Une erreur est survenue"

        ( RemoteData.Failure err, _ ) ->
            text err


viewForm :
    referential
    -> Status
    -> Maybe String
    -> FormData
    -> FormBuilder referential
    -> Html (Msg referential)
    -> Html (Msg referential)
    -> Html (Msg referential)
viewForm referential status maybeError formData form saveButton submitButton =
    let
        viewElement =
            case status of
                Editable ->
                    viewEditableElement

                ReadOnly ->
                    viewReadOnlyElement

        currentForm =
            form formData referential
    in
    Html.form
        [ class "pl-16 pr-4 mt-10"
        , onSubmit (UserClickSubmit referential)
        ]
        [ View.title currentForm.title
        , div
            [ class "mt-6 flex flex-wrap gap-x-8" ]
            (List.map (viewElement formData) currentForm.elements
                |> List.filter ((/=) [])
                |> List.map (div [])
            )
        , case status of
            Editable ->
                div
                    [ class "mt-8 pb-4 flex justify-between pr-4" ]
                    [ saveButton
                    , submitButton
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
            let
                extraAttributes =
                    if dataType == "number" then
                        [ Html.Styled.Attributes.min "0" ]

                    else
                        []
            in
            input
                ([ type_ dataType
                 , name elementId
                 , id elementId
                 , onInput (UserChangedElement elementId)
                 , class extraClass
                 , class "min-w-0 h-[78px] pr-4"
                 , inputStyle
                 , value dataOrDefault
                 ]
                    ++ extraAttributes
                )
                []

        textareaView : Maybe String -> Html (Msg referential)
        textareaView placeholderValue =
            textarea
                [ name elementId
                , id elementId
                , onInput (UserChangedElement elementId)
                , class "w-[520px] h-[150px] p-8 mb-8"
                , inputStyle
                , value dataOrDefault
                , placeholderValue |> Maybe.map placeholder |> Maybe.withDefault (class "")
                ]
                []

        withLegend s el =
            fieldset
                []
                [ legend [ class labelStyle ] [ text s ]
                , el
                ]

        withLabel s el =
            [ labelView elementId labelStyle s
            , el
            ]
    in
    case element of
        Checkbox label ->
            [ div
                [ class "flex items-start h-8 w-full" ]
                [ checkboxView [] elementId dataOrDefault
                , labelView elementId "text-base text-slate-800" label
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
                , class "mt-1 mb-4"
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
            [ View.Heading.h3 title ]

        Title title ->
            [ View.Heading.h5 title ]

        Input label ->
            inputView "text" "w-full"
                |> withLabel label

        Number label ->
            inputView "number" "w-40"
                |> withLabel label

        Textarea label placeholder ->
            textareaView placeholder
                |> withLabel label

        Info label value ->
            info value
                |> withLabel label

        ReadOnlyElement readOnlyElement ->
            [ div
                [ class "mb-8" ]
              <|
                viewReadOnlyElement formData ( elementId, readOnlyElement )
            ]

        ReadOnlyElements readOnlyElements ->
            [ div
                [ class "flex rounded"
                , class "bg-slate-100 border-slate-200"
                , class "-mt-2 mb-8 px-1 pt-2"
                ]
              <|
                List.map
                    (viewReadOnlyElement formData >> div [ class "mx-3" ])
                    readOnlyElements
            ]

        Section title ->
            [ View.Heading.h4 title ]

        Select label choices ->
            select
                [ id elementId
                , onInput (UserChangedElement elementId)
                , class "mt-1 block w-[520px] h-[78px] pr-10"
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

        SelectOther selectId otherValue label ->
            case Dict.get selectId formData of
                Just selectedValue ->
                    if selectedValue == otherValue then
                        textareaView Nothing
                            |> withLabel label

                    else
                        []

                Nothing ->
                    []

        Radio label ->
            [ div
                [ class "flex items-start h-8 w-full" ]
                [ radioView [] elementId label dataOrDefault
                , labelView elementId "text-base text-slate-800" label
                ]
            ]

        RadioList label choices ->
            let
                viewChoices =
                    List.map
                        (\( choiceId, choice ) -> viewEditableElement formData ( choiceId, Radio choice ))
                        choices
                        |> List.concat
            in
            [ div
                [ name elementId
                , id elementId
                , class "mt-1 mb-4"
                ]
                viewChoices
                |> withLegend label
            ]


viewReadOnlyElement : FormData -> ( String, Element ) -> List (Html (Msg referential))
viewReadOnlyElement formData ( elementId, element ) =
    let
        dataOrDefault =
            Dict.get elementId formData
                |> Maybe.withDefault (defaultValue element)

        dataClass =
            "min-h-[40px] rounded px-8 py-5 text-xl font-medium leading-snug text-slate-900 mt-1 mb-4"

        userEditedClass =
            "min-h-[78px] flex items-center border border-slate-200 bg-white"

        dataView extraClass d =
            dd
                [ class extraClass, class dataClass ]
                [ text d ]

        termView s =
            dt
                [ class labelStyle ]
                [ text s ]

        withTerm s el =
            [ termView s
            , el
            ]

        defaultView label =
            dataView userEditedClass dataOrDefault
                |> withTerm label
    in
    case element of
        Checkbox label ->
            [ div
                [ class "flex items-start h-8 w-full"
                , classList [ ( "text-gray-500", dataOrDefault /= "checked" ) ]
                ]
                [ checkboxView [ disabled True ] elementId dataOrDefault
                , labelView elementId "text-base font-normal" label
                ]
            ]

        CheckboxList label choices ->
            let
                viewChoices =
                    List.map
                        (\( choiceId, choice ) -> li [] <| viewReadOnlyElement formData ( choiceId, Checkbox choice ))
                        choices
            in
            ul
                [ class "mt-2 mb-4"
                , name elementId
                , id elementId
                ]
                viewChoices
                |> withTerm label

        Date label ->
            defaultView label

        Empty ->
            []

        Heading title ->
            [ View.Heading.h3 title ]

        Title title ->
            [ View.Heading.h5 title ]

        Info label value ->
            info value
                |> withTerm label

        Input label ->
            div
                [ class "w-[240px]" ]
                [ dataView userEditedClass dataOrDefault ]
                |> withTerm label

        Number label ->
            div
                [ class "w-40" ]
                [ dataView userEditedClass dataOrDefault ]
                |> withTerm label

        Textarea label _ ->
            [ div [ class "w-[590px]" ] <| defaultView label ]

        ReadOnlyElement readOnlyElement ->
            viewReadOnlyElement formData ( elementId, readOnlyElement )

        ReadOnlyElements readOnlyElements ->
            [ div
                [ class "flex justify-between gap-6 mr-2" ]
              <|
                List.map
                    (viewReadOnlyElement formData >> div [])
                    readOnlyElements
            ]

        Section title ->
            [ View.Heading.h4 title ]

        Select label choices ->
            List.filter (\( choiceId, _ ) -> choiceId == dataOrDefault) choices
                |> List.head
                |> Maybe.map (\( _, choice ) -> dataView "bg-slate-100 min-w-[240px]" choice |> withTerm label)
                |> Maybe.withDefault []

        SelectOther selectId otherValue label ->
            case Dict.get selectId formData of
                Just selectedValue ->
                    if selectedValue == otherValue then
                        defaultView label

                    else
                        []

                Nothing ->
                    []

        Radio label ->
            [ div
                [ class "flex items-start h-8 w-full text-gray-500"
                ]
                [ radioView [ disabled True ] elementId label dataOrDefault
                , labelView elementId "text-base font-normal" label
                ]
            ]

        RadioList label choices ->
            let
                viewChoices =
                    List.map
                        (\( choiceId, choice ) -> li [] <| viewReadOnlyElement formData ( choiceId, Radio choice ))
                        choices
            in
            ul
                [ class "mt-2 mb-4"
                , name elementId
                , id elementId
                ]
                viewChoices
                |> withTerm label


info : String -> Html msg
info value =
    p
        [ class "rounded bg-slate-100 text-slate-800 mb-6"
        , class "px-6 py-4 text-lg"
        ]
        [ text value ]


labelStyle : String
labelStyle =
    "text-lg font-medium text-slate-900 mb-2"


labelView : String -> String -> String -> Html msg
labelView elementId extraClass s =
    label
        [ for elementId
        , class "block"
        , class extraClass
        ]
        [ text s ]


checkboxView : List (Html.Attribute (Msg referential)) -> String -> String -> Html (Msg referential)
checkboxView extraAttributes elementId dataOrDefault =
    input
        (extraAttributes
            ++ [ type_ "checkbox"
               , name elementId
               , id elementId
               , onCheck (booleanToString >> UserChangedElement elementId)
               , class "focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-400 rounded mr-4"
               , class "mt-1 block min-w-0 rounded sm:text-sm border-gray-300"
               , class "checked:disabled:border-gray-600 checked:disabled:bg-gray-600"
               , class "disabled:hover:not-allowed"
               , class "disabled:text-gray-400 disabled:border-slate-200 disabled:bg-gray-100"
               , checked (dataOrDefault == "checked")
               ]
        )
        []


radioView : List (Html.Attribute (Msg referential)) -> String -> String -> String -> Html (Msg referential)
radioView extraAttributes elementId label dataOrDefault =
    input
        (extraAttributes
            ++ [ type_ "radio"
               , name elementId
               , id label
               , value label
               , class "h-4 w-4 text-blue-600 border-slate-400 mr-4"
               , class "mt-1 block min-w-0 sm:text-sm border-gray-300"
               , onCheck (\_ -> UserChangedElement elementId label)
               , checked (dataOrDefault == label)
               ]
        )
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

        clickHandler handler validate toMsg state referential form formData =
            case validate referential formData of
                Err error ->
                    ( { model | form = Editing (Just error) form formData }, Cmd.none )

                Ok () ->
                    ( { model | form = state form formData }
                    , handler context.endpoint context.token toMsg referential formData
                    )
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

        ( UserClickSave referential, Editing _ form formData ) ->
            clickHandler model.onSave (\_ _ -> Ok ()) GotSaveResponse Saving referential form formData

        ( UserClickSave _, _ ) ->
            noChange

        ( UserClickSubmit referential, Editing _ form formData ) ->
            clickHandler model.onSubmit model.onValidate GotSaveResponse Submitting referential form formData

        ( UserClickSubmit _, _ ) ->
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
            ( { model | form = Editing (Just error) form formData }, Cmd.none )

        ( GotSaveResponse (RemoteData.Failure error), Submitting form formData ) ->
            ( { model | form = Editing (Just error) form formData }, Cmd.none )

        ( GotSaveResponse _, _ ) ->
            noChange

        ( NoOp, _ ) ->
            noChange


updateForm :
    Context
    ->
        { form : FormData -> referential -> Form
        , onLoad : String -> Token -> (RemoteData String (Dict String String) -> Msg referential) -> Cmd (Msg referential)
        , onRedirect : Cmd (Msg referential)
        , onSubmit : ClickHandler referential
        , onSave : Maybe (ClickHandler referential)
        , onValidate : referential -> Dict String String -> Result String ()
        , status : Status
        }
    -> Model referential
    -> ( Model referential, Cmd (Msg referential) )
updateForm context config model =
    ( { model
        | form = Loading config.form
        , onRedirect = config.onRedirect
        , onSave = config.onSave |> Maybe.withDefault (\_ _ _ _ _ -> Cmd.none)
        , onSubmit = config.onSubmit
        , onValidate = config.onValidate
        , status = config.status
      }
    , config.onLoad context.endpoint context.token GotLoadResponse
    )
