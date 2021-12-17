module Page.Candidates.Recognition exposing (Model, Msg, Step(..), init, update, view)

import Actions
import Api exposing (Token)
import Browser.Dom
import Candidate exposing (Candidate)
import Candidate.MetaSkill exposing (MetaSkill)
import Html.Styled exposing (Html, button, details, div, form, h3, h4, h5, label, li, p, span, summary, table, tbody, td, text, textarea, th, thead, tr, ul)
import Html.Styled.Attributes exposing (attribute, class, for, id, minlength, name, placeholder, required, rows, scope, type_)
import Html.Styled.Events exposing (onClick, onInput, onSubmit)
import Json.Decode exposing (maybe)
import List.Extra
import RemoteData exposing (WebData)
import Task
import View.Helpers exposing (dataTest)
import View.Icons as Icons


type Msg
    = UserUpdatedSkillComment MetaSkill String
    | UserUpdatedNewSkill MetaSkill String
    | UserNavigateTo Step
    | UserSubmittedNewSkill MetaSkill
    | UserAskedToDeleteSkill MetaSkill
    | UserDeletedSkill
    | GotSkillResponse (WebData MetaSkill)
    | GotCancelSkillToDelete
    | GotSkillDeletedResponse (WebData MetaSkill)
    | NoOp


type Step
    = Introduction
    | Selection
    | CreateMetaSkill MetaSkill
    | Contextualization MetaSkill (Maybe String)
    | Confirmation MetaSkill
    | Review (Maybe MetaSkill) (Maybe String)


type alias Model =
    { token : Token
    , step : Step
    }


type alias MetaSkillReference =
    { id : String
    , category : String
    , label : String
    }


predefinedMetaSkills : List MetaSkillReference
predefinedMetaSkills =
    [ { id = "1"
      , category = "Travail en équipe"
      , label = "Je sais travailler en équipe (gestion du temps, collaboration, contribution aux objectifs du groupe)"
      }
    , { id = "2"
      , category = "Travail en équipe"
      , label = "Je sais respecter les règles de vivre ensemble (ponctualité, assiduité, écoute, respect, bienveillance)"
      }
    , { id = "3"
      , category = "Posture professionnelle"
      , label = "Je sais adopter une posture professionnelle (ponctualité, respect des délais, savoir communiquer, rigueur )"
      }
    , { id = "4"
      , category = "Posture professionnelle"
      , label = "Je sais organiser mon travail en fonction des priorités et des échéances fixées"
      }
    , { id = "5"
      , category = "Posture professionnelle"
      , label = "Je sais prendre des initiatives dans le cadre professionnel"
      }
    , { id = "6"
      , category = "Posture professionnelle"
      , label = "Je sais faire faire preuve d'autonomie (organiser mon activité et prendre des initiatives)"
      }
    , { id = "7"
      , category = "Posture professionnelle"
      , label = "Je sais faciliter l'apprentissage des autres (je sais motiver les autres, les aider)"
      }
    , { id = "8"
      , category = "Posture professionnelle"
      , label = "Je sais analyser avec recul ma pratique professionnelle, me remettre en question"
      }
    , { id = "9"
      , category = "Compétences informatiques"
      , label = "Je sais utiliser les fonctions de base d'un ordinateur (traitement de texte,\nmessagerie électronique, recherche d'informations sur Internet)"
      }
    , { id = "10"
      , category = "Communication orale"
      , label = "Je sais exposer une idée à l'oral de facon compréhensible"
      }
    , { id = "11"
      , category = "Communication orale"
      , label = "Je sais écouter, prendre en compte ce que dit l'autre"
      }
    , { id = "12"
      , category = "Communication écrite"
      , label = "Je sais exposer une idée à l'écrit de facon compréhensible, en respectant les règles d'orthographe, de grammaire"
      }
    ]
        |> List.map
            (\skill ->
                { id = skill.id
                , category = skill.category
                , label = skill.label
                }
            )


view : Model -> Candidate -> Html Msg
view model candidate =
    case candidate.metaSkills of
        RemoteData.Failure _ ->
            div [] [ text "Erreur lors du chargement des compétences du candidat" ]

        RemoteData.Success skills ->
            div [] <|
                case model.step of
                    Introduction ->
                        introduction candidate skills

                    Selection ->
                        selection candidate

                    CreateMetaSkill skill ->
                        createMetaSkill skill

                    Contextualization skill maybeError ->
                        contextualization skill maybeError

                    Confirmation skill ->
                        reviewFullScreen skills (Just skill) Nothing Nothing

                    Review maybeSkillToDelete maybeError ->
                        reviewFullScreen skills Nothing maybeSkillToDelete maybeError

        _ ->
            div [] [ text "Chargement" ]


