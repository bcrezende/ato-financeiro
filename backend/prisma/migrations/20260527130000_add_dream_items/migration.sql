-- CreateTable
CREATE TABLE "dream_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "image_data" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "size" TEXT NOT NULL DEFAULT 'sm',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dream_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dream_items_user_id_idx" ON "dream_items"("user_id");

-- AddForeignKey
ALTER TABLE "dream_items" ADD CONSTRAINT "dream_items_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
