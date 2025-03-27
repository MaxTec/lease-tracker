export function numberToWords(num: number): string {
  const ones = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE', 'DIEZ'];
  const tens = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const hundreds = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  if (num === 0) return 'CERO';
  if (num === 100) return 'CIEN';
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' Y ' + ones[num % 10] : '');
  if (num < 1000) return hundreds[Math.floor(num / 100)] + (num % 100 ? ' ' + numberToWords(num % 100) : '');
  if (num < 1000000) return numberToWords(Math.floor(num / 1000)) + ' MIL ' + (num % 1000 ? numberToWords(num % 1000) : '');
  return 'NÚMERO MUY GRANDE';
} 