-- CreateTable
CREATE TABLE "subscription_request_department" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "department_id" UUID NOT NULL,
    "is_onsite" BOOLEAN NOT NULL DEFAULT false,
    "is_remote" BOOLEAN NOT NULL DEFAULT false,
    "subscription_request_id" UUID NOT NULL,

    CONSTRAINT "subscription_request_department_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "subscription_request_department" ADD CONSTRAINT "subscription_request_department_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_request_department" ADD CONSTRAINT "subscription_request_department_subscription_request_id_fkey" FOREIGN KEY ("subscription_request_id") REFERENCES "subscription_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;