introduction : Candidate -> List MetaSkill -> List (Html Msg)
introduction candidate skills =
    let
        skillCount =
            List.length skills
    in
    [ title4 [ text "Reconnaître des compétences transversales développées lors de l'accompagnement VAE" ]
    , if not (List.isEmpty skills) then
        div
            [ class "mb-4 bg-gray-100 rounded-lg px-4 pb-4 pt-3" ]
            [ title5
                [ text <| String.fromInt skillCount
                , if skillCount == 1 then
                    text " compétence reconnue"

                  else
                    text " compétences reconnues"
                ]
            , div
                [ class "flex items-center justify-between"
                ]
                [ actionButton
                    { dataTest = "start-recognition"
                    , text = "Ajouter une autre compétence"
                    , toMsg = UserNavigateTo Selection
                    }
                , secondaryActionButton
                    { dataTest = "review-recognition"
                    , text = "Voir les compétences reconnues"
                    , toMsg = UserNavigateTo <| Review Nothing Nothing
                    }
                ]
            ]

      else
        text ""
    , div
        [ class "mt-4" ]
        [ p []
            [ text "Bienvenue dans l’espace reconnaissance ! Et merci de votre engagement dans cette nouvelle aventure !" ]
        , p
            [ class "mt-2" ]
            [ text "Vous avez, avec la personne que vous accompagnez, co-défini les compétences transversales à reconnaître et vous allez désormais les saisir dans cet espace REVA."
            ]
        , ul
            [ class "mt-2 pl-4 list-disc" ]
            [ li [ class "mt-2" ] [ text "Si des compétences proposées dans la bibliothèque vous conviennent à tous les deux, vous allez ajouter le(s) compétence(s) choisies et préciser pour chacune, dans quelle situation la compétence s’est exprimée et expliquer ce qui s’est passé." ]
            , li [ class "mt-2" ] [ text "Si vous ne trouvez pas dans cette bibliothèque une ou des compétence(s) co-définies avec la personne, vous avez la possibilité de la/les créer. Dans ce cas, vous saisissez l’intitulé de la compétence en commençant toujours par « j’ai progressé et je sais... » et préciser pour chacune, dans quelle situation la compétence s’est exprimée et expliquer ce qui s’est passé." ]
            ]
        , p
            [ class "mt-2 mb-5" ]
            [ text "N'hésitez pas à nous poser vos questions via le chat en bas à droite de cette page." ]
        ]
    , if List.isEmpty skills then
        actionButton
            { dataTest = "start-recognition"
            , text = "Commencer"
            , toMsg = UserNavigateTo Selection
            }

      else
        text ""
    ]


selection : Candidate -> List (Html Msg)
selection _ =
    let
        viewSkillButton skill =
            button
                [ dataTest <| "skill-" ++ skill.id
                , type_ "button"
                , onClick <|
                    UserNavigateTo <|
                        Contextualization
                            { id = skill.id
                            , category = skill.category
                            , label = skill.label
                            , comment = ""
                            , type_ = "official"
                            }
                            Nothing
                , class "flex"
                , class "relative block h-40 text-left leading-snug"
                , class "text-gray-700 p-4 rounded-lg"
                , class "group border-2 border-white bg-white transition-border shadow"
                , class "hover:border-blue-500"
                ]
                [ div [ class "ml-1" ] [ text skill.label ]
                , div [ class "absolute bottom-4 right-4" ] [ Icons.add ]
                ]

        viewSkills ( firstSkill, nextSkills ) =
            div
                [ class "my-12" ]
                [ title4 [ text firstSkill.category ]
                , List.map viewSkillButton (firstSkill :: nextSkills)
                    |> viewSkillGrid
                ]
    in
    popup
        { title = "Ajouter une compétence"
        , onClose = UserNavigateTo Introduction
        , content =
            [ groupByCategory predefinedMetaSkills
                |> List.map viewSkills
                |> div []
            ]
        , footer =
            [ div
                []
                [ div
                    [ class "relative mb-4" ]
                    [ div
                        [ class "absolute inset-0 flex items-center" ]
                        [ div [ class "w-full border-t border-gray-300" ] [] ]
                    , div
                        [ class "relative flex justify-center text-sm" ]
                        [ span
                            [ class "px-2 bg-white text-gray-500"
                            ]
                            [ text "ou" ]
                        ]
                    ]
                , actionButton
                    { dataTest = "create-skill"
                    , text = "Saisir une compétence personnalisée"
                    , toMsg =
                        UserNavigateTo <|
                            CreateMetaSkill
                                { id = ""
                                , category = ""
                                , label = ""
                                , comment = ""
                                , type_ = "custom"
                                }
                    }
                ]
            ]
        }


