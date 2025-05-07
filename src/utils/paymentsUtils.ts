import { Payment, ScheduledPayment } from "@/types/payment";
import { Lease } from "@/types/lease";

/**
 * Generates a payment schedule for a lease, merging existing payments and generating missing ones.
 * @param payments Array of existing payments
 * @param leaseInfo Lease information
 * @param today Date to use as the current date (should be set to midnight)
 * @returns Array of scheduled payments
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

    // Map existing payments by due date for quick lookup
    const existingPaymentsByDate = new Map<string, Payment>();
    payments.forEach((payment) => {
        const dueDate = new Date(payment.dueDate);
        const dateKey = `${dueDate.getUTCFullYear()}-${dueDate.getUTCMonth()}-${dueDate.getUTCDate()}`;
        existingPaymentsByDate.set(dateKey, payment);
    });

    const scheduledPayments: ScheduledPayment[] = [];

    // Start from the lease start date
    const currentDate = new Date(startDate);

    // If payment day is specified, set the day of the first month
    if (paymentDay) {
        currentDate.setUTCDate(paymentDay);
        // If the payment day is before the start date, move to the next month
        if (currentDate < startDate) {
            currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
        }
    }

    // Generate payments until the end date
    while (currentDate <= endDate) {
        const dateKey = `${currentDate.getUTCFullYear()}-${currentDate.getUTCMonth()}-${currentDate.getUTCDate()}`;
        const existingPayment = existingPaymentsByDate.get(dateKey);

        if (existingPayment) {
            // Use existing payment data
            scheduledPayments.push({
                id: existingPayment.id,
                dueDate: new Date(existingPayment.dueDate),
                amount: Number(existingPayment.amount),
                status: existingPayment.status as ScheduledPayment["status"],
                isExisting: true,
                paymentMethod: existingPayment.paymentMethod as ScheduledPayment["paymentMethod"],
                paidDate: existingPayment.paidDate ? new Date(existingPayment.paidDate) : undefined,
            });
        } else {
            // Create a new scheduled payment
            const status = currentDate < today ? "OVERDUE" : "PENDING";
            scheduledPayments.push({
                dueDate: new Date(currentDate),
                amount: Number(rentAmount),
                status,
                isExisting: false,
            });
        }
        // Move to the next month
        currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
    }
    return scheduledPayments;
} 