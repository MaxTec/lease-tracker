-- CreateTable
CREATE TABLE "OverduePaymentNotification" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextNotificationAt" TIMESTAMP(3) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "paymentCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OverduePaymentNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OverduePaymentNotification_tenantId_nextNotificationAt_idx" ON "OverduePaymentNotification"("tenantId", "nextNotificationAt");

-- AddForeignKey
ALTER TABLE "OverduePaymentNotification" ADD CONSTRAINT "OverduePaymentNotification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