createMetaSkill : MetaSkill -> List (Html Msg)
createMetaSkill skill =
    let
        namePlaceHolder =
            "Je sais travailler en équipe (gestion du temps, collaboration, contribution aux objectifs du groupe)"
    in
    popup
        { title = "Décrire la compétence"
        , onClose = UserNavigateTo Introduction
        , content =
            [ div
                [ class "flex justify-center items-center"
                , class "py-24 bg-gray-100 w-full flex-grow"
                ]
                [ form
                    [ class "max-w-md w-full rounded-lg px-6 py-5 bg-white"
                    , class "border border-gray-300"
                    , onSubmit <| UserNavigateTo (Contextualization skill Nothing)
                    ]
                    [ label
                        [ for "description", class "sr-only" ]
                        [ text "Description de la compétence" ]
                    , textarea
                        [ dataTest "description"
                        , onInput (UserUpdatedNewSkill skill)
                        , required True
                        , minlength 25
                        , rows 4
                        , name "description"
                        , id "description"
                        , placeholder namePlaceHolder
                        , class "block w-full border-gray-300 rounded-md mt-2 mb-1"
                        , class "focus:ring-indigo-500 focus:border-indigo-500"
                        ]
                        []
                    , button
                        [ dataTest "save-description"
                        , type_ "submit"
                        , class "mt-4 w-full rounded bg-blue-600"
                        , class "hover:bg-blue-700 text-white px-8 py-3"
                        ]
                        [ text "Continuer" ]
                    ]
                ]
            ]
        , footer =
            [ secondaryButton
                { dataTest = "restart-recognition"
                , text = "← Retour"
                , toMsg = UserNavigateTo Selection
                }
            ]
        }


contextualization : MetaSkill -> Maybe String -> List (Html Msg)
contextualization skill maybeError =
    let
        commentPlaceholder =
            "Présenter au moins une situation pendant laquelle la compétence s'est illustrée"
    in
    popup
        { title = "Présenter une situation"
        , onClose = UserNavigateTo Introduction
        , content =
            [ div
                [ class "flex flex-col justify-center items-center"
                , class "py-24 bg-gray-100 w-full flex-grow"
                ]
                [ maybeError
                    |> Maybe.map (\error -> div [ class "max-w-md w-full px-6" ] [ errorAlert error ])
                    |> Maybe.withDefault (text "")
                , viewSkill
                    { situation =
                        [ form
                            [ onSubmit <| UserSubmittedNewSkill skill ]
                            [ label
                                [ for "situation", class "sr-only" ]
                                [ text commentPlaceholder ]
                            , textarea
                                [ dataTest "situation"
                                , onInput (UserUpdatedSkillComment skill)
                                , required True
                                , minlength 25
                                , rows 4
                                , name "situation"
                                , id "situation"
                                , placeholder commentPlaceholder
                                , class "block w-full border-gray-300 rounded-md mt-4 mb-1 "
                                , class "focus:ring-indigo-500 focus:border-indigo-500"
                                ]
                                []
                            , button
                                [ dataTest "confirm-recognition"
                                , type_ "submit"
                                , class "mt-4 w-full rounded bg-blue-600"
                                , class "hover:bg-blue-700 text-white px-8 py-3"
                                ]
                                [ text "Reconnaître" ]
                            ]
                        ]
                    , footer = []
                    }
                    skill
                ]
            ]
        , footer =
            [ secondaryButton
                { dataTest = "restart-recognition"
                , text = "← Retour"
                , toMsg = UserNavigateTo Selection
                }
            ]
        }


