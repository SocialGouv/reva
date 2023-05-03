module View.Candidacy.NavigationSteps exposing (archiveView, dropOutView, reorientationView, view)

import Admin.Enum.CandidacyStatusStep exposing (CandidacyStatusStep(..))
import BetaGouv.DSFR.Button as Button
import Data.Candidacy as Candidacy exposing (Candidacy)
import Html exposing (Html, div, h2, h3, span, text)
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

        examInfoLink =
            if Candidacy.isStatusEqualOrAbove candidacy ParcoursConfirme then
                Just <| Route.href baseUrl <| Route.Candidacy (tab View.Candidacy.Tab.ExamInfo)

            else
                Nothing
    in
    View.Steps.view (title "Toutes les étapes")
        (Candidacy.statusToProgressPosition (candidacyStatus candidacy))
        [ { content = expandedView "Rendez-vous pédagogique" PriseEnCharge candidacy
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
        , { content = expandedView "Jury" ParcoursConfirme candidacy
          , navigation = examInfoLink
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
    View.Steps.view (title "Abandon du candidat")
        progressPosition
        [ { content = dropOutInfo
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
    View.Steps.view (title "Candidature supprimée")
        2
        [ { content = [ text "Supprimée le ", text archiveDate.fullFormat ]
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
    View.Steps.view (title "Candidature réorientée")
        2
        [ { content = [ text "Réorientée le ", text archiveDate.fullFormat ]
          , navigation = Just archiveLink
          }
        ]


title : String -> Html msg
title value =
    h2
        [ class "my-4 flex items-end"
        , class "text-xl font-semibold"
        ]
        [ text value ]


expandedView : String -> Candidacy.Step -> Candidacy -> List (Html msg)
expandedView stepTitle status candidacy =
    [ View.Steps.link stepTitle
    , if candidacyStatus candidacy == status then
        div
            []
            [ Button.new { onClick = Nothing, label = "Compléter" } |> Button.view ]

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
