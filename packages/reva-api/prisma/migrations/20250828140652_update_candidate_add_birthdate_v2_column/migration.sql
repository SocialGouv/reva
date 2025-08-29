update candidate
set
    birthdate_v2 = case
        when date_part ('hour', birthdate) <= 12 THEN DATE (birthdate)
        when date_part ('hour', birthdate) > 12 THEN DATE (birthdate) + INTERVAL '1 DAY'
    END;