review : List MetaSkill -> Maybe MetaSkill -> List (Html Msg)
review skills maybeSkillToDelete =
    let
        trashSkill skillToDelete =
            [ div [ dataTest "delete-skill", class "py-1 text-red-600 cursor-pointer", onClick <| UserAskedToDeleteSkill skillToDelete ] [ Icons.trash ] ]

        viewSkillWithComment skill =
            viewSkill
                { situation =
                    [ div
                        [ class "text-gray-600"
                        , class "bg-gray-100 w-full rounded-md px-3 py-2 mt-2"
                        ]
                        [ text skill.comment ]
                    ]
                , footer =
                    [ div [ class "flex justify-end items-center mt-5" ]
                        (maybeSkillToDelete
                            |> Maybe.map
                                (\skillToDelete ->
                                    if skillToDelete == skill then
                                        [ button [ dataTest "cancel-delete-skill", onClick GotCancelSkillToDelete ] [ text "Annuler" ]
                                        , button [ dataTest "confirm-delete-skill", class "ml-2 px-3 py-1 rounded bg-red-500 font-medium text-white", onClick UserDeletedSkill ] [ text "Confirmer" ]
                                        ]

                                    else
                                        trashSkill skill
                                )
                            |> Maybe.withDefault (trashSkill skill)
                        )
                    ]
                }
                skill
    in
    List.map
        viewSkillWithComment
        skills


type RecognitionTableMode
    = Simplified
    | Complete


reviewTable : RecognitionTableMode -> List MetaSkill -> Html Msg
reviewTable mode skills =
    let
        tableHead s =
            th
                [ scope "col", class "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" ]
                [ text s ]

        tableBody =
            tbody [ class "bg-white divide-y divide-gray-200" ]

        tableData s =
            td
                [ class "px-6 py-4 text-sm font-medium text-gray-900" ]
                [ text s ]

        viewData skill =
            case mode of
                Complete ->
                    [ tableData skill.label
                    , tableData skill.comment
                    ]

                Simplified ->
                    [ tableData skill.label ]
    in
    div
        [ class "m-10 shadow overflow-hidden border-gray-200 rounded-lg" ]
        [ table
            [ class "min-w-full text-left divide-y divide-gray-200" ]
            [ thead
                [ class "bg-gray-50" ]
                [ tr
                    []
                  <|
                    case mode of
                        Complete ->
                            [ tableHead "Compétences"
                            , tableHead "Situations"
                            ]

                        Simplified ->
                            [ tableHead "Compétences" ]
                ]
            , tableBody <|
                List.map
                    (viewData >> tr [])
                    skills
            ]
        ]


reviewFullScreen : List MetaSkill -> Maybe MetaSkill -> Maybe MetaSkill -> Maybe String -> List (Html Msg)
reviewFullScreen skills maybeSkill maybeSkillToDelete maybeError =
    let
        detailsView : { a | attribute : String, title : String, content : Html msg } -> Html msg
        detailsView config =
            details
                [ class "mb-0.25 border bg-gray-100 overflow-hidden"
                , attribute config.attribute ""
                ]
                [ summary
                    [ class "text-left font-semibold text-gray-600 hover:text-blue-500"
                    , class "p-4 cursor-pointer bg-white"
                    ]
                    [ text config.title ]
                , config.content
                ]
    in
    popup
        { title = "Compétences reconnues"
        , onClose = UserNavigateTo Introduction
        , content =
            [ case maybeSkill of
                Just skill ->
                    successAlert <|
                        "La compétence \""
                            ++ skill.label
                            ++ "\" a\u{00A0}été\u{00A0}enregistrée."

                Nothing ->
                    text ""
            , case maybeError of
                Just error ->
                    errorAlert error

                Nothing ->
                    text ""
            , div
                [ class "flex-grow w-full bg-gray-200 p-5 overflow-y-scroll" ]
                [ detailsView
                    { attribute = "closed"
                    , title = "Liste à copier/coller"
                    , content = reviewTable Complete skills
                    }
                , detailsView
                    { attribute = "closed"
                    , title = "Liste simplifiée à copier/coller"
                    , content = reviewTable Simplified skills
                    }
                , detailsView
                    { attribute = "open"
                    , title = "Présentation en vignettes"
                    , content = viewSkillGrid <| review skills maybeSkillToDelete
                    }
                ]
            ]
        , footer =
            [ actionButton
                { dataTest = "restart-recognition"
                , text = "Ajouter une autre compétence"
                , toMsg = UserNavigateTo Selection
                }
            ]
        }


