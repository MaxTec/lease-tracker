import numeroALetras from "@vigilio/numeros-a-letras";

export const numberToWords = (amount: number): string => {
  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);
  const formattedCents = decimalPart.toString().padStart(2, "0");

  const text = numeroALetras(integerPart).toUpperCase();

  return `${amount} (${text} ${formattedCents}/100 M.N.)`;
};
