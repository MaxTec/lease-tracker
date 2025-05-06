import numeroALetras from "@vigilio/numeros-a-letras";

export const numberToWords = (
  amount: number,
  currency = "MXN",
  suffix = "M.N."
): string => {
  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);
  const formattedCents = decimalPart.toString().padStart(2, "0");

  const text = numeroALetras(integerPart).toUpperCase().trimEnd();
  return `${amount} (${text} ${currency} ${formattedCents}/100 ${suffix})`;
};

export const getOrdinal = (
  num: number,
  options: { language?: "es" | "en"; gender?: "masculine" | "feminine" } = {
    language: "es",
    gender: "masculine",
  }
): string => {
  const { language, gender } = options;

  if (language === "es") {
    const ordinalesEs: Record<number, [string, string]> = {
      1: ["Primero", "Primera"],
      2: ["Segundo", "Segunda"],
      3: ["Tercero", "Tercera"],
      4: ["Cuarto", "Cuarta"],
      5: ["Quinto", "Quinta"],
      6: ["Sexto", "Sexta"],
      7: ["Séptimo", "Séptima"],
      8: ["Octavo", "Octava"],
      9: ["Noveno", "Novena"],
      10: ["Décimo", "Décima"],
      11: ["Undécimo", "Undécima"],
      12: ["Duodécimo", "Duodécima"],
      13: ["Decimotercero", "Decimotercera"],
      14: ["Decimocuarto", "Decimocuarta"],
      15: ["Decimoquinto", "Decimoquinta"],
      16: ["Decimosexto", "Decimosexta"],
      17: ["Decimoséptimo", "Decimoséptima"],
      18: ["Decimoctavo", "Decimoctava"],
      19: ["Decimonoveno", "Decimonovena"],
      20: ["Vigésimo", "Vigésima"],
    };

    if (ordinalesEs[num]) {
      return ordinalesEs[num][gender === "feminine" ? 1 : 0];
    }

    if (num > 20 && num < 100) {
      const decenas = Math.floor(num / 10);
      const unidades = num % 10;
      const prefijos: Record<number, [string, string]> = {
        2: ["Vigésimo", "Vigésima"],
        3: ["Trigésimo", "Trigésima"],
        4: ["Cuadragésimo", "Cuadragésima"],
        5: ["Quincuagésimo", "Quincuagésima"],
        6: ["Sexagésimo", "Sexagésima"],
        7: ["Septuagésimo", "Septuagésima"],
        8: ["Octogésimo", "Octogésima"],
        9: ["Nonagésimo", "Nonagésima"],
      };

      const base = prefijos[decenas];
      if (!base) return `${num}º`;
      const baseOrdinal = base[gender === "feminine" ? 1 : 0];

      return unidades === 0
        ? baseOrdinal
        : `${baseOrdinal} ${getOrdinal(unidades, options).toLowerCase()}`;
    }

    return `${num}º`;
  }

  if (language === "en") {
    const suffix =
      num % 10 === 1 && num % 100 !== 11
        ? "st"
        : num % 10 === 2 && num % 100 !== 12
        ? "nd"
        : num % 10 === 3 && num % 100 !== 13
        ? "rd"
        : "th";

    return `${num}${suffix}`;
  }

  return num.toString(); // fallback
};

/**
 * Formats a Mexican phone number to a standard readable format.
 * Supports local (10 digits) and international (+52 or 52 prefix) formats.
 *
 * @param phoneNumber - The phone number as a string or number
 * @param options - Optional formatting options
 *   withCountryCode: boolean (default: false) - Force output with country code
 * @returns The formatted phone number string, or the original input if invalid
 */
export type FormatPhoneNumberOptions = {
  withCountryCode?: boolean;
};

export const formatPhoneNumber = (
  phoneNumber: string | number,
  options: FormatPhoneNumberOptions = {}
): string => {
  const { withCountryCode = false } = options;
  const raw = String(phoneNumber).replace(/\D/g, "");

  // Handle country code
  let number = raw;
  let hasCountryCode = false;

  if (number.startsWith("52")) {
    hasCountryCode = true;
    number = number.slice(2);
  } else if (number.startsWith("521")) {
    hasCountryCode = true;
    number = number.slice(3);
  }

  if (number.length !== 10) {
    // Invalid length for Mexican numbers
    return String(phoneNumber);
  }

  const areaCode = number.slice(0, 3);
  const firstPart = number.slice(3, 6);
  const secondPart = number.slice(6, 10);
  const formatted = `(${areaCode}) ${firstPart}-${secondPart}`;

  if (hasCountryCode || withCountryCode) {
    return `+52 ${formatted}`;
  }

  return formatted;
};

/**
 * Formats a number as Mexican Peso (MXN) currency.
 *
 * @param value - The number to format
 * @param options - Optional formatting options
 *   showDecimals: boolean (default: true) - Show decimals
 *   showSymbol: boolean (default: true) - Show the $ symbol
 *   minFractionDigits: number (default: 2)
 *   maxFractionDigits: number (default: 2)
 * @returns The formatted currency string
 */
export type FormatCurrencyMXNOptions = {
  showDecimals?: boolean;
  showSymbol?: boolean;
  minFractionDigits?: number;
  maxFractionDigits?: number;
};

export const formatCurrencyMXN = (
  value: number | string,
  options: FormatCurrencyMXNOptions = {}
): string => {
  const {
    showDecimals = true,
    showSymbol = true,
    minFractionDigits = showDecimals ? 2 : 0,
    maxFractionDigits = showDecimals ? 2 : 0,
  } = options;

  const numberValue = typeof value === "string" ? Number(value) : value;
  if (isNaN(numberValue)) return String(value);

  const formatter = new Intl.NumberFormat("es-MX", {
    style: showSymbol ? "currency" : "decimal",
    currency: "MXN",
    minimumFractionDigits: minFractionDigits,
    maximumFractionDigits: maxFractionDigits,
  });

  return formatter.format(numberValue);
};
