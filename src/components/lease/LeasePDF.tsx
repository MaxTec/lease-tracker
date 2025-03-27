"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";
import { formatDistance } from "date-fns";
import { numberToWords } from "@/utils/numberUtils";
import { formatDate } from "@/utils/dateUtils";
import { Locale, eachMonthOfInterval, setDate } from "date-fns";
import { es } from "date-fns/locale"; // Import Spanish locale
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
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 20,
    lineHeight: 1.5,
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
  rentAmount: number;
  depositAmount: number;
  paymentDay: number;

  // Existing clause and rule interfaces
  clauses: LeaseClause[];
  rules: LeaseRule[];
}

interface LeasePDFProps {
  data: LeaseData | null;
  locale?: Locale;
}

// Component for the actual PDF document
const LeaseDocument: React.FC<{ data: LeaseData; locale?: Locale }> = ({
  data,
  locale,
}) => (
  <Document>
    {/* Title Page */}
    <Page size="LETTER" style={styles.page}>
      <View style={styles.title}>
        <Text>CONTRATO DE ARRENDAMIENTO</Text>
      </View>

      <View style={{ ...styles.section, textAlign: "left" }}>
        <Text style={styles.header}>
          En la ciudad de Cancun, a{" "}
          {formatDate(new Date(), "d 'de' MMMM 'de' yyyy")}
        </Text>
      </View>

      {/* Landlord Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          CONVENIO TRANSACCIONAL QUE CELEBRAN POR UNA PARTE COMO ARRENDADOR O
          PROPIETARIO EL C. {data.landlordName}, Y POR LA OTRA PARTE COMO
          ARRENDATARIO EL C. {data.tenantName}&nbsp; RESPECTO AL LOCAL UBICADO
          EN LA CALLE {data.propertyAddress}&nbsp; SUJETAN A LAS SIGUIENTES:
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
        <Text style={styles.clauseContent}>
          A partir del {formatDate(data.startDate, "d 'de' MMMM 'de' yyyy")}, el
          arrendatario deberá pagar {data.rentAmount}&nbsp;(
          {numberToWords(data.rentAmount)}&nbsp;00/100&nbsp;M.N.) como renta
          mensual. Este monto se mantendrá vigente hasta el pago correspondiente
          al {formatDate(data.endDate, "d 'de' MMMM 'de' yyyy")}, cubriendo el
          Cada pago deberá realizarse el día {data.paymentDay}&nbsp;de cada mes
          y corresponderá al mes en curso. Para años subsecuentes, si el
          arrendador opta por renovar el contrato, el monto de la renta podrá
          ser actualizado y los pagos seguirán realizándose de la misma manera,
          el día {data.paymentDay}&nbsp;de cada mes, cubriendo el mes en curso.
        </Text>
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

      {/* Tenant Information Section */}
      {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>ARRENDATARIO:</Text>
        <Text style={styles.contactInfo}>Nombre: {data.tenantName}</Text>
        <Text style={styles.contactInfo}>Teléfono: {data.tenantPhone}</Text>
        <Text style={styles.contactInfo}>Email: {data.tenantEmail}</Text>
        {data.emergencyContact && (
          <Text style={styles.contactInfo}>
            Contacto de Emergencia: {data.emergencyContact}
          </Text>
        )}
      </View> */}

      {/* Property Information Section */}
      {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. OBJETO DEL CONTRATO</Text>
        <Text style={styles.propertyDetails}>
          El inmueble denominado {data.propertyName}, tipo{" "}
          {data.propertyType.toLowerCase()}, ubicado en {data.propertyAddress},
          Unidad {data.unitNumber}.
        </Text>
      </View> */}

      {/* <View style={styles.section}>
        <Text style={styles.clauseTitle}>2. TÉRMINO</Text>
        <Text style={styles.clauseContent}>
          Desde: {format(new Date(data.startDate), "dd/MM/yyyy")}
          {"\n"}
          Hasta: {format(new Date(data.endDate), "dd/MM/yyyy")}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.clauseTitle}>3. RENTA Y DEPÓSITO</Text>
        <Text style={styles.clauseContent}>
          Renta mensual: ${data.rentAmount}
          {"\n"}
          Depósito de garantía: ${data.depositAmount}
          {"\n"}
          Día de pago: {data.paymentDay} de cada mes
        </Text>
      </View> */}

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
    start: new Date(
      new Date(data.startDate).setMonth(new Date(data.startDate).getMonth() - 1)
    ),
    end: new Date(data.endDate),
  });
  const paymentDates = months.map((date) =>
    formatDate(setDate(date, data.paymentDay), "d 'de' MMMM 'de' yyyy")
  );
  const monthsCount = months.length;
  console.log(monthsCount);
  console.log(months);
  console.log(data.endDate);
  console.log(paymentDates);
  return (
    <div className="w-full h-[800px]">
      <PDFViewer className="w-full h-full">
        <LeaseDocument
          data={data}
          locale={locale}
          paymentDates={paymentDates}
        />
      </PDFViewer>
    </div>
  );
}
