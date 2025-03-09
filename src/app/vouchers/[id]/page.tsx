import Link from "next/link";

interface VoucherData {
  id: string;
  voucherNumber: string;
  generatedDate: string;
  sentDate: string | null;
  status: "GENERATED" | "SENT" | "VIEWED";
  payment: {
    id: string;
    amount: number;
    dueDate: string;
    paidDate: string;
    status: string;
    lease: {
      id: string;
      rentAmount: number;
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

async function getVoucher(id: number) {
  if (!id || isNaN(id)) {
    throw new Error("Invalid voucher ID");
  }

  console.log("route", `${process.env.NEXT_PUBLIC_API_URL}/api/vouchers/${id}`);

  //   try {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vouchers/${id}`, {
    next: { revalidate: 60 }, // Cache for 60 seconds
  });
  console.log("response", response);
  if (!response.ok) {
    throw new Error(`Failed to fetch voucher: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data) {
    throw new Error("No data received from the server");
  }

  return data;
  //   } catch (error) {
  //     console.error("Error fetching voucher:", error);
  //     throw error;
  //   }
}

type Params = Promise<{ id: number }>;
export default async function VoucherDetail({ params }: { params: Params }) {
  const { id } = await params;
  const voucher = await getVoucher(id);
  console.log("voucher", voucher);
  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-3xl mx-auto'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-3xl font-bold'>Payment Voucher</h1>
          <Link href='/dashboard' className='text-blue-600 hover:underline'>
            Back to Dashboard
          </Link>
        </div>

        <div className='bg-white rounded-lg shadow-md p-8 mb-8 border-t-4 border-blue-600'>
          <div className='flex justify-between items-start mb-6'>
            <div>
              <h2 className='text-2xl font-bold text-gray-800'>{voucher.payment.lease.unit.property.name}</h2>
              <p className='text-black'>{voucher.payment.lease.unit.property.address}</p>
            </div>
            <div className='text-right'>
              <p className='text-sm text-black'>Voucher Number</p>
              <p className='text-lg font-semibold'>{voucher.voucherNumber}</p>
            </div>
          </div>

          <div className='border-t border-gray-200 pt-6 mb-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <h3 className='text-sm font-medium text-gray-500 mb-1'>Tenant</h3>
                <p className='font-semibold'>{voucher.payment.lease.tenant.user.name}</p>
                <p className='text-b'>{voucher.payment.lease.tenant.user.email}</p>
              </div>
              <div>
                <h3 className='text-sm font-medium text-gray-500 mb-1'>Property Unit</h3>
                <p className='font-semibold'>Unit {voucher.payment.lease.unit.unitNumber}</p>
              </div>
            </div>
          </div>

          <div className='border-t border-gray-200 pt-6 mb-6'>
            <h3 className='text-lg font-semibold mb-4'>Payment Details</h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <p className='text-sm text-gray-500'>Amount Paid</p>
                <p className='text-xl font-bold'>{voucher.payment.amount}</p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Payment Date</p>
                <p className='font-medium'>{new Date(voucher.payment.paidDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Status</p>
                <p className='font-medium'>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${voucher.payment.status === "PAID" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {voucher.payment.status}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className='border-t border-gray-200 pt-6'>
            <div className='flex justify-between items-center'>
              <div>
                <p className='text-sm text-gray-500'>Generated On</p>
                <p className='font-medium'>{new Date(voucher.generatedDate).toLocaleDateString()}</p>
              </div>
              {voucher.sentDate && (
                <div>
                  <p className='text-sm text-gray-500'>Sent On</p>
                  <p className='font-medium'>{new Date(voucher.sentDate).toLocaleDateString()}</p>
                </div>
              )}
              <div className='text-right'>
                <p className='text-sm text-gray-500'>Voucher Status</p>
                <p className='font-medium'>{voucher.status}</p>
              </div>
            </div>
          </div>
        </div>

        <div className='text-center text-gray-500 text-sm'>
          <p>This is an official payment receipt for your records.</p>
          <p>© {new Date().getFullYear()} LeaseTracker. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
