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
