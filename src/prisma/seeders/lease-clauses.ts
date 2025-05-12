import type { ClauseType } from '@prisma/client';

export const leaseClauses = [
  {
    title: "PRIMERA",
    content:
      "Ambas partes sujetan este convenio a lo dispuesto por los artículos 3134, 3140, 3141, 3149, 3150 y 3151 del Código Civil vigente en el Estado.",
    type: 'LEGAL' as ClauseType,
    isActive: true,
  },
  {
    title: "CUARTA",
    content:
      "El local será destinado exclusivamente para uso de oficina administrativa y de diseño. El arrendatario declara haber recibido el inmueble en condiciones adecuadas para su uso y funcionamiento.",
    type: 'USE' as ClauseType,
    isActive: true,
  },
  {
    title: "QUINTA",
    content:
      "El arrendatario se compromete a entregar el local al término del convenio en las mismas condiciones en que lo recibió, salvo el deterioro natural por el uso adecuado. Será responsable de cualquier daño derivado de la remoción de muebles o instalaciones. Asimismo, renuncia expresamente a prórrogas y autoriza al arrendador a tomar posesión del local al día siguiente de la fecha de terminación del convenio, sin necesidad de resolución judicial, conforme a los artículos 2738 y 2739 del Código Civil vigente.",
    type: 'TERMINATION' as ClauseType,
    isActive: true,
  },
  {
    title: "SEXTA",
    content:
      "Serán por cuenta del arrendatario todos los gastos derivados del consumo de agua potable, energía eléctrica, vigilancia, limpieza y cualquier otro relacionado con el funcionamiento y operación del local arrendado.",
    type: 'UTILITIES' as ClauseType,
    isActive: true,
  },
  {
    title: "SÉPTIMA",
    content:
      "En caso de que el arrendatario no entregue el local en la fecha pactada de terminación, se obliga a pagar una pena convencional de $200.00 (DOSCIENTOS PESOS 00/100 M.N.) por cada día de retraso, sin perjuicio de cubrir daños y perjuicios adicionales, así como los gastos legales derivados del incumplimiento.",
    type: 'PENALTY' as ClauseType,
    isActive: true,
  },
  {
    title: "OCTAVA",
    content:
      "Para la interpretación y cumplimiento del presente convenio, las partes se someten expresamente a la jurisdicción de los tribunales competentes en la ciudad o municipio donde se encuentra ubicado el inmueble, renunciando a cualquier otro fuero que pudiera corresponderles por razón de su domicilio presente o futuro.",
    type: 'LEGAL' as ClauseType,
    isActive: true,
  },
  {
    title: "NOVENA",
    content:
      "El arrendatario entregará al arrendador, al momento de la firma del presente convenio, la cantidad acordada como depósito en garantía. Dicho depósito será devuelto al arrendatario al finalizar el convenio, previa verificación del estado del inmueble y cumplimiento de las obligaciones pactadas.",
    type: 'SECURITY_DEPOSIT' as ClauseType,
    isActive: true,
  },
  {
    title: "DÉCIMA",
    content:
      "El arrendatario no podrá ceder los derechos de este contrato ni subarrendar, total o parcialmente, el inmueble arrendado sin el consentimiento expreso y por escrito del arrendador.",
    type: 'RESTRICTIONS' as ClauseType,
    isActive: true,
  },
  {
    title: "DÉCIMA PRIMERA",
    content:
      "En caso de que alguna de las partes desee dar por terminado anticipadamente el convenio, deberá notificarlo por escrito a la otra parte con al menos 30 días naturales de anticipación. En caso de incumplimiento de esta cláusula, la parte que resuelva unilateralmente deberá cubrir una indemnización equivalente a un mes de renta.",
    type: 'TERMINATION' as ClauseType,
    isActive: true,
  },
];