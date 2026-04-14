-- CreateTable
CREATE TABLE "EventPlan" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "track" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventPublication" (
    "eventPlanId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "heroEyebrow" TEXT NOT NULL,
    "heroBlurb" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "trackLabel" TEXT NOT NULL,
    "seatsTotal" INTEGER NOT NULL,
    "seatsRemaining" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "highlights" TEXT NOT NULL,
    "operatorNotes" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventPublication_pkey" PRIMARY KEY ("eventPlanId")
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL,
    "eventPlanId" TEXT NOT NULL,
    "attendeeName" TEXT NOT NULL,
    "attendeeEmail" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "seatCount" INTEGER NOT NULL,
    "notes" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventPlan_slug_key" ON "EventPlan"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "EventPublication_slug_key" ON "EventPublication"("slug");

-- CreateIndex
CREATE INDEX "Registration_attendeeEmail_idx" ON "Registration"("attendeeEmail");

-- AddForeignKey
ALTER TABLE "EventPublication" ADD CONSTRAINT "EventPublication_eventPlanId_fkey" FOREIGN KEY ("eventPlanId") REFERENCES "EventPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_eventPlanId_fkey" FOREIGN KEY ("eventPlanId") REFERENCES "EventPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