viewSkill : { situation : List (Html Msg), footer : List (Html Msg) } -> MetaSkill -> Html Msg
viewSkill config skill =
    div
        [ dataTest "candidate-skill"
        , class "flex flex-col max-w-md w-full shadow rounded-lg px-6 py-5 bg-white"
        ]
        [ div [ class "flex-1" ]
            [ div
                [ class "text-left w-full" ]
                [ p
                    [ class "text-base font-medium text-gray-700 leading-snug" ]
                    [ text skill.label ]
                ]
            , div [ class "text-left w-full mt-3" ] config.situation
            ]
        , div [ class "flex-none" ] config.footer
        ]


viewSkillGrid : List (Html msg) -> Html msg
viewSkillGrid =
    div
        [ class "grid grid-cols-1 gap-4 justify-items-center sm:grid-cols-2 lg:grid-cols-3"
        , class "bg-gray-100 p-10"
        ]



-- UPDATE


update : Candidate -> Model -> Msg -> ( Model, Cmd Msg, List Actions.Action )
update candidate model msg =
    case ( msg, model.step ) of
        ( UserNavigateTo (CreateMetaSkill skill), _ ) ->
            ( { model | step = CreateMetaSkill skill }
            , Browser.Dom.focus "description"
                |> Task.attempt (\_ -> NoOp)
            , []
            )

        ( UserNavigateTo (Contextualization skill maybeError), _ ) ->
            ( { model | step = Contextualization skill maybeError }
            , Browser.Dom.focus "situation"
                |> Task.attempt (\_ -> NoOp)
            , []
            )

        ( UserNavigateTo (Confirmation skill), _ ) ->
            ( { model | step = Confirmation skill }
            , Api.createSkill GotSkillResponse { token = model.token, candicadyId = candidate.candidacyId, skill = skill }
            , []
            )

        ( UserNavigateTo step, _ ) ->
            ( { model | step = step }
            , Cmd.none
            , []
            )

        ( UserUpdatedNewSkill _ label, CreateMetaSkill skill ) ->
            ( { model | step = CreateMetaSkill { skill | label = label } }
            , Cmd.none
            , []
            )

        ( UserUpdatedSkillComment _ comment, Contextualization skill _ ) ->
            ( { model | step = Contextualization { skill | comment = comment } Nothing }
            , Cmd.none
            , []
            )

        ( UserSubmittedNewSkill skill, Contextualization _ _ ) ->
            ( model
            , Api.createSkill GotSkillResponse { token = model.token, candicadyId = candidate.candidacyId, skill = skill }
            , []
            )

        ( UserAskedToDeleteSkill skillToDelete, Confirmation _ ) ->
            ( { model | step = Review (Just skillToDelete) Nothing }, Cmd.none, [] )

        ( UserAskedToDeleteSkill skillToDelete, Review _ _ ) ->
            ( { model | step = Review (Just skillToDelete) Nothing }, Cmd.none, [] )

        ( UserDeletedSkill, Review (Just skill) _ ) ->
            ( model
            , Api.deleteSkill GotSkillDeletedResponse { token = model.token, candicadyId = candidate.candidacyId, skill = skill }
            , []
            )

        ( GotSkillResponse (RemoteData.Success skill), Contextualization _ _ ) ->
            ( { model | step = Confirmation skill }
            , Cmd.none
            , [ Actions.UpdateCandidate
                    { candidate
                        | metaSkills = RemoteData.map (\skills -> skill :: skills) candidate.metaSkills
                    }
              ]
            )

        ( GotSkillResponse (RemoteData.Failure error), Contextualization skill _ ) ->
            ( { model | step = Contextualization skill (Just ("Une erreur est survenue lors de l'enregistrement de la compétence \"" ++ skill.label ++ "\"")) }, Cmd.none, [] )

        ( GotCancelSkillToDelete, Review _ _ ) ->
            ( { model | step = Review Nothing Nothing }, Cmd.none, [] )

        ( GotSkillDeletedResponse (RemoteData.Success skillDeleted), Review _ _ ) ->
            ( { model | step = Review Nothing Nothing }
            , Cmd.none
            , [ Actions.UpdateCandidate
                    { candidate
                        | metaSkills = RemoteData.map (List.filter (\skill -> skill /= skillDeleted)) candidate.metaSkills
                    }
              ]
            )

        ( GotSkillDeletedResponse (RemoteData.Failure _), Review (Just skill) _ ) ->
            ( { model | step = Review Nothing (Just ("Une erreur est survenue lors de la suppression de la compétence \"" ++ skill.label ++ "\"")) }
            , Cmd.none
            , []
            )

        _ ->
            ( model, Cmd.none, [] )


