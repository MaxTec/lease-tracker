import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';

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
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: '#4B61DD',
    borderRadius: 8,
    marginRight: 15,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  voucherNumber: {
    fontSize: 16,
    color: '#666666',
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  column: {
    flex: 1,
    marginRight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 16,
  },
  propertyName: {
    fontSize: 20,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
    lineHeight: 1.4,
  },
  tenantName: {
    fontSize: 20,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  tenantEmail: {
    fontSize: 16,
    color: '#666666',
  },
  paymentDetailsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  paymentDetailsTitle: {
    fontSize: 22,
    color: '#1a1a1a',
    marginBottom: 24,
  },
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  paymentGridItem: {
    width: '50%',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 6,
  },
  value: {
    fontSize: 18,
    color: '#1a1a1a',
  },
  amount: {
    fontSize: 24,
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 40,
    textAlign: 'center',
    color: '#666666',
  },
  footerText: {
    fontSize: 14,
    marginBottom: 4,
  },
});

interface VoucherPDFProps {
  voucher: Voucher;
}

const VoucherPDF: React.FC<VoucherPDFProps> = ({ voucher }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.iconPlaceholder} />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Payment Voucher</Text>
          <Text style={styles.voucherNumber}>Voucher #{voucher.voucherNumber}</Text>
        </View>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.column}>
          <Text style={styles.sectionTitle}>Property</Text>
          <Text style={styles.propertyName}>{voucher.payment.lease.unit.property.name}</Text>
          <Text style={styles.addressText}>Unit {voucher.payment.lease.unit.unitNumber}</Text>
          <Text style={styles.addressText}>{voucher.payment.lease.unit.property.address}</Text>
        </View>

        <View style={styles.column}>
          <Text style={styles.sectionTitle}>Tenant</Text>
          <Text style={styles.tenantName}>{voucher.payment.lease.tenant.user.name}</Text>
          <Text style={styles.tenantEmail}>{voucher.payment.lease.tenant.user.email}</Text>
        </View>
      </View>

      <View style={styles.paymentDetailsContainer}>
        <Text style={styles.paymentDetailsTitle}>Payment Details</Text>
        <View style={styles.paymentGrid}>
          <View style={styles.paymentGridItem}>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.amount}>${voucher.payment.amount}</Text>
          </View>
          <View style={styles.paymentGridItem}>
            <Text style={styles.label}>Payment Method</Text>
            <Text style={styles.value}>{voucher.payment.paymentMethod?.replace('_', ' ')}</Text>
          </View>
          <View style={styles.paymentGridItem}>
            <Text style={styles.label}>Due Date</Text>
            <Text style={styles.value}>{format(new Date(voucher.payment.dueDate), 'MMM dd, yyyy')}</Text>
          </View>
          <View style={styles.paymentGridItem}>
            <Text style={styles.label}>Paid Date</Text>
            <Text style={styles.value}>{format(new Date(voucher.payment.paidDate), 'MMM dd, yyyy')}</Text>
          </View>
          {voucher.payment.transactionId && (
            <View style={styles.paymentGridItem}>
              <Text style={styles.label}>Transaction ID</Text>
              <Text style={styles.value}>{voucher.payment.transactionId}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>This is an automatically generated payment voucher.</Text>
        <Text style={styles.footerText}>Please keep this for your records.</Text>
      </View>
    </Page>
  </Document>
);

export default VoucherPDF; 