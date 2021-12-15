module Page.Candidates.Recognition exposing (Model, Msg, Step(..), init, update, view)

import Actions
import Browser.Dom
import Candidate exposing (Candidate)
import Candidate.MetaSkill exposing (MetaSkill)
import Html.Styled exposing (Html, button, details, div, form, h3, h4, h5, label, li, p, span, summary, table, tbody, td, text, textarea, th, thead, tr, ul)
import Html.Styled.Attributes exposing (attribute, class, for, id, minlength, name, placeholder, required, rows, scope, type_)
import Html.Styled.Events exposing (onClick, onInput, onSubmit)
import List.Extra
import Task
import View.Helpers exposing (dataTest)
import View.Icons as Icons


type Msg
    = UserUpdatedSkillComment MetaSkill String
    | UserUpdatedNewSkill MetaSkill String
    | UserNavigateTo Step
    | NoOp


type Step
    = Introduction
    | Selection
    | CreateMetaSkill MetaSkill
    | Contextualization MetaSkill
    | Confirmation MetaSkill
    | Review


type alias Model =
    { step : Step }


type alias MetaSkillReference =
    { id : String
    , category : String
    , name : String
    }


predefinedMetaSkills : List MetaSkillReference
predefinedMetaSkills =
    [ { id = "1"
      , category = "Travail en équipe"
      , name = "J'ai progressé et je sais travailler en équipe (gestion du temps, collaboration, contribution aux objectifs du groupe)"
      }
    , { id = "2"
      , category = "Travail en équipe"
      , name = "J'ai progressé et je sais respecter les règles de vivre ensemble (ponctualité, assiduité, écoute, respect, bienveillance)"
      }
    , { id = "3"
      , category = "Posture professionnelle"
      , name = "J'ai progressé et je sais adopter une posture professionnelle (ponctualité, respect des délais, savoir communiquer, rigueur )"
      }
    , { id = "4"
      , category = "Posture professionnelle"
      , name = "J'ai progressé et je sais organiser mon travail en fonction des priorités et des échéances fixées"
      }
    , { id = "5"
      , category = "Posture professionnelle"
      , name = "J'ai progressé et je sais prendre des initiatives dans le cadre professionnel"
      }
    , { id = "6"
      , category = "Posture professionnelle"
      , name = "J'ai progressé et je sais faire faire preuve d'autonomie (organiser mon activité et prendre des initiatives)"
      }
    , { id = "7"
      , category = "Posture professionnelle"
      , name = "J'ai progressé et je sais faciliter l'apprentissage des autres (je sais motiver les autres, les aider)"
      }
    , { id = "8"
      , category = "Posture professionnelle"
      , name = "J'ai progressé et je sais analyser avec recul ma pratique professionnelle, me remettre en question"
      }
    , { id = "9"
      , category = "Compétences informatiques"
      , name = "J'ai progressé et je sais utiliser les fonctions de base d'un ordinateur (traitement de texte,\nmessagerie électronique, recherche d'informations sur Internet)"
      }
    , { id = "10"
      , category = "Communication orale"
      , name = "J'ai progressé et je sais exposer une idée à l'oral de facon compréhensible"
      }
    , { id = "11"
      , category = "Communication orale"
      , name = "J'ai progressé et je sais écouter, prendre en compte ce que dit l'autre"
      }
    , { id = "12"
      , category = "Communication écrite"
      , name = "J'ai progressé et je sais exposer une idée à l'écrit de facon compréhensible, en respectant les règles d'orthographe, de grammaire"
      }
    ]
        |> List.map
            (\skill ->
                { id = skill.id
                , category = skill.category
                , name = skill.name
                }
            )


view : Model -> Candidate -> Html Msg
view model candidate =
    div [] <|
        case model.step of
            Introduction ->
                introduction candidate

            Selection ->
                selection candidate

            CreateMetaSkill skill ->
                createMetaSkill skill

            Contextualization skill ->
                contextualization skill

            Confirmation skill ->
                reviewFullScreen candidate (Just skill)

            Review ->
                reviewFullScreen candidate Nothing


introduction : Candidate -> List (Html Msg)
introduction candidate =
    let
        skillCount =
            List.length candidate.metaSkills
    in
    [ title4 [ text "Reconnaître des compétences transversales développées lors de l'accompagnement VAE" ]
    , if not (List.isEmpty candidate.metaSkills) then
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
                    , toMsg = UserNavigateTo Review
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
    , if List.isEmpty candidate.metaSkills then
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
                            , name = skill.name
                            , comment = ""
                            }
                , class "flex"
                , class "relative block h-40 text-left leading-snug"
                , class "text-gray-700 p-4 rounded-lg"
                , class "group border-2 border-white bg-white transition-border shadow"
                , class "hover:border-blue-500"
                ]
                [ div [ class "ml-1" ] [ text skill.name ]
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
                                , name = ""
                                , comment = ""
                                }
                    }
                ]
            ]
        }


