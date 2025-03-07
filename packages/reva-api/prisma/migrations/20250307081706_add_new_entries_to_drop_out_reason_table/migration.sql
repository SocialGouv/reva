INSERT INTO drop_out_reason (id, label, is_active, created_at)
VALUES ('2434789f-8303-4868-adff-8a0430fe46c5', 'Non recevabilité prononcée par le certificateur', 'TRUE', now())
ON CONFLICT (id)
DO NOTHING;

INSERT INTO drop_out_reason (id, label, is_active, created_at)
VALUES ('c8da9bde-5dbe-41b3-a4e8-f6633a6315c0', 'Recevabilité caduque', 'TRUE', now())
ON CONFLICT (id)
DO NOTHING;
