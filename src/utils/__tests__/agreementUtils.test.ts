import {
  generateAmortizationTable,
  generateRentClause,
} from "../agreementUtils";

// Mock the dependent functions
// jest.mock("@/utils/dateUtils", () => ({
//   formatDate: jest.fn((date, format = "d 'de' MMMM 'de' yyyy") => {
//     if (format === "yyyy-MM-dd") return "2024-01-15";
//     if (format === "MMMM") return "enero";
//     return "15 de enero de 2024";
//   }),
// }));

// jest.mock("@/utils/numberUtils", () => ({
//   numberToWords: jest.fn(
//     (amount) => `${amount} (CINCO MIL PESOS MXN 00/100 M.N.)`
//   ),
// }));

describe("agreementUtils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateAmortizationTable", () => {
    
    it("should generate correct payment schedule for regular payment day", () => {
      const startDate = "2024-01-01";
      const endDate = "2024-03-31";
      const paymentDay = 15;
      const amount = 5000;

      const result = generateAmortizationTable(
        startDate,
        endDate,
        paymentDay,
        amount
      );

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        number: 1,
        dueDate: "2024-01-15",
        amount: "5000 (CINCO MIL MXN 00/100 M.N.)",
      });
      //last payment
      expect(result[2]).toEqual({
        number: 3,
        dueDate: "2024-03-15",
        amount: "5000 (CINCO MIL MXN 00/100 M.N.)",
      });
    });

    it("should handle end of month payment day", () => {
      const startDate = "2024-01-01";
      const endDate = "2024-02-29";
      const paymentDay = 30;
      const amount = 5000;

      const result = generateAmortizationTable(
        startDate,
        endDate,
        paymentDay,
        amount
      );

      expect(result).toHaveLength(2);
    });

    it("should throw error for invalid date range", () => {
      const startDate = "2024-03-01";
      const endDate = "2024-02-01";
      const paymentDay = 15;
      const amount = 5000;

      expect(() =>
        generateAmortizationTable(startDate, endDate, paymentDay, amount)
      ).toThrow("La fecha de fin debe ser posterior a la fecha de inicio");
    });

    it("should return empty array when no payments fall within range", () => {
      const startDate = "2024-01-01";
      const endDate = "2024-01-05";
      const paymentDay = 15;
      const amount = 5000;

      const result = generateAmortizationTable(
        startDate,
        endDate,
        paymentDay,
        amount
      );
      expect(result).toHaveLength(0);
    });

    it("should handle first day of month payments for a full year", () => {
      const startDate = "2025-05-01";
      const endDate = "2026-04-30";
      const paymentDay = 1;
      const amount = 9500;

      const result = generateAmortizationTable(startDate, endDate, paymentDay, amount);

      expect(result).toHaveLength(12);
      expect(result[0]).toEqual({
        number: 1,
        dueDate: "2025-05-01",
        amount: "9500 (NUEVE MIL QUINIENTOS MXN 00/100 M.N.)",
      });
      expect(result[11]).toEqual({
        number: 12,
        dueDate: "2026-04-01",
        amount: "9500 (NUEVE MIL QUINIENTOS MXN 00/100 M.N.)",
      });
    });

    it("should handle mid-month payments for a full year", () => {
      const startDate = "2024-07-01";
      const endDate = "2025-06-30";
      const paymentDay = 15;
      const amount = 6800;

      const result = generateAmortizationTable(startDate, endDate, paymentDay, amount);

      expect(result).toHaveLength(12);
      expect(result[0]).toEqual({
        number: 1,
        dueDate: "2024-07-15",
        amount: "6800 (SEIS MIL OCHOCIENTOS MXN 00/100 M.N.)",
      });
    });

    it("should handle last day of month payments with varying month lengths", () => {
      const startDate = "2023-09-01";
      const endDate = "2024-08-31";
      const paymentDay = 30;
      const amount = 12345.67;

      const result = generateAmortizationTable(startDate, endDate, paymentDay, amount);

      expect(result).toHaveLength(12);
      // September has 30 days
      expect(result[0].dueDate).toBe("2023-09-30");
      // February in 2024 (leap year)
      expect(result[5].dueDate).toBe("2024-02-29");
      // August has 31 days
      expect(result[11].dueDate).toBe("2024-08-31");
    });

    it("should handle leap year February correctly", () => {
      const startDate = "2024-02-01";
      const endDate = "2025-01-31";
      const paymentDay = 30;
      const amount = 8800;

      const result = generateAmortizationTable(startDate, endDate, paymentDay, amount);

      expect(result).toHaveLength(12);
      expect(result[0].dueDate).toBe("2024-02-29");
    });

    it("should handle partial year (6 months) correctly", () => {
      const startDate = "2025-06-01";
      const endDate = "2025-11-30";
      const paymentDay = 15;
      const amount = 7777.77;

      const result = generateAmortizationTable(startDate, endDate, paymentDay, amount);

      expect(result).toHaveLength(6);
      expect(result[0].dueDate).toBe("2025-06-15");
      expect(result[5].dueDate).toBe("2025-11-15");
    });
  });

  describe("generateRentClause", () => {
    it("should generate correct clause for middle of month payment", () => {
      const startDate = "2024-01-01";
      const endDate = "2024-12-31";
      const paymentDay = 15;
      const amount = 5000;

      const result = generateRentClause(startDate, endDate, paymentDay, amount);

      expect(result).toContain("día 15 de cada mes");
      expect(result).toContain("CINCO MIL");
    });

    it("should generate correct clause for end of month payment", () => {
      const startDate = "2024-01-01";
      const endDate = "2024-12-31";
      const paymentDay = 30;
      const amount = 5000;

      const result = generateRentClause(startDate, endDate, paymentDay, amount);

      expect(result).toContain("último día de cada mes");
    });

    it("should generate correct clause for first day of month payment", () => {
      const startDate = "2024-01-01";
      const endDate = "2024-12-31";
      const paymentDay = 1;
      const amount = 5000;

      const result = generateRentClause(startDate, endDate, paymentDay, amount);
      console.log("RESULT", result);
      expect(result).toContain("día 1 de cada mes");
      expect(result).toContain("CINCO MIL");
      expect(result).toContain("1 de diciembre de 2024");
    });

    it("should generate clause for full year starting in May", () => {
      const startDate = "2025-05-01";
      const endDate = "2026-04-30";
      const paymentDay = 1;
      const amount = 9500;

      const result = generateRentClause(startDate, endDate, paymentDay, amount);

      expect(result).toContain("día 1 de cada mes");
      expect(result).toContain("1 de mayo de 2025");
      expect(result).toContain("1 de abril de 2026");
    });

    it("should generate clause for decimal amounts", () => {
      const startDate = "2023-09-01";
      const endDate = "2024-08-31";
      const paymentDay = 30;
      const amount = 12345.67;

      const result = generateRentClause(startDate, endDate, paymentDay, amount);

      expect(result).toContain("último día de cada mes");
      expect(result).toContain("DOCE MIL TRESCIENTOS CUARENTA Y CINCO MXN 67/100 M.N.");
    });

    it("should generate clause for partial year period", () => {
      const startDate = "2025-06-01";
      const endDate = "2025-11-30";
      const paymentDay = 15;
      const amount = 7777.77;

      const result = generateRentClause(startDate, endDate, paymentDay, amount);

      expect(result).toContain("día 15 de cada mes");
      expect(result).toContain("15 de junio de 2025");
      expect(result).toContain("15 de noviembre de 2025");
    });
  });
});
