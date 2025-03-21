import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { LeaseData } from '@/utils/leaseUtils';
// import { numberToWords } from '@/utils/leaseUtils';

// Define styles for the lease PDF
const styles = StyleSheet.create({
  page: {
    padding: 72, // 1 inch margin
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  header: {
    fontSize: 10,
    marginBottom: 20,
  },
  clauseTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  clauseContent: {
    fontSize: 10,
    marginBottom: 15,
    marginLeft: 20,
  },
  signature: {
    fontSize: 10,
    marginTop: 30,
  },
});

interface LeasePDFProps {
  leaseData: LeaseData;
}
const numberToWords = (num: number): string => {
  const ones = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE', 'DIEZ'];
  const teens = ['ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const tens = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const hundreds = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  if (num === 0) return 'CERO';
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 11];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
  if (num < 1000) return hundreds[Math.floor(num / 100)] + (num % 100 !== 0 ? ' ' + numberToWords(num % 100) : '');

  return 'NÚMERO MUY GRANDE';
}


const LeasePDF: React.FC<LeasePDFProps> = ({ leaseData }) => {
  // Calculate lease duration in years
  const duration = Math.ceil(
    (leaseData.endDate.getTime() - leaseData.startDate.getTime()) /
      (1000 * 60 * 60 * 24 * 365)
  );

  // Format dates
  const startDate = format(leaseData.startDate, "d 'DE' MMMM 'DE' yyyy", {
    locale: es,
  });
  const endDate = format(leaseData.endDate, "d 'DE' MMMM 'DE' yyyy", {
    locale: es,
  });
  const currentDate = format(new Date(), "d 'DEL' MMMM 'DEL' yyyy", {
    locale: es,
  });

  // Convert amounts to words
  const rentAmountInWords = numberToWords(Math.floor(leaseData.rentAmount));

  // Header text
  const headerText = `QUE CELEBRAN POR UNA PARTE COMO ARRENDADOR O PROPIETARIO EL C. JOSÉ JAVIER DOLORES TEC Y CHULIM Y POR LA OTRA PARTE COMO ARRENDATARIO EL C. ${leaseData.tenantName.toUpperCase()} RESPECTO AL LOCAL UBICADO EN ${leaseData.propertyName.toUpperCase()}, UNIDAD ${leaseData.unitNumber.toUpperCase()}, SE SUJETAN A LAS SIGUIENTES:`;

  // Clauses
  const clauses = [
    {
      title: 'PRIMERA.',
      content:
        'Ambas partes sujetan este convenio a lo dispuesto por los artículos 3134, 3140, 3141, 3149, 3150, 3151, del Código Civil vigente en el estado.',
    },
    {
      title: 'SEGUNDA.',
      content: `Este convenio es por el término definitivo e improrrogable de ${duration} AÑO(S), que corresponde del ${startDate} AL ${endDate}.`,
    },
    {
      title: 'TERCERA.',
      content: `La cuota mensual por concepto de arrendamiento se detalla a continuación: La cuota mensual por concepto de arrendamiento se establecerá de la siguiente manera: A partir del ${startDate}, el arrendatario deberá pagar $${leaseData.rentAmount.toFixed(2)} (${rentAmountInWords} PESOS 00/100 M.N.) correspondientes al mes de ${format(
        leaseData.startDate,
        'MMMM',
        { locale: es }
      )}. Este monto se aplicará hasta el pago realizado el ${format(
        leaseData.endDate,
        "d 'DE' MMMM 'DE' yyyy",
        { locale: es }
      )}. Cada pago realizado el día ${leaseData.paymentDay} será para cubrir el costo del arrendamiento del mes que finaliza ese día, entregándose en el domicilio ya mencionado o a través de un depósito bancario.`,
    },
    {
      title: 'CUARTA.',
      content:
        'EL LOCAL será destinado para uso de OFICINA ADMINISTRATIVA Y DE DISEÑO, que el arrendatario acepta que están en buenas condiciones dicho LOCAL para su uso y funcionamiento.',
    },
    {
      title: 'QUINTA.',
      content:
        'Al término de este convenio, el arrendatario se compromete y obliga a entregar este local a sus propietarios, respondiendo por los daños que causen al inmueble por el retiro de muebles u otros accesorios que se encuentran introducidos en dicho local y que sirven para el funcionamiento del giro al que está destinado, renunciando desde ahora a toda prórroga y beneficio de acuerdo con los artículos 2738 y 2739 del Código Civil en vigor, y por tanto autoriza expresamente a los propietarios para que tomen posesión de este local al día siguiente de la terminación de este convenio sin necesidad de invocar acción alguna ante los tribunales de esta ciudad o los jueces del pueblo donde corresponda.',
    },
    {
      title: 'SEXTA.',
      content:
        'Será por cuenta del arrendatario los gastos que se refieran por consumo de agua potable, energía eléctrica, vigilancia, limpieza y todos los demás que se refieren a la operación y funcionamiento del local arrendado.',
    },
    {
      title: 'SÉPTIMA.',
      content:
        'Para el caso de incumplimiento en la entrega de este local arrendado a la fecha de vencimiento de este convenio, se establece la pena convencional el pago de la cantidad de $200 PESOS (SON: DOSCIENTOS PESOS 00/100 M.N.) por cada día que exceda al CONTRATO, sin que por ello se entienda relevado de cubrir daños y perjuicios, gastos y costos de los juicios que se iniciarán ante los tribunales judiciales de esta ciudad, los jueces del pueblo o cualquier autoridad donde corresponda, por causas de incumplimiento.',
    },
    {
      title: 'OCTAVA.',
      content:
        'Para el caso de interpretación y cumplimiento de este convenio, las partes expresamente manifiestan someterse a la jurisdicción y competencia de los tribunales judiciales o las autoridades correspondientes de la ciudad o del pueblo donde corresponda.',
    },
    {
      title: 'NOVENA.',
      content:
        'Las partes manifiestan que, de su voluntad libre y espontánea, al suscribir este convenio, por lo que no existe error, dolo, violencia o mala fe, desde ahora renuncian a invocar estas como causales de rescisión del mismo.',
    },
    {
      title: 'DÉCIMA.',
      content:
        'TODA REMODELACIÓN QUE SE HAGA O CAMBIO A SU ESTRUCTURA DEL BIEN INMUEBLE QUEDARÁ A BENEFICIO DEL ARRENDADOR.',
    },
  ];

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>CONVENIO TRANSACCIONAL</Text>
        <Text style={styles.header}>{headerText}</Text>

        {clauses.map((clause, index) => (
          <View key={index}>
            <Text style={styles.clauseTitle}>{clause.title}</Text>
            <Text style={styles.clauseContent}>{clause.content}</Text>
          </View>
        ))}

        <Text style={styles.signature}>
          Las partes contratantes declaran y manifiestan estar debidamente
          enteradas de todas y cada una de las cláusulas de este convenio, como su
          contenido, y ratificando en la ciudad de Cancún, del Municipio de Benito
          Juárez, Q. Roo, a los {currentDate}.
        </Text>
      </Page>
    </Document>
  );
};

export default LeasePDF; 