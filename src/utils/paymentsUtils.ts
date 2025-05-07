import { Payment, ScheduledPayment } from "@/types/payment";
import { Lease } from "@/types/lease";

/**
 * Generates a payment schedule for a lease, merging existing payments and generating missing ones.
 */
export function generatePaymentSchedule(
  payments: Payment[],
  leaseInfo: Lease,
  today: Date
): ScheduledPayment[] {
  const startDate = new Date(
    Date.UTC(
      new Date(leaseInfo.startDate).getUTCFullYear(),
      new Date(leaseInfo.startDate).getUTCMonth(),
      new Date(leaseInfo.startDate).getUTCDate()
    )
  );
  const endDate = new Date(
    Date.UTC(
      new Date(leaseInfo.endDate).getUTCFullYear(),
      new Date(leaseInfo.endDate).getUTCMonth(),
      new Date(leaseInfo.endDate).getUTCDate()
    )
  );
  const paymentDay = leaseInfo.paymentDay;
  const rentAmount = leaseInfo.rentAmount;

  // Agrupa los pagos existentes por mes y año
  const existingPaymentsByMonth = new Map<string, Payment>();
  payments.forEach((payment) => {
    const dueDate = new Date(payment.dueDate);
    const key = `${dueDate.getUTCFullYear()}-${dueDate.getUTCMonth()}`;
    existingPaymentsByMonth.set(key, payment); // último pago del mes sobrescribe
  });

  const scheduledPayments: ScheduledPayment[] = [];
  const currentDate = new Date(startDate);

  if (paymentDay) {
    const startMonthLastDay = new Date(
      Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 0)
    ).getUTCDate();
    const startEffectiveDay =
      paymentDay === 30
        ? startMonthLastDay
        : Math.min(paymentDay, startMonthLastDay);
    const tentativeStart = new Date(
      Date.UTC(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth(),
        startEffectiveDay
      )
    );
    if (tentativeStart < startDate) {
      currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
    }
  }

  while (currentDate <= endDate) {
    const lastDayOfMonth = new Date(
      Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 0)
    ).getUTCDate();
    const effectiveDay =
      paymentDay === 30
        ? lastDayOfMonth
        : Math.min(paymentDay || currentDate.getUTCDate(), lastDayOfMonth);

    const currentMonthDate = new Date(
      Date.UTC(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth(),
        effectiveDay
      )
    );

    const key = `${currentMonthDate.getUTCFullYear()}-${currentMonthDate.getUTCMonth()}`;
    const existingPayment = existingPaymentsByMonth.get(key);

    if (existingPayment) {
      scheduledPayments.push({
        id: existingPayment.id,
        dueDate: new Date(existingPayment.dueDate),
        amount: Number(existingPayment.amount),
        status: existingPayment.status as ScheduledPayment["status"],
        isExisting: true,
        paymentMethod:
          existingPayment.paymentMethod as ScheduledPayment["paymentMethod"],
        paidDate: existingPayment.paidDate
          ? new Date(existingPayment.paidDate)
          : undefined,
      });
    } else {
      const status = currentMonthDate < today ? "OVERDUE" : "PENDING";
      scheduledPayments.push({
        dueDate: currentMonthDate,
        amount: Number(rentAmount),
        status,
        isExisting: false,
      });
    }

    currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
  }

  return scheduledPayments;
}
