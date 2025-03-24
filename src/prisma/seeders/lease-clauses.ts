import type { ClauseType } from '@prisma/client';

export const leaseClauses = [
  {
    title: "PRIMERA",
    content:
      "Ambas partes sujetan este convenio a lo dispuesto por los artículos 3134, 3140, 3141, 3149, 3150, 3151, del Código Civil vigente en el estado.",
    type: 'PAYMENT' as ClauseType,
    isActive: true,
  },
  {
    title: "SEGUNDA",
    content:
      "Este convenio es por el término definitivo e improrrogable de 1 AÑO(S), que corresponde del 01 DE ABRIL DE 2024 AL 31 DE MARZO DE 2025.",
    type: 'MAINTENANCE' as ClauseType,
    isActive: true,
  },
  {
    title: "TERCERA",
    content:
      "La cuota mensual por concepto de arrendamiento se detalla a continuación: La cuota mensual por concepto de arrendamiento se establecerá de la siguiente manera: A partir del 30 DE ABRIL DE 2024, el arrendatario deberá pagar $2,500 (DOS MIL QUINIENTOS PESOS 00/100 M.N.) correspondientes al mes de abril. Este monto se aplicará hasta el pago realizado el 30 DE SEPTIEMBRE DE 2024. A partir del 30 DE OCTUBRE DE 2024, la cuota mensual aumentará a $3,000 (TRES MIL PESOS 00/100 M.N.) y así sucesivamente hasta el término del primer año contractual, el 31 DE MARZO DE 2025. Cada pago realizado el día 30 será para cubrir el costo del arrendamiento del mes que finaliza ese día, entregándose en el domicilio ya mencionado o a través de un depósito bancario. Para años subsecuentes, si el arrendador opta por renovar el contrato, la cuota mensual será determinada por el arrendador y seguirá pagándose de la misma manera, el día 30 de cada mes, por el mes correspondiente.",
    type: 'PAYMENT' as ClauseType,
    isActive: true,
  },
  {
    title: "CUARTA",
    content:
      "EL LOCAL será destinado para uso de OFICINA ADMINISTRATIVA Y DE DISEÑO, que el arrendatario acepta que están en buenas condiciones dicho LOCAL para su uso y funcionamiento.",
    type: 'UTILITIES' as ClauseType,
    isActive: true,
  },
  {
    title: "QUINTA",
    content:
      "Al término de este convenio, el arrendatario se compromete y obliga a entregar este local a sus propietarios, respondiendo por los daños que causen al inmueble por el retiro de muebles u otros accesorios que se encuentran introducidos en dicho local y que sirven para el funcionamiento del giro al que está destinado, renunciando desde ahora a toda prórroga y beneficio de acuerdo con los artículos 2738 y 2739 del Código Civil en vigor, y por tanto autoriza expresamente a los propietarios para que tomen posesión de este local al día siguiente de la terminación de este convenio sin necesidad de invocar acción alguna ante los tribunales de esta ciudad o los jueces del pueblo donde corresponda.",
    type: 'TERMINATION' as ClauseType,
    isActive: true,
  },
  {
    title: "SEXTA",
    content:
      "Será por cuenta del arrendatario los gastos que se refieran por consumo de agua potable, energía eléctrica, vigilancia, limpieza y todos los demás que se refieren a la operación y funcionamiento del local arrendado.",
    type: 'MAINTENANCE' as ClauseType,
    isActive: true,
  },
  {
    title: "SÉPTIMA",
    content:
      "Para el caso de incumplimiento en la entrega de este local arrendado a la fecha de vencimiento de este convenio, se establece la pena convencional el pago de la cantidad de $200 PESOS (SON: DOSCIENTOS PESOS 00/100 M.N.) por cada día que exceda al CONTRATO, sin que por ello se entienda relevado de cubrir daños y perjuicios, gastos y costos de los juicios que se iniciarán ante los tribunales judiciales de esta ciudad, los jueces del pueblo o cualquier autoridad donde corresponda, por causas de incumplimiento.",
    type: 'SECURITY_DEPOSIT' as ClauseType,
    isActive: true,
  },
  {
    title: "OCTAVA",
    content:
      "Para el caso de interpretación y cumplimiento de este convenio, las partes expresamente manifiestan someterse a la jurisdicción y competencia de los tribunales judiciales o las autoridades correspondientes de la ciudad o del pueblo donde corresponda.",
    type: 'UTILITIES' as ClauseType,
    isActive: true,
  },
];