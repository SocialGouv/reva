module View.Candidacy.NavigationSteps exposing (dropOutView, view)

import Data.Candidacy as Candidacy exposing (Candidacy)
import Html.Styled exposing (Html, button, div, h2, h3, span, text)
import Html.Styled.Attributes exposing (class)
import Route
import Time
import View.Candidacy.Tab
import View.Date
import View.Steps


view : String -> Candidacy -> Html msg
view baseUrl candidacy =
    let
        appointmentLink =
            Just <| Route.href baseUrl <| Route.Candidacy (View.Candidacy.Tab.Meetings candidacy.id)

        trainingLink =
            Just <| Route.href baseUrl <| Route.Candidacy (View.Candidacy.Tab.Training candidacy.id)

        admissibilityLink =
            if Candidacy.isStatusEqualOrAbove candidacy "PARCOURS_CONFIRME" then
                Just <| Route.href baseUrl <| Route.Candidacy (View.Candidacy.Tab.Admissibility candidacy.id)

            else
                Nothing
    in
    View.Steps.view (Candidacy.statusToProgressPosition (candidacyStatus candidacy))
        [ { content = [ title "Prochaines étapes" ]
          , navigation = Nothing
          }
        , { content = expandedView "Rendez-vous pédagogique" "PRISE_EN_CHARGE" candidacy
          , navigation = appointmentLink
          }
        , { content = expandedView "Définition du parcours" "PRISE_EN_CHARGE" candidacy
          , navigation = trainingLink
          }
        , { content = [ View.Steps.info "Validation du parcours" ]
          , navigation = Nothing
          }
        , { content = expandedView "Gestion de la recevabilité" "PARCOURS_CONFIRME" candidacy
          , navigation = admissibilityLink
          }
        , { content = expandedView "Demande de prise en charge" "PARCOURS_CONFIRME" candidacy
          , navigation = candidateInfoLink baseUrl candidacy
          }
        ]


dropOutView : String -> Candidacy -> Time.Posix -> Html msg
dropOutView baseUrl candidacy dropOutDate =
    let
        dropOutInfo =
            [ h3 [] [ text "Abandon du candidat confirmé" ]
            , span [ class "text-sm text-gray-700" ] [ text <| View.Date.toFullFormat dropOutDate ]
            ]

        dropOutLink =
            Just <| Route.href baseUrl <| Route.Candidacy (View.Candidacy.Tab.DropOut candidacy.id)

        progressPosition =
            if Candidacy.isFundingRequestSent candidacy then
                3

            else
                2
    in
    View.Steps.view progressPosition
        [ { content = [ title "Abandon du candidat" ]
          , navigation = Nothing
          }
        , { content = dropOutInfo
          , navigation = dropOutLink
          }
        , { content = expandedView "Demande de prise en charge" "PARCOURS_CONFIRME" candidacy
          , navigation = candidateInfoLink baseUrl candidacy
          }
        ]


title : String -> Html msg
title value =
    h2
        [ class "h-32 flex items-end -mb-12" ]
        [ span
            [ class "text-2xl font-medium" ]
            [ text value ]
        ]


expandedView : String -> String -> Candidacy -> List (Html msg)
expandedView stepTitle status candidacy =
    [ View.Steps.link stepTitle
    , if candidacyStatus candidacy == status then
        div
            []
            [ button
                [ class "bg-slate-900 text-white text-base"
                , class "mt-2 w-auto rounded"
                , class "text-center px-8 py-1"
                ]
                [ text "Compléter" ]
            ]

      else
        text ""
    ]


candidateInfoLink : String -> Candidacy -> Maybe (Html.Styled.Attribute msg)
candidateInfoLink baseUrl candidacy =
    let
        fundingView =
            if Candidacy.isStatusEqualOrAbove candidacy "DEMANDE_FINANCEMENT_ENVOYE" then
                View.Candidacy.Tab.FundingRequest

            else
                View.Candidacy.Tab.CandidateInfo
    in
    if candidacy.dropOutDate /= Nothing || Candidacy.isStatusEqualOrAbove candidacy "PARCOURS_CONFIRME" then
        Just <| Route.href baseUrl <| Route.Candidacy (fundingView candidacy.id)

    else
        Nothing


candidacyStatus : Candidacy -> String
candidacyStatus candidacy =
    (Candidacy.lastStatus >> .status) candidacy.statuses
