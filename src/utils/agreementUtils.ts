import { lastDayOfMonth, parse, isValid, compareAsc, getDaysInMonth, addMonths } from "date-fns";
import { formatDate } from "@/utils/dateUtils";
import { numberToWords } from "@/utils/numberUtils";
interface Payment {
    number: number;
    dueDate: string;
    amount: string;
}

export function generateAmortizationTable(startDate: string, endDate: string, paymentDay: number, amount: number): Payment[] {
    // Parsear las fechas de entrada
    const start = parse(startDate, "yyyy-MM-dd", new Date());
    const end = parse(endDate, "yyyy-MM-dd", new Date());

    if (!isValid(start) || !isValid(end)) {
        throw new Error("Fechas inválidas");
    }

    if (compareAsc(end, start) < 0) {
        throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
    }

    let firstPaymentDate: Date;

    // Si el día de pago es mayor que los días del mes inicial o es 31
    const daysInFirstMonth = getDaysInMonth(start);

    if (paymentDay === 30 || paymentDay > daysInFirstMonth) {
        firstPaymentDate = lastDayOfMonth(start);
    } else {
        firstPaymentDate = new Date(start);
        firstPaymentDate.setDate(paymentDay);

        if (compareAsc(firstPaymentDate, start) < 0) {
            firstPaymentDate = new Date(start.getFullYear(), start.getMonth() + 1, paymentDay);

            // Si el siguiente mes tiene menos días que el día de pago
            if (paymentDay > getDaysInMonth(firstPaymentDate)) {
                firstPaymentDate = lastDayOfMonth(firstPaymentDate);
            }
        }
    }

    const paymentDates: Date[] = [];
    let currentDate = firstPaymentDate;

    while (compareAsc(currentDate, end) <= 0) {
        paymentDates.push(new Date(currentDate));

        // Calcular la fecha del siguiente mes
        let nextMonth = addMonths(currentDate, 1);

        // Si el día de pago es 30 o mayor que los días del mes siguiente
        if (paymentDay === 30 || paymentDay > getDaysInMonth(nextMonth)) {
            nextMonth = lastDayOfMonth(nextMonth);
        } else {
            nextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), paymentDay);
        }

        currentDate = nextMonth;
    }

    if (paymentDates.length === 0) {
        return [];
    }

    return paymentDates.map((paymentDate, i) => {
        return {
            number: i + 1,
            dueDate: formatDate(paymentDate, "yyyy-MM-dd", "UTC"),
            amount: numberToWords(amount),
        };
    });
} 