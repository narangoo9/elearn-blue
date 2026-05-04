CREATE TYPE "LessonVideoType" AS ENUM ('NONE', 'YOUTUBE', 'UPLOAD');

CREATE TYPE "LessonVideoProvider" AS ENUM ('YOUTUBE', 'CUSTOM');

ALTER TABLE "lessons"
  ADD COLUMN "videoType" "LessonVideoType" NOT NULL DEFAULT 'NONE',
  ADD COLUMN "videoUrl" TEXT,
  ADD COLUMN "videoProvider" "LessonVideoProvider",
  ADD COLUMN "sourceCreditName" TEXT,
  ADD COLUMN "sourceCreditUrl" TEXT;
