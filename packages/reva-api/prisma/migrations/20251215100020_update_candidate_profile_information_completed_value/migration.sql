update candidate
set
    profile_information_completed = true
where
    firstname is not null
    and lastname is not null
    and country_id is not null
    and birth_department_id is not null
    and email is not null
    and phone is not null
    and gender is not null;