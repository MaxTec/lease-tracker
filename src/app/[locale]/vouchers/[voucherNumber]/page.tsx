import Layout from "@/components/layout/Layout";
import VoucherItem from "./VoucherItem";

export default function VoucherPage() {
  return (
    <Layout showBreadcrumbs={false}>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto text-center'>
          <VoucherItem />
        </div>
      </div>
    </Layout>
  );
}