init : Token -> Model
init token =
    { token = token
    , step = Introduction
    }



-- HELPERS


popup : { a | title : String, onClose : msg, content : List (Html msg), footer : List (Html msg) } -> List (Html msg)
popup config =
    [ div
        [ dataTest "popup"
        , class "fixed z-50 inset-0 overflow-y-auto"
        , attribute "aria-labelledby" "selection"
        , attribute "role" "dialog"
        , attribute "aria-modal" "true"
        ]
        [ div
            [ class "flex items-end justify-center h-screen w-screen py-12 px-8" ]
            [ div
                [ dataTest "close-popup"
                , class "fixed inset-0 bg-gray-400"
                , onClick config.onClose
                ]
                []
            , div
                [ class "relative bg-white max-w-6xl rounded-lg overflow-hidden shadow-xl transform transition-all"
                , class "flex flex-col items-center text-center"
                , class "sm:align-middle sm:w-full sm:h-full"
                ]
                [ div
                    [ class "relative w-full bg-white pt-4"
                    , class "border-b"
                    ]
                    [ title3 config.title
                    , button
                        [ dataTest "close-popup"
                        , type_ "button"
                        , onClick config.onClose
                        , class "absolute top-0 right-0"
                        , class "hover:text-blue-900"
                        , class "flex items-center h-full px-6"
                        ]
                        [ text "Fermer" ]
                    ]
                , div
                    [ class "flex flex-col w-full h-full items-center overflow-y-scroll" ]
                    config.content
                , div
                    [ class "border-t w-full flex flex-col items-center justify-center py-8" ]
                    config.footer
                ]
            ]
        ]
    ]


type AlertLevel
    = Success
    | Error


alert : AlertLevel -> String -> Html msg
alert level s =
    let
        colors =
            case level of
                Success ->
                    "bg-green-100 text-green-800"

                Error ->
                    "bg-red-100 text-red-800"
    in
    div
        [ dataTest "alert"
        , class "my-8"
        , class "rounded-lg px-8 py-4 font-semibold mx-6"
        , class colors
        ]
        [ text s ]


successAlert : String -> Html msg
successAlert =
    alert Success


errorAlert : String -> Html msg
errorAlert =
    alert Error


groupByCategory : List MetaSkillReference -> List ( MetaSkillReference, List MetaSkillReference )
groupByCategory =
    List.Extra.groupWhile
        (\s1 s2 -> s1.category == s2.category)


title3 : String -> Html msg
title3 s =
    h3
        [ class "mb-4 text-2xl font-semibold text-gray-800" ]
        [ text s ]


title4 : List (Html msg) -> Html msg
title4 content =
    h4
        [ class "font-semibold leading-tight  text-gray-700 text-lg mb-4 mr-2" ]
        content


title5 : List (Html msg) -> Html msg
title5 content =
    h5
        [ class "font-semibold leading-tight text-gray-500 text-base mb-3" ]
        content


actionButton : { a | dataTest : String, text : String, toMsg : msg } -> Html msg
actionButton config =
    button
        [ dataTest config.dataTest
        , onClick config.toMsg
        , type_ "button"
        , class "flex-1 rounded bg-blue-600"
        , class "hover:bg-blue-700 text-white px-4 py-3"
        ]
        [ text config.text ]


secondaryActionButton : { a | dataTest : String, text : String, toMsg : msg } -> Html msg
secondaryActionButton config =
    button
        [ dataTest config.dataTest
        , onClick config.toMsg
        , type_ "button"
        , class "flex-1 rounded bg-white border"
        , class "hover:border-gray-300 font-medium text-blue-600 px-4 py-3 ml-4"
        ]
        [ text config.text ]


secondaryButton : { a | dataTest : String, text : String, toMsg : msg } -> Html msg
secondaryButton config =
    button
        [ dataTest config.dataTest
        , onClick config.toMsg
        , type_ "button"
        , class "hover:text-blue-700 text-blue-600 mx-4 px-8"
        ]
        [ text config.text ]