createMetaSkill : MetaSkill -> List (Html Msg)
createMetaSkill skill =
    let
        namePlaceHolder =
            "J'ai progressé et je sais travailler en équipe (gestion du temps, collaboration, contribution aux objectifs du groupe)"
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
                    , onSubmit <| UserNavigateTo (Contextualization skill)
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


contextualization : MetaSkill -> List (Html Msg)
contextualization skill =
    let
        commentPlaceholder =
            "Présenter au moins une situation pendant laquelle la compétence s'est illustrée"
    in
    popup
        { title = "Présenter une situation"
        , onClose = UserNavigateTo Introduction
        , content =
            [ div
                [ class "flex justify-center items-center"
                , class "py-24 bg-gray-100 w-full flex-grow"
                ]
                [ viewSkill
                    [ form
                        [ onSubmit <| UserNavigateTo (Confirmation skill) ]
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


review : Candidate -> List (Html Msg)
review candidate =
    let
        viewSkillWithComment skill =
            viewSkill
                [ div
                    [ class "text-gray-600"
                    , class "bg-gray-100 w-full rounded-md px-3 py-2 mt-2"
                    ]
                    [ text skill.comment ]
                ]
                skill
    in
    List.map
        viewSkillWithComment
        candidate.metaSkills


type RecognitionTableMode
    = Simplified
    | Complete


reviewTable : RecognitionTableMode -> Candidate -> Html Msg
reviewTable mode candidate =
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
                    [ tableData skill.name
                    , tableData skill.comment
                    ]

                Simplified ->
                    [ tableData skill.name ]
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
                    candidate.metaSkills
            ]
        ]


reviewFullScreen : Candidate -> Maybe MetaSkill -> List (Html Msg)
reviewFullScreen candidate maybeSkill =
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
                    alert <|
                        "Mode de démonstration, la compétence \""
                            ++ skill.name
                            ++ "\" n'a\u{00A0}pas\u{00A0}été\u{00A0}enregistrée."

                Nothing ->
                    text ""
            , div
                [ class "flex-grow w-full bg-gray-200 p-5 overflow-y-scroll" ]
                [ detailsView
                    { attribute = "closed"
                    , title = "Tableau exportable"
                    , content = reviewTable Complete candidate
                    }
                , detailsView
                    { attribute = "closed"
                    , title = "Tableau exportable (simplifié)"
                    , content = reviewTable Simplified candidate
                    }
                , detailsView
                    { attribute = "open"
                    , title = "Grille"
                    , content = viewSkillGrid <| review candidate
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


viewSkill : List (Html Msg) -> MetaSkill -> Html Msg
viewSkill situation skill =
    div
        [ dataTest "candidate-skill"
        , class "max-w-md w-full shadow rounded-lg px-6 py-5 bg-white"
        ]
        [ div
            [ class "text-left w-full" ]
            [ p
                [ class "text-base font-medium text-gray-700 leading-snug" ]
                [ text skill.name ]
            ]
        , div [ class "text-left w-full mt-3" ] situation
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
    case msg of
        UserNavigateTo (CreateMetaSkill skill) ->
            ( { model | step = CreateMetaSkill skill }
            , Browser.Dom.focus "description"
                |> Task.attempt (\_ -> NoOp)
            , []
            )

        UserNavigateTo (Contextualization skill) ->
            ( { model | step = Contextualization skill }
            , Browser.Dom.focus "situation"
                |> Task.attempt (\_ -> NoOp)
            , []
            )

        UserNavigateTo (Confirmation skill) ->
            ( { model | step = Confirmation skill }
            , Cmd.none
            , [ Actions.UpdateCandidate
                    { candidate
                        | metaSkills = skill :: candidate.metaSkills
                    }
              ]
            )

        UserNavigateTo step ->
            ( { model | step = step }
            , Cmd.none
            , []
            )

        UserUpdatedNewSkill skill name ->
            ( { model | step = CreateMetaSkill { skill | name = name } }
            , Cmd.none
            , []
            )

        UserUpdatedSkillComment skill comment ->
            ( { model | step = Contextualization { skill | comment = comment } }
            , Cmd.none
            , []
            )

        NoOp ->
            ( model, Cmd.none, [] )


init : Model
init =
    { step = Introduction }



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


alert : String -> Html msg
alert s =
    div
        [ class "my-8"
        , class "rounded-lg px-8 py-4 font-semibold bg-yellow-100 text-yellow-800 mx-6"
        ]
        [ text s ]


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
