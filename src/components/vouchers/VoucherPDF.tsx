import React, { memo } from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { format } from "date-fns";

// Change the import to use the direct path
const logoPath = "/logo-lease-tracker.png";

interface Voucher {
  id: string;
  voucherNumber: string;
  status: string;
  payment: {
    amount: number;
    dueDate: string;
    paidDate: string;
    paymentMethod: string;
    transactionId: string | null;
    lease: {
      tenant: {
        user: {
          name: string;
          email: string;
        };
      };
      unit: {
        unitNumber: string;
        property: {
          name: string;
          address: string;
        };
      };
    };
  };
}

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: "10mm",
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: "8mm",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconPlaceholder: {
    width: 100,
    marginRight: 15,
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#1a1a1a",
  },
  voucherInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  voucherNumber: {
    fontSize: 12,
    color: "#656565",
  },
  voucherDate: {
    fontSize: 12,
    color: "#656565",
    fontWeight: "bold",
  },
  mainContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: "5mm",
  },
  column: {
    flex: 1,
    marginRight: "5mm",
  },
  sectionTitle: {
    fontSize: 14,
    color: "#656565",
    marginBottom: "2.5mm",
  },
  textBase: {
    fontSize: 12,
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: "#1a1a1a",
    marginBottom: 8,
  },
  inlineLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: '#1a1a1a',
  },
  inlineText: {
    fontSize: 12,
    color: '#1a1a1a',
  },
  inlineContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 4,
  },
  paymentDetailsContainer: {
    backgroundColor: "#f8f9fa",
    padding: "5mm",
    borderRadius: 4,
  },
  paymentDetailsTitle: {
    fontSize: 14,
    color: "#656565",
    marginBottom: '5mm'
  },
  paymentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  paymentGridItem: {
    width: "25%"
  },
  label: {
    fontSize: 12,
    color: "#656565",
    marginBottom: 6,
  },
  footer: {
    marginTop: "5mm",
    textAlign: "center",
    color: "#656565",
  },
  footerText: {
    fontSize: 10,
    marginBottom: 4,
  },
  signatureSection: {
    marginTop: "20mm",
    paddingTop: "10mm",
    // borderTop: "1pt solid #e5e7eb",
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: "15mm",
  },
  signatureBox: {
    width: "45%",
  },
  signatureLine: {
    borderBottom: "1pt solid #000000",
    marginBottom: "4mm",
  },
  signatureLabel: {
    fontSize: 10,
    color: "#656565",
    textAlign: "center",
  },
  signatureDate: {
    fontSize: 10,
    color: "#656565",
    textAlign: "center",
    marginTop: "5mm",
  },
});

interface VoucherPDFProps {
  voucher: Voucher;
}

const VoucherPDF: React.FC<VoucherPDFProps> = memo(({ voucher }) => (
  <Document>
    <Page size="LETTER" style={styles.page}>
      <View style={styles.header}>
        <Image src={logoPath} style={styles.iconPlaceholder} />
        <View style={styles.titleContainer}>
          <View>
            <Text style={styles.title}>Payment Voucher</Text>
            <Text style={styles.voucherNumber}>
              Voucher #{voucher.voucherNumber}
            </Text>
          </View>
          <View style={styles.voucherInfo}>
            <Text style={styles.voucherDate}>
              {format(new Date(), "MMM dd, yyyy")}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.column}>
          <Text style={styles.sectionTitle}>Property</Text>
          <Text style={styles.subtitle}>
            {voucher.payment.lease.unit.property.name}
          </Text>
          <Text style={styles.textBase}>
            Unit {voucher.payment.lease.unit.unitNumber}
          </Text>
          <View style={styles.inlineContainer}>
            <Text style={styles.inlineLabel}>Address:</Text>
            <Text style={styles.inlineText}>
              {voucher.payment.lease.unit.property.address}
            </Text>
          </View>
        </View>

        <View style={styles.column}>
          <Text style={styles.sectionTitle}>Tenant</Text>
          <View style={styles.inlineContainer}>
            <Text style={styles.inlineLabel}>Name:</Text>
            <Text style={styles.inlineText}>
              {voucher.payment.lease.tenant.user.name}
            </Text>
          </View>
          <View style={styles.inlineContainer}>
            <Text style={styles.inlineLabel}>Email:</Text>
            <Text style={styles.inlineText}>
              {voucher.payment.lease.tenant.user.email}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.paymentDetailsTitle}>Payment Details</Text>
      <View style={styles.paymentDetailsContainer}>
        <View style={styles.paymentGrid}>
          <View style={styles.paymentGridItem}>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.textBase}>${voucher.payment.amount}</Text>
          </View>
          <View style={styles.paymentGridItem}>
            <Text style={styles.label}>Payment Method</Text>
            <Text style={styles.textBase}>
              {voucher.payment.paymentMethod?.replace("_", " ")}
            </Text>
          </View>
          <View style={styles.paymentGridItem}>
            <Text style={styles.label}>Paid Date</Text>
            <Text style={styles.textBase}>
              {format(new Date(voucher.payment.paidDate), "MMM dd, yyyy")}
            </Text>
          </View>
          {voucher.payment.transactionId && (
            <View style={styles.paymentGridItem}>
              <Text style={styles.label}>Transaction ID</Text>
              <Text style={styles.textBase}>
                {voucher.payment.transactionId}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* <View style={styles.signatureSection}>
        <View style={styles.signatureRow}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Landlord Signature</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Tenant Signature</Text>
          </View>
        </View>
      </View> */}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          This is an automatically generated payment voucher.
        </Text>
        <Text style={styles.footerText}>
          Please keep this for your records.
        </Text>
      </View>
    </Page>
  </Document>
));

VoucherPDF.displayName = 'VoucherPDF';

export default VoucherPDF;

// Recibo otorgado en calidad de PARTE ARRENDADORA por Maximiliano Tec Cocom, a la atención de
// Jose Luis Tec Cocom en calidad de PARTE ARRENDATARIA.
// Por este medio, Maximiliano Tec Cocom declara haber recibido de la PARTE ARRENDATARIA el pago de
// la renta de la vivienda ubicada en: Reg. 219, Mz 27 Lote 14, calle 103.
// Dicha renta corresponde al período comprendido entre los días 01 de junio y 30 de junio del 2024; período
// por el cual se ha generado un monto total de $2500 MXN, exclusivamente por concepto de arrendamiento
// del inmueble.
// Asimismo, declara la PARTE ARRENDADORA que el pago fue recibido el día 15/07/24 en efectivo.
