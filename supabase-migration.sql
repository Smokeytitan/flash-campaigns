-- Flash Campaigns Database Migration
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/xdtfcrkdnbzakmmbnnba/sql

-- Create ENUMs
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'LIVE', 'ENDED', 'WINNERS_SELECTED');
CREATE TYPE "SubmissionStatus" AS ENUM ('SUBMITTED', 'INVALID', 'WINNER', 'REJECTED');
CREATE TYPE "NotificationChannel" AS ENUM ('TELEGRAM');
CREATE TYPE "NotificationStatus" AS ENUM ('SENT', 'FAILED');

-- Create User table
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "xUserId" TEXT UNIQUE,
    "xHandle" TEXT UNIQUE,
    "xName" TEXT,
    "xAvatarUrl" TEXT,
    "xAccessToken" TEXT,
    "xRefreshToken" TEXT,
    "xTokenExpiry" TIMESTAMP(3),
    "telegramChatId" TEXT UNIQUE,
    "telegramUsername" TEXT,
    "telegramLinkingCode" TEXT,
    "telegramCodeExpiry" TIMESTAMP(3),
    "notifyOptIn" BOOLEAN NOT NULL DEFAULT true
);

-- Create Campaign table
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "brief" TEXT NOT NULL,
    "requirements" TEXT[] NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "prizePoolAmount" DECIMAL(12,2) NOT NULL,
    "prizePoolCurrency" TEXT NOT NULL DEFAULT 'USD',
    "winnersCount" INTEGER NOT NULL,
    "createdById" TEXT NOT NULL,
    FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create Submission table
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xPostUrl" TEXT NOT NULL,
    "xPostId" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "campaignId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("campaignId", "userId")
);

-- Create Winner table
CREATE TABLE "Winner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rank" INTEGER NOT NULL,
    "prizeAmount" DECIMAL(12,2),
    "campaignId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL UNIQUE,
    "userId" TEXT NOT NULL,
    "selectedBy" TEXT NOT NULL,
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create NotificationLog table
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationStatus" NOT NULL,
    "message" TEXT,
    "error" TEXT,
    "campaignId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for User
CREATE INDEX "User_xHandle_idx" ON "User"("xHandle");
CREATE INDEX "User_xUserId_idx" ON "User"("xUserId");
CREATE INDEX "User_telegramChatId_idx" ON "User"("telegramChatId");

-- Create indexes for Campaign
CREATE INDEX "Campaign_status_idx" ON "Campaign"("status");
CREATE INDEX "Campaign_createdById_idx" ON "Campaign"("createdById");

-- Create indexes for Submission
CREATE INDEX "Submission_campaignId_idx" ON "Submission"("campaignId");
CREATE INDEX "Submission_userId_idx" ON "Submission"("userId");
CREATE INDEX "Submission_status_idx" ON "Submission"("status");

-- Create indexes for Winner
CREATE INDEX "Winner_campaignId_idx" ON "Winner"("campaignId");
CREATE INDEX "Winner_userId_idx" ON "Winner"("userId");

-- Create indexes for NotificationLog
CREATE INDEX "NotificationLog_campaignId_idx" ON "NotificationLog"("campaignId");
CREATE INDEX "NotificationLog_userId_idx" ON "NotificationLog"("userId");
CREATE INDEX "NotificationLog_status_idx" ON "NotificationLog"("status");
