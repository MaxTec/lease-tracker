// import PaymentList from '@/components/PaymentList';
import LeaseList from '@/components/admin/LeaseList';
import Layout from '@/components/layout/Layout';

export default function Dashboard() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">LeaseTracker Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Payment Management</h2>
          <p className="mb-6">
            View and manage all lease payments. Send payment vouchers to tenants via email.
          </p>
          
          {/* <PaymentList /> */}
          <LeaseList />
        </div>
      </div>
    </Layout>
  );
} 