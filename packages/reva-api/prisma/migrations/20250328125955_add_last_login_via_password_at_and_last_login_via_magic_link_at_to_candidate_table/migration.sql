-- AlterTable
ALTER TABLE "candidate" ADD COLUMN     "last_login_via_magic_link_at" TIMESTAMPTZ(6),
ADD COLUMN     "last_login_via_password_at" TIMESTAMPTZ(6);
