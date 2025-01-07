INSERT INTO drop_out_reason (id, label, is_active, created_at)
VALUES ('9485ed0e-c535-4efa-a4a2-7f1494183e14', 'Financement du jury', 'TRUE', now())
ON CONFLICT (id)
DO NOTHING;
