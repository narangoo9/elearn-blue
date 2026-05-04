CREATE TABLE IF NOT EXISTS "saved_courses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saved_courses_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'saved_courses_userId_courseId_key'
  ) THEN
    ALTER TABLE "saved_courses" ADD CONSTRAINT "saved_courses_userId_courseId_key" UNIQUE ("userId", "courseId");
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "saved_courses_userId_savedAt_idx" ON "saved_courses"("userId", "savedAt" DESC);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'saved_courses_userId_fkey'
  ) THEN
    ALTER TABLE "saved_courses" ADD CONSTRAINT "saved_courses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'saved_courses_courseId_fkey'
  ) THEN
    ALTER TABLE "saved_courses" ADD CONSTRAINT "saved_courses_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
