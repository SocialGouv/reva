-- CreateTable
CREATE TABLE
    "candidacy_financing_method" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4 (),
        "label" VARCHAR(255) NOT NULL,
        "order" INTEGER NOT NULL,
        "created_at" TIMESTAMPTZ (6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMPTZ (6),
        CONSTRAINT "candidacy_financing_method_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "candidacy_on_candidacy_financing_method" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4 (),
        "candidacy_id" UUID NOT NULL,
        "candidacy_financing_method" UUID NOT NULL,
        "additional_information" TEXT,
        "created_at" TIMESTAMPTZ (6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMPTZ (6),
        CONSTRAINT "candidacy_on_candidacy_financing_method_pkey" PRIMARY KEY ("id")
    );

-- CreateIndex
CREATE UNIQUE INDEX "candidacy_financing_method_label_key" ON "candidacy_financing_method" ("label");

-- CreateIndex
CREATE UNIQUE INDEX "candidacy_on_candidacy_financing_method_candidacy_id_candid_key" ON "candidacy_on_candidacy_financing_method" ("candidacy_id", "candidacy_financing_method");

-- AddForeignKey
ALTER TABLE "candidacy_on_candidacy_financing_method" ADD CONSTRAINT "candidacy_on_candidacy_financing_method_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidacy_on_candidacy_financing_method" ADD CONSTRAINT "candidacy_on_candidacy_financing_method_candidacy_financin_fkey" FOREIGN KEY ("candidacy_financing_method") REFERENCES "candidacy_financing_method" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO
    "candidacy_financing_method" ("id", "label", "order")
VALUES
    (
        'a32212f0-5727-41fe-86b2-ffeb71944d79',
        'Droits CPF via Mon Compte Personnel Formation',
        1
    ),
    (
        '5e248eb5-b165-4e6f-b99a-8d3f6500fcb3',
        'Abondements via Mon Compte Personnel Formation',
        2
    ),
    (
        'a3d16bd6-1e8a-4a20-8eca-5bd42e83a080',
        'Fonds propres du candidat',
        3
    ),
    (
        'ba03ba33-05ea-4dfb-b064-d7aa84057c0d',
        'Financement par France Travail',
        4
    ),
    (
        '15c7facd-c42d-446d-a58a-060ea26fc84d',
        'Financement par l''OPCO',
        5
    ),
    (
        '4a94aeca-8f3e-4c9d-9afb-eb1766fccd45',
        'Financement par l''employeur',
        6
    ),
    (
        '39c1bc88-5975-40d9-85de-01c8cfa35d04',
        'Financement par la région',
        7
    ),
    (
        'a0d5b35b-06bb-46dd-8cf5-fbba5b01c711',
        'Autre source de financement',
        8
    );