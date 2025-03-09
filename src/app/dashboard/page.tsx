import PaymentList from '@/components/PaymentList';
import { Header, Footer } from '@/components/layout';

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">LeaseTracker Dashboard</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Payment Management</h2>
            <p className="mb-6">
              View and manage all lease payments. Send payment vouchers to tenants via email.
            </p>
            
            <PaymentList />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 