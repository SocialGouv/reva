module Actions exposing (Action(..))

import Candidate exposing (Candidate)


type Action
    = UpdateCandidate Candidate
