"use client";

import React from "react";
import { Document, Page, Text, View, StyleSheet, PDFViewer } from "@react-pdf/renderer";
import { numberToWords } from "@/utils/numberUtils";
import { formatDate } from "@/utils/dateUtils";
import { parseISO, Locale, eachMonthOfInterval, setDate, lastDayOfMonth, formatDistance } from "date-fns";
import { es } from "date-fns/locale"; // Import Spanish locale
import { generateAmortizationTable } from "@/utils/agreementUtils";

// Define styles for the lease PDF
const styles = StyleSheet.create({
  page: {
    padding: 28.35, // 1 cm margin
    fontFamily: "Helvetica", // Arial font in PDF
    fontSize: 12,
    color: "#000000",
    lineHeight: 1.5, // Double spacing
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10, //
    textAlign: "center",
    fontFamily: "Helvetica",
  },
  header: {
    fontSize: 12,
    marginBottom: 15,
    textAlign: "center",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  clauseTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  clauseContent: {
    fontSize: 10,
    marginBottom: 5,
    marginLeft: 10,
    lineHeight: 1,
  },
  pageNumber: {
    position: "absolute",
    top: 30,
    right: 30,
    fontSize: 12,
  },
  signature: {
    fontSize: 12,
    marginTop: 45,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureLine: {
    width: 200,
    borderBottom: 1,
    marginTop: 40,
  },
  contactInfo: {
    fontSize: 10,
    marginBottom: 5,
  },
  propertyDetails: {
    fontSize: 10,
    marginBottom: 15,
  },
});

export interface LeaseClause {
  id: number;
  title: string;
  content: string;
  type: string;
}

export interface LeaseRule {
  id: number;
  title: string;
  description: string;
  category: string;
}

export interface LeaseData {
  // Landlord information
  landlordName: string;
  landlordCompany?: string;
  landlordPhone: string;
  landlordAddress: string;

  // Tenant information
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;
  emergencyContact?: string;

  // Property and unit information
  propertyName: string;
  propertyAddress: string;
  propertyType: string;
  unitNumber: string;

  // Lease details
  startDate: string;
  endDate: string;
  rentAmount: string;
  depositAmount: string;
  paymentDay: string;

  // Existing clause and rule interfaces
  clauses: LeaseClause[];
  rules: LeaseRule[];
}

interface LeasePDFProps {
  data: LeaseData | null;
  locale?: Locale;
}

// Component for the actual PDF document
const LeaseDocument: React.FC<{ data: LeaseData; locale?: Locale }> = ({ data, locale }) => (
  <Document>
    {/* Title Page */}
    <Page size='LETTER' style={styles.page}>
      <View style={styles.title}>
        <Text>CONTRATO DE ARRENDAMIENTO</Text>
      </View>

      <View style={{ ...styles.section, textAlign: "left" }}>
        <Text style={styles.header}>En la ciudad de Cancun, a {formatDate(new Date(), "d 'de' MMMM 'de' yyyy")}</Text>
      </View>

      {/* Landlord Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          CONVENIO TRANSACCIONAL QUE CELEBRAN POR UNA PARTE COMO ARRENDADOR O PROPIETARIO EL C. {data.landlordName}, Y POR LA OTRA PARTE COMO ARRENDATARIO EL C. {data.tenantName}
          &nbsp; RESPECTO AL LOCAL UBICADO EN LA CALLE {data.propertyAddress}&nbsp; SUJETAN A LAS SIGUIENTES:
        </Text>
      </View>
      {/* SEGUNDA. \- Este convenio es por el término definitivo e improrrogable de 1 AÑO(S), que corresponde del 01 DE ABRIL DE 2024 AL 31 DE MARZO DE 2025\.
       */}
      {/* Poner titulo de la seccion CLAUSULAS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CLAUSULAS</Text>
      </View>
      <View key={0} style={styles.section}>
        <Text style={styles.clauseTitle}>1. TÉRMINO</Text>
        <Text style={styles.clauseContent}>
          Este convenio es por el término definitivo e improrrogable de&nbsp;
          {formatDistance(new Date(data.startDate), new Date(data.endDate), {
            addSuffix: false,
            locale: locale || es,
          })}
          &nbsp; , que corresponde del&nbsp;
          {formatDate(data.startDate, "d 'de' MMMM 'de' yyyy")}&nbsp; al&nbsp;
          {formatDate(data.endDate, "d 'de' MMMM 'de' yyyy")}.
        </Text>
      </View>

      {/* La cuota mensual por concepto de arrendamiento se detalla a continuación: La cuota mensual por concepto de arrendamiento se establecerá de la siguiente manera: A partir del 30 DE ABRIL DE 2024, el arrendatario deberá pagar $2,500 (DOS MIL QUINIENTOS PESOS 00/100 M.N.) correspondientes al mes de abril. Este monto se aplicará hasta el pago realizado el 30 DE SEPTIEMBRE DE 2024\. A partir del 30 DE OCTUBRE DE 2024, la cuota mensual aumentará a $3,000 (TRES MIL PESOS 00/100 M.N.) y así sucesivamente hasta el término del primer año contractual, el 31 DE MARZO DE 2025\. Cada pago realizado el día 30 será para cubrir el costo del arrendamiento del mes que finaliza ese día, entregándose en el domicilio ya mencionado o a través de un depósito bancario. Para años subsecuentes, si el arrendador opta por renovar el contrato, la cuota mensual será determinada por el arrendador y seguirá pagándose de la misma manera, el día 30 de cada mes, por el mes correspondiente.
       */}
      <View key={1} style={styles.section}>
        <Text style={styles.clauseTitle}>2. RENTA</Text>
        <Text style={styles.clauseContent}>{generateRentClause(data.startDate, data.endDate, parseInt(data.paymentDay) || 1, parseFloat(data.rentAmount) || 0)}</Text>
      </View>
      {/* Render Clauses */}
      {data.clauses.map((clause, index) => (
        <View key={clause.id} style={styles.section}>
          <Text style={styles.clauseTitle}>
            {index + 4}. {clause.title}
          </Text>
          <Text style={styles.clauseContent}>{clause.content}</Text>
        </View>
      ))}
      {/* Generar tabla de amortizacion */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tabla de Amortización</Text>
      </View>
      <View style={{ padding: 5 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            fontSize: 8,
            fontWeight: "bold",
            borderBottom: "1px solid #000",
            paddingBottom: 4,
          }}
        >
          <Text style={styles.clauseContent}>Número</Text>
          <Text style={styles.clauseContent}>Fecha de Vencimiento</Text>
          <Text style={styles.clauseContent}>Monto</Text>
          <Text style={styles.clauseContent}>Cubre</Text>
        </View>
        {generateAmortizationTable(data.startDate, data.endDate, parseInt(data.paymentDay) || 1, parseFloat(data.rentAmount) || 0).map((item) => (
          <View key={item.number} style={{ borderBottom: "1px solid #000", padding: 2 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                fontSize: 8,
              }}
            >
              <Text style={styles.clauseContent}>{item.number}</Text>
              <Text style={styles.clauseContent}>{item.dueDate}</Text>
              <Text style={styles.clauseContent}>{item.amount}</Text>
              {/* <Text style={styles.clauseContent}>{item.covers}</Text> */}
            </View>
          </View>
        ))}
      </View>
      {/* Render Rules Section */}
      {data.rules.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.clauseTitle}>REGLAMENTO DEL INMUEBLE</Text>
          {data.rules.map((rule) => (
            <View key={rule.id} style={styles.section}>
              <Text style={styles.clauseTitle}>{rule.title}</Text>
              <Text style={styles.clauseContent}>{rule.description}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.signature}>
        <View>
          <Text>EL ARRENDADOR:</Text>
          <View style={styles.signatureLine} />
          <Text style={{ textAlign: "center" }}>{data.landlordName}</Text>
        </View>
        <View>
          <Text>EL ARRENDATARIO:</Text>
          <View style={styles.signatureLine} />
          <Text style={{ textAlign: "center" }}>{data.tenantName}</Text>
        </View>
      </View>

      {/* <Text style={styles.pageNumber}>Página 2 de 2</Text> */}
    </Page>
  </Document>
);

export default function LeasePDF({ data, locale }: LeasePDFProps) {
  if (!data) return null;
  const months = eachMonthOfInterval({
    start: new Date(new Date(data.startDate).setMonth(new Date(data.startDate).getMonth() - 1)),
    end: new Date(data.endDate),
  });
  const paymentDates = months.map((date) => formatDate(setDate(date, data.paymentDay), "d 'de' MMMM 'de' yyyy"));
  const monthsCount = months.length;
  console.log(monthsCount);
  console.log(months);
  console.log(data.endDate);
  console.log(paymentDates);
  return (
    <div className='w-full h-[800px]'>
      <PDFViewer className='w-full h-full'>
        <LeaseDocument data={data} locale={locale} paymentDates={paymentDates} />
      </PDFViewer>
    </div>
  );
}

export const generateRentClause = (startDate: string, endDate: string, paymentDay: number, rentAmount: number): string => {
  console.log("startDate", startDate);
  console.log("endDate", endDate);
  console.log("paymentDay", paymentDay);
  console.log("rentAmount", rentAmount);
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  const getUTCDate = (date: Date, day: number): Date => {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();

    if (day === 30) {
      return lastDayOfMonth(new Date(Date.UTC(year, month, 1)));
    }

    return new Date(Date.UTC(year, month, day));
  };

  // Primer pago
  const firstPaymentDate = getUTCDate(start, paymentDay);
  const formattedFirstPaymentDate = formatDate(firstPaymentDate, "d 'de' MMMM 'de' yyyy", "UTC", es);
  const coveredMonth = formatDate(firstPaymentDate, "MMMM", "UTC", es);

  // Último pago
  const lastPaymentDate = getUTCDate(end, paymentDay);
  const formattedLastPaymentDate = formatDate(lastPaymentDate, "d 'de' MMMM 'de' yyyy", "UTC", es);
  const lastCoveredMonth = formatDate(lastPaymentDate, "MMMM", "UTC", es);

  // Día de pago texto
  const paymentDayText = paymentDay === 1 ? "día 1 de cada mes" : paymentDay === 15 ? "día 15 de cada mes" : "último día de cada mes";

  const clause = `
El primer pago de renta deberá realizarse el ${formattedFirstPaymentDate}, y corresponderá al mes de ${coveredMonth}. A partir de esa fecha, el arrendatario deberá pagar ${numberToWords(
    rentAmount
  )} como renta mensual.

Cada pago deberá realizarse el ${paymentDayText} y cubrirá el mes en curso.

Este monto se mantendrá vigente hasta el pago correspondiente al ${formattedLastPaymentDate}, cubriendo el mes de ${lastCoveredMonth}.

Para años subsecuentes, si el arrendador opta por renovar el contrato, el monto de la renta podrá ser actualizado y los pagos seguirán realizándose de la misma manera: el ${paymentDayText}, cubriendo el mes en curso.
`.trim();

  return clause;
};
export type AmortizationItem = {
  number: number;
  dueDate: string;
  amount: number;
  covers: string;
};
 