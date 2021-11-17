module Candidate.File exposing (Status(..), fromString)

import Candidate.Grade exposing (Grade(..))


type Status
    = Submitted
    | Estimated Admissibility
    | Reviewed
    | Pending
    | AcceptedAt Rate
    | RejectedBy Board
    | Unknown


type Admissibility
    = Favorable
    | Uncertain
    | Negative


type Rate
    = Full
    | Partial


type Board
    = Adviser
    | Jury


toString : Status -> String
toString status =
    case status of
        Submitted ->
            "Candidature en attente de traitement"

        Estimated admissibility ->
            "Avis de recevabilité reçu : " ++ admissibilityToString admissibility

        Reviewed ->
            "Reçu dans l'expérimentation et accompagnement en cours."

        Pending ->
            "En attente des résultats du jury"

        AcceptedAt Partial ->
            "Reçu partiellement"

        AcceptedAt Full ->
            "Reçu"

        RejectedBy Adviser ->
            "Non reçu dans l'expérimentation"

        RejectedBy Jury ->
            "Non reçu"

        Unknown ->
            "Statut introuvable"


admissibilityToString : Admissibility -> String
admissibilityToString admissibility =
    case admissibility of
        Favorable ->
            "favorable"

        Uncertain ->
            "partiel"

        Negative ->
            "défavorable"


fromString : String -> Status
fromString status =
    case status of
        "submitted" ->
            Submitted

        "estimated_favorable" ->
            Estimated Favorable

        "estimated_uncertain" ->
            Estimated Uncertain

        "estimated_negative" ->
            Estimated Negative

        "reviewed" ->
            Reviewed

        "pending" ->
            Pending

        "accepted_full" ->
            AcceptedAt Full

        "accepted_partial" ->
            AcceptedAt Partial

        "rejected_by_adviser" ->
            RejectedBy Adviser

        "rejected_by_jury" ->
            RejectedBy Jury

        _ ->
            Unknown
