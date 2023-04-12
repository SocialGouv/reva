module View.Candidacy.NavigationSteps exposing (archiveView, reorientationView, dropOutView, view)

import Admin.Enum.CandidacyStatusStep exposing (CandidacyStatusStep(..))
import Data.Candidacy as Candidacy exposing (Candidacy)
import Html exposing (Html, button, div, h2, h3, span, text)
import Html.Attributes exposing (class)
import Route
import Time
import View.Candidacy.Tab
import View.Date
import View.Steps


view : String -> Candidacy -> Html msg
view baseUrl candidacy =
    let
        tab =
            View.Candidacy.Tab.Tab candidacy.id

        appointmentLink =
            Just <| Route.href baseUrl <| Route.Candidacy (tab View.Candidacy.Tab.Meetings)

        trainingLink =
            Just <| Route.href baseUrl <| Route.Candidacy (tab View.Candidacy.Tab.Training)

        admissibilityLink =
            if Candidacy.isStatusEqualOrAbove candidacy ParcoursConfirme then
                Just <| Route.href baseUrl <| Route.Candidacy (tab View.Candidacy.Tab.Admissibility)

            else
                Nothing
    in
    View.Steps.view (Candidacy.statusToProgressPosition (candidacyStatus candidacy))
        [ { content = [ title "Prochaines étapes" ]
          , navigation = Nothing
          }
        , { content = expandedView "Rendez-vous pédagogique" PriseEnCharge candidacy
          , navigation = appointmentLink
          }
        , { content = expandedView "Définition du parcours" PriseEnCharge candidacy
          , navigation = trainingLink
          }
        , { content = [ View.Steps.info "Validation du parcours" ]
          , navigation = Nothing
          }
        , { content = expandedView "Gestion de la recevabilité" ParcoursConfirme candidacy
          , navigation = admissibilityLink
          }
        , { content = expandedView "Demande de prise en charge" ParcoursConfirme candidacy
          , navigation = candidateInfoLink baseUrl candidacy
          }
        , { content = expandedView "Demande de paiement" DemandeFinancementEnvoye candidacy
          , navigation = paymentRequestLink baseUrl candidacy
          }
        ]


dropOutView : String -> Candidacy -> Time.Posix -> Html msg
dropOutView baseUrl candidacy dropOutDate =
    let
        tab =
            View.Candidacy.Tab.Tab candidacy.id

        dropOutInfo =
            [ h3 [] [ text "Abandon du candidat confirmé" ]
            , span [ class "text-sm text-gray-700" ] [ text <| View.Date.toFullFormat dropOutDate ]
            ]

        dropOutLink =
            Just <| Route.href baseUrl <| Route.Candidacy (tab View.Candidacy.Tab.DropOut)

        progressPosition =
            if Candidacy.isPaymentRequestSent candidacy then
                4

            else if Candidacy.isFundingRequestSent candidacy then
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
        , { content = expandedView "Demande de prise en charge" ParcoursConfirme candidacy
          , navigation = candidateInfoLink baseUrl candidacy
          }
        , { content = expandedView "Demande de paiement" DemandeFinancementEnvoye candidacy
          , navigation = paymentRequestLink baseUrl candidacy
          }
        ]


archiveView : String -> Candidacy -> Html msg
archiveView baseUrl candidacy =
    let
        archiveDate =
            Candidacy.lastStatus candidacy.statuses |> .createdAt

        archiveLink =
            Route.href baseUrl <| Route.Candidacy (View.Candidacy.Tab.Tab candidacy.id View.Candidacy.Tab.Archive)
    in
    View.Steps.view 2
        [ { content = [ title "Candidature archivée" ]
          , navigation = Nothing
          }
        , { content = [ text "Archivée le ", text archiveDate.fullFormat ]
          , navigation = Just archiveLink
          }
        ]
reorientationView : String -> Candidacy -> Html msg
reorientationView baseUrl candidacy =
    let
        archiveDate =
            Candidacy.lastStatus candidacy.statuses |> .createdAt

        archiveLink =
            Route.href baseUrl <| Route.Candidacy (View.Candidacy.Tab.Tab candidacy.id View.Candidacy.Tab.Archive)
    in
    View.Steps.view 2
        [ { content = [ title "Candidature réorientée" ]
          , navigation = Nothing
          }
        , { content = [ text "Réorientée le ", text archiveDate.fullFormat ]
          , navigation = Just archiveLink
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


expandedView : String -> Candidacy.Step -> Candidacy -> List (Html msg)
expandedView stepTitle status candidacy =
    [ View.Steps.link stepTitle
    , if candidacyStatus candidacy == status then
        div
            []
            [ button
                [ class "bg-slate-900 text-white text-base"
                , class "mt-2 w-auto rounded"
                , class "text-center px-8 py-1"
                , class "hover:enabled:bg-gray-700"
                ]
                [ text "Compléter" ]
            ]

      else
        text ""
    ]


candidateInfoLink : String -> Candidacy -> Maybe (Html.Attribute msg)
candidateInfoLink baseUrl candidacy =
    let
        tab =
            View.Candidacy.Tab.Tab candidacy.id

        fundingView =
            if Candidacy.isStatusEqualOrAbove candidacy DemandeFinancementEnvoye then
                tab View.Candidacy.Tab.FundingRequest

            else
                tab View.Candidacy.Tab.CandidateInfo
    in
    if candidacy.dropOutDate /= Nothing || Candidacy.isStatusEqualOrAbove candidacy ParcoursConfirme then
        Just <| Route.href baseUrl <| Route.Candidacy fundingView

    else
        Nothing


paymentRequestLink : String -> Candidacy -> Maybe (Html.Attribute msg)
paymentRequestLink baseUrl candidacy =
    let
        tab =
            View.Candidacy.Tab.Tab candidacy.id View.Candidacy.Tab.PaymentRequest
    in
    if candidacy.dropOutDate /= Nothing || Candidacy.isStatusEqualOrAbove candidacy DemandeFinancementEnvoye then
        Just <| Route.href baseUrl <| Route.Candidacy tab

    else
        Nothing


candidacyStatus : Candidacy -> Candidacy.Step
candidacyStatus candidacy =
    (Candidacy.lastStatus >> .status) candidacy.statuses